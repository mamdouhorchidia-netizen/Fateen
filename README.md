# sheets-grounded-ai-assistant-demo

Production-shaped demo of a **Google Sheets–grounded AI assistant**:
- Next.js chat UI
- Node.js + Express backend
- Google Sheets as the **single source of truth**
- Deterministic analytics (KPIs, aggregations, ranking, trends) computed in backend code
- Strict grounding + refusal when evidence is missing
- Citations: tab + row numbers
- In-memory cache with TTL + manual refresh
- Audit trail stored in SQLite
- Demo-grade Basic Auth (admin/user from env)

See `/docs/SETUP.md` to configure Google Cloud + Sheets and run locally.
