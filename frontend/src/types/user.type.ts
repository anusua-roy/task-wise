export type Role = "admin" | "manager" | "member";
export interface IUser  {
  id: string;
  name: string;
  email?: string;
  role: Role;
  avatar?: string;
};
