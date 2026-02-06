import { google } from "googleapis";
import { config } from "../config";

export function makeSheetsClient() {
  const creds = JSON.parse(config.serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}
