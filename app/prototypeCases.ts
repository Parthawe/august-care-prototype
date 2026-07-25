export type PrototypeView =
  | "home"
  | "intake"
  | "details"
  | "summary"
  | "checkout"
  | "waiting"
  | "clinician"
  | "upload"
  | "prescription"
  | "plan"
  | "followup"
  | "emergency"
  | "unsupported";

export const prototypeCases = [
  {
    id: "home",
    label: "Home",
    view: "home",
    concern: "",
    note: "Start state and August entry point.",
  },
  {
    id: "symptom-intake",
    label: "Symptom intake",
    view: "intake",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Human-feeling first safety question.",
  },
  {
    id: "three-questions",
    label: "Three-question intake",
    view: "details",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "August asks enough before recommending care.",
  },
  {
    id: "visit-summary",
    label: "Visit summary",
    view: "summary",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Reviewable clinician handoff.",
  },
  {
    id: "pricing-checkout",
    label: "Pricing handoff",
    view: "checkout",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Expectation, consent, state, and no-guarantee framing.",
  },
  {
    id: "async-wait",
    label: "Async wait",
    view: "waiting",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Clinician response expectation management.",
  },
  {
    id: "doctor-handoff",
    label: "Doctor handoff",
    view: "clinician",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Human clinician enters the thread.",
  },
  {
    id: "async-clinician",
    label: "Async clinician",
    view: "clinician",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Human clinician enters the thread.",
  },
  {
    id: "report-upload",
    label: "Report upload",
    view: "upload",
    concern: "I want to upload my lab report.",
    note: "August reads and summarizes an uploaded result.",
  },
  {
    id: "lab-upload",
    label: "Lab upload",
    view: "upload",
    concern: "I want to upload my lab report.",
    note: "August reads and summarizes an uploaded result.",
  },
  {
    id: "prescription-request",
    label: "Prescription request",
    view: "prescription",
    concern: "I think I need an antibiotic prescription for my sore throat.",
    note: "Assessment before medication, no prescription promise.",
  },
  {
    id: "prescription-boundary",
    label: "Prescription boundary",
    view: "prescription",
    concern: "I think I need an antibiotic prescription for my sore throat.",
    note: "Assessment before medication, no prescription promise.",
  },
  {
    id: "care-plan",
    label: "Care plan",
    view: "plan",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Doctor-signed next steps.",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    view: "followup",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "August checks back after care.",
  },
  {
    id: "emergency",
    label: "Emergency escalation",
    view: "emergency",
    concern: "I have chest pain and trouble breathing.",
    note: "Safety-first escalation.",
  },
  {
    id: "unsupported",
    label: "Unsupported request",
    view: "unsupported",
    concern: "I need a refill for Adderall.",
    note: "Clear boundary without apology language.",
  },
  {
    id: "unsupported-controlled",
    label: "Unsupported controlled request",
    view: "unsupported",
    concern: "I need a refill for Adderall.",
    note: "Clear boundary without apology language.",
  },
] satisfies Array<{
  id: string;
  label: string;
  view: PrototypeView;
  concern: string;
  note: string;
}>;

export type PrototypeCaseId = (typeof prototypeCases)[number]["id"];

export function getPrototypeCase(caseId: string | string[] | null | undefined) {
  const normalizedCaseId = Array.isArray(caseId) ? caseId[0] : caseId;
  if (!normalizedCaseId) return undefined;
  return prototypeCases.find(
    (prototypeCase) => prototypeCase.id === normalizedCaseId
  );
}
