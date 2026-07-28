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

test("initial concern routing respects negation and interrupts on clear danger", () => {
  const routine = encounterReducer(createEncounterState(), {
    type: "START_CONCERN",
    concern: "No chest pain, just heartburn.",
  });
  assert.equal(routine.phase, "safety");

  const danger = encounterReducer(createEncounterState(), {
    type: "START_CONCERN",
    concern: "No chest pain, but I fainted.",
  });
  assert.equal(danger.phase, "emergency");
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

test("summary corrections persist in the encounter record", () => {
  const initial = createEncounterState({ phase: "summary" });
  const corrected = encounterReducer(initial, {
    type: "ADD_SUMMARY_CORRECTION",
    correction: "The fever reached 102°F, not 101°F.",
  });
  assert.deepEqual(corrected.summaryCorrections, [
    "The fever reached 102°F, not 101°F.",
  ]);
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

test("clinician assignment, reply, patient answer, and signature remain chronological", () => {
  const matching = createEncounterState({ phase: "matching" });
  assert.equal(matching.clinicianMessages.length, 0);

  const bypassAssignment = encounterReducer(matching, {
    type: "GO_TO",
    phase: "clinician_reviewing",
  });
  assert.equal(bypassAssignment.phase, "matching");

  const reviewing = encounterReducer(matching, { type: "ASSIGN_CLINICIAN" });
  assert.equal(reviewing.phase, "clinician_reviewing");
  assert.equal(reviewing.clinicianMessages.length, 0);

  const bypassReply = encounterReducer(reviewing, {
    type: "GO_TO",
    phase: "clinician_active",
  });
  assert.equal(bypassReply.phase, "clinician_reviewing");

  const replied = encounterReducer(reviewing, { type: "CLINICIAN_REPLIED" });
  assert.equal(replied.phase, "clinician_active");
  assert.equal(
    replied.clinicianMessages.filter((item) => item.author === "clinician")
      .length,
    2
  );

  const bypassSignature = encounterReducer(replied, {
    type: "GO_TO",
    phase: "plan_ready",
  });
  assert.equal(bypassSignature.phase, "clinician_active");

  const answered = encounterReducer(replied, {
    type: "SEND_MESSAGE",
    recipient: "clinician",
    content: "The swelling feels even.",
  });
  const signed = encounterReducer(answered, { type: "SIGN_PLAN" });
  assert.equal(signed.phase, "plan_ready");

  const directPlan = createEncounterState({ phase: "plan_ready" });
  assert.ok(
    directPlan.clinicianMessages.some((item) => item.author === "patient")
  );
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
  assert.equal(clinician.upload?.status, "selecting");
  clinician = encounterReducer(clinician, { type: "USE_SAMPLE_UPLOAD" });
  clinician = encounterReducer(clinician, { type: "PROCESS_UPLOAD" });
  assert.equal(clinician.upload?.status, "processing");
  clinician = encounterReducer(clinician, { type: "COMPLETE_UPLOAD" });
  assert.equal(clinician.upload?.status, "review");
  clinician = encounterReducer(clinician, { type: "CONFIRM_UPLOAD" });
  assert.equal(clinician.phase, "clinician_active");
  assert.equal(clinician.upload?.status, "confirmed");
  assert.equal(clinician.clinicianMessages.at(-1)?.author, "system");
});

test("safety and follow-up uploads return to the exact originating conversation", () => {
  const safety = encounterReducer(createEncounterState({ phase: "safety" }), {
    type: "START_UPLOAD",
    origin: "safety",
  });
  assert.equal(safety.upload?.returnTo, "safety");

  const followUp = encounterReducer(
    createEncounterState({ phase: "follow_up" }),
    {
      type: "START_UPLOAD",
      origin: "follow_up",
    }
  );
  assert.equal(followUp.upload?.returnTo, "follow_up");
});

test("report extraction cannot skip required processing and confirmation states", () => {
  let state = encounterReducer(createEncounterState({ phase: "intake" }), {
    type: "START_UPLOAD",
    origin: "intake",
  });

  const cannotCompleteAttached = encounterReducer(state, {
    type: "COMPLETE_UPLOAD",
  });
  assert.equal(cannotCompleteAttached.upload?.status, "selecting");

  state = encounterReducer(state, { type: "USE_SAMPLE_UPLOAD" });
  assert.equal(state.upload?.status, "attached");

  const cannotConfirmAttached = encounterReducer(state, {
    type: "CONFIRM_UPLOAD",
  });
  assert.equal(cannotConfirmAttached.phase, "report");

  state = encounterReducer(state, { type: "PROCESS_UPLOAD" });
  const cannotConfirmProcessing = encounterReducer(state, {
    type: "CONFIRM_UPLOAD",
  });
  assert.equal(cannotConfirmProcessing.upload?.status, "processing");

  state = encounterReducer(state, { type: "COMPLETE_UPLOAD" });
  const cannotRetryReview = encounterReducer(state, { type: "RETRY_UPLOAD" });
  assert.equal(cannotRetryReview.upload?.status, "review");

  state = encounterReducer(state, { type: "SET_UPLOAD_LOW_CONFIDENCE" });
  state = encounterReducer(state, { type: "RETRY_UPLOAD" });
  assert.equal(state.upload?.status, "selecting");
});

test("real selected files never produce fabricated extraction values", () => {
  let state = encounterReducer(createEncounterState(), {
    type: "START_UPLOAD",
    origin: "entry",
  });
  state = encounterReducer(state, {
    type: "SELECT_UPLOAD_FILE",
    filename: "my-real-report.pdf",
  });
  assert.deepEqual(state.upload?.extractedFields, []);
  assert.equal(state.upload?.source, "user-selected");

  state = encounterReducer(state, { type: "PROCESS_UPLOAD" });
  state = encounterReducer(state, { type: "COMPLETE_UPLOAD" });
  assert.equal(state.upload?.status, "low_confidence");
  assert.deepEqual(state.upload?.extractedFields, []);
});

test("safety routing applies to medication, report, and conversation messages", () => {
  const medication = encounterReducer(
    createEncounterState({ phase: "prescription" }),
    {
      type: "SUBMIT_PRESCRIPTION",
      answer: "I took too much and think I overdosed.",
    }
  );
  assert.equal(medication.phase, "emergency");
  assert.equal(medication.safetyOrigin, "prescription");

  const report = encounterReducer(
    createEncounterState({ phase: "report" }),
    {
      type: "SUBMIT_REPORT_NOTE",
      content: "I have chest pain now.",
    }
  );
  assert.equal(report.phase, "emergency");
  assert.equal(report.safetyOrigin, "report");

  const followUp = encounterReducer(
    createEncounterState({ phase: "follow_up" }),
    {
      type: "SEND_MESSAGE",
      recipient: "august",
      content: "My face is drooping and my speech is slurred.",
    }
  );
  assert.equal(followUp.phase, "emergency");
  assert.equal(followUp.safetyOrigin, "follow_up");
});

test("emergency exit preserves the originating care context", () => {
  let state = encounterReducer(
    createEncounterState({ phase: "prescription" }),
    {
      type: "SUBMIT_PRESCRIPTION",
      answer: "I am having chest pain.",
    }
  );
  state = encounterReducer(state, { type: "CONFIRM_EMERGENCY_EXIT" });
  assert.equal(state.phase, "prescription");
  assert.equal(state.safetyOrigin, null);
});

test("controlled medication requests route to an ongoing-care boundary", () => {
  const state = encounterReducer(createEncounterState(), {
    type: "START_CONCERN",
    concern: "Can I refill Xanax?",
  });
  assert.equal(state.phase, "unsupported");
});

test("follow-up replies are contextual and clinician care can be reopened", () => {
  const followUp = createEncounterState({ phase: "follow_up" });
  const replied = encounterReducer(followUp, {
    type: "SEND_MESSAGE",
    recipient: "august",
    content: "It feels about the same.",
  });
  assert.match(
    replied.augustMessages.at(-1)?.content ?? "",
    /compare this with yesterday/i
  );

  const reopened = encounterReducer(replied, {
    type: "GO_TO",
    phase: "clinician_active",
  });
  assert.equal(reopened.phase, "clinician_active");
  assert.equal(reopened.clinicianState, "replied");
});

test("all medication decision outcomes resolve inside the clinician encounter", () => {
  for (const outcome of ["appropriate", "test-first", "declined"] as const) {
    const resolved = encounterReducer(
      createEncounterState({
        phase: "prescription",
        concern: "I think I need an antibiotic.",
      }),
      { type: "SET_PRESCRIPTION_OUTCOME", outcome }
    );
    assert.equal(resolved.phase, "clinician_active");
    assert.equal(resolved.prescriptionOutcome, outcome);
  }
});

test("eligibility and consent begin explicitly unconfirmed", () => {
  const state = createEncounterState({ phase: "eligibility" });
  assert.deepEqual(state.eligibility, {
    careFor: null,
    adultConfirmed: false,
    identityConfirmed: false,
    locationConfirmed: false,
    state: "California",
  });
  assert.deepEqual(state.consent, {
    shareSummary: false,
    telehealth: false,
  });
});
