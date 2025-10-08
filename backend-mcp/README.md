# Backend MCP Server

Model Context Protocol (MCP) server that wraps the Tenant Management backend REST API and exposes it as agent-friendly tools. Use this service to let agentic workflows perform CRUD operations on properties, tenants, and transactions without re-implementing business logic.

## Prerequisites

- Node.js >= 20.11
- Tenant Management backend reachable at `BACKEND_MCP_BASE_URL` (default: `http://localhost:8080`)
- `npm` or `pnpm` for dependency management

## Installation

```bash
cd backend-mcp
cp .env.example .env             # adjust values as needed
npm install
```

## Available Scripts

- `npm run dev` – run the MCP server in watch mode (via `tsx`)
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run the compiled server (`node dist/index.js`)
- `npm run lint` – lint the TypeScript sources

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_MCP_BASE_URL` | Base URL of the Spring Boot backend REST API. | `http://localhost:8080` |
| `BACKEND_MCP_API_TOKEN` | Optional bearer token for secured deployments. | _unset_ |

The server validates configuration on startup; misconfigured values surface as immediate errors so they can be corrected quickly.

## Tool Catalogue

All tools return JSON unless noted otherwise. Dates use ISO 8601 strings (`YYYY-MM-DD`) to align with the backend.

### Property Tools

| Tool | Purpose | Input Shape |
|------|---------|-------------|
| `list_properties` | Fetch every property managed by the backend. | `{}` |
| `get_property` | Load a property by identifier. | `{ "id": number }` |
| `create_property` | Create a property. | `{ "address": string, "rent": number, "maintenance": number }` |
| `update_property` | Update a property. | `{ "id": number, "address": string, "rent": number, "maintenance": number }` |
| `delete_property` | Delete a property. Returns a confirmation text. | `{ "id": number }` |
| `list_property_transactions` | Retrieve transactions for a property. | `{ "id": number }` |

Example call:

```jsonc
{
  "tool": "create_property",
  "input": {
    "address": "400 Market Street, Unit 9",
    "rent": 1800,
    "maintenance": 150
  }
}
```

### Tenant Tools

| Tool | Purpose | Input Shape |
|------|---------|-------------|
| `list_tenants` | Fetch all tenants (includes linked property info). | `{}` |
| `get_tenant` | Load a tenant by identifier. | `{ "id": number }` |
| `create_tenant` | Create a tenant. Requires `name` and `propertyId`. | `{ "name": string, "propertyId": number, ...optional fields }` |
| `update_tenant` | Update one or more tenant fields. | `{ "id": number, ...at least one field }` |
| `delete_tenant` | Delete a tenant. Returns a confirmation text. | `{ "id": number }` |
| `list_tenant_transactions` | Retrieve all transactions for a tenant. | `{ "id": number }` |

Optional tenant fields include passport details, contact info, rent/security, and contract dates. Set a value to `null` to clear it.

### Transaction Tools

| Tool | Purpose | Input Shape |
|------|---------|-------------|
| `list_transactions` | Fetch every transaction. | `{}` |
| `get_transaction` | Load a transaction by identifier. | `{ "id": number }` |
| `create_transaction` | Create a transaction. Requires `propertyId`, `type`, `amount`, `transactionDate`. | `{ "propertyId": number, "type": string, "amount": number, "transactionDate": string, ...optional }` |
| `update_transaction` | Update one or more transaction fields. | `{ "id": number, ...at least one field }` |
| `delete_transaction` | Delete a transaction. Returns a confirmation text. | `{ "id": number }` |

**Payment categorisation:** Treat every transaction type other than `payment_received` as an outstanding amount. `payment_received` entries indicate funds already collected from the tenant, so client summaries should subtract those from outstanding balances.

## Error Handling

- Backend validation errors propagate with status codes and messages, making it clear which field needs attention.
- The MCP server surfaces connectivity issues as structured MCP errors, so agent orchestrators can retry or escalate.

## Extending the Server

1. Add new helper functions or schemas under `src/`.
2. Register additional tools alongside the existing modules in `src/tools/`.
3. Update documentation (this file) and `.cursor/rules/backend-mcp.mdc` to guide future contributors.

## Testing Locally

```bash
# Ensure the Spring backend is running (e.g., mvn spring-boot:run)
cd backend-mcp
npm run dev
# Connect your MCP-compatible client (Claude Desktop, Cursor MCP, etc.)
```

The server automatically hot-reloads when you edit files during `npm run dev`. Stop with `Ctrl+C`.
