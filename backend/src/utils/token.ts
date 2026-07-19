import jwt from "jsonwebtoken";
import { env } from "../config/env";

// The payload we embed in the JWT — just the user id is enough to look them up.
export type JwtPayload = { id: string };

export function signToken(payload: JwtPayload): string {
  // Cast keeps TS happy: the types model expiresIn as a template-literal type,
  // but a plain string like "7d" is exactly what jsonwebtoken expects.
  const options: jwt.SignOptions = {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
