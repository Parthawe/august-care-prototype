export type PortfolioScenario = {
  id: string;
  label: string;
  note: string;
  initialScenario: string;
  group:
    | "start"
    | "intake"
    | "handoff"
    | "reports"
    | "decisions"
    | "safety";
};

export const portfolioScenarioGroups = [
  {
    id: "start",
    eyebrow: "01 · Start",
    title: "Begin a new concern",
    note: "A blank entry point with no clinical state carried in.",
  },
  {
    id: "intake",
    eyebrow: "02 · Intake",
    title: "Gather the right context",
    note: "Two focused intake branches that stop before clinician care.",
  },
  {
    id: "handoff",
    eyebrow: "03 · Human care",
    title: "Review the clinician handoff",
    note: "Prepared states for waiting and private conversation boundaries.",
  },
  {
    id: "reports",
    eyebrow: "04 · Reports",
    title: "Test and review a result",
    note: "Self-contained choices for testing, upload recovery, and review.",
  },
  {
    id: "decisions",
    eyebrow: "05 · Decisions",
    title: "Understand the care outcome",
    note: "Prepared medication and follow-up outcomes without earlier steps.",
  },
  {
    id: "safety",
    eyebrow: "06 · Safety",
    title: "Stop routine care safely",
    note: "Focused boundaries for unsupported and emergency concerns.",
  },
] as const;

export const portfolioScenarios: PortfolioScenario[] = [
  {
    id: "start",
    label: "Start with a blank conversation",
    note: "Nothing is prefilled. Test only how August opens a new concern.",
    initialScenario: "empty",
    group: "start",
  },
  {
    id: "symptom",
    label: "Symptom intake",
    note: "Review the one-question-at-a-time interview and summary.",
    initialScenario: "symptom",
    group: "intake",
  },
  {
    id: "prescription",
    label: "Prescription request",
    note: "August assesses the request before any medication decision.",
    initialScenario: "prescription",
    group: "intake",
  },
  {
    id: "clinician-wait",
    label: "Maya is reviewing",
    note: "An honest delayed-response state with a private Ask August route.",
    initialScenario: "clinician-wait",
    group: "handoff",
  },
  {
    id: "care-inbox",
    label: "Care conversations",
    note: "Move between August and clinician threads without mixing visibility.",
    initialScenario: "care",
    group: "handoff",
  },
  {
    id: "testing",
    label: "Testing options",
    note: "Arrange a test through August or use an external laboratory.",
    initialScenario: "testing",
    group: "reports",
  },
  {
    id: "report-review",
    label: "Result awaiting Maya",
    note: "The confirmed result returns to its clinician conversation.",
    initialScenario: "result-review",
    group: "reports",
  },
  {
    id: "unreadable-report",
    label: "Unreadable report",
    note: "Recover from low-confidence extraction without inventing a result.",
    initialScenario: "upload-low-confidence",
    group: "reports",
  },
  {
    id: "medication-appropriate",
    label: "Medication appropriate",
    note: "Review the clinician-authored decision and continue to fulfillment.",
    initialScenario: "prescription-appropriate",
    group: "decisions",
  },
  {
    id: "medication-declined",
    label: "Medication not appropriate",
    note: "See the clinical reasoning, useful alternative, and next step.",
    initialScenario: "prescription-declined",
    group: "decisions",
  },
  {
    id: "follow-up",
    label: "August checks back",
    note: "Respond better or worse and see how continuity changes the next step.",
    initialScenario: "follow-up",
    group: "decisions",
  },
  {
    id: "unsupported",
    label: "Unsupported request",
    note: "A neutral boundary with a useful route forward.",
    initialScenario: "unsupported",
    group: "safety",
  },
  {
    id: "emergency",
    label: "Emergency interruption",
    note: "Routine chat stops while location and urgent action become primary.",
    initialScenario: "emergency",
    group: "safety",
  },
];

export function getPortfolioScenario(id: string) {
  return portfolioScenarios.find((scenario) => scenario.id === id);
}
