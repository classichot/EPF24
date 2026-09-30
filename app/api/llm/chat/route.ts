import { chatSystem, isChatGoal, isScreenId, type ChatContext } from "@/lib/chat-brief";

export const dynamic = "force-dynamic";

type Turn = { role: "user" | "assistant"; content: string };

function readContext(value: unknown): ChatContext {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const screen = typeof raw.screen === "string" && isScreenId(raw.screen) ? raw.screen : "start";
  const audience = raw.audience === "advisor" ? "advisor" : "corporate";
  return { screen, audience, agi: raw.agi === true, secLive: raw.secLive === true };
}

function readTurns(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-8)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
      const content = typeof row.content === "string" ? row.content.trim().slice(0, 2000) : "";
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((item): item is Turn => item !== null);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ connected: false, reply: "The message could not be read." }, { status: 400 });
  }
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (!isChatGoal(raw.goal)) {
    return Response.json({ connected: false, reply: "Choose how to use the app, the EPF specialist, or feedback." }, { status: 400 });
  }
  const turns = readTurns(raw.messages);
  if (!turns.some((turn) => turn.role === "user")) {
    return Response.json({ connected: false, reply: "Write a message first." }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return Response.json({
      connected: false,
      reply: "The language model is not connected. Add the key on the server, then try again. Nothing was sent.",
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: raw.goal === "feedback" ? 0.4 : 0.2,
        max_tokens: 500,
        messages: [
          { role: "system", content: chatSystem(raw.goal, readContext(raw.context)) },
          ...turns,
        ],
      }),
    });
    if (!res.ok) {
      return Response.json({ connected: false, reply: "The model did not answer. Try again in a moment." });
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return Response.json({ connected: false, reply: "The model returned an empty answer." });
    return Response.json({ connected: true, reply });
  } catch {
    return Response.json({ connected: false, reply: "The model could not be reached." });
  }
}
