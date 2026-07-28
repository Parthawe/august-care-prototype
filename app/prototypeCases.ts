export type EncounterPhase =
  | "entry"
  | "safety"
  | "intake"
  | "summary"
  | "eligibility"
  | "matching"
  | "clinician_reviewing"
  | "clinician_active"
  | "plan_ready"
  | "follow_up"
  | "report"
  | "prescription"
  | "emergency"
  | "unsupported";

// Kept as a compatibility alias for existing imports and shared links.
export type PrototypeView = EncounterPhase;

export type PrototypeVariationId =
  | "classic"
  | "ambient"
  | "clinical"
  | "concierge";

export type PrototypeFixture =
  | "default"
  | "upload-low-confidence"
  | "prescription-appropriate"
  | "prescription-test-first"
  | "prescription-declined";

export type PrototypeCase = {
  id: string;
  label: string;
  phase: EncounterPhase;
  view: EncounterPhase;
  concern: string;
  note: string;
  fixture?: PrototypeFixture;
  group: "walkthrough" | "edge" | "supporting";
  compareVariations?: boolean;
};

export const prototypeVariations = [
  {
    id: "classic",
    label: "Classic",
    note: "Balanced August baseline: one continuous care encounter.",
    hypothesis: "Continuous care thread",
    question:
      "Does familiar chat with restrained clinical structure feel trustworthy?",
    recommended: true,
  },
  {
    id: "ambient",
    label: "Ambient",
    note: "Quieter surfaces, softer pacing, and less visible system structure.",
    hypothesis: "Quiet care companion",
    question:
      "Can August collect context while feeling calm and conversational?",
  },
  {
    id: "clinical",
    label: "Clinical",
    note: "Stronger provenance, timestamps, and explicit care-system state.",
    hypothesis: "Transparent care system",
    question:
      "Does visible provenance improve trust without feeling bureaucratic?",
  },
  {
    id: "concierge",
    label: "Concierge",
    note: "A more proactive, high-touch handoff with stronger care-team presence.",
    hypothesis: "Guided premium service",
    question:
      "Does proactive guidance make asynchronous care feel more supported and reassuring?",
  },
] satisfies Array<{
  id: PrototypeVariationId;
  label: string;
  note: string;
  hypothesis: string;
  question: string;
  recommended?: boolean;
}>;

