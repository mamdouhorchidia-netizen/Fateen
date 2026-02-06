# Setup: sheets-grounded-ai-assistant-demo

This demo uses:
- Google Sheets API via a **Service Account**
- OpenAI Chat Completions (model `gpt-4.1-mini`)
- Demo Basic Auth (admin/user) from environment variables

## 1) Create the Google Sheet

Create a Google Sheet named anything you like. Create tabs:
- `settings`
- `stock`
- `sales`
- `crm`
- `glossary` (optional but supported — still create the tab to keep loader simple)

Then follow `/docs/SHEET_SCHEMA.md` to add headers and example rows.

## 2) Google Cloud project + Service Account

1. Create / select a Google Cloud project.
2. Enable **Google Sheets API**.
3. Create a **Service Account**.
4. Create a JSON key for that service account and download it.
5. Share the Google Sheet with the service account email (Viewer is enough for reading; Editor required if you want the admin meta_prompt editor to write back).

## 3) Configure backend env

Copy `backend/.env.example` to `backend/.env` and set:
- `GOOGLE_SHEET_ID` (from the sheet URL)
- `GOOGLE_SERVICE_ACCOUNT_JSON` (paste the full JSON file content as a single line JSON)
- `OPENAI_API_KEY`
- (optional) change demo credentials `ADMIN_USER/ADMIN_PASS` and `USER_USER/USER_PASS`

## 4) Configure frontend env

Copy `frontend/.env.example` to `frontend/.env`:
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`

## 5) Run locally (Node)

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## 6) Run locally (Docker Compose)

From repo root:
```bash
docker compose up --build
```

## 7) Quick test

1. Open `http://localhost:3000`
2. Login as user:
   - username: `user`
   - password: `userpass`
   - role: `user`
3. Ask questions like:
   - `What is the stock quantity for product: Amaryl distributor: Delta?`
   - `target vs achieved for month: 2025-01 territory: Giza`
   - `top 5 under target by territory month: 2025-01`
   - `coverage percent by rep week: 2025-W03`

If the sheet doesn't contain evidence, the assistant returns exactly:
> Not available in the current Google Sheet data.
