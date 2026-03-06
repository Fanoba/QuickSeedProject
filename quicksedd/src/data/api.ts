/**
 * api.ts – Cliente base para todas las llamadas al backend FastAPI.
 *
 * - Lee el token del localStorage
 * - Añade Authorization header automáticamente
 * - En 401 intenta refrescar el token una vez
 * - Lanza ApiError con el mensaje del backend
 */


const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// ── Tipos ──────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
}

export class ApiException extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiException";
  }
}

// ── Token helpers ──────────────────────────────────────────
export const tokenStorage = {
  getAccess: () => localStorage.getItem("access_token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// ── Refresh interno ────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new ApiException("No refresh token", 401);

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    tokenStorage.clear();
    throw new ApiException("Sesión expirada", 401);
  }

  const data = await res.json();
  tokenStorage.set(data.access_token, data.refresh_token);
  return data.access_token;
}

// ── Fetch wrapper principal ────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = tokenStorage.getAccess();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Token expirado → refrescar una vez
  if (res.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            headers["Authorization"] = `Bearer ${newToken}`;
            resolve(apiFetch<T>(endpoint, { ...options, headers }, false));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      return apiFetch<T>(endpoint, options, false);
    } catch (err) {
      processQueue(err, null);
      tokenStorage.clear();
      window.location.href = "/login";
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? body?.message ?? message;
    } catch {}
    throw new ApiException(message, res.status);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Métodos HTTP convenientes ──────────────────────────────
export const api = {
  get: <T>(url: string) => apiFetch<T>(url, { method: "GET" }),

  post: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) }),

  patch: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};

export default api;
