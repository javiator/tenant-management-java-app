package com.example.tenantmanagement.service;

import com.example.tenantmanagement.web.dto.TenantDto;
import com.example.tenantmanagement.web.dto.TransactionDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ChatService {

    private final GeminiClient geminiClient;
    private final TenantService tenantService;
    private final PropertyService propertyService;
    private final TransactionService transactionService;
    private final ObjectMapper objectMapper;

    public ChatService(GeminiClient geminiClient, TenantService tenantService, PropertyService propertyService,
            TransactionService transactionService,
            ObjectMapper objectMapper) {
        this.geminiClient = geminiClient;
        this.tenantService = tenantService;
        this.propertyService = propertyService;
        this.transactionService = transactionService;
        this.objectMapper = objectMapper;
    }

    private final Map<String, List<Map<String, Object>>> conversationHistory = new java.util.concurrent.ConcurrentHashMap<>();

    public String chat(String userMessage, String sessionId) {
        try {
            // 1. Retrieve or Initialize History
            List<Map<String, Object>> contents = conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());

            // 2. Add User Message
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(Map.of("text", userMessage)));
            contents.add(userContent);

            // 3. Construct Request
            Map<String, Object> request = new HashMap<>();
            request.put("contents", contents);
            request.put("tools", List.of(Map.of("function_declarations", getTools())));
            request.put("system_instruction", Map.of("parts", Map.of("text",
                    "You are an intelligent property management assistant. You have access to raw data via tools like 'list_tenants', 'list_properties', and 'search_transactions'. "
                            +
                            "Today is " + LocalDate.now() + ". " +
                            "CRITICAL INSTRUCTION: You are expected to perform logic and calculations on the data you fetch. "
                            +
                            "The 'search_transactions' tool returns a list of transactions. EACH transaction object contains: "
                            +
                            "- 'tenantName': The name of the tenant (if linked). " +
                            "- 'tenantId': The ID of the tenant. " +
                            "- 'type': The category of payment (e.g., 'Rent', 'Security Deposit', 'Maintenance'). " +
                            "- 'amount': The transaction amount. " +
                            "- 'transactionDate': The date of payment. " +
                            "Use these fields to identify who paid what. Do NOT say you cannot link transactions to tenants. "
                            +
                            "Example: If asked 'Who hasn't paid rent?', do NOT look for a specific tool. Instead: " +
                            "1. Call 'list_tenants' to get all tenants. " +
                            "2. Call 'search_transactions' for the current month. " +
                            "3. Compare the lists yourself to identify who is missing. " +
                            "Always format your final response in Markdown. " +
                            "If you generate a report, summary, or table, wrap that specific part in <canvas>...</canvas> tags. "
                            +
                            "If the user asks for a visualization or chart, generate a JSON object wrapped in <chart>...</chart> tags. "
                            +
                            "The JSON must have this format: { \"type\": \"bar|line|pie\", \"title\": \"Chart Title\", \"data\": [{\"name\": \"Label\", \"value\": 123}, ...], \"xKey\": \"name\", \"yKey\": \"value\" }."
                            +
                            "\n\n" +
                            "BE PROACTIVE AND INSIGHTFUL:\n" +
                            "1. CONTEXTUAL AWARENESS: When asked about an entity (Tenant, Property), proactively fetch and summarize related data (e.g., payment history, lease status, outstanding balances) even if not explicitly asked. Provide a holistic view.\n"
                            +
                            "2. ANALYSIS OVER LISTING: Don't just list data. Analyze it. (e.g., 'Tenant X is late on rent', 'Property Y has high maintenance costs compared to rent', 'Occupancy rate is low').\n"
                            +
                            "3. CREATIVE VISUALIZATION: Use charts (<chart>) and summaries (<canvas>) creatively to present trends, comparisons, or financial overviews. If a table or chart would make the data easier to understand, generate one.\n"
                            +
                            "4. TONE: Be helpful, professional, and proactive. Anticipate the user's needs.\n" +
                            "\n\n" +
                            "FOR DATA MODIFICATION (Add/Update):\n" +
                            "1. DERIVE MISSING DATA: If the user provides partial info (e.g., 'Add rent for John'), use available tools (e.g., 'list_tenants') to find missing IDs or details (e.g., John's tenantId and propertyId). Do NOT ask the user for info you can find yourself.\n"
                            +
                            "2. CONFIRMATION: Before calling any 'add_*' or 'update_*' tool, you MUST output a summary of the action you are about to take (including all derived values) and ask the user for confirmation.\n"
                            +
                            "3. EXECUTION: Only call the tool AFTER the user has explicitly confirmed (e.g., 'Yes', 'Proceed'). If they have not confirmed, just ask for confirmation.")));

            // 4. Call Gemini (Loop for multi-turn function calls)
            int turns = 0;
            while (turns < 10) {
                String responseJson = geminiClient.callGemini(request);
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(responseJson);
                com.fasterxml.jackson.databind.JsonNode candidates = root.path("candidates");

                if (candidates.isArray() && candidates.size() > 0) {
                    com.fasterxml.jackson.databind.JsonNode content = candidates.get(0).path("content");
                    com.fasterxml.jackson.databind.JsonNode parts = content.path("parts");

                    if (parts.isArray() && parts.size() > 0) {
                        com.fasterxml.jackson.databind.JsonNode firstPart = parts.get(0);

                        // Add Model Response to History
                        Map<String, Object> modelContent = new HashMap<>();
                        modelContent.put("role", "model");

                        if (firstPart.has("functionCall")) {
                            // Handle Function Call
                            com.fasterxml.jackson.databind.JsonNode functionCall = firstPart.get("functionCall");
                            String functionName = functionCall.get("name").asText();
                            Map<String, Object> args = objectMapper.convertValue(functionCall.get("args"), Map.class);

                            // Add function call to history
                            modelContent.put("parts", List
                                    .of(Map.of("functionCall", objectMapper.convertValue(functionCall, Map.class))));
                            contents.add(modelContent);

                            // Execute Tool
                            Object toolResult = executeTool(functionName, args);

                            // Add Function Response
                            Map<String, Object> functionResponseContent = new HashMap<>();
                            functionResponseContent.put("role", "function");
                            functionResponseContent.put("parts", List.of(Map.of(
                                    "functionResponse", Map.of(
                                            "name", functionName,
                                            "response", Map.of("result", toolResult)))));
                            contents.add(functionResponseContent);

                            // Update Request with new history
                            request.put("contents", contents);
                            turns++;
                            // Continue loop to send function result back to model
                        } else {
                            // Just text response - we are done
                            String text = firstPart.path("text").asText();
                            modelContent.put("parts", List.of(Map.of("text", text)));
                            contents.add(modelContent);
                            return text;
                        }
                    } else {
                        return "Error: Empty response parts from AI.";
                    }
                } else {
                    return "Error: No candidates from AI.";
                }
            }
            return "Error: Too many function calls (max 10).";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing AI response: " + e.getMessage();
        }
    }

    private List<Map<String, Object>> getTools() {
        return List.of(
                Map.of(
                        "name", "list_tenants",
                        "description", "Get a list of all tenants",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of(), "required", List.of())),
                Map.of(
                        "name", "list_properties",
                        "description", "Get a list of all properties",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of(), "required", List.of())),
                Map.of(
                        "name", "search_transactions",
                        "description", "Search transactions by date range",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "startDate",
                                        Map.of("type", "STRING", "description", "Start date in YYYY-MM-DD format"),
                                        "endDate",
                                        Map.of("type", "STRING", "description", "End date in YYYY-MM-DD format")),
                                "required", List.of("startDate", "endDate"))),
                Map.of(
                        "name", "add_property",
                        "description", "Add a new property",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "address", Map.of("type", "STRING", "description", "Property address"),
                                        "rent", Map.of("type", "NUMBER", "description", "Monthly rent amount"),
                                        "maintenance",
                                        Map.of("type", "NUMBER", "description", "Monthly maintenance amount")),
                                "required", List.of("address", "rent"))),
                Map.of(
                        "name", "add_tenant",
                        "description", "Add a new tenant",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "name", Map.of("type", "STRING", "description", "Tenant name"),
                                        "propertyId",
                                        Map.of("type", "NUMBER", "description", "ID of the property to assign"),
                                        "contactNo", Map.of("type", "STRING", "description", "Contact number"),
                                        "rent", Map.of("type", "NUMBER", "description", "Agreed rent amount"),
                                        "security", Map.of("type", "NUMBER", "description", "Security deposit amount"),
                                        "moveInDate",
                                        Map.of("type", "STRING", "description", "Move-in date (YYYY-MM-DD)")),
                                "required", List.of("name", "propertyId"))),
                Map.of(
                        "name", "add_transaction",
                        "description", "Record a new transaction (payment)",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "propertyId", Map.of("type", "NUMBER", "description", "Property ID"),
                                        "tenantId", Map.of("type", "NUMBER", "description", "Tenant ID"),
                                        "type",
                                        Map.of("type", "STRING", "description",
                                                "Payment type (Rent, Security Deposit, etc.)"),
                                        "amount", Map.of("type", "NUMBER", "description", "Payment amount"),
                                        "transactionDate",
                                        Map.of("type", "STRING", "description", "Date of payment (YYYY-MM-DD)"),
                                        "forMonth",
                                        Map.of("type", "STRING", "description",
                                                "Month the payment is for (e.g., 'January 2024')"),
                                        "comments", Map.of("type", "STRING", "description", "Any comments")),
                                "required", List.of("propertyId", "type", "amount", "transactionDate"))));
    }

    // Helper to execute tools (will be used in the loop)
    public Object executeTool(String name, Map<String, Object> args) {
        if ("list_tenants".equals(name)) {
            return tenantService.list(1, 1000).data;
        } else if ("list_properties".equals(name)) {
            return propertyService.list(1, 1000).data;
        } else if ("search_transactions".equals(name)) {
            String start = (String) args.get("startDate");
            String end = (String) args.get("endDate");
            return transactionService.searchTransactions(LocalDate.parse(start), LocalDate.parse(end));
        } else if ("add_property".equals(name)) {
            com.example.tenantmanagement.web.dto.PropertyDto dto = new com.example.tenantmanagement.web.dto.PropertyDto();
            dto.address = (String) args.get("address");
            if (args.get("rent") instanceof Number)
                dto.rent = ((Number) args.get("rent")).doubleValue();
            if (args.get("maintenance") instanceof Number)
                dto.maintenance = ((Number) args.get("maintenance")).doubleValue();
            return propertyService.create(dto);
        } else if ("add_tenant".equals(name)) {
            com.example.tenantmanagement.web.dto.TenantDto dto = new com.example.tenantmanagement.web.dto.TenantDto();
            dto.name = (String) args.get("name");
            if (args.get("propertyId") instanceof Number)
                dto.propertyId = ((Number) args.get("propertyId")).longValue();
            dto.contactNo = (String) args.get("contactNo");
            if (args.get("rent") instanceof Number)
                dto.rent = ((Number) args.get("rent")).doubleValue();
            if (args.get("security") instanceof Number)
                dto.security = ((Number) args.get("security")).doubleValue();
            if (args.get("moveInDate") != null)
                dto.moveInDate = LocalDate.parse((String) args.get("moveInDate"));
            return tenantService.create(dto);
        } else if ("add_transaction".equals(name)) {
            com.example.tenantmanagement.web.dto.TransactionDto dto = new com.example.tenantmanagement.web.dto.TransactionDto();
            if (args.get("propertyId") instanceof Number)
                dto.propertyId = ((Number) args.get("propertyId")).longValue();
            if (args.get("tenantId") instanceof Number)
                dto.tenantId = ((Number) args.get("tenantId")).longValue();
            dto.type = (String) args.get("type");
            if (args.get("amount") instanceof Number)
                dto.amount = ((Number) args.get("amount")).doubleValue();
            if (args.get("transactionDate") != null)
                dto.transactionDate = LocalDate.parse((String) args.get("transactionDate"));
            dto.forMonth = (String) args.get("forMonth");
            dto.comments = (String) args.get("comments");
            return transactionService.create(dto);
        }
        return null;
    }
}
