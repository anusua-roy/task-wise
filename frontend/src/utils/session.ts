// services/session.ts

type User = {
  id: string;
  name: string;
  email: string;
  role_id: string;
} | null;

let currentUser: User = null;

export function setSessionUser(user: User) {
  currentUser = user;
}

export function getSessionUser(): User {
  return currentUser;
}

export function clearSessionUser() {
  currentUser = null;
}
