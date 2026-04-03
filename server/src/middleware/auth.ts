import { NextFunction, Request, Response } from "express";
import { AuthUser, verifyAuthToken } from "../utils/auth";

export function getTokenFromRequest(req: Request): string | null {
  const authorization = req.header("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = verifyAuthToken(token);

  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  res.locals.user = user;
  next();
}

export function getAuthUser(res: Response): AuthUser | null {
  const user = res.locals.user as AuthUser | undefined;
  return user ?? null;
}