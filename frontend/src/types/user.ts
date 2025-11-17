export type Role = "admin" | "manager" | "member";
export type User = {
  id: string;
  name: string;
  email?: string;
  role: Role;
  avatar?: string;
};
