import { CATALOG_MISSIONS } from "@/lib/catalog";
import type { AdvisorCase } from "@/lib/cases";
import { caseFacts } from "@/lib/cases";
import { COMPANY, baht, type ScreenId } from "@/lib/model";

export type EasyRole = "hr" | "committee" | "member";

export type EasyStep = {
  id: string;
  title: string;
  phase: string;
  why: string;
  output: string;
  screen: ScreenId;
  effort: string;
  documents: string;
  dependsOn: string;
  mode: "Single" | "Team" | "Swarm";
  approval: boolean;
  evidence: "ready" | "provisional" | "insufficient";
  note: string;
};

export type Opportunity = {
  name: string;
  kind: "estimated" | "unseparated" | "scenario" | "hidden" | "none";
  text: string;
};

export type EasyPlan = {
  goal: string;
  role: EasyRole;
  company: string;
  provider: string;
  scope: string;
  period: string;
  steps: EasyStep[];
  missing: string[];
  opportunities: Opportunity[];
  employerCash: string;
  employeeFee: string;
  investment: string;
  agents: string;
  spend: string;
  read: string;
  draft: string;
  approval: string;
  owner: string;
  doneWhen: string;
  nextDecision: string;
  result: string;
};

export type OpenBrief = {
  mission: string;
  company: string;
  provider: string;
  period: string;
  question: string;
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
const TENDER = new Set(["C03", "C05", "C10"]);

const PHASE: Record<string, string> = {
  A01: "Establish the facts",
  F03: "Establish the facts",
  A02: "Find options",
  A10: "Find options",
  H04: "Find options",
  D01: "Find options",
  B01: "Prepare action",
  C03: "Prepare action",
  C05: "Prepare action",
  C10: "Prepare action",
  L02: "Prove the result",
  L03: "Prove the result",
};

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

function documentsFor(id: string) {
  if (id === "F03" || id === "H04") return "A comparable return series. SEC history is not loaded.";
  if (id === "L02" || id === "L03") return "A contracted change and invoices after the change. Neither is on the file.";
  if (TENDER.has(id)) return "A decision that a tender is warranted, then the current contract.";
  if (id === "custom") return "A clearer goal, or a mission outside the first 12.";
  return "The reviewed fee schedule on the open file.";
}

function stepFor(id: string, goal: string, previous: string): EasyStep {
  const mission = CATALOG_MISSIONS.find((item) => item.id === id);
  if (!mission || !mission.first) {
    return {
      id: "custom",
      title: "Review a custom task",
      phase: "Review",
      why: `No first-release mission matches “${goal}”.`,
      output: "A task for a person to accept or reject. It is not run automatically.",
      screen: "mission",
      effort: "A review, not a calculation",
      documents: documentsFor("custom"),
      dependsOn: "None",
      mode: "Single",
      approval: true,
      evidence: "insufficient",
      note: "Nothing is ranked until a person accepts the task.",
    };
  }
  return {
    id: mission.id,
    title: mission.title,
    phase: PHASE[mission.id] ?? mission.categoryName,
    why: mission.work,
    output: mission.measure,
    screen: mission.screen,
    effort: APPROVAL.has(mission.id) ? "Stops for a named approval" : "One sitting on the open file",
    documents: documentsFor(mission.id),
    dependsOn: previous ? previous : "None. This step opens the plan.",
    mode: mission.mode,
    approval: APPROVAL.has(mission.id),
    evidence: EVIDENCE[mission.id] ?? "provisional",
    note: TENDER.has(mission.id) ? "Only if a tender is warranted. Staying is a valid result." : "",
  };
}

export function stamp() {
  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${hours}:${minutes}`;
}

export function stepGate(step: EasyStep): "draft" | "approval" | "insufficient" {
  if (step.evidence === "insufficient") return "insufficient";
  if (step.approval) return "approval";
  return "draft";
}

export function buildPlan(goal: string, role: EasyRole, advisor: boolean, file?: AdvisorCase | null): EasyPlan {
  const text = goal.trim();
  const kind = role === "member" ? "member" : intent(text);
  const ids = kind === "unknown" ? [] : ORDER[kind];
  const steps = ids.length
    ? ids.map((id, index) => stepFor(id, text, index === 0 ? "" : ids[index - 1]))
    : [stepFor("custom", text || "an empty request", "")];
  const who = role === "member" ? "an individual member" : role === "committee" ? "the provident-fund committee" : advisor ? "an advisor for the employer" : "HR for the employer";
  const owner = role === "member" ? "The member" : role === "committee" ? "The provident-fund committee" : "K. Suda Wongsa, committee secretary";
  const bare = advisor && file && !file.worked;
  const company = bare && file ? file.employer : COMPANY.name;
  const provider = bare && file ? file.provider : COMPANY.provider;
  const single = steps.filter((step) => step.mode === "Single").map((step) => step.id);
  const team = steps.filter((step) => step.mode === "Team").map((step) => step.id);
  const agents = single.length
    ? `Team for ${team.join(", ") || "the shared steps"}. Single for ${single.join(", ")}.`
    : "Team. The catalog marks these missions Team. Swarm is not recommended for this sequence.";
  const opportunities: Opportunity[] = bare
    ? [
        { name: "Employer cash", kind: "none", text: "Not calculated. This case has insufficient evidence." },
        { name: "Employee fee", kind: "unseparated", text: "Not separated, and not copied from another employer." },
        { name: "Investment scenario", kind: "none", text: "Not calculated. A past return on another file is not a future gain here." },
      ]
    : [
        role === "member"
          ? { name: "Employer cash", kind: "hidden", text: "Hidden. A member does not see the employer’s invoice." }
          : { name: "Employer cash", kind: "estimated", text: `${baht(COMPANY.feeSaving)} a year · estimated opportunity · not a contracted reduction and not a verified saving` },
        { name: "Employee fee", kind: "unseparated", text: "Not separated from the employer total. Counting it again would double-count the same fee." },
        kind === "fees"
          ? { name: "Investment scenario", kind: "none", text: "Not estimated. This goal did not ask for a return scenario." }
          : role === "member"
            ? { name: "Investment scenario", kind: "scenario", text: "Not calculated for one member from the employer sample. Past returns are not future gains." }
            : { name: "Investment scenario", kind: "scenario", text: `${baht(COMPANY.investOpp)} a year on the stated return gap · uncertain scenario · past returns are not future gains` },
      ];
  return {
    company,
    provider,
    opportunities,
    agents,
    spend: `${baht(0)}. This build does not call a model, so there is no live AI spend.`,
    owner,
    goal: text || "No goal was written.",
    role,
    scope: bare
      ? `${who} of ${file.employer}. ${caseFacts(file)}. This case is not the worked sample.`
      : `${who} of ${COMPANY.name}. ${COMPANY.members.toLocaleString("en-US")} members, ${baht(COMPANY.aum)} assets, provider ${COMPANY.provider}.`,
    period: bare ? "No period is on this case yet." : "The open 2026 fee file. Not a live SEC history.",
    steps,
    missing: [
      ...(bare ? ["This case has no contract, invoice, or return series. The Rattana sample is not applied to it."] : []),
      "SEC historical returns and published fees are not loaded, so no real fund is ranked.",
      "The fee schedule does not split employer-paid charges from member-paid charges. The employer gap is not counted again as an employee saving.",
      "Invoices have not been reconciled, so nothing is a verified saving.",
      "A negotiated price is not the same as a published factsheet fee.",
    ],
    employerCash: role === "member"
      ? "Hidden. A member does not see the employer’s invoice."
      : bare
        ? "Not calculated. This case has insufficient evidence."
        : `${baht(COMPANY.feeSaving)} a year · estimated opportunity · sample contract, not a contracted reduction and not a verified saving`,
    employeeFee: "Not separated from the employer total. Counting it again would double-count the same fee.",
    investment: bare
      ? "Not calculated. A past return on another file is not a future gain here."
      : kind === "fees"
        ? "Not estimated. This goal did not ask for a return scenario."
        : role === "member"
          ? "Not calculated for one member from the employer sample. Past returns are not future gains."
          : `${baht(COMPANY.investOpp)} a year on the stated return gap · uncertain scenario · past returns are not future gains`,
    read: "The sample employer file and documents already marked reviewed. Not the SEC API.",
    draft: "Comparisons, a negotiation note, and a tender outline. Invitations and transfers stay unsent.",
    approval: `${owner} must approve provider invitations, binding negotiation, a fund change, a contribution change, or any asset transfer.`,
    doneWhen: "Draft analysis is on the file, payer splits are not double-counted, and any sending step is still unsent until the named person approves it.",
    nextDecision: role === "member"
      ? "The member can read the explanation. This screen does not give personalized advice or move assets."
      : `${owner} decides whether to stay, ask for a reprice, or warrant a tender. No letter is sent from this screen.`,
    result: kind === "unknown"
      ? "There is not enough in the sentence to choose a mission. The custom task is for review. No fund was ranked."
      : kind === "both" && role !== "member" && !bare
        ? "Here are three supported opportunities, what each could save, what remains uncertain, and the next decision for your committee."
        : "Here are the supported opportunities, what each could save, what remains uncertain, and the next decision. An estimated opportunity is not a contracted reduction or a verified saving.",
  };
}
