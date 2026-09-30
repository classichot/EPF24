import { loadFeeBoard } from "@/lib/sec-fees";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const board = await loadFeeBoard();
  return Response.json(board);
}