export const prototypeCases = [
  {
    id: "home",
    label: "Home",
    phase: "entry",
    view: "entry",
    concern: "",
    note: "Natural entry point for symptoms, reports, medication, or a doctor.",
    group: "walkthrough",
    compareVariations: true,
  },
  {
    id: "symptom-intake",
    label: "Safety check",
    phase: "safety",
    view: "safety",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Free-text safety interruption before routine intake.",
    group: "walkthrough",
    compareVariations: true,
  },
  {
    id: "three-questions",
    label: "Focused intake",
    phase: "intake",
    view: "intake",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "One active question at a time before recommending care.",
    group: "walkthrough",
  },
  {
    id: "visit-summary",
    label: "Visit summary",
    phase: "summary",
    view: "summary",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Patient-reviewable context before anything is shared.",
    group: "walkthrough",
  },
  {
    id: "eligibility",
    label: "Eligibility and consent",
    phase: "eligibility",
    view: "eligibility",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Care recipient, location, summary sharing, and telehealth consent are explicitly confirmed.",
    group: "walkthrough",
  },
  {
    id: "async-wait",
    label: "Matching",
    phase: "matching",
    view: "matching",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "An honest asynchronous state that the patient can leave.",
    group: "walkthrough",
  },
  {
    id: "doctor-reviewing",
    label: "Clinician reviewing",
    phase: "clinician_reviewing",
    view: "clinician_reviewing",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "A sample clinician is assigned but has not replied.",
    group: "walkthrough",
  },
  {
    id: "doctor-handoff",
    label: "Clinician conversation",
    phase: "clinician_active",
    view: "clinician_active",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "Human care and a private August sidecar in one encounter.",
    group: "walkthrough",
    compareVariations: true,
  },
  {
    id: "care-plan",
    label: "Signed care plan",
    phase: "plan_ready",
    view: "plan_ready",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "The plan appears only after the clinician receives the final answer.",
    group: "walkthrough",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    phase: "follow_up",
    view: "follow_up",
    concern: "My throat has hurt for five days and I have a fever.",
    note: "August checks back and can reopen safety or clinician care.",
    group: "walkthrough",
  },
  {
    id: "report-upload",
    label: "Report workflow",
    phase: "report",
    view: "report",
    concern: "I want to upload my lab report.",
    note: "Attach, process, confirm, and return to the originating thread.",
    group: "edge",
  },
  {
    id: "report-low-confidence",
    label: "Unreadable report",
    phase: "report",
    view: "report",
    concern: "I want to upload my lab report.",
    note: "A low-confidence extraction recovers without inventing a result.",
    fixture: "upload-low-confidence",
    group: "supporting",
  },
  {
    id: "prescription-request",
    label: "Medication assessment",
    phase: "prescription",
    view: "prescription",
    concern: "I think I need an antibiotic prescription for my sore throat.",
    note: "Assessment before any medication decision.",
    group: "edge",
  },
  {
    id: "prescription-appropriate",
    label: "Medication appropriate",
    phase: "clinician_active",
    view: "clinician_active",
    concern: "I think I need an antibiotic prescription for my sore throat.",
    note: "Sample clinician decision with fulfillment next steps.",
    fixture: "prescription-appropriate",
    group: "supporting",
  },
  {
    id: "prescription-test-first",
    label: "Testing first",
    phase: "clinician_active",
    view: "clinician_active",
    concern: "I think I need an antibiotic prescription for my sore throat.",
    note: "Testing is required before a medication decision.",
    fixture: "prescription-test-first",
    group: "supporting",
  },
  {
    id: "prescription-declined",
    label: "Medication declined",
    phase: "clinician_active",
    view: "clinician_active",
    concern: "I think I need an antibiotic prescription for my sore throat.",
    note: "A clear clinical boundary with an alternative plan.",
    fixture: "prescription-declined",
    group: "supporting",
  },
  {
    id: "emergency",
    label: "Emergency interruption",
    phase: "emergency",
    view: "emergency",
    concern: "I have chest pain and trouble breathing.",
    note: "Routine conversation stops and emergency action becomes primary.",
    group: "edge",
  },
  {
    id: "unsupported",
    label: "Unsupported care",
    phase: "unsupported",
    view: "unsupported",
    concern: "I need a refill for Adderall.",
    note: "A concise boundary with an established-care next step.",
    group: "edge",
  },
] satisfies PrototypeCase[];

export type PrototypeCaseId = (typeof prototypeCases)[number]["id"];

export const recommendedWalkthroughCases = prototypeCases.filter(
  (prototypeCase) => prototypeCase.group === "walkthrough"
);

export const variationComparisonCases = prototypeCases.filter(
  (prototypeCase) => prototypeCase.compareVariations
);

export const signatureEdgeCases = prototypeCases.filter(
  (prototypeCase) => prototypeCase.group === "edge"
);

export const supportingCases = prototypeCases.filter(
  (prototypeCase) => prototypeCase.group === "supporting"
);

export const primaryPrototypeCases = [
  ...recommendedWalkthroughCases,
  ...signatureEdgeCases,
];

const legacyCaseAliases: Record<string, string> = {
  "async-clinician": "doctor-handoff",
  "lab-upload": "report-upload",
  "prescription-boundary": "prescription-request",
  "unsupported-controlled": "unsupported",
};

export function getPrototypeCase(
  caseId: string | string[] | null | undefined
) {
  const rawCaseId = Array.isArray(caseId) ? caseId[0] : caseId;
  if (!rawCaseId) return undefined;
  const normalizedCaseId = legacyCaseAliases[rawCaseId] ?? rawCaseId;
  return prototypeCases.find(
    (prototypeCase) => prototypeCase.id === normalizedCaseId
  );
}

export function getPrototypeVariation(
  variationId: string | string[] | null | undefined
) {
  const normalizedVariationId = Array.isArray(variationId)
    ? variationId[0]
    : variationId;
  if (!normalizedVariationId) return prototypeVariations[0];
  return (
    prototypeVariations.find(
      (variation) => variation.id === normalizedVariationId
    ) ?? prototypeVariations[0]
  );
}

export function supportsVariationComparison(caseId: string) {
  return Boolean(getPrototypeCase(caseId)?.compareVariations);
}
