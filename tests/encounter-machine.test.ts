import assert from "node:assert/strict";
import test from "node:test";
import {
  classifySafetyAnswer,
  createEncounterState,
  encounterReducer,
} from "../app/encounterMachine";

test("safety classifier distinguishes negatives, danger, and ambiguity", () => {
  assert.equal(classifySafetyAnswer("No chest pain, but I fainted."), "emergency");
  assert.equal(
    classifySafetyAnswer(
      "I am breathing normally, can swallow liquids, have not fainted, and have no chest pain."
    ),
    "safe"
  );
  assert.equal(
    classifySafetyAnswer("I can't breathe but my breathing is normal."),
    "clarify"
  );
  assert.equal(classifySafetyAnswer("I feel strange."), "clarify");
});

test("routine intake unlocks one answer at a time and ends at summary", () => {
  let state = createEncounterState({
    phase: "safety",
    concern: "My throat hurts.",
  });
  state = encounterReducer(state, {
    type: "SUBMIT_SAFETY",
    answer:
      "Breathing is normal, I can drink, I have not fainted, and no chest pain.",
  });
  assert.equal(state.phase, "intake");
  assert.equal(state.intakeStep, 0);

  state = encounterReducer(state, {
    type: "SUBMIT_INTAKE",
    answer: "Five days, fever last night.",
  });
  assert.equal(state.phase, "intake");
  assert.equal(state.intakeStep, 1);

  state = encounterReducer(state, {
    type: "SUBMIT_INTAKE",
    answer: "I can drink; swelling is even.",
  });
  assert.equal(state.phase, "intake");
  assert.equal(state.intakeStep, 2);

  state = encounterReducer(state, {
    type: "SUBMIT_INTAKE",
    answer: "No medication allergies.",
  });
  assert.equal(state.phase, "summary");
  assert.equal(state.intakeStep, 3);
});

test("a danger signal interrupts routine intake immediately", () => {
  const state = createEncounterState({ phase: "intake" });
  const next = encounterReducer(state, {
    type: "SUBMIT_INTAKE",
    answer: "No chest pain, but I fainted.",
  });
  assert.equal(next.phase, "emergency");
  assert.equal(next.safetyDecision, "emergency");
});

test("private August and clinician-visible messages never leak channels", () => {
  const initial = createEncounterState({ phase: "clinician_active" });
  const clinicianCount = initial.clinicianMessages.length;
  const augustCount = initial.augustMessages.length;

  const privateState = encounterReducer(initial, {
    type: "SEND_MESSAGE",
    recipient: "august",
    content: "Why did Maya ask this?",
  });
  assert.equal(privateState.clinicianMessages.length, clinicianCount);
  assert.equal(privateState.augustMessages.length, augustCount + 2);
  assert.ok(
    privateState.augustMessages
      .slice(-2)
      .every((message) => message.visibility === "private-to-august")
  );

  const sharedState = encounterReducer(privateState, {
    type: "SEND_MESSAGE",
    recipient: "clinician",
    content: "The swelling feels even.",
  });
  assert.equal(sharedState.augustMessages.length, privateState.augustMessages.length);
  assert.equal(sharedState.clinicianMessages.length, clinicianCount + 1);
  assert.equal(
    sharedState.clinicianMessages.at(-1)?.visibility,
    "shared-with-clinician"
  );
});

test("care plan cannot be signed before a final patient answer", () => {
  const initial = createEncounterState({ phase: "clinician_active" });
  const blocked = encounterReducer(initial, { type: "SIGN_PLAN" });
  assert.equal(blocked.phase, "clinician_active");

  const answered = encounterReducer(initial, {
    type: "SEND_MESSAGE",
    recipient: "clinician",
    content: "The swelling is even.",
  });
  const signed = encounterReducer(answered, { type: "SIGN_PLAN" });
  assert.equal(signed.phase, "plan_ready");
  assert.equal(signed.clinicianState, "plan_signed");
});

test("uploads remember their origin and only notify the intended thread", () => {
  const intake = encounterReducer(createEncounterState({ phase: "intake" }), {
    type: "START_UPLOAD",
    origin: "intake",
  });
  assert.equal(intake.upload?.returnTo, "intake");

  let clinician = encounterReducer(
    createEncounterState({ phase: "clinician_active" }),
    { type: "START_UPLOAD", origin: "clinician_active" }
  );
  assert.equal(clinician.upload?.returnTo, "clinician_active");
  clinician = encounterReducer(clinician, { type: "PROCESS_UPLOAD" });
  assert.equal(clinician.upload?.status, "processing");
  clinician = encounterReducer(clinician, { type: "COMPLETE_UPLOAD" });
  assert.equal(clinician.upload?.status, "review");
  clinician = encounterReducer(clinician, { type: "CONFIRM_UPLOAD" });
  assert.equal(clinician.phase, "clinician_active");
  assert.equal(clinician.upload?.status, "confirmed");
  assert.equal(clinician.clinicianMessages.at(-1)?.author, "system");
});

test("eligibility and consent begin explicitly unconfirmed", () => {
  const state = createEncounterState({ phase: "checkout" });
  assert.deepEqual(state.eligibility, {
    careFor: null,
    adultConfirmed: false,
    locationConfirmed: false,
    state: "California",
  });
  assert.equal(state.consent, false);
});
