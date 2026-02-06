import { loadAllTabsFromSheet } from "../sheets/loader";
import { normalizeLoadedData, parseSettings } from "../sheets/normalize";
import { LoadedSheetData, Settings } from "../sheets/types";
import { config } from "../config";

type CacheState = {
  data: LoadedSheetData | null;
  settings: Settings | null;
  loadedAt: number;
  ttlMs: number;
};

const state: CacheState = {
  data: null,
  settings: null,
  loadedAt: 0,
  ttlMs: config.defaults.cacheTtlSeconds * 1000,
};

export async function getCachedSheet(): Promise<{ data: LoadedSheetData; settings: Settings }> {
  const now = Date.now();
  const expired = !state.data || !state.settings || (now - state.loadedAt) > state.ttlMs;
  if (!expired) return { data: state.data!, settings: state.settings! };

  const raw = await loadAllTabsFromSheet();
  const normalized = normalizeLoadedData(raw);
  const settings = parseSettings(normalized.settings);

  state.data = normalized;
  state.settings = settings;
  state.loadedAt = now;
  state.ttlMs = settings.cache_ttl_seconds * 1000;

  return { data: normalized, settings };
}

export async function forceRefresh(): Promise<void> {
  state.data = null;
  state.settings = null;
  state.loadedAt = 0;
  await getCachedSheet();
}
