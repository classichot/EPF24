import { datasetPath } from "@/lib/sec-pvd";
import { emptySlice, sliceFromBody, type SecLiveBook, type SecSlice } from "@/lib/sec-book";

const PAGE = 40;
const TTL_MS = 10 * 60 * 1000;

const LIVE = {
  companies: "01",
  funds: "02",
  fees: "07",
  performance: "05",
} as const;

let cache: { at: number; book: SecLiveBook } | null = null;

function credentials() {
  const base = process.env.SEC_OPENDATA_BASE_URL?.trim().replace(/\/$/, "") || "";
  const header = process.env.SEC_OPENDATA_KEY_HEADER?.trim() || "";
  const key = process.env.SEC_OPENDATA_SUBSCRIPTION_KEY?.trim() || "";
  return { base, header, key, ready: Boolean(base && header && key) };
}

async function pull(id: string): Promise<SecSlice> {
  const path = datasetPath(id);
  if (!path) return { ...emptySlice(), note: "This dataset has no path." };
  const { base, header, key } = credentials();
  const url = `${base}${path}${path.includes("?") ? "&" : "?"}page_size=${PAGE}`;
  try {
    const response = await fetch(url, {
      headers: { [header]: key, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      return { ...emptySlice(path), status: response.status, note: `SEC responded ${response.status}.` };
    }
    const body: unknown = await response.json();
    return sliceFromBody(path, response.status, body);
  } catch {
    return { ...emptySlice(path), note: "The SEC feed did not answer." };
  }
}

export async function loadSecLive(): Promise<SecLiveBook> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.book;
  const creds = credentials();
  if (!creds.ready) {
    return {
      live: false,
      source: "SEC Open Data",
      fetchedAt: null,
      reason: "The SEC key is not on this server. SEC live is not showing the sample book in its place.",
      companies: emptySlice(),
      funds: emptySlice(),
      fees: emptySlice(),
      performance: emptySlice(),
    };
  }
  const [companies, funds, fees, performance] = await Promise.all([
    pull(LIVE.companies),
    pull(LIVE.funds),
    pull(LIVE.fees),
    pull(LIVE.performance),
  ]);
  const slices = [companies, funds, fees, performance];
  const live = slices.some((slice) => slice.status === 200 && slice.rows.length > 0);
  const book: SecLiveBook = {
    live,
    source: "SEC Open Data",
    fetchedAt: new Date().toISOString(),
    reason: live
      ? "First page of SEC Open Data. This is not the employer’s negotiated contract."
      : "SEC answered, but none of the PVD pages returned rows this view can show.",
    companies,
    funds,
    fees,
    performance,
  };
  if (live) cache = { at: Date.now(), book };
  return book;
}
