import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import { AUTH_COOKIE } from "../utils/cookie";

// Guards protected routes. Reads the JWT from the httpOnly auth cookie, verifies
// it, and stashes the user id on the request for the controller.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];

  if (!token) {
    return res.status(401).json({ message: "Not authorized." });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
