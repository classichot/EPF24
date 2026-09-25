import { connectorStatus } from "@/lib/sec-sync";

export function GET() {
  return Response.json(connectorStatus());
}
