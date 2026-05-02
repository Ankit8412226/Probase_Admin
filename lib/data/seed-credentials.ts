import type { UserRecord } from "@/types";

export const seededCredentials = [
  {
    label: "Admin",
    role: "admin",
    email: "admin@probase.io",
    password: "Admin@123",
  },
  {
    label: "Manager",
    role: "manager",
    email: "manager@probase.io",
    password: "Manager@123",
  },
  {
    label: "Business",
    role: "business",
    email: "business@probase.io",
    password: "Business@123",
  },
] as const;

export const seededUsers: UserRecord[] = [
  {
    id: "user_admin",
    name: "Sophia Carter",
    email: seededCredentials[0].email,
    role: seededCredentials[0].role,
    password: seededCredentials[0].password,
  },
  {
    id: "user_manager",
    name: "Ethan Brooks",
    email: seededCredentials[1].email,
    role: seededCredentials[1].role,
    password: seededCredentials[1].password,
  },
  {
    id: "user_business_01",
    name: "Olivia Hart",
    email: seededCredentials[2].email,
    role: seededCredentials[2].role,
    password: seededCredentials[2].password,
  },
];
