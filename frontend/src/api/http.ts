import { clearSession, getSession } from "../utils/session";
import { API_BASE_URL } from "../constants/Api.constants";

export async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const session = getSession();
  const token = session?.token;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
      window.location.href = "/signin";
    }

    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "API Error");
  }

  return res.json();
}
