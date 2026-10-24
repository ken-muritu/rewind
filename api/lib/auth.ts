import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { VercelRequest } from "@vercel/node";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set");
  return secret;
}

export function signToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, full_name: user.full_name ?? null },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    if (!payload.sub || !payload.email) return null;
    return {
      id: String(payload.sub),
      email: String(payload.email),
      full_name: (payload.full_name as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function requireUser(req: VercelRequest): AuthUser {
  const token = getBearerToken(req);
  if (!token) throw new Error("Unauthorized");
  const user = verifyToken(token);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
