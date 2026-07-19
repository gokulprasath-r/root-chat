// Thin wrapper around fetch so every call to the backend shares the same base
// URL, JSON handling and error behaviour.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    // Send/receive the httpOnly auth cookie on every request.
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  // The API always replies with JSON; fall back to an empty object just in case.
  const data = await res.json().catch(() => ({}));

  // Turn any non-2xx response into a thrown error carrying the server's message,
  // so callers can simply try/catch.
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || "Something went wrong.");
  }

  return data as T;
}
