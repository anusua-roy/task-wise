import { http } from "./http";

export const getRoles = () =>
  http<{ id: string; name: string }[]>("/api/roles/");
