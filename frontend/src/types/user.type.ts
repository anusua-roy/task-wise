export type Role = "admin" | "user";
export type User = {
  id: string;
  name: string;
  email: string;
  role: { name: Role };
};
export type UserFormType = {
  id: string;
  name: string;
  email: string;
  role: Role;
};