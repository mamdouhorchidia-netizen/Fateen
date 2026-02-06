import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { requireAuth } from "./auth/middleware";
import { healthRouter } from "./routes/health";
import { refreshRouter } from "./routes/refresh";
import { chatRouter } from "./routes/chat";
import { auditRouter } from "./routes/audit";

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined", { skip: (_req, res) => res.statusCode === 200 && config.nodeEnv === "test" }));

app.use(rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get("/", (_req, res) => res.json({ ok: true, name: "sheets-grounded-ai-assistant-demo-backend" }));

app.use("/api/health", healthRouter);
app.use("/api", requireAuth);
app.use("/api/chat", chatRouter);
app.use("/api/refresh", refreshRouter);
app.use("/api/audit", auditRouter);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${config.port}`);
});
