import { z } from "zod";
import type { createServer } from "@modelcontextprotocol/server";
import {
  tenantCreateSchema,
  tenantListSchema,
  tenantSchema,
  tenantUpdateSchema,
  transactionListSchema
} from "../types.js";
import { requestJson, requestVoid } from "../httpClient.js";

type MCPServer = ReturnType<typeof createServer>;

const tenantUpdateWithIdSchema = z
  .object({
    id: z.number().int().nonnegative(),
    ...tenantUpdateSchema.shape
  })
  .refine((value) => {
    const { id, ...changes } = value;
    return Object.values(changes).some((field) => field !== undefined);
  }, {
    message: "Provide at least one property to update."
  });

export function registerTenantTools(server: MCPServer): void {
  server.tool({
    name: "list_tenants",
    description: "Retrieve all tenants from the backend.",
    inputSchema: z
      .object({})
      .describe("No parameters required to list all tenants."),
    execute: async () => {
      const tenants = await requestJson(
        { method: "GET", path: "/api/tenants" },
        tenantListSchema
      );
      return {
        content: [
          {
            type: "json",
            json: tenants
          }
        ]
      };
    }
  });

  server.tool({
    name: "get_tenant",
    description: "Fetch a single tenant by identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative().describe("Tenant identifier")
    }),
    execute: async ({ input }) => {
      const tenant = await requestJson(
        { method: "GET", path: `/api/tenants/${input.id}` },
        tenantSchema
      );
      return {
        content: [
          {
            type: "json",
            json: tenant
          }
        ]
      };
    }
  });

  server.tool({
    name: "create_tenant",
    description:
      "Create a tenant. Requires at least the tenant name and associated property.",
    inputSchema: tenantCreateSchema,
    execute: async ({ input }) => {
      const tenant = await requestJson(
        { method: "POST", path: "/api/tenants", body: input },
        tenantSchema
      );
      return {
        content: [
          {
            type: "json",
            json: tenant
          }
        ]
      };
    }
  });

  server.tool({
    name: "update_tenant",
    description:
      "Update a tenant. Provide the tenant identifier and at least one field to change.",
    inputSchema: tenantUpdateWithIdSchema,
    execute: async ({ input }) => {
      const { id, ...body } = input;
      const tenant = await requestJson(
        { method: "PUT", path: `/api/tenants/${id}`, body },
        tenantSchema
      );
      return {
        content: [
          {
            type: "json",
            json: tenant
          }
        ]
      };
    }
  });

  server.tool({
    name: "delete_tenant",
    description: "Delete a tenant by identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative()
    }),
    execute: async ({ input }) => {
      await requestVoid({
        method: "DELETE",
        path: `/api/tenants/${input.id}`
      });
      return {
        content: [
          {
            type: "text",
            text: `Tenant ${input.id} deleted successfully.`
          }
        ]
      };
    }
  });

  server.tool({
    name: "list_tenant_transactions",
    description:
      "Return every transaction associated with a tenant identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative().describe("Tenant identifier")
    }),
    execute: async ({ input }) => {
      const transactions = await requestJson(
        { method: "GET", path: `/api/tenants/${input.id}/transactions` },
        transactionListSchema
      );
      return {
        content: [
          {
            type: "json",
            json: transactions
          }
        ]
      };
    }
  });
}
