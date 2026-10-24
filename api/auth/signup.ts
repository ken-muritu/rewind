import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, newId } from "../lib/db.js";
import { hashPassword, signToken } from "../lib/auth.js";
import { handleCors as setCors } from "../lib/cors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password, full_name } = req.body ?? {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const db = getDb();
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email.toLowerCase().trim()],
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    const id = newId();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await db.batch([
      {
        sql: `INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, email.toLowerCase().trim(), passwordHash, full_name?.trim() || null, now, now],
      },
      {
        sql: `INSERT INTO profiles (id, created_at, updated_at) VALUES (?, ?, ?)`,
        args: [id, now, now],
      },
    ]);

    const user = { id, email: email.toLowerCase().trim(), full_name: full_name?.trim() || null };
    const access_token = signToken(user);

    return res.status(200).json({
      user: { id, email: user.email, user_metadata: { full_name: user.full_name } },
      session: { access_token, user: { id, email: user.email, user_metadata: { full_name: user.full_name } } },
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
}
