import { loadPvdMarket } from "@/lib/sec-pvd-market";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const market = await loadPvdMarket();
  return Response.json(market);
}
