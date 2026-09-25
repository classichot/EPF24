import { SEC_PVD_DATASETS, datasetPath, type RawEnvelope, type NormalizedRow } from "@/lib/sec-pvd";

export function connectorStatus() {
  const base = process.env.SEC_OPENDATA_BASE_URL?.trim() || "";
  const key = process.env.SEC_OPENDATA_SUBSCRIPTION_KEY?.trim() || "";
  const header = process.env.SEC_OPENDATA_KEY_HEADER?.trim() || "";
  const pathsPinned = SEC_PVD_DATASETS.filter((dataset) => datasetPath(dataset.id)).length;
  const subscribed = Boolean(base && key && header);
  let message = "Connector is ready. Pages do not call the SEC. Set SEC_OPENDATA_BASE_URL, SEC_OPENDATA_KEY_HEADER and SEC_OPENDATA_SUBSCRIPTION_KEY from the current portal.";
  if (subscribed && pathsPinned === 0) message = "Credentials are set. Dataset paths are not pinned, so sync stays off.";
  if (subscribed && pathsPinned > 0) message = `Sync can run for ${pathsPinned} pinned datasets. The browser still does not call the SEC.`;
  return {
    ready: true,
    subscribed,
    pathsPinned,
    datasets: SEC_PVD_DATASETS.length,
    callsFromUi: false,
    rateLimit: "3,000 calls / 300 seconds",
    message,
  };
}

export function storeRaw(envelope: RawEnvelope): RawEnvelope {
  return {
    datasetId: envelope.datasetId,
    retrievedAt: envelope.retrievedAt,
    effectiveDate: envelope.effectiveDate,
    body: envelope.body,
  };
}

export function normalizeEnvelope(envelope: RawEnvelope): { rows: NormalizedRow[]; note: string } {
  storeRaw(envelope);
  return {
    rows: [],
    note: "The raw response is kept. Columns are not mapped until the current portal schema is pinned, so no figure is guessed.",
  };
}

export async function syncDataset(datasetId: string): Promise<{ ok: false; reason: string } | { ok: true; envelope: RawEnvelope }> {
  const dataset = SEC_PVD_DATASETS.find((item) => item.id === datasetId);
  if (!dataset) return { ok: false, reason: "Unknown dataset." };
  const status = connectorStatus();
  if (!status.subscribed) return { ok: false, reason: status.message };
  const path = datasetPath(datasetId);
  if (!path) return { ok: false, reason: `${dataset.name} has no path from the current portal yet.` };
  const base = process.env.SEC_OPENDATA_BASE_URL!.replace(/\/$/, "");
  const header = process.env.SEC_OPENDATA_KEY_HEADER!;
  const key = process.env.SEC_OPENDATA_SUBSCRIPTION_KEY!;
  const response = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, { headers: { [header]: key }, cache: "no-store" });
  if (!response.ok) return { ok: false, reason: `SEC responded ${response.status} for dataset ${datasetId}.` };
  const body: unknown = await response.json();
  return {
    ok: true,
    envelope: storeRaw({ datasetId, retrievedAt: new Date().toISOString(), effectiveDate: null, body }),
  };
}
