import { LoadedSheetData, RowRef, SalesRow, StockRow, CrmRow } from "../sheets/types";

export function sum(nums: Array<number | null | undefined>): number {
  return nums.reduce((?? 0) => a + (typeof b === "number" ? b : 0), 0);
}

export function pct(n: number, d: number): number | null {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  return (n / d) * 100;
}

export function rowRefs(rows: Array<{__tab:any; __rowNumber:number}>): RowRef[] {
  return rows.map(r => ({ tab: r.__tab, rowNumber: r.__rowNumber }));
}
