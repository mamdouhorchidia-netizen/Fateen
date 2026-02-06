import { makeSheetsClient } from "./client";
import { LoadedSheetData, TabName } from "./types";
import { validateTabName } from "./normalize";
import { config } from "../config";

const REQUIRED_TABS: TabName[] = ["settings","stock","sales","crm","glossary"];

function asHeaderMap(headers: string[]) {
  const m = new Map<string, number>();
  headers.forEach((h, i) => m.set(String(h).trim(), i));
  return m;
}

function cell(row: any[], idx: number | undefined) {
  if (idx === undefined) return "";
  return row[idx] ?? "";
}

export async function loadAllTabsFromSheet(): Promise<LoadedSheetData> {
  const sheets = makeSheetsClient();
  const ranges = REQUIRED_TABS.map(t => `${t}!A:Z`);
  const resp = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: config.sheetId,
    ranges,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const valueRanges = resp.data.valueRanges ?? [];
  const byTab = new Map<TabName, any[][]>();
  for (const vr of valueRanges) {
    const r = vr.range ?? "";
    const tab = r.split("!")[0];
    const t = validateTabName(tab);
    if (!t) continue;
    byTab.set(t, (vr.values as any[][]) ?? []);
  }

  const out: any = {};
  for (const tab of REQUIRED_TABS) {
    const rows = byTab.get(tab) ?? [];
    if (rows.length === 0) {
      out[tab] = [];
      continue;
    }
    const headers = rows[0].map(x => String(x).trim());
    const hmap = asHeaderMap(headers);

    const body = rows.slice(1);
    out[tab] = body
      .filter(r => r.some(x => String(x ?? "").trim() !== ""))
      .map((r, i) => {
        const rowNumber = i + 2; // header is row 1
        const base = { __tab: tab, __rowNumber: rowNumber };
        if (tab === "settings") {
          return { ...base, key: String(cell(r, hmap.get("key"))).trim(), value: String(cell(r, hmap.get("value"))).trim() };
        }
        if (tab === "stock") {
          return {
            ...base,
            distributor: String(cell(r, hmap.get("distributor"))).trim(),
            product: String(cell(r, hmap.get("product"))).trim(),
            sku: String(cell(r, hmap.get("sku"))).trim(),
            quantity: cell(r, hmap.get("quantity")),
            last_updated: String(cell(r, hmap.get("last_updated"))).trim(),
          };
        }
        if (tab === "sales") {
          return {
            ...base,
            month: String(cell(r, hmap.get("month"))).trim(),
            territory: String(cell(r, hmap.get("territory"))).trim(),
            brick: String(cell(r, hmap.get("brick"))).trim(),
            rep: String(cell(r, hmap.get("rep"))).trim(),
            product: String(cell(r, hmap.get("product"))).trim(),
            target: cell(r, hmap.get("target")),
            achieved: cell(r, hmap.get("achieved")),
          };
        }
        if (tab === "crm") {
          return {
            ...base,
            week: String(cell(r, hmap.get("week"))).trim(),
            territory: String(cell(r, hmap.get("territory"))).trim(),
            rep: String(cell(r, hmap.get("rep"))).trim(),
            doctor: String(cell(r, hmap.get("doctor"))).trim(),
            specialty: String(cell(r, hmap.get("specialty"))).trim(),
            visits: cell(r, hmap.get("visits")),
            coverage_flag: cell(r, hmap.get("coverage_flag")),
          };
        }
        if (tab === "glossary") {
          return {
            ...base,
            term: String(cell(r, hmap.get("term"))).trim(),
            synonyms: String(cell(r, hmap.get("synonyms"))).trim(),
            canonical: String(cell(r, hmap.get("canonical"))).trim(),
          };
        }
        return { ...base };
      });
  }

  return out as LoadedSheetData;
}

export async function writeSettingValue(key: string, value: string): Promise<void> {
  // Writes to settings tab by locating the row for key; if absent, appends.
  const sheets = makeSheetsClient();

  const getResp = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: "settings!A:Z",
  });

  const values = (getResp.data.values as any[][]) ?? [];
  const headers = values[0] ?? ["key","value"];
  const keyIdx = headers.findIndex(h => String(h).trim() === "key");
  const valIdx = headers.findIndex(h => String(h).trim() === "value");
  const body = values.slice(1);

  let targetRowNumber: number | null = null;
  for (let i = 0; i < body.length; i++) {
    const k = String(body[i][keyIdx] ?? "").trim();
    if (k === key) {
      targetRowNumber = i + 2;
      break;
    }
  }

  if (targetRowNumber !== null) {
    const a1 = `settings!${String.fromCharCode(65 + valIdx)}${targetRowNumber}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: a1,
      valueInputOption: "RAW",
      requestBody: { values: [[value]] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheetId,
      range: "settings!A:Z",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [[key, value]] },
    });
  }
}
