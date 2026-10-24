import { createClient } from "@libsql/client";

let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    }
    client = createClient({ url, authToken });
  }
  return client;
}

export function newId() {
  return crypto.randomUUID();
}
