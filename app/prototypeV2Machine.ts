export const prototypeV2Flows = ["intake", "prescription", "lab"] as const;

export type PrototypeV2Flow = (typeof prototypeV2Flows)[number];

export const prototypeV2States = {
  intake: [
    "empty",
    "concern",
    "gathering",
    "summary",
    "reviewing",
    "reply",
  ],
  prescription: ["recommended", "review", "pharmacy", "sent"],
  lab: ["recommended", "nearby-lab", "confirmed"],
} as const;

export type IntakeV2State = (typeof prototypeV2States.intake)[number];
export type PrescriptionV2State =
  (typeof prototypeV2States.prescription)[number];
export type LabV2State = (typeof prototypeV2States.lab)[number];
export type PrototypeV2State =
  | IntakeV2State
  | PrescriptionV2State
  | LabV2State;

export type IntakeAnswers = {
  concern: string;
  onset: string;
  warningSigns: string;
  history: string;
  allergies: string;
};

export type PrototypeV2Encounter = {
  flow: PrototypeV2Flow;
  state: PrototypeV2State;
  answers: IntakeAnswers;
  summaryConfirmed: boolean;
  clinician: {
    name: "Maya Rao";
    role: "Human clinician";
    status: "unassigned" | "reviewing" | "replied";
  };
  prescription: {
    medication: "Penicillin V";
    directions: "Follow clinician directions";
    pharmacy: "Castro Community Pharmacy";
    status: "recommended" | "reviewed" | "sent";
  };
  lab: {
    test: "Rapid strep test";
    location: "Mission Lab";
    appointment: "Tomorrow · 9:30 AM";
    status: "recommended" | "arranged" | "confirmed";
  };
};

export const defaultIntakeAnswers: IntakeAnswers = {
  concern: "My throat has been hurting and I had a fever last night.",
  onset: "Five days ago. It is worse today and my highest temperature was 102°F.",
  warningSigns:
    "I can breathe and drink normally. I have not fainted and have no chest pain.",
  history:
    "No major health conditions. I take ibuprofen occasionally and no other medication.",
  allergies: "No medication allergies or previous antibiotic reactions.",
};

export const prototypeV2StateLabels: Record<
  PrototypeV2Flow,
  Record<string, string>
> = {
  intake: {
    empty: "Empty conversation",
    concern: "Concern started",
    gathering: "Information gathering",
    summary: "Confirm information",
    reviewing: "Clinician reviewing",
    reply: "First clinician reply",
  },
  prescription: {
    recommended: "Medication recommended",
    review: "Review prescription",
    pharmacy: "Confirm pharmacy",
    sent: "Prescription sent",
  },
  lab: {
    recommended: "Testing recommended",
    "nearby-lab": "Nearby lab arranged",
    confirmed: "Appointment confirmed",
  },
};

export function isPrototypeV2Flow(value: string): value is PrototypeV2Flow {
  return prototypeV2Flows.includes(value as PrototypeV2Flow);
}

export function normalizePrototypeV2State(
  flow: PrototypeV2Flow,
  value?: string,
): PrototypeV2State {
  const states = prototypeV2States[flow] as readonly string[];
  return (states.includes(value ?? "") ? value : states[0]) as PrototypeV2State;
}

export function getPrototypeV2StateIndex(
  flow: PrototypeV2Flow,
  state: PrototypeV2State,
) {
  return (prototypeV2States[flow] as readonly string[]).indexOf(state);
}

export function movePrototypeV2State(
  flow: PrototypeV2Flow,
  state: PrototypeV2State,
  direction: -1 | 1,
) {
  const states = prototypeV2States[flow] as readonly PrototypeV2State[];
  const current = Math.max(0, states.indexOf(state));
  const next = Math.min(states.length - 1, Math.max(0, current + direction));
  return states[next];
}

export function createPrototypeV2Encounter(
  flow: PrototypeV2Flow,
  state?: string,
): PrototypeV2Encounter {
  const normalized = normalizePrototypeV2State(flow, state);
  const stateIndex = getPrototypeV2StateIndex(flow, normalized);

  return {
    flow,
    state: normalized,
    answers: { ...defaultIntakeAnswers },
    summaryConfirmed: flow !== "intake" || stateIndex >= 4,
    clinician: {
      name: "Maya Rao",
      role: "Human clinician",
      status:
        flow !== "intake" || normalized === "reply"
          ? "replied"
          : normalized === "reviewing"
            ? "reviewing"
            : "unassigned",
    },
    prescription: {
      medication: "Penicillin V",
      directions: "Follow clinician directions",
      pharmacy: "Castro Community Pharmacy",
      status:
        flow === "prescription" && normalized === "sent"
          ? "sent"
          : flow === "prescription" && stateIndex >= 1
            ? "reviewed"
            : "recommended",
    },
    lab: {
      test: "Rapid strep test",
      location: "Mission Lab",
      appointment: "Tomorrow · 9:30 AM",
      status:
        flow === "lab" && normalized === "confirmed"
          ? "confirmed"
          : flow === "lab" && normalized === "nearby-lab"
            ? "arranged"
            : "recommended",
    },
  };
}
