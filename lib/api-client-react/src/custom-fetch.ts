export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type BodyType = unknown;
export type AuthTokenGetter = () => Promise<string | null> | string | null;

const NO_BODY_STATUS = new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

function isUrl(input: RequestInfo | URL): input is URL {
  return typeof URL !== "undefined" && input instanceof URL;
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;

  const url = resolveUrl(input);
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;

  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function getMediaType(headers: Headers): string | null {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}

function isJsonMediaType(mediaType: string | null): boolean {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}

function isTextMediaType(mediaType: string | null): boolean {
  return Boolean(
    mediaType &&
      (mediaType.startsWith("text/") ||
        mediaType === "application/xml" ||
        mediaType === "text/xml" ||
        mediaType.endsWith("+xml") ||
        mediaType === "application/x-www-form-urlencoded"),
  );
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function buildErrorMessage(response: Response, data: unknown): string {
  const prefix = `HTTP ${response.status} ${response.statusText}`;

  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${text}` : prefix;
  }

  if (data && typeof data === "object") {
    const candidate = data as Record<string, unknown>;
    const message =
      (typeof candidate.title === "string" && candidate.title) ||
      (typeof candidate.detail === "string" && candidate.detail) ||
      (typeof candidate.message === "string" && candidate.message) ||
      (typeof candidate.error === "string" && candidate.error);

    if (message) return `${prefix}: ${message}`;
  }

  return prefix;
}

export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;

  constructor(
    response: Response,
    data: T | null,
    requestInfo: { method: string; url: string },
  ) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}

export type ErrorType = ApiError<unknown>;

async function readBody(
  response: Response,
  responseType: "json" | "text" | "blob" | "auto",
): Promise<unknown> {
  if (NO_BODY_STATUS.has(response.status) || response.body === null) {
    return null;
  }

  const mediaType = getMediaType(response.headers);
  const effectiveType =
    responseType === "auto"
      ? isJsonMediaType(mediaType)
        ? "json"
        : isTextMediaType(mediaType) || mediaType == null
          ? "text"
          : "blob"
      : responseType;

  if (effectiveType === "blob") {
    return typeof response.blob === "function" ? response.blob() : response.arrayBuffer();
  }

  const text = await response.text();
  if (text.trim() === "") return null;

  if (effectiveType === "json" || looksLikeJson(text)) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  const requestInput = applyBaseUrl(input);
  const method = (options.method ?? (isRequest(requestInput) ? requestInput.method : "GET")).toUpperCase();
  const url = resolveUrl(requestInput);

  const headers = mergeHeaders(
    isRequest(requestInput) ? requestInput.headers : undefined,
    options.headers,
  );

  if (!headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  const token = _authTokenGetter ? await _authTokenGetter() : null;
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(requestInput, {
    ...options,
    method,
    headers,
  });

  const body = await readBody(response, options.responseType ?? "auto");

  if (!response.ok) {
    throw new ApiError(response, body, { method, url });
  }

  return body as T;
}