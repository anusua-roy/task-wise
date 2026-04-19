const USER_KEY = "app_user";

type StoredSession = {
  user: any;
  token: string;
  expiresAt: number;
};

export function setSession(user: any, token: string, ttlMs = 1000 * 60 * 60) {
  const data: StoredSession = {
    user,
    token,
    expiresAt: Date.now() + ttlMs,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

export function getSession() {
  const dataStr = localStorage.getItem(USER_KEY);
  if (!dataStr) return null;

  try {
    const data: StoredSession = JSON.parse(dataStr);

    if (Date.now() > data.expiresAt) {
      clearSession();
      return null;
    }

    return data;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
}
