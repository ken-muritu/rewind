import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, newId } from "../lib/db.js";
import { requireUser } from "../lib/auth.js";
import { handleCors as setCors } from "../lib/cors.js";

const ALLOWED_TABLES = new Set([
  "profiles",
  "reflections",
  "reflection_answers",
  "blueprints",
  "blueprint_notes",
  "blueprint_reminders",
  "blueprint_goals",
]);

const USER_SCOPED = new Set([
  "profiles",
  "reflections",
  "reflection_answers",
  "blueprints",
  "blueprint_notes",
  "blueprint_reminders",
  "blueprint_goals",
]);

// Column names and ORDER BY targets come from the client, and SQL placeholders
// can't bind identifiers, so every identifier is checked against this pattern
// before it is put into a query.
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

class BadRequest extends Error {}

function ident(name: string): string {
  if (!IDENTIFIER.test(name)) throw new BadRequest(`Invalid column: ${name.slice(0, 40)}`);
  return name;
}

function parseTags(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string") return value;
  return "[]";
}

function serializeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "tags" && typeof value === "string") {
      try {
        out[key] = JSON.parse(value);
      } catch {
        out[key] = [];
      }
    } else if (key === "is_active") {
      out[key] = Boolean(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const table = String(req.query.table || "");
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table" });
  }

  try {
    const user = requireUser(req);
    const db = getDb();

    if (req.method === "GET") {
      const filters = Object.entries(req.query).filter(
        ([key]) => !["table", "select", "order", "asc", "limit", "single", "maybeSingle"].includes(key)
      );

      let sql = `SELECT * FROM ${table}`;
      const args: unknown[] = [];
      const where: string[] = [];

      if (USER_SCOPED.has(table) && table !== "profiles") {
        where.push("user_id = ?");
        args.push(user.id);
      }

      for (const [key, value] of filters) {
        if (value === undefined) continue;
        where.push(`${ident(key)} = ?`);
        args.push(Array.isArray(value) ? value[0] : value);
      }

      if (table === "profiles") {
        where.push("id = ?");
        args.push(user.id);
      }

      if (where.length) sql += ` WHERE ${where.join(" AND ")}`;

      const order = req.query.order as string | undefined;
      if (order) {
        const asc = req.query.asc !== "false";
        sql += ` ORDER BY ${ident(order)} ${asc ? "ASC" : "DESC"}`;
      }

      const limit = req.query.limit as string | undefined;
      if (limit) sql += ` LIMIT ${parseInt(limit, 10)}`;

      const result = await db.execute({ sql, args });
      const rows = result.rows.map((r) => serializeRow(r as Record<string, unknown>));

      if (req.query.single === "true" || req.query.maybeSingle === "true") {
        if (!rows.length) {
          if (req.query.single === "true") {
            return res.status(404).json({ error: "Not found" });
          }
          return res.status(200).json({ data: null });
        }
        return res.status(200).json({ data: rows[0] });
      }

      return res.status(200).json({ data: rows });
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      const isUpsert = body._upsert === true;
      const onConflict = body._onConflict as string | undefined;
      delete body._upsert;
      delete body._onConflict;

      const payload = { ...body };
      if (USER_SCOPED.has(table)) payload.user_id = user.id;
      if (table === "profiles") payload.id = user.id;
      if (!payload.id) payload.id = newId();

      const now = new Date().toISOString();
      payload.created_at = payload.created_at ?? now;
      payload.updated_at = now;

      if (payload.tags !== undefined) payload.tags = parseTags(payload.tags);
      if (payload.is_active !== undefined) payload.is_active = payload.is_active ? 1 : 0;

      const columns = Object.keys(payload).map(ident);
      const placeholders = columns.map(() => "?").join(", ");
      const values = columns.map((c) => payload[c]);

      if (isUpsert && onConflict) {
        const conflictCols = onConflict.split(",").map((c) => ident(c.trim()));
        const updates = columns
          .filter((c) => c !== "id" && c !== "created_at" && !conflictCols.includes(c))
          .map((c) => `${c} = excluded.${c}`)
          .join(", ");

        await db.execute({
          sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})
                ON CONFLICT(${conflictCols.join(", ")}) DO UPDATE SET ${updates}`,
          args: values,
        });

        // Read back only the caller's own row.
        const ownerCol = table === "profiles" ? "id" : "user_id";
        const conflictWhere = [...conflictCols.map((c) => `${c} = ?`), `${ownerCol} = ?`].join(" AND ");
        const conflictArgs = [...conflictCols.map((c) => payload[c]), user.id];
        const selected = await db.execute({
          sql: `SELECT * FROM ${table} WHERE ${conflictWhere} LIMIT 1`,
          args: conflictArgs,
        });

        const row = selected.rows[0]
          ? serializeRow(selected.rows[0] as Record<string, unknown>)
          : null;
        return res.status(200).json({ data: row });
      }

      await db.execute({
        sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
        args: values,
      });

      const selected = await db.execute({
        sql: `SELECT * FROM ${table} WHERE id = ?`,
        args: [payload.id],
      });

      const row = selected.rows[0]
        ? serializeRow(selected.rows[0] as Record<string, unknown>)
        : payload;
      return res.status(200).json({ data: row });
    }

    if (req.method === "PATCH") {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: "id is required" });

      const body = { ...req.body };
      delete body.id;
      delete body.user_id;
      body.updated_at = new Date().toISOString();

      if (body.tags !== undefined) body.tags = parseTags(body.tags);
      if (body.is_active !== undefined) body.is_active = body.is_active ? 1 : 0;

      const sets = Object.keys(body).map((k) => `${ident(k)} = ?`).join(", ");
      const args = [...Object.values(body), id, user.id];

      const scopeCol = table === "profiles" ? "id" : "user_id";
      await db.execute({
        sql: `UPDATE ${table} SET ${sets} WHERE id = ? AND ${scopeCol} = ?`,
        args,
      });

      // Scoped like the UPDATE, so a foreign id never returns someone else's row.
      const selected = await db.execute({
        sql: `SELECT * FROM ${table} WHERE id = ? AND ${scopeCol} = ?`,
        args: [id, user.id],
      });

      const row = selected.rows[0]
        ? serializeRow(selected.rows[0] as Record<string, unknown>)
        : null;
      return res.status(200).json({ data: row });
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: "id is required" });

      const scopeCol = table === "profiles" ? "id" : "user_id";
      await db.execute({
        sql: `DELETE FROM ${table} WHERE id = ? AND ${scopeCol} = ?`,
        args: [id, user.id],
      });

      return res.status(200).json({ data: null });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    const status = err instanceof BadRequest ? 400 : message === "Unauthorized" ? 401 : 500;
    if (status === 500) console.error(`data/${table} error:`, err);
    return res.status(status).json({ error: message });
  }
}
