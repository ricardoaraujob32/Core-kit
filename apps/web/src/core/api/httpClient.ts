// web/src/core/api/httpClient.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpRequestConfig = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  skipAuthRetry?: boolean;
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
    codigo?: string;
    mensagem?: string;
    detalhes?: Record<string, unknown>;
  };
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "HttpError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "https://corekit-api-homolog.onrender.com/api"
).replace(/\/+$/, "");

let accessTokenGetter: (() => string | null) | null = null;
let refreshSessionHandler: (() => Promise<boolean>) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function registerAccessTokenGetter(getter: () => string | null): void {
  accessTokenGetter = getter;
}

export function registerRefreshSessionHandler(handler: (() => Promise<boolean>) | null): void {
  refreshSessionHandler = handler;
}

export function registerUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

async function buildHttpError(response: Response): Promise<HttpError> {
  if (isJsonResponse(response)) {
    const data = (await response.json()) as ApiErrorEnvelope;

    return new HttpError({
      message: data.erro?.mensagem?.trim() || `Erro HTTP ${response.status}`,
      status: response.status,
      code: data.erro?.codigo,
      details: data.erro?.detalhes,
    });
  }

  const text = await response.text().catch(() => "");
  return new HttpError({
    message: text || `Erro HTTP ${response.status}`,
    status: response.status,
  });
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(config: HttpRequestConfig, token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...config.headers,
  };

  const hasBody = config.body !== undefined && config.body !== null;

  if (hasBody && !isFormDataBody(config.body)) {
    headers["Content-Type"] = "application/json";
  }

  // Permite desabilitar a injeção automática com `Authorization: ""`,
  // útil em refresh/logout.
  if (token && headers.Authorization !== "") {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function buildBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isFormDataBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseSuccessResponse<TResponse>(response: Response): Promise<TResponse> {
  if (response.status === 204) {
    return undefined as TResponse;
  }

  if (isJsonResponse(response)) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}

let refreshPromise: Promise<boolean> | null = null;

async function ensureRefreshedSession(): Promise<boolean> {
  if (!refreshSessionHandler) {
    return false;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await refreshSessionHandler();
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function rawFetch(path: string, config: HttpRequestConfig): Promise<Response> {
  const token = accessTokenGetter?.() ?? null;

  return fetch(buildUrl(path), {
    method: config.method ?? "GET",
    headers: buildHeaders(config, token),
    body: buildBody(config.body),
    signal: config.signal,
    credentials: config.credentials ?? "include",
  });
}

export async function httpRequest<TResponse>(path: string, config: HttpRequestConfig = {}): Promise<TResponse> {
  let response = await rawFetch(path, config);

  if (response.status === 401 && !config.skipAuthRetry) {
    const refreshed = await ensureRefreshedSession();

    if (refreshed) {
      response = await rawFetch(path, {
        ...config,
        skipAuthRetry: true,
      });
    } else {
      unauthorizedHandler?.();
    }
  }

  if (!response.ok) {
    throw await buildHttpError(response);
  }

  return parseSuccessResponse<TResponse>(response);
}

export const httpClient = {
  get<TResponse>(path: string, config?: Omit<HttpRequestConfig, "method" | "body">) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "GET",
    });
  },

  post<TResponse, TBody = unknown>(path: string, body?: TBody, config?: Omit<HttpRequestConfig, "method" | "body">) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "POST",
      body,
    });
  },

  put<TResponse, TBody = unknown>(path: string, body?: TBody, config?: Omit<HttpRequestConfig, "method" | "body">) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "PUT",
      body,
    });
  },

  patch<TResponse, TBody = unknown>(path: string, body?: TBody, config?: Omit<HttpRequestConfig, "method" | "body">) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "PATCH",
      body,
    });
  },

  delete<TResponse>(path: string, config?: Omit<HttpRequestConfig, "method" | "body">) {
    return httpRequest<TResponse>(path, {
      ...config,
      method: "DELETE",
    });
  },
};
