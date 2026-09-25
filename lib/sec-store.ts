import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { RawEnvelope } from "@/lib/sec-pvd";

export type RawRecord = RawEnvelope & { id: string };

type LakeFile = { raw: RawRecord[] };

const FILE = path.join(process.cwd(), "data", "sec-pvd-raw.json");

export function readLake(): LakeFile {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as LakeFile;
    return { raw: Array.isArray(parsed.raw) ? parsed.raw : [] };
  } catch {
    return { raw: [] };
  }
}

/** Append one untouched SEC response. A repeat of the same retrieval is refused. */
export function appendRaw(envelope: RawEnvelope): { stored: true; id: string } | { stored: false; reason: string } {
  try {
    const lake = readLake();
    const id = `${envelope.datasetId}@${envelope.retrievedAt}`;
    if (lake.raw.some((row) => row.id === id)) {
      return { stored: false, reason: "This snapshot is already in sec_pvd_raw. Raw responses are not overwritten." };
    }
    lake.raw.push({ ...envelope, id });
    mkdirSync(path.dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(lake));
    return { stored: true, id };
  } catch {
    return { stored: false, reason: "The raw store could not be written on this server. Nothing was invented in its place." };
  }
}
