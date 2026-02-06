import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
  const body = await req.text();
  const auth = req.headers.get("authorization") ?? "";
  const resp = await fetch(`${backend}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": auth },
    body,
  });
  const text = await resp.text();
  return new Response(text, { status: resp.status, headers: { "Content-Type": "application/json" } });
}
