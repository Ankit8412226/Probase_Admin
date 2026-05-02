import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { findUserByEmail, sanitizeUser } from "@/lib/services/users";
import type { AuthUser, UserRole } from "@/types";

const AUTH_COOKIE = "probase_admin_token";
const AUTH_MAX_AGE = 60 * 60 * 24 * 7;
const DEMO_USER: AuthUser = {
  id: "demo_admin",
  name: "Demo Admin",
  email: "demo@probase.io",
  role: "admin",
};

interface SessionPayload extends JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

function getJwtSecret() {
  return process.env.JWT_SECRET ?? "development-secret-change-me";
}

export function isDemoModeEnabled() {
  return (
    process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

export function getDemoUser() {
  return DEMO_USER;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: AUTH_MAX_AGE,
    },
  );
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    console.log("Auth Debug: User not found for email:", email);
    return null;
  }

  const passwordMatches = user.password.startsWith("$2")
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!passwordMatches) {
    console.log("Auth Debug: Password mismatch for user:", email);
    console.log("Auth Debug: DB Password starts with $2:", user.password.startsWith("$2"));
    return null;
  }

  return sanitizeUser(user);
}

export function getAuthCookieConfig(token: string) {
  return {
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_MAX_AGE,
  };
}

export function getClearAuthCookieConfig() {
  return {
    ...getAuthCookieConfig(""),
    maxAge: 0,
  };
}

export function parseSessionPayload(payload: SessionPayload): AuthUser {
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}

export async function getSessionUser() {
  if (isDemoModeEnabled()) {
    return getDemoUser();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  return payload ? parseSessionPayload(payload) : null;
}

export async function requireSessionUser(allowedRoles?: UserRole[]) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireApiUser(request: NextRequest, allowedRoles?: UserRole[]) {
  if (isDemoModeEnabled()) {
    return getDemoUser();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    throw new AuthError("Unauthorized", 401);
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    throw new AuthError("Invalid session", 401);
  }

  const user = parseSessionPayload(payload);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }

  return user;
}
