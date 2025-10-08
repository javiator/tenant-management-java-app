import { z } from "zod";
import type { createServer } from "@modelcontextprotocol/server";
import {
  propertyInputSchema,
  propertyListSchema,
  propertySchema,
  transactionListSchema
} from "../types.js";
import { requestJson, requestVoid } from "../httpClient.js";

type MCPServer = ReturnType<typeof createServer>;

export function registerPropertyTools(server: MCPServer): void {
  server.tool({
    name: "list_properties",
    description:
      "Retrieve every property managed by the tenant management backend.",
    inputSchema: z
      .object({})
      .describe("No parameters required to list all properties."),
    execute: async () => {
      const properties = await requestJson(
        { method: "GET", path: "/api/properties" },
        propertyListSchema
      );
      return {
        content: [
          {
            type: "json",
            json: properties
          }
        ]
      };
    }
  });

  server.tool({
    name: "get_property",
    description: "Fetch a single property by its identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative().describe("Property identifier")
    }),
    execute: async ({ input }) => {
      const property = await requestJson(
        { method: "GET", path: `/api/properties/${input.id}` },
        propertySchema
      );
      return {
        content: [
          {
            type: "json",
            json: property
          }
        ]
      };
    }
  });

  server.tool({
    name: "create_property",
    description: "Create a new property with address, rent, and maintenance.",
    inputSchema: propertyInputSchema,
    execute: async ({ input }) => {
      const property = await requestJson(
        { method: "POST", path: "/api/properties", body: input },
        propertySchema
      );
      return {
        content: [
          {
            type: "json",
            json: property
          }
        ]
      };
    }
  });

  server.tool({
    name: "update_property",
    description:
      "Update an existing property. All fields must be provided for now.",
    inputSchema: propertyInputSchema.extend({
      id: z.number().int().nonnegative()
    }),
    execute: async ({ input }) => {
      const { id, ...payload } = input;
      const property = await requestJson(
        { method: "PUT", path: `/api/properties/${id}`, body: payload },
        propertySchema
      );
      return {
        content: [
          {
            type: "json",
            json: property
          }
        ]
      };
    }
  });

  server.tool({
    name: "delete_property",
    description: "Delete a property by its identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative()
    }),
    execute: async ({ input }) => {
      await requestVoid({
        method: "DELETE",
        path: `/api/properties/${input.id}`
      });
      return {
        content: [
          {
            type: "text",
            text: `Property ${input.id} deleted successfully.`
          }
        ]
      };
    }
  });

  server.tool({
    name: "list_property_transactions",
    description:
      "Return every transaction linked to a particular property identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative().describe("Property identifier")
    }),
    execute: async ({ input }) => {
      const transactions = await requestJson(
        { method: "GET", path: `/api/properties/${input.id}/transactions` },
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
