import { clearSessionUser, getSessionUser } from "../utils/session";
import { API_BASE_URL } from "../constants/Api.constants";

export async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const user = getSessionUser();

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(user ? { Authorization: `Bearer ${user.email}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearSessionUser();
      window.location.href = "/signin";
    }

    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "API Error");
  }

  return res.json();
}
