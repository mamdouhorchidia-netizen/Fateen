import { Router } from "express";
import { requireAdmin } from "../auth/middleware";
import { listAudit } from "../audit/store";

export const auditRouter = Router();

auditRouter.get("/", requireAdmin, (_req, res) => {
  const entries = listAudit(50);
  res.json({ entries });
});
