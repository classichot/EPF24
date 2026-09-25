import { CATALOG_MISSIONS } from "@/lib/catalog";
import { COMPANY, baht, type ScreenId } from "@/lib/model";

export type EasyRole = "hr" | "committee" | "member";

export type EasyStep = {
  id: string;
  title: string;
  why: string;
  output: string;
  screen: ScreenId;
  effort: string;
  needs: string;
  approval: boolean;
  evidence: "ready" | "provisional" | "insufficient";
};

export type EasyPlan = {
  goal: string;
  role: EasyRole;
  scope: string;
  period: string;
  steps: EasyStep[];
  missing: string[];
  employerCash: string;
  employeeFee: string;
  investment: string;
  agents: "Team";
  read: string;
  draft: string;
  approval: string;
  doneWhen: string;
  result: string;
};

/** The 12 catalog missions marked for the first release. */
export const PRIORITY_IDS = CATALOG_MISSIONS.filter((mission) => mission.first).map((mission) => mission.id);

const ORDER: Record<string, string[]> = {
  both: ["A01", "F03", "A02", "A10", "D01", "B01", "C03", "C05", "C10", "L02", "L03"],
  fees: ["A01", "A02", "A10", "D01", "B01", "L02", "L03"],
  returns: ["F03", "H04", "D01"],
  switch: ["D01", "C03", "C05", "C10", "B01"],
  member: ["F03", "H04"],
};

const APPROVAL = new Set(["B01", "C03", "C05", "C10"]);

const EVIDENCE: Record<string, EasyStep["evidence"]> = {
  A01: "provisional",
  A02: "provisional",
  A10: "provisional",
  F03: "provisional",
  H04: "provisional",
  D01: "provisional",
  B01: "provisional",
  C03: "provisional",
  C05: "insufficient",
  C10: "insufficient",
  L02: "insufficient",
  L03: "insufficient",
};

function intent(text: string) {
  const fee = /fee|cost|expensive|charg|paying|ค่าธรรมเนียม|แพง/i.test(text);
  const ret = /return|perform|unhapp|invest|yield|ผลตอบแทน/i.test(text);
  const move = /switch|tender|rfp|move provider|เปลี่ยน/i.test(text);
  if (fee && ret) return "both";
  if (fee) return "fees";
  if (ret) return "returns";
  if (move) return "switch";
  return "unknown";
}

function stepFor(id: string, goal: string): EasyStep {
  const mission = CATALOG_MISSIONS.find((item) => item.id === id);
  if (!mission) {
    return {
      id: "custom",
      title: "Review a custom task",
      why: `No first-release mission matches “${goal}”.`,
      output: "A task for a person to accept or reject. It is not run automatically.",
      screen: "mission",
      effort: "A review, not a calculation",
      needs: "A clearer goal, or a mission outside the first 12",
      approval: true,
      evidence: "insufficient",
    };
  }
  return {
    id: mission.id,
    title: mission.title,
    why: mission.work,
    output: mission.measure,
    screen: mission.screen,
    effort: APPROVAL.has(mission.id) ? "Stops for approval" : "One sitting on the open file",
    needs: mission.id.startsWith("F") || mission.id === "H04"
      ? "A comparable return series. SEC history is not loaded."
      : "The reviewed fee schedule on the open file",
    approval: APPROVAL.has(mission.id),
    evidence: EVIDENCE[mission.id] ?? "provisional",
  };
}

export function buildPlan(goal: string, role: EasyRole, advisor: boolean): EasyPlan {
  const text = goal.trim();
  const kind = role === "member" ? "member" : intent(text);
  const ids = kind === "unknown" ? [] : ORDER[kind];
  const steps = ids.length ? ids.map((id) => stepFor(id, text)) : [stepFor("custom", text || "an empty request")];
  const who = role === "member" ? "an individual member" : role === "committee" ? "the provident-fund committee" : advisor ? "an advisor for the employer" : "HR for the employer";
  const owner = role === "committee" ? "The provident-fund committee" : "K. Suda Wongsa, committee secretary";
  return {
    goal: text || "No goal was written.",
    role,
    scope: `${who} of ${COMPANY.name}. ${COMPANY.members.toLocaleString("en-US")} members, ${baht(COMPANY.aum)} assets, provider ${COMPANY.provider}.`,
    period: "The open 2026 fee file. Not a live SEC history.",
    steps,
    missing: [
      "SEC historical returns and published fees are not loaded, so no real fund is ranked.",
      "The fee schedule does not split employer-paid charges from member-paid charges. The employer gap is not counted again as an employee saving.",
      "Invoices have not been reconciled, so nothing is a verified saving.",
      "A negotiated price is not the same as a published factsheet fee.",
    ],
    employerCash: role === "member"
      ? "Hidden. A member does not see the employer’s invoice."
      : `${baht(COMPANY.feeSaving)} a year · estimated opportunity · sample contract, not a contracted reduction and not a verified saving`,
    employeeFee: "Not separated from the employer total. Counting it again would double-count the same fee.",
    investment: kind === "fees"
      ? "Not estimated. This goal did not ask for a return scenario."
      : `${baht(COMPANY.investOpp)} a year on the stated return gap · uncertain scenario · past returns are not future gains`,
    agents: "Team",
    read: "The sample employer file and documents already marked reviewed. Not the SEC API.",
    draft: "Comparisons, a negotiation note, and a tender outline.",
    approval: `${owner} must approve provider invitations, binding negotiation, a fund change, a contribution change, or any asset transfer.`,
    doneWhen: "Each mission’s measure is filled, payer splits are not double-counted, and any sending step is still unsent until approval.",
    result: kind === "unknown"
      ? "There is not enough in the sentence to choose a mission. The custom task is for review. No fund was ranked."
      : "Here are the supported opportunities, what each could save, what is still uncertain, and the next decision for the committee. Estimated opportunity, contracted reduction, and verified saving are different things.",
  };
}
