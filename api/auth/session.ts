import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getBearerToken, verifyToken } from "../lib/auth.js";
import { handleCors as setCors } from "../lib/cors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = getBearerToken(req);
  if (!token) {
    return res.status(200).json({ session: null, user: null });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(200).json({ session: null, user: null });
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.full_name ?? null },
  };

  return res.status(200).json({
    user: sessionUser,
    session: { access_token: token, user: sessionUser },
  });
}
