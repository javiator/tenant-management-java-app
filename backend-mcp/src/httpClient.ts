import { z } from "zod";
import { config } from "./config.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export class BackendApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.details = details;
  }
}

async function send(options: RequestOptions): Promise<Response> {
  const url = new URL(options.path, `${config.baseUrl}/`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  if (config.apiToken) {
    headers.Authorization = `Bearer ${config.apiToken}`;
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body, (_key, value) =>
            value instanceof Date ? value.toISOString() : value
          )
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    const message =
      typeof details === "string" && details.trim().length > 0
        ? details
        : response.statusText || "Unknown backend API error";
    throw new BackendApiError(response.status, message, details);
  }

  return response;
}

export async function requestJson<T>(
  options: RequestOptions,
  schema: z.ZodType<T>
): Promise<T> {
  const response = await send(options);
  if (response.status === 204) {
    throw new BackendApiError(
      500,
      "Backend returned no content but JSON was expected"
    );
  }

  const data = (await response.json()) as unknown;
  return schema.parse(data);
}

export async function requestVoid(options: RequestOptions): Promise<void> {
  const response = await send(options);
  if (response.status !== 204 && response.headers.get("Content-Length") !== "0") {
    // Drain body for consistent connection reuse, but ignore content.
    await response.arrayBuffer();
  }
}
