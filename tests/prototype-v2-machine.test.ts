import assert from "node:assert/strict";
import test from "node:test";
import {
  completeJourneyStates,
  createPrototypeV2Encounter,
  getCompleteJourneyLocation,
  getPreviousPrototypeV2State,
  normalizePrototypeV2State,
  prototypeV2States,
} from "../app/prototypeV2Machine";

test("complete journey orders every existing state into one coherent visit", () => {
  assert.equal(completeJourneyStates.length, 13);
  assert.deepEqual(getCompleteJourneyLocation(), {
    id: "intake-empty",
    index: 0,
    flow: "intake",
    state: "empty",
  });
  assert.deepEqual(getCompleteJourneyLocation("lab-nearby-lab"), {
    id: "lab-nearby-lab",
    index: 7,
    flow: "lab",
    state: "nearby-lab",
  });
  assert.equal(completeJourneyStates.at(-1), "prescription-sent");
});

test("V2 exposes exactly 13 deterministic screens across three flows", () => {
  assert.deepEqual(prototypeV2States.intake, [
    "empty",
    "concern",
    "gathering",
    "summary",
    "reviewing",
    "reply",
  ]);
  assert.deepEqual(prototypeV2States.prescription, [
    "recommended",
    "review",
    "pharmacy",
    "sent",
  ]);
  assert.deepEqual(prototypeV2States.lab, [
    "recommended",
    "nearby-lab",
    "confirmed",
  ]);
  assert.equal(
    Object.values(prototypeV2States).reduce(
      (total, states) => total + states.length,
      0,
    ),
    13,
  );
});

test("invalid state URLs normalize to each flow start", () => {
  assert.equal(normalizePrototypeV2State("intake", "choose-clinician"), "empty");
  assert.equal(
    normalizePrototypeV2State("prescription", "nearby-lab"),
    "recommended",
  );
  assert.equal(normalizePrototypeV2State("lab", "sent"), "recommended");
});

test("confirmed context and clinician ownership are honest", () => {
  const gathering = createPrototypeV2Encounter("intake", "gathering");
  assert.equal(gathering.summaryConfirmed, false);
  assert.equal(gathering.clinician.status, "unassigned");

  const reviewing = createPrototypeV2Encounter("intake", "reviewing");
  assert.equal(reviewing.summaryConfirmed, true);
  assert.equal(reviewing.clinician.status, "reviewing");

  const prescription = createPrototypeV2Encounter("prescription", "sent");
  assert.equal(prescription.clinician.status, "replied");
  assert.equal(prescription.prescription.status, "sent");

  const lab = createPrototypeV2Encounter("lab", "confirmed");
  assert.equal(lab.lab.status, "confirmed");
  assert.equal(lab.lab.orderCode, "AUG-4821");
  assert.equal(prescription.prescription.strength, "500 mg tablet");
  assert.equal(
    prescription.prescription.electronicStatus,
    "Accepting electronic prescriptions",
  );
});

test("patient back navigation stays within the flow and rejoins care context", () => {
  assert.deepEqual(getPreviousPrototypeV2State("intake", "summary"), {
    flow: "intake",
    state: "gathering",
  });
  assert.deepEqual(getPreviousPrototypeV2State("prescription", "review"), {
    flow: "prescription",
    state: "recommended",
  });
  assert.deepEqual(getPreviousPrototypeV2State("lab", "recommended"), {
    flow: "intake",
    state: "reply",
  });
});
