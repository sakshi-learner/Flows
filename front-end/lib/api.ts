const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function normalizePath(path: string) {
  // ensure leading slash
  let p = path.startsWith("/") ? path : `/${path}`;

  // auto-prefix /api if missing
  if (!p.startsWith("/api/")) {
    p = `/api${p}`;
  }

  return p;
}

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const url = `${API_BASE}${normalizePath(path)}`;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    credentials: "include", // ✅ cookie auth
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as any;

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
