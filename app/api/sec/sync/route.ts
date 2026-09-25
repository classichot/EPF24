import { syncDataset } from "@/lib/sec-sync";
import { SEC_PVD_DATASETS } from "@/lib/sec-pvd";

export async function POST(request: Request) {
  const token = process.env.SEC_SYNC_TOKEN?.trim() || "";
  const auth = request.headers.get("authorization") || "";
  if (!token || auth !== `Bearer ${token}`) {
    return Response.json({ ok: false, reason: "Sync is refused. Set SEC_SYNC_TOKEN and send it as a bearer token. The page does not call this route." }, { status: 401 });
  }
  const results = [];
  for (const dataset of SEC_PVD_DATASETS) {
    const result = await syncDataset(dataset.id);
    results.push({ id: dataset.id, ok: result.ok, reason: result.ok ? undefined : result.reason });
  }
  const stored = results.filter((row) => row.ok).length;
  return Response.json({ ok: stored > 0, stored, results });
}
