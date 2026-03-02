// utils/session.ts

const USER_KEY = "app_user";

type StoredUser = {
  user: any;
  expiresAt: number;
};

export function setSessionUser(user: any, ttlMs: number = 1000 * 60 * 60) {
  // default 1h
  const data: StoredUser = {
    user,
    expiresAt: Date.now() + ttlMs,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

export function getSessionUser() {
  const dataStr = localStorage.getItem(USER_KEY);
  if (!dataStr) return null;

  try {
    const data: StoredUser = JSON.parse(dataStr);
    if (Date.now() > data.expiresAt) {
      clearSessionUser();
      return null;
    }
    return data.user;
  } catch {
    clearSessionUser();
    return null;
  }
}

export function clearSessionUser() {
  localStorage.removeItem(USER_KEY);
}
