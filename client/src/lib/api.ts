const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Önceki localStorage tabanlı sürümden kalan token'ları bir kez temizle.
localStorage.removeItem("bayrat_access_token");
localStorage.removeItem("bayrat_refresh_token");

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

type RequestOptions = RequestInit & { auth?: boolean; retry?: boolean };

async function send<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, retry = true, headers, ...requestInit } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    credentials: "include",
    headers: {
      ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && auth && retry) {
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
  try {
    await send("/auth/refresh", {
      method: "POST",
      retry: false,
    });
    return true;
  } catch {
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
