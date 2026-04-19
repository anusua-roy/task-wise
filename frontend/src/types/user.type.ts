export type Role = "Admin" | "Task-Creator" | "Read-Only";
export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};
export type UserFormType = {
  id: string;
  name: string;
  email: string;
  role: string;
};
