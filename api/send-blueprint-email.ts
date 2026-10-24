import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { getDb } from "./lib/db.js";
import { requireUser } from "./lib/auth.js";
import { handleCors as setCors } from "./lib/cors.js";

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = requireUser(req);
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "RESEND_API_KEY is not configured" });
    }

    const {
      recipientEmail,
      recipientName,
      senderName,
      blueprintContent,
      blueprintDate,
    } = req.body ?? {};

    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return res.status(400).json({ success: false, error: "Invalid recipient email" });
    }
    if (!senderName || senderName.length > 100) {
      return res.status(400).json({ success: false, error: "Invalid sender name" });
    }
    if (!blueprintContent || blueprintContent.length > 50000) {
      return res.status(400).json({ success: false, error: "Blueprint content invalid or too long" });
    }

    const db = getDb();
    const bp = await db.execute({
      sql: "SELECT id FROM blueprints WHERE user_id = ? LIMIT 1",
      args: [user.id],
    });
    if (!bp.rows.length) {
      return res.status(403).json({ success: false, error: "No blueprint found for this user" });
    }

    const safeSenderName = escapeHtml(senderName);
    const safeRecipientName = recipientName ? escapeHtml(recipientName) : null;
    const safeBlueprintDate = escapeHtml(blueprintDate || "");

    const htmlContent = String(blueprintContent)
      .split("\n")
      .map((line) => {
        const escapedLine = escapeHtml(line);
        if (line.startsWith("## ")) {
          return `<h2 style="color: #6366F1; font-size: 20px; margin-top: 24px; margin-bottom: 12px;">${escapeHtml(line.replace("## ", ""))}</h2>`;
        }
        if (line.startsWith("### ")) {
          return `<h3 style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">${escapeHtml(line.replace("### ", ""))}</h3>`;
        }
        if (line.startsWith("# ")) {
          return `<h1 style="font-size: 24px; margin-top: 24px; margin-bottom: 12px;">${escapeHtml(line.replace("# ", ""))}</h1>`;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return `<p style="font-weight: bold; margin: 12px 0 8px;">${escapeHtml(line.replace(/\*\*/g, ""))}</p>`;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return `<li style="margin-left: 20px; margin-bottom: 6px;">${escapeHtml(line.replace(/^[-*] /, ""))}</li>`;
        }
        if (/^\d+\. /.test(line)) {
          return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: decimal;">${escapeHtml(line.replace(/^\d+\. /, ""))}</li>`;
        }
        if (line.trim() === "") return "<br/>";
        return `<p style="margin-bottom: 8px; color: #333;">${escapedLine}</p>`;
      })
      .join("\n");

    const resend = new Resend(apiKey);
    const emailResponse = await resend.emails.send({
      from: "REWIND <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${safeSenderName} shared their 2025 Blueprint with you!`,
      html: `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0 0 8px; font-size: 28px;">2025 Blueprint</h1>
          <p style="margin: 0; opacity: 0.9;">Shared by ${safeSenderName}</p>
        </div>
        <div style="background: #F5F5F0; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <p style="margin: 0;">${safeRecipientName ? `Hi ${safeRecipientName},` : "Hi there,"}<br/><br/>
          ${safeSenderName} wanted to share their personalized 2025 Blueprint with you.</p>
        </div>
        <div style="background: white; border: 1px solid #E5E5E5; border-radius: 12px; padding: 24px;">
          <p style="text-align: center; color: #6366F1;">Created on ${safeBlueprintDate}</p>
          ${htmlContent}
        </div>
        <div style="text-align: center; margin-top: 24px; color: #888; font-size: 14px;">
          Start your own reflection journey at
          <a href="${process.env.SITE_URL || "https://rewindsite.vercel.app"}" style="color: #6366F1;">rewindsite.vercel.app</a>
        </div>
      </body></html>`,
    });

    return res.status(200).json({ success: true, data: emailResponse });
  } catch (err) {
    console.error("send-blueprint-email error:", err);
    const message = err instanceof Error ? err.message : "Failed to send email";
    const status = message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ success: false, error: message });
  }
}
