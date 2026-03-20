import { appConfig } from "../../app/config";
import type { HttpErrorPayload } from "../errors/errorCodes";

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  headers?: HeadersInit;
};

export class HttpError extends Error {
  status: number;
  payload?: HttpErrorPayload;

  constructor(message: string, status: number, payload?: HttpErrorPayload) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let payload: HttpErrorPayload | undefined;

    try {
      payload = (await response.json()) as HttpErrorPayload;
    } catch {
      payload = undefined;
    }

    throw new HttpError(
      payload?.erro?.mensagem ?? `HTTP ${response.status}`,
      response.status,
      payload,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}