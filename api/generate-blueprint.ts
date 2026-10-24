import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireUser } from "./lib/auth.js";
import { handleCors as setCors } from "./lib/cors.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const systemPrompt = `You are an insightful life coach and personal development expert. You analyze someone's year-in-review reflections to create a personalized "Blueprint" for their journey ahead.

Based on the reflection answers provided, generate a comprehensive yet inspiring blueprint that includes:

1. **Core Themes** (2-3 themes): Identify the major patterns or themes that emerged from their reflection
2. **Key Insights** (3-4 insights): Deep observations about their growth, challenges, and patterns
3. **Strengths Revealed**: What strengths did they demonstrate?
4. **Growth Areas**: Where is there opportunity for development?
5. **Goals Ahead** (3-5 goals): Specific, actionable goals based on their reflections
6. **Quarterly Focus Areas**: Suggest a theme or focus for each quarter of the coming year
7. **Affirmation**: A personalized affirmation or mantra for their journey ahead
8. **One Word Theme**: Suggest one word that could define their path forward

Be warm, encouraging, and specific. Reference their actual answers when making recommendations. Avoid generic advice - make it personal to their journey.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = requireUser(req);
    const { answers } = req.body ?? {};

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid answers format" });
    }
    if (answers.length > 100) {
      return res.status(400).json({ error: "Too many answers provided" });
    }

    const sanitizeText = (text: string) =>
      text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();

    const sanitizedAnswers = answers.map(
      (answer: { question: string; answer: string; category: string }) => {
        if (
          typeof answer.question !== "string" ||
          typeof answer.answer !== "string" ||
          typeof answer.category !== "string"
        ) {
          throw new Error("Invalid answer structure");
        }
        return {
          question: sanitizeText(answer.question),
          answer: sanitizeText(answer.answer),
          category: sanitizeText(answer.category),
        };
      }
    );

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "LOVABLE_API_KEY is not configured" });
    }

    const formattedAnswers = sanitizedAnswers
      .map((a) => `**${a.category} - ${a.question}**\n${a.answer}`)
      .join("\n\n");

    const userPrompt = `Here are someone's year-in-review reflection answers:\n\n${formattedAnswers}\n\nPlease create their personalized Blueprint for the next year.`;

    console.log("Calling Lovable AI Gateway for user:", user.id);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
      }
      if (response.status === 402) {
        return res.status(402).json({ error: "AI usage limit reached. Please add credits to continue." });
      }
      return res.status(500).json({ error: `AI gateway error: ${response.status}` });
    }

    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader("Content-Type", "text/event-stream");

    if (!response.body) {
      return res.status(500).json({ error: "No response body from AI gateway" });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    return res.end();
  } catch (err) {
    console.error("generate-blueprint error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
