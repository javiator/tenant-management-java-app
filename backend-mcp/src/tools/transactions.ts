import { z } from "zod";
import type { createServer } from "@modelcontextprotocol/server";
import {
  transactionCreateSchema,
  transactionListSchema,
  transactionSchema,
  transactionUpdateSchema
} from "../types.js";
import { requestJson, requestVoid } from "../httpClient.js";

type MCPServer = ReturnType<typeof createServer>;

const transactionUpdateWithIdSchema = z
  .object({
    id: z.number().int().nonnegative(),
    ...transactionUpdateSchema.shape
  })
  .refine((value) => {
    const { id, ...changes } = value;
    return Object.values(changes).some((field) => field !== undefined);
  }, {
    message: "Provide at least one property to update."
  });

export function registerTransactionTools(server: MCPServer): void {
  const paymentLogicNote =
    "Payment logic: `payment_received` entries represent funds collected from tenants. " +
    "All other transaction types should be treated as outstanding amounts.";

  server.tool({
    name: "list_transactions",
    description: `Retrieve all transactions from the backend. ${paymentLogicNote}`,
    inputSchema: z
      .object({})
      .describe("No parameters required to list all transactions."),
    execute: async () => {
      const transactions = await requestJson(
        { method: "GET", path: "/api/transactions" },
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

  server.tool({
    name: "get_transaction",
    description: `Fetch a single transaction by identifier. ${paymentLogicNote}`,
    inputSchema: z.object({
      id: z.number().int().nonnegative().describe("Transaction identifier")
    }),
    execute: async ({ input }) => {
      const transaction = await requestJson(
        { method: "GET", path: `/api/transactions/${input.id}` },
        transactionSchema
      );
      return {
        content: [
          {
            type: "json",
            json: transaction
          }
        ]
      };
    }
  });

  server.tool({
    name: "create_transaction",
    description:
      "Create a transaction. Requires property, type, amount, and transaction date.",
    inputSchema: transactionCreateSchema,
    execute: async ({ input }) => {
      const transaction = await requestJson(
        { method: "POST", path: "/api/transactions", body: input },
        transactionSchema
      );
      return {
        content: [
          {
            type: "json",
            json: transaction
          }
        ]
      };
    }
  });

  server.tool({
    name: "update_transaction",
    description:
      "Update a transaction by identifier. Provide at least one field to change.",
    inputSchema: transactionUpdateWithIdSchema,
    execute: async ({ input }) => {
      const { id, ...body } = input;
      const transaction = await requestJson(
        { method: "PUT", path: `/api/transactions/${id}`, body },
        transactionSchema
      );
      return {
        content: [
          {
            type: "json",
            json: transaction
          }
        ]
      };
    }
  });

  server.tool({
    name: "delete_transaction",
    description: "Delete a transaction by identifier.",
    inputSchema: z.object({
      id: z.number().int().nonnegative()
    }),
    execute: async ({ input }) => {
      await requestVoid({
        method: "DELETE",
        path: `/api/transactions/${input.id}`
      });
      return {
        content: [
          {
            type: "text",
            text: `Transaction ${input.id} deleted successfully.`
          }
        ]
      };
    }
  });
}
