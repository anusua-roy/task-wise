import { http } from "./http";

export type BackendUser = {
  id: string;
  email: string;
  name: string;
  role_id: string;
};

export function getUsers() {
  return http<BackendUser[]>("/api/users/");
}
