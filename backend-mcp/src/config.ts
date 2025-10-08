import { z } from "zod";

const envSchema = z.object({
  BACKEND_MCP_BASE_URL: z
    .string()
    .url()
    .describe("Base URL for the tenant management backend API"),
  BACKEND_MCP_API_TOKEN: z
    .string()
    .min(1)
    .optional()
    .describe("Optional bearer token for authenticated environments")
});

const parsed = envSchema.safeParse({
  BACKEND_MCP_BASE_URL:
    process.env.BACKEND_MCP_BASE_URL ?? "http://localhost:8080",
  BACKEND_MCP_API_TOKEN: process.env.BACKEND_MCP_API_TOKEN
});

if (!parsed.success) {
  const formatted = parsed.error.errors
    .map((err) => `${err.path.join(".") || "value"}: ${err.message}`)
    .join("; ");
  throw new Error(`Invalid MCP server configuration: ${formatted}`);
}

export const config = {
  baseUrl: parsed.data.BACKEND_MCP_BASE_URL.replace(/\/+$/, ""),
  apiToken: parsed.data.BACKEND_MCP_API_TOKEN
};
