const API_BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "rewind_auth_token";

export interface User {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string | null };
}

export interface Session {
  access_token: string;
  user: User;
}

type AuthListener = (event: string, session: Session | null) => void;

let cachedSession: Session | null = null;
const listeners = new Set<AuthListener>();

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function notify(event: string, session: Session | null) {
  cachedSession = session;
  listeners.forEach((cb) => cb(event, session));
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "Request failed");
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }
  return data;
}

class QueryBuilder {
  private table: string;
  private filters: Record<string, string> = {};
  private orderBy?: { column: string; ascending: boolean };
  private limitCount?: number;
  private fields = "*";
  private mode: "many" | "single" | "maybeSingle" = "many";
  private mutation?: { type: "insert" | "upsert" | "update" | "delete"; payload?: Record<string, unknown>; onConflict?: string };

  constructor(table: string) {
    this.table = table;
  }

  select(fields = "*") {
    this.fields = fields;
    return this;
  }

  eq(column: string, value: string | number) {
    this.filters[column] = String(value);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: opts?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.mode = "single";
    return this;
  }

  maybeSingle() {
    this.mode = "maybeSingle";
    return this;
  }

  insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
    this.mutation = { type: "insert", payload: Array.isArray(payload) ? payload[0] : payload };
    return this;
  }

  upsert(payload: Record<string, unknown>, opts?: { onConflict?: string }) {
    this.mutation = { type: "upsert", payload, onConflict: opts?.onConflict };
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.mutation = { type: "update", payload };
    return this;
  }

  delete() {
    this.mutation = { type: "delete" };
    return this;
  }

  private buildQuery() {
    const params = new URLSearchParams();
    Object.entries(this.filters).forEach(([k, v]) => params.set(k, v));
    if (this.orderBy) {
      params.set("order", this.orderBy.column);
      params.set("asc", String(this.orderBy.ascending));
    }
    if (this.limitCount) params.set("limit", String(this.limitCount));
    if (this.mode === "single") params.set("single", "true");
    if (this.mode === "maybeSingle") params.set("maybeSingle", "true");
    return params.toString();
  }

  async then<TResult1 = { data: unknown; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      let result: { data: unknown; error: Error | null };

      if (this.mutation?.type === "insert" || this.mutation?.type === "upsert") {
        const body = {
          ...this.mutation.payload,
          _upsert: this.mutation.type === "upsert",
          _onConflict: this.mutation.onConflict,
        };
        const res = await apiFetch(`/data/${this.table}`, { method: "POST", body: JSON.stringify(body) });
        result = { data: res.data, error: null };
      } else if (this.mutation?.type === "update") {
        const id = this.filters.id;
        const res = await apiFetch(`/data/${this.table}?id=${id}`, {
          method: "PATCH",
          body: JSON.stringify(this.mutation.payload),
        });
        result = { data: res.data, error: null };
      } else if (this.mutation?.type === "delete") {
        const id = this.filters.id;
        await apiFetch(`/data/${this.table}?id=${id}`, { method: "DELETE" });
        result = { data: null, error: null };
      } else {
        const qs = this.buildQuery();
        const res = await apiFetch(`/data/${this.table}${qs ? `?${qs}` : ""}`);
        const data = this.mode === "many" ? (res.data ?? []) : res.data;
        result = { data, error: null };
      }

      return onfulfilled ? onfulfilled(result) : (result as TResult1);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Request failed");
      const result = { data: null, error };
      if (onrejected) return onrejected(error);
      if (onfulfilled) return onfulfilled(result);
      throw error;
    }
  }
}

export const api = {
  auth: {
    async getSession() {
      try {
        const data = await apiFetch("/auth/session");
        if (data.session) {
          cachedSession = data.session;
          setToken(data.session.access_token);
        }
        return { data: { session: data.session as Session | null }, error: null };
      } catch (err) {
        return { data: { session: null }, error: err as Error };
      }
    },

    async getUser() {
      const { data } = await this.getSession();
      return { data: { user: data.session?.user ?? null }, error: null };
    },

    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      this.getSession().then(({ data }) => callback("INITIAL_SESSION", data.session));

      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.session.access_token);
        notify("SIGNED_IN", data.session);
        return { data, error: null };
      } catch (err) {
        return { data: { session: null, user: null }, error: err as Error };
      }
    },

    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string }; emailRedirectTo?: string };
    }) {
      try {
        const data = await apiFetch("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            full_name: options?.data?.full_name,
          }),
        });
        setToken(data.session.access_token);
        notify("SIGNED_IN", data.session);
        return { data, error: null };
      } catch (err) {
        return { data: { session: null, user: null }, error: err as Error };
      }
    },

    async signOut() {
      setToken(null);
      notify("SIGNED_OUT", null);
      return { error: null };
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  storage: {
    from(_bucket: string) {
      return {
        async remove(_paths: string[]) {
          return { error: null };
        },
        async upload(_path: string, file: File) {
          return new Promise<{ error: Error | null }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ error: null });
            reader.onerror = () => resolve({ error: new Error("Failed to read file") });
            reader.readAsDataURL(file);
          });
        },
        getPublicUrl(_path: string) {
          return { data: { publicUrl: "" } };
        },
      };
    },
  },

  functions: {
    async invoke(name: string, { body }: { body?: Record<string, unknown> }) {
      const token = getToken();
      const path = name === "send-blueprint-email" ? "/send-blueprint-email" : `/${name}`;

      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body ?? {}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { data: null, error: new Error(data.error || "Function invoke failed") };
      }
      return { data, error: null };
    },
  },
};

// Drop-in alias for migration from Supabase client
export const supabase = api;
