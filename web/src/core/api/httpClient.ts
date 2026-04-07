// web/src/core/api/httpClient.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpRequestConfig = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
};

export type ApiErrorCode =
  | "NAO_AUTORIZADO"
  | "NAO_AUTENTICADO"
  | "INVALIDO"
  | "NAO_ENCONTRADO"
  | "ERRO_INTERNO"
  | "CONFLITO";

export type ApiErrorEnvelope = {
  erro?: {
    codigo?: ApiErrorCode;
    mensagem?: string;
    detalhes?: Record<string, unknown>;
  };
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly code?: ApiErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    status: number;
    code?: ApiErrorCode;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "HttpError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

const API_BASE_URL =
 // (import.meta as ImportMeta).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";
  "http://localhost:3333/api";

let accessTokenGetter: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function registerAccessTokenGetter(getter: () => string | null): void {
  accessTokenGetter = getter;
}

export function registerUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

async function parseErrorResponse(response: Response): Promise<never> {
  if (isJsonResponse(response)) {
    const data = (await response.json()) as ApiErrorEnvelope;

    const code = data.erro?.codigo;
    const message =
      data.erro?.mensagem?.trim() || `Erro HTTP ${response.status}`;
    const details = data.erro?.detalhes;

    throw new HttpError({
      message,
      status: response.status,
      code,
      details,
    });
  }

  const text = await response.text().catch(() => "");
  throw new HttpError({
    message: text || `Erro HTTP ${response.status}`,
    status: response.status,
  });
}

export async function httpRequest<TResponse>(
  path: string,
  config: HttpRequestConfig = {},
): Promise<TResponse> {
  const token = accessTokenGetter?.() ?? null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...config.headers,
  };

  const hasBody = config.body !== undefined && config.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && config.body instanceof FormData;

  if (hasBody && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token && headers.Authorization !== "") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method: config.method ?? "GET",
    headers,
    body: hasBody
      ? isFormData
        ? (config.body as BodyInit)
        : JSON.stringify(config.body)
      : undefined,
    signal: config.signal,
    credentials: config.credentials ?? "include",
  });

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  if (isJsonResponse(response)) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}

export const httpClient = {
  get<TResponse>(
    path: string,
    config?: Omit<HttpRequestConfig, "method" | "body">,
  ) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "GET",
    });
  },

  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    config?: Omit<HttpRequestConfig, "method" | "body">,
  ) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "POST",
      body,
    });
  },

  put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    config?: Omit<HttpRequestConfig, "method" | "body">,
  ) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "PUT",
      body,
    });
  },

  patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    config?: Omit<HttpRequestConfig, "method" | "body">,
  ) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "PATCH",
      body,
    });
  },

  delete<TResponse>(
    path: string,
    config?: Omit<HttpRequestConfig, "method" | "body">,
  ) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "DELETE",
    });
  },
};