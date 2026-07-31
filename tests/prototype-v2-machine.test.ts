import assert from "node:assert/strict";
import test from "node:test";
import {
  createPrototypeV2Encounter,
  normalizePrototypeV2State,
  prototypeV2States,
} from "../app/prototypeV2Machine";

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
});
