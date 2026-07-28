import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("the canonical entry redirects to the isolated flow directory", async () => {
  const response = await render();
  assert.ok([307, 308].includes(response.status));
  assert.equal(
    new URL(response.headers.get("location")).pathname,
    "/prototype",
  );
});

test("renders one-click supporting scenarios", async () => {
  const emptyResponse = await render("/prototype/start");
  assert.equal(emptyResponse.status, 200);
  const emptyHtml = await emptyResponse.text();
  assert.doesNotMatch(emptyHtml, /Ask August anything\./);
  assert.match(emptyHtml, /Message August…/);
  assert.doesNotMatch(emptyHtml, /Main navigation|New conversation/);

  const waitingResponse = await render("/prototype/clinician-wait");
  assert.equal(waitingResponse.status, 200);
  const waitingHtml = await waitingResponse.text();
  assert.match(waitingHtml, /Maya \(Clinician\)/);
  assert.match(waitingHtml, /Usually replies in 2–4 hours/);
  assert.match(waitingHtml, /Ask August while you wait/);
  assert.match(waitingHtml, /Handoff flow complete/);
  assert.doesNotMatch(waitingHtml, /Check for a reply|Main navigation/);

  const emergencyResponse = await render("/prototype/emergency");
  assert.equal(emergencyResponse.status, 200);
  const emergencyHtml = await emergencyResponse.text();
  assert.match(emergencyHtml, /This may need emergency care now\./);
  assert.match(emergencyHtml, /Call emergency services/);
  assert.doesNotMatch(emergencyHtml, /Message August…|Main navigation/);
});

test("legacy case links redirect into isolated flows", async () => {
  const response = await render("/cases/doctor-handoff/concierge");
  assert.ok([307, 308].includes(response.status));
  assert.equal(
    new URL(response.headers.get("location")).pathname,
    "/prototype/care-inbox",
  );
});

test("renders the portfolio scenario directory", async () => {
  const response = await render("/prototype");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Choose one small flow\./);
  assert.match(html, /Every route stands on its own\./);
  assert.match(html, /\/prototype\/start/);
  assert.match(html, /\/prototype\/clinician-wait/);
  assert.match(html, /\/prototype\/emergency/);
  assert.doesNotMatch(html, />Previous<|>Next<|One continuous care story/);
});

test("renders the case hub as independent flows, not a walkthrough", async () => {
  const response = await render("/cases");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Choose one small flow\./);
  assert.match(html, /Six small flow groups/);
  assert.match(html, /\/prototype\/start/);
  assert.match(html, /\/prototype\/report-review/);
  assert.doesNotMatch(
    html,
    /Begin walkthrough|One continuous care story|Four hypotheses/,
  );
});
