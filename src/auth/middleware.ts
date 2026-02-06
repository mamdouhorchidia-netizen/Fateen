import { Request, Response, NextFunction } from "express";
import { validateBasicAuth } from "./users";

export type AuthedUser = { userId: string; role: "admin" | "user"; username: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.header("authorization") ?? "";
  const [scheme, token] = h.split(" ");
  if (scheme?.toLowerCase() !== "basic" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  let decoded = "";
  try {
    decoded = Buffer.from(token, "base64").toString("utf8");
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return res.status(401).json({ error: "Unauthorized" });
  const username = decoded.slice(0, idx);
  const password = decoded.slice(idx + 1);
  const u = validateBasicAuth(username, password);
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  req.user = { userId: u.userId, role: u.role, username: u.username };
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}
