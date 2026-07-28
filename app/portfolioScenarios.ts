export type PortfolioScenario = {
  id: string;
  label: string;
  note: string;
  initialScenario: string;
  group: "begin" | "handoff" | "outcome" | "safety";
};

export const portfolioScenarios: PortfolioScenario[] = [
  {
    id: "start",
    label: "Start with a blank conversation",
    note: "Nothing is prefilled. Type naturally and watch August begin the interview.",
    initialScenario: "empty",
    group: "begin",
  },
  {
    id: "symptom",
    label: "Symptom → clinician",
    note: "Adaptive questions, summary review, consent, and clinician handoff.",
    initialScenario: "symptom",
    group: "begin",
  },
  {
    id: "prescription",
    label: "Prescription request",
    note: "August assesses the request before any medication decision.",
    initialScenario: "prescription",
    group: "begin",
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
    group: "outcome",
  },
  {
    id: "report-review",
    label: "Result awaiting Maya",
    note: "The confirmed result returns to its clinician conversation.",
    initialScenario: "result-review",
    group: "outcome",
  },
  {
    id: "unreadable-report",
    label: "Unreadable report",
    note: "Recover from low-confidence extraction without inventing a result.",
    initialScenario: "upload-low-confidence",
    group: "outcome",
  },
  {
    id: "medication-appropriate",
    label: "Medication appropriate",
    note: "Review the clinician-authored decision and continue to fulfillment.",
    initialScenario: "prescription-appropriate",
    group: "outcome",
  },
  {
    id: "medication-declined",
    label: "Medication not appropriate",
    note: "See the clinical reasoning, useful alternative, and next step.",
    initialScenario: "prescription-declined",
    group: "outcome",
  },
  {
    id: "follow-up",
    label: "August checks back",
    note: "Respond better or worse and see how continuity changes the next step.",
    initialScenario: "follow-up",
    group: "outcome",
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
