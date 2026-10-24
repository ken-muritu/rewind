import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../lib/db.js";
import { comparePassword, signToken } from "../lib/auth.js";
import { handleCors as setCors } from "../lib/cors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = getDb();
    const result = await db.execute({
      sql: "SELECT id, email, password_hash, full_name FROM users WHERE email = ?",
      args: [String(email).toLowerCase().trim()],
    });

    const row = result.rows[0];
    if (!row) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const valid = await comparePassword(String(password), String(row.password_hash));
    if (!valid) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const user = {
      id: String(row.id),
      email: String(row.email),
      full_name: row.full_name ? String(row.full_name) : null,
    };
    const access_token = signToken(user);

    return res.status(200).json({
      user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } },
      session: {
        access_token,
        user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } },
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}
