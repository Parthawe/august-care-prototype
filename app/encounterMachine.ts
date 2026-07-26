import type {
  EncounterPhase,
  PrototypeFixture,
} from "./prototypeCases";

export type ConversationRecipient = "august" | "clinician";
export type ConversationAuthor = "patient" | "august" | "clinician" | "system";
export type MessageVisibility =
  | "patient"
  | "shared-with-clinician"
  | "private-to-august";
export type MessageDelivery = "sending" | "delivered" | "read";
export type ClinicianState =
  | "unassigned"
  | "matching"
  | "assigned"
  | "reviewing"
  | "replied"
  | "plan_signed"
  | "unavailable"
  | "delayed";
export type UploadStatus =
  | "attached"
  | "processing"
  | "review"
  | "low_confidence"
  | "confirmed";
export type PrescriptionOutcome =
  | "appropriate"
  | "test-first"
  | "declined"
  | null;
export type SafetyDecision = "emergency" | "safe" | "clarify";

export type ConversationMessage = {
  id: string;
  author: ConversationAuthor;
  recipient: ConversationRecipient;
  visibility: MessageVisibility;
  timestamp: string;
  delivery: MessageDelivery;
  content: string;
};

export type UploadContext = {
  origin: EncounterPhase;
  returnTo: EncounterPhase;
  status: UploadStatus;
  confidence: number | null;
  filename: string;
  extractedFields: Array<{ label: string; value: string }>;
  confirmed: boolean;
};

export type EligibilityState = {
  careFor: "self" | "someone-else" | null;
  adultConfirmed: boolean;
  locationConfirmed: boolean;
  state: string;
};

export type EncounterState = {
  phase: EncounterPhase;
  concern: string;
  safetyDecision: SafetyDecision | null;
  safetyClarification: boolean;
  intakeStep: number;
  intakeAnswers: string[];
  summaryCorrections: string[];
  recipient: ConversationRecipient;
  clinicianState: ClinicianState;
  clinicianMessages: ConversationMessage[];
  augustMessages: ConversationMessage[];
  upload: UploadContext | null;
  eligibility: EligibilityState;
  consent: boolean;
  prescriptionStep: number;
  prescriptionAnswers: string[];
  prescriptionOutcome: PrescriptionOutcome;
  emergencyActionStarted: boolean;
  emergencyExitConfirmed: boolean;
};

export type EncounterAction =
  | { type: "RESET"; state: EncounterState }
  | { type: "GO_TO"; phase: EncounterPhase }
  | { type: "START_CONCERN"; concern: string }
  | { type: "SUBMIT_SAFETY"; answer: string }
  | { type: "SUBMIT_INTAKE"; answer: string }
  | { type: "ADD_SUMMARY_CORRECTION"; correction: string }
  | { type: "SET_RECIPIENT"; recipient: ConversationRecipient }
  | {
      type: "SEND_MESSAGE";
      recipient: ConversationRecipient;
      content: string;
    }
  | { type: "ASSIGN_CLINICIAN" }
  | { type: "CLINICIAN_REPLIED" }
  | { type: "SIGN_PLAN" }
  | { type: "SET_CLINICIAN_DELAYED" }
  | { type: "START_UPLOAD"; origin: EncounterPhase }
  | { type: "PROCESS_UPLOAD" }
  | { type: "COMPLETE_UPLOAD" }
  | { type: "SET_UPLOAD_LOW_CONFIDENCE" }
  | { type: "CONFIRM_UPLOAD" }
  | { type: "RETRY_UPLOAD" }
  | {
      type: "SET_ELIGIBILITY";
      eligibility: Partial<EligibilityState>;
    }
  | { type: "SET_CONSENT"; consent: boolean }
  | { type: "SUBMIT_PRESCRIPTION"; answer: string }
  | { type: "SET_PRESCRIPTION_OUTCOME"; outcome: PrescriptionOutcome }
  | { type: "START_EMERGENCY_ACTION" }
  | { type: "CONFIRM_EMERGENCY_EXIT" };

const safetyConcepts = [
  {
    positive:
      /trouble breathing|difficulty breathing|hard to breathe|short of breath|can't breathe|cannot breathe/,
    negative:
      /no (?:trouble|difficulty) breathing|not (?:having )?(?:trouble|difficulty) breathing|breathing (?:is )?(?:normal|fine|okay)|can breathe/,
  },
  {
    positive:
      /unable to swallow|can't swallow|cannot swallow|hard to swallow liquids|can't drink|cannot drink/,
    negative: /can swallow|able to swallow|can drink|able to drink/,
  },
  {
    positive: /fainted|fainting|passed out|feel like i (?:might|may) pass out/,
    negative:
      /didn't faint|did not faint|haven't fainted|have not fainted|no fainting|not fainting/,
  },
  {
    positive:
      /severe chest pain|chest pressure|pressure in (?:my )?chest/,
    negative:
      /no (?:severe )?chest pain|chest pain (?:is )?not severe|no chest pressure/,
  },
];

