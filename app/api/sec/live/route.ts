import { loadSecLive } from "@/lib/sec-live";

export const dynamic = "force-dynamic";

export async function GET() {
  const book = await loadSecLive();
  return Response.json(book);
}
