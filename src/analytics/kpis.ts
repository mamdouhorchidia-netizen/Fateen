import { LoadedSheetData, RowRef, SalesRow, StockRow, CrmRow } from "../sheets/types";

export function sum(nums: Array<number | null | undefined>): number {
  var total = 0;
  for (var i = 0; i < nums.length; i++) {
    var v = nums[i];
    if (typeof v === "number") {
      total = total + v;
    }
  }
  return total;
}

export function pct(n: number, d: number): number | null {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
    return null;
  }
  return (n / d) * 100;
}

export function rowRefs(rows: Array<{ __tab: any; __rowNumber: number }>): RowRef[] {
  var result: RowRef[] = [];
  for (var i = 0; i < rows.length; i++) {
    result.push({
      tab: rows[i].__tab,
      rowNumber: rows[i].__rowNumber
    });
  }
  return result;
}