export function classifySafetyAnswer(answer: string): SafetyDecision {
  const normalized = answer.toLowerCase().replace(/[’]/g, "'").trim();
  if (!normalized) return "clarify";
  if (/^(yes|yes,|one of those|i am|i do)$/.test(normalized)) {
    return "emergency";
  }
  if (/^(no|nope|none|none of those|not at all)$/.test(normalized)) {
    return "safe";
  }

  const explicitContradiction =
    /(can't|cannot|hard to) breathe.*breathing (?:is )?(?:normal|fine|okay)|breathing (?:is )?(?:normal|fine|okay).*(can't|cannot|hard to) breathe/.test(
      normalized
    );
  if (explicitContradiction) return "clarify";

  const hasUnnegatedDanger = safetyConcepts.some(
    ({ positive, negative }) =>
      positive.test(normalized) && !negative.test(normalized)
  );
  if (hasUnnegatedDanger) return "emergency";

  const hasSafetyLanguage =
    /none of (?:these|those)|no (?:other )?(?:warning|danger|urgent) signs|breathing (?:is )?(?:normal|fine|okay)|can (?:still )?(?:swallow|drink|breathe)|able to (?:swallow|drink|breathe)|no fainting|did not faint|no (?:severe )?chest pain/.test(
      normalized
    );
  return hasSafetyLanguage ? "safe" : "clarify";
}

export function hasEmergencySignal(answer: string) {
  return classifySafetyAnswer(answer) === "emergency";
}

function message(
  id: string,
  author: ConversationAuthor,
  recipient: ConversationRecipient,
  visibility: MessageVisibility,
  timestamp: string,
  content: string
): ConversationMessage {
  return {
    id,
    author,
    recipient,
    visibility,
    timestamp,
    delivery: "delivered",
    content,
  };
}

function clinicianReplyMessages() {
  return [
    message(
      "clinician-1",
      "clinician",
      "clinician",
      "shared-with-clinician",
      "10:18 AM",
      "I reviewed your fever, throat pain, safety answers, and recent exposure."
    ),
    message(
      "clinician-2",
      "clinician",
      "clinician",
      "shared-with-clinician",
      "10:19 AM",
      "A rapid strep test would help guide the next step. Is the swelling stronger on one side, or is it even?"
    ),
  ];
}

function privateAugustMessages() {
  return [
    message(
      "august-private-1",
      "august",
      "august",
      "private-to-august",
      "10:20 AM",
      "Maya is asking about one-sided swelling because it can change how urgently your throat should be examined."
    ),
  ];
}

export function createEncounterState({
  phase = "entry",
  concern = "",
  fixture = "default",
}: {
  phase?: EncounterPhase;
  concern?: string;
  fixture?: PrototypeFixture;
} = {}): EncounterState {
  const prescriptionOutcome: PrescriptionOutcome =
    fixture === "prescription-appropriate"
      ? "appropriate"
      : fixture === "prescription-test-first"
        ? "test-first"
        : fixture === "prescription-declined"
          ? "declined"
          : null;

  const clinicianState: ClinicianState =
    phase === "clinician_reviewing"
      ? "reviewing"
      : phase === "clinician_active"
        ? "replied"
        : phase === "plan_ready" || phase === "follow_up"
          ? "plan_signed"
          : phase === "matching"
            ? "matching"
            : "unassigned";

  const uploadStatus: UploadStatus =
    fixture === "upload-low-confidence" ? "low_confidence" : "attached";
  const clinicianHasReplied =
    phase === "clinician_active" ||
    phase === "plan_ready" ||
    phase === "follow_up";
  const planIsSigned = phase === "plan_ready" || phase === "follow_up";
  const seededClinicianMessages = clinicianHasReplied
    ? clinicianReplyMessages()
    : [];
  const clinicianMessages = planIsSigned
    ? [
        ...seededClinicianMessages,
        message(
          "patient-final-answer",
          "patient",
          "clinician",
          "shared-with-clinician",
          "10:21 AM",
          "The swelling feels even on both sides."
        ),
      ]
    : seededClinicianMessages;

  return {
    phase,
    concern,
    safetyDecision: phase === "intake" ? "safe" : null,
    safetyClarification: false,
    intakeStep: phase === "intake" ? 0 : 0,
    intakeAnswers: [],
    summaryCorrections: [],
    recipient: "clinician",
    clinicianState,
    clinicianMessages,
    augustMessages: clinicianHasReplied ? privateAugustMessages() : [],
    upload:
      phase === "report"
        ? {
            origin: "summary",
            returnTo: "summary",
            status: uploadStatus,
            confidence:
              fixture === "upload-low-confidence" ? 0.42 : null,
            filename: "Rapid strep result.pdf",
            extractedFields: [
              { label: "Rapid strep", value: "Negative" },
              { label: "Collected", value: "Today" },
            ],
            confirmed: false,
          }
        : null,
    eligibility: {
      careFor: null,
      adultConfirmed: false,
      locationConfirmed: false,
      state: "California",
    },
    consent: false,
    prescriptionStep: 0,
    prescriptionAnswers: [],
    prescriptionOutcome,
    emergencyActionStarted: false,
    emergencyExitConfirmed: false,
  };
}

function nextMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function encounterReducer(
  state: EncounterState,
  action: EncounterAction
): EncounterState {
  switch (action.type) {
    case "RESET":
      return action.state;
    case "GO_TO": {
      const skipsAssignment =
        state.phase === "matching" &&
        action.phase === "clinician_reviewing" &&
        state.clinicianState !== "assigned";
      const skipsReply =
        state.phase === "clinician_reviewing" &&
        action.phase === "clinician_active" &&
        state.clinicianState !== "replied";
      const skipsSignature =
        state.phase === "clinician_active" &&
        action.phase === "plan_ready" &&
        state.clinicianState !== "plan_signed";
      if (skipsAssignment || skipsReply || skipsSignature) return state;
      return {
        ...state,
        phase: action.phase,
        clinicianState:
          action.phase === "matching"
            ? "matching"
            : action.phase === "clinician_reviewing"
              ? "reviewing"
              : action.phase === "clinician_active" &&
                  state.phase === "follow_up"
                ? "replied"
              : state.clinicianState,
      };
    }
    case "START_CONCERN": {
      const normalized = action.concern.toLowerCase();
      if (hasEmergencySignal(normalized)) {
        return { ...state, concern: action.concern, phase: "emergency" };
      }
      if (/adderall|oxycodone|controlled medication/.test(normalized)) {
        return { ...state, concern: action.concern, phase: "unsupported" };
      }
      if (/upload|report|result|lab/.test(normalized)) {
        return {
          ...state,
          concern: action.concern,
          phase: "report",
          upload: {
            origin: "entry",
            returnTo: "summary",
            status: "attached",
            confidence: null,
            filename: "Rapid strep result.pdf",
            extractedFields: [
              { label: "Rapid strep", value: "Negative" },
              { label: "Collected", value: "Today" },
            ],
            confirmed: false,
          },
        };
      }
      if (/prescription|refill|antibiotic|medication/.test(normalized)) {
        return {
          ...state,
          concern: action.concern,
          phase: "prescription",
        };
      }
      return {
        ...state,
        concern: action.concern,
        phase: "safety",
        safetyDecision: null,
        safetyClarification: false,
      };
    }
    case "SUBMIT_SAFETY": {
      const decision = classifySafetyAnswer(action.answer);
      return {
        ...state,
        safetyDecision: decision,
        safetyClarification: decision === "clarify",
        phase: decision === "emergency" ? "emergency" : state.phase,
        intakeStep: decision === "safe" ? 0 : state.intakeStep,
        intakeAnswers:
          decision === "safe"
            ? [action.answer]
            : state.intakeAnswers,
        ...(decision === "safe" ? { phase: "intake" as const } : {}),
      };
    }
    case "SUBMIT_INTAKE": {
      if (hasEmergencySignal(action.answer)) {
        return {
          ...state,
          intakeAnswers: [...state.intakeAnswers, action.answer],
          phase: "emergency",
          safetyDecision: "emergency",
        };
      }
      const answers = [...state.intakeAnswers, action.answer];
      const nextStep = state.intakeStep + 1;
      return {
        ...state,
        intakeAnswers: answers,
        intakeStep: nextStep,
        phase: nextStep >= 3 ? "summary" : "intake",
      };
    }
    case "ADD_SUMMARY_CORRECTION":
      return {
        ...state,
        summaryCorrections: [
          ...state.summaryCorrections,
          action.correction.trim(),
        ].filter(Boolean),
      };
    case "SET_RECIPIENT":
      return { ...state, recipient: action.recipient };
    case "SEND_MESSAGE": {
      const isClinician = action.recipient === "clinician";
      const next = message(
        nextMessageId(isClinician ? "patient-clinician" : "patient-august"),
        "patient",
        action.recipient,
        isClinician ? "shared-with-clinician" : "private-to-august",
        "Now",
        action.content
      );
      return isClinician
        ? {
            ...state,
            clinicianMessages: [...state.clinicianMessages, next],
          }
        : {
            ...state,
            augustMessages: [
              ...state.augustMessages,
              next,
              message(
                nextMessageId("august-reply"),
                "august",
                "august",
                "private-to-august",
                "Now",
                state.phase === "follow_up"
                  ? "Thanks for the update. I can help compare this with yesterday. If symptoms are worsening, reopen the safety check or message Maya about this visit."
                  : "The rapid test checks for group A strep. Maya will interpret the result alongside your symptoms before deciding what comes next."
              ),
            ],
          };
    }
    case "ASSIGN_CLINICIAN":
      if (state.phase !== "matching") return state;
      return {
        ...state,
        phase: "clinician_reviewing",
        clinicianState: "reviewing",
      };
    case "CLINICIAN_REPLIED": {
      if (state.phase !== "clinician_reviewing") return state;
      const hasReply = state.clinicianMessages.some(
        (item) => item.author === "clinician"
      );
      return {
        ...state,
        phase: "clinician_active",
        clinicianState: "replied",
        recipient: "clinician",
        clinicianMessages: hasReply
          ? state.clinicianMessages
          : [...state.clinicianMessages, ...clinicianReplyMessages()],
        augustMessages:
          state.augustMessages.length > 0
            ? state.augustMessages
            : privateAugustMessages(),
      };
    }
    case "SIGN_PLAN":
      if (
        state.phase !== "clinician_active" ||
        state.clinicianState !== "replied" ||
        !state.clinicianMessages.some(
          (item) => item.author === "patient"
        )
      ) {
        return state;
      }
      return {
        ...state,
        phase: "plan_ready",
        clinicianState: "plan_signed",
      };
    case "SET_CLINICIAN_DELAYED":
      return { ...state, clinicianState: "delayed" };
    case "START_UPLOAD": {
      const returnTo =
        action.origin === "clinician_active"
          ? "clinician_active"
          : action.origin === "prescription"
            ? "prescription"
            : action.origin === "follow_up"
              ? "follow_up"
              : action.origin === "safety"
                ? "safety"
            : action.origin === "intake"
              ? "intake"
              : "summary";
      return {
        ...state,
        phase: "report",
        upload: {
          origin: action.origin,
          returnTo,
          status: "attached",
          confidence: null,
          filename: "Rapid strep result.pdf",
          extractedFields: [
            { label: "Rapid strep", value: "Negative" },
            { label: "Collected", value: "Today" },
          ],
          confirmed: false,
        },
      };
    }
    case "PROCESS_UPLOAD":
      return state.upload?.status === "attached"
        ? {
            ...state,
            upload: { ...state.upload, status: "processing" },
          }
        : state;
    case "COMPLETE_UPLOAD":
      return state.upload?.status === "processing"
        ? {
            ...state,
            upload: {
              ...state.upload,
              status: "review",
              confidence: 0.96,
            },
          }
        : state;
    case "SET_UPLOAD_LOW_CONFIDENCE":
      return state.upload?.status === "review"
        ? {
            ...state,
            upload: {
              ...state.upload,
              status: "low_confidence",
              confidence: 0.42,
            },
          }
        : state;
    case "CONFIRM_UPLOAD": {
      if (!state.upload || state.upload.status !== "review") return state;
      const clinicianUpdate =
        state.upload.returnTo === "clinician_active"
          ? [
              ...state.clinicianMessages,
              message(
                nextMessageId("report-shared"),
                "system",
                "clinician",
                "shared-with-clinician",
                "Now",
                "Confirmed report added to this encounter."
              ),
            ]
          : state.clinicianMessages;
      return {
        ...state,
        phase: state.upload.returnTo,
        clinicianMessages: clinicianUpdate,
        upload: { ...state.upload, status: "confirmed", confirmed: true },
      };
    }
    case "RETRY_UPLOAD":
      return state.upload?.status === "low_confidence"
        ? {
            ...state,
            upload: {
              ...state.upload,
              status: "attached",
              confidence: null,
            },
          }
        : state;
    case "SET_ELIGIBILITY":
      return {
        ...state,
        eligibility: { ...state.eligibility, ...action.eligibility },
      };
    case "SET_CONSENT":
      return { ...state, consent: action.consent };
    case "SUBMIT_PRESCRIPTION": {
      const answers = [...state.prescriptionAnswers, action.answer];
      return {
        ...state,
        prescriptionAnswers: answers,
        prescriptionStep: Math.min(3, state.prescriptionStep + 1),
      };
    }
    case "SET_PRESCRIPTION_OUTCOME":
      return {
        ...state,
        prescriptionOutcome: action.outcome,
        phase: "clinician_active",
        clinicianState: "replied",
      };
    case "START_EMERGENCY_ACTION":
      return { ...state, emergencyActionStarted: true };
    case "CONFIRM_EMERGENCY_EXIT":
      return { ...state, emergencyExitConfirmed: true, phase: "entry" };
    default:
      return state;
  }
}
