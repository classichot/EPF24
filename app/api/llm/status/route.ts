export const dynamic = "force-dynamic";

/** Whether the server can reach the language model. The key never leaves this route. */
export async function GET() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return Response.json({ connected: false });
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return Response.json({ connected: res.ok });
  } catch {
    return Response.json({ connected: false });
  }
}
