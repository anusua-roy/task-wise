import { User } from "../types/user.type";
import { http } from "./http";

export function getUsers() {
  return http<User[]>("/api/users/");
}

export const createUser = (data: any) =>
  http<User>("/api/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = (id: string, data: any) =>
  http<User>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = (id: string) =>
  http(`/api/users/${id}`, {
    method: "DELETE",
  });