import { createServer } from "@modelcontextprotocol/server";
import { registerPropertyTools } from "./tools/properties.js";
import { registerTenantTools } from "./tools/tenants.js";
import { registerTransactionTools } from "./tools/transactions.js";
import "./config.js";

const server = createServer({
  name: "tenant-management-backend-mcp",
  version: "0.1.0",
  description:
    "MCP server exposing the Tenant Management backend REST API as agent-friendly tools."
});

registerPropertyTools(server);
registerTenantTools(server);
registerTransactionTools(server);

void server.start();
