import { Router } from "express";
import { forceRefresh } from "./sharedCache";

export const refreshRouter = Router();

refreshRouter.post("/", async (_req, res) => {
  await forceRefresh();
  res.json({ ok: true, refreshedAt: new Date().toISOString() });
});
