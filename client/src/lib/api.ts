const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const ACCESS_TOKEN_KEY = "bayrat_access_token";
const REFRESH_TOKEN_KEY = "bayrat_refresh_token";
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

type RequestOptions = RequestInit & { auth?: boolean; retry?: boolean };

async function send<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, retry = true, headers, ...requestInit } = options;
  const accessToken = tokenStorage.getAccess();

  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    headers: {
      ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
      ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && auth && retry && tokenStorage.getRefresh()) {
    const refreshed = await refreshSession();
    if (refreshed) return send<T>(path, { ...options, retry: false });
  }

  const payload = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "İstek tamamlanamadı",
      response.status,
      payload?.error?.code,
    );
  }
  return payload as T;
}

async function requestNewSession() {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  try {
    const payload = await send<{
      data: { accessToken: string; refreshToken: string };
    }>("/auth/refresh", {
      method: "POST",
      retry: false,
      body: JSON.stringify({ refreshToken }),
    });
    tokenStorage.set(payload.data.accessToken, payload.data.refreshToken);
    return true;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = requestNewSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const api = {
  get: <T>(path: string, auth = false) => send<T>(path, { auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    send<T>(path, { method: "POST", auth, body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body: unknown, auth = false) =>
    send<T>(path, { method: "PATCH", auth, body: JSON.stringify(body) }),
  delete: <T>(path: string, body: unknown, auth = false) =>
    send<T>(path, { method: "DELETE", auth, body: JSON.stringify(body) }),
};
