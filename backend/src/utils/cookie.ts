import { Response } from "express";

// The auth JWT is stored in an httpOnly cookie so browser JavaScript can't read
// it (protects against XSS stealing the token). The browser attaches it
// automatically on every request to the API.
export const AUTH_COOKIE = "token";

const isProd = process.env.NODE_ENV === "production";

const baseOptions = {
  httpOnly: true, // not readable by document.cookie
  sameSite: "lax" as const, // sent on same-site requests; blocks most CSRF
  secure: isProd, // HTTPS-only in production (localhost is http, so off in dev)
  path: "/",
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the JWT lifetime
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, baseOptions);
}
