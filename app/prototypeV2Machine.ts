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

export const completeJourneyStates = [
  "intake-empty",
  "intake-concern",
  "intake-gathering",
  "intake-summary",
  "intake-reviewing",
  "intake-reply",
  "lab-recommended",
  "lab-nearby-lab",
  "lab-confirmed",
  "prescription-recommended",
  "prescription-review",
  "prescription-pharmacy",
  "prescription-sent",
] as const;

export type CompleteJourneyState = (typeof completeJourneyStates)[number];

export type CompleteJourneyLocation = {
  flow: PrototypeV2Flow;
  state: PrototypeV2State;
};

export function getCompleteJourneyLocation(
  value?: string,
): CompleteJourneyLocation & { id: CompleteJourneyState; index: number } {
  const id = (completeJourneyStates.includes(value as CompleteJourneyState)
    ? value
    : completeJourneyStates[0]) as CompleteJourneyState;
  const [flow, ...stateParts] = id.split("-");
  return {
    id,
    index: completeJourneyStates.indexOf(id),
    flow: flow as PrototypeV2Flow,
    state: stateParts.join("-") as PrototypeV2State,
  };
}

export function getCompleteJourneyId(
  flow: PrototypeV2Flow,
  state: PrototypeV2State,
): CompleteJourneyState {
  return `${flow}-${state}` as CompleteJourneyState;
}

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
    responseEstimate: "Usually replies within 2–4 hours";
    sharedAt: "Today · 9:52 AM";
    repliedAt: "Today · 10:24 AM";
  };
  prescription: {
    medication: "Penicillin V";
    strength: "500 mg tablet";
    directions: "Take one tablet twice daily";
    duration: "10 days";
    quantity: "20 tablets";
    prescriber: "Maya Rao";
    pharmacy: "Castro Community Pharmacy";
    pharmacyAddress: "2200 Market St, San Francisco";
    pharmacyDistance: "0.8 miles away";
    pharmacyAvailability: "Open today until 7:00 PM";
    electronicStatus: "Accepting electronic prescriptions";
    sentAt: "Today · 10:42 AM";
    status: "recommended" | "reviewed" | "sent";
  };
  lab: {
    test: "Rapid strep test";
    reason: "Guides the medication decision";
    location: "Mission Lab";
    address: "2400 Mission St, San Francisco";
    distance: "1.2 miles away";
    appointment: "Tomorrow · 9:30 AM";
    preparation: "Bring photo ID and order code";
    orderCode: "AUG-4821";
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
      responseEstimate: "Usually replies within 2–4 hours",
      sharedAt: "Today · 9:52 AM",
      repliedAt: "Today · 10:24 AM",
    },
    prescription: {
      medication: "Penicillin V",
      strength: "500 mg tablet",
      directions: "Take one tablet twice daily",
      duration: "10 days",
      quantity: "20 tablets",
      prescriber: "Maya Rao",
      pharmacy: "Castro Community Pharmacy",
      pharmacyAddress: "2200 Market St, San Francisco",
      pharmacyDistance: "0.8 miles away",
      pharmacyAvailability: "Open today until 7:00 PM",
      electronicStatus: "Accepting electronic prescriptions",
      sentAt: "Today · 10:42 AM",
      status:
        flow === "prescription" && normalized === "sent"
          ? "sent"
          : flow === "prescription" && stateIndex >= 1
            ? "reviewed"
            : "recommended",
    },
    lab: {
      test: "Rapid strep test",
      reason: "Guides the medication decision",
      location: "Mission Lab",
      address: "2400 Mission St, San Francisco",
      distance: "1.2 miles away",
      appointment: "Tomorrow · 9:30 AM",
      preparation: "Bring photo ID and order code",
      orderCode: "AUG-4821",
      status:
        flow === "lab" && normalized === "confirmed"
          ? "confirmed"
          : flow === "lab" && normalized === "nearby-lab"
            ? "arranged"
            : "recommended",
    },
  };
}

export function getPreviousPrototypeV2State(
  flow: PrototypeV2Flow,
  state: PrototypeV2State,
): { flow: PrototypeV2Flow; state: PrototypeV2State } {
  const index = getPrototypeV2StateIndex(flow, state);
  if (index > 0) {
    return {
      flow,
      state: prototypeV2States[flow][index - 1] as PrototypeV2State,
    };
  }

  if (flow === "prescription" || flow === "lab") {
    return { flow: "intake", state: "reply" };
  }

  return { flow: "intake", state: "empty" };
}
