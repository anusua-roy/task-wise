import { User } from "../types/user.type";
import { http } from "./http";

export function getUsers() {
  return http<User[]>("/api/users/");
}
