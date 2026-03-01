export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned: boolean | null;
  banReason?: string | null;
  banExpires?: number | null;
  image?: string | null;
  createdAt: Date;
}

export interface EditingField {
  userId: string;
  field: "name" | "email" | "image";
}

export type Role = "user" | "admin";

export const validRoles: Role[] = ["user", "admin"];

export function isValidRole(value: string): value is Role {
  return validRoles.includes(value as Role);
}
