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

test("renders the canonical August care entry", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>August — One continuous care conversation<\/title>/i,
  );
  assert.doesNotMatch(html, /Hi Parth—what would you like help with today\?/);
  assert.doesNotMatch(html, /My throat has been hurting\./);
  assert.match(html, /Ask August anything\./);
  assert.match(html, /Describe what’s going on…/);
  assert.match(html, /AI guide \+ human care/);
  assert.doesNotMatch(html, /Secure · Private · Built by doctors/i);
  assert.doesNotMatch(html, /board.certified|licensed clinician|HIPAA/i);
  assert.doesNotMatch(html, />Preview\b|>Prototype\b/i);
});

test("the initial screen does not fabricate an active clinician", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /Maya \(Clinician\)/);
  assert.doesNotMatch(html, /Plan signed by Maya/);
});

test("renders one-click supporting scenarios", async () => {
  const emptyResponse = await render("/prototype/start");
  assert.equal(emptyResponse.status, 200);
  const emptyHtml = await emptyResponse.text();
  assert.doesNotMatch(emptyHtml, /Ask August anything\./);
  assert.match(emptyHtml, /Message August…/);

  const waitingResponse = await render("/prototype/clinician-wait");
  assert.equal(waitingResponse.status, 200);
  const waitingHtml = await waitingResponse.text();
  assert.match(waitingHtml, /Maya \(Clinician\)/);
  assert.match(waitingHtml, /Usually replies in 2–4 hours/);
  assert.match(waitingHtml, /Ask August while you wait/);

  const emergencyResponse = await render("/prototype/emergency");
  assert.equal(emergencyResponse.status, 200);
  const emergencyHtml = await emergencyResponse.text();
  assert.match(emergencyHtml, /This may need emergency care now\./);
  assert.match(emergencyHtml, /Call emergency services/);
  assert.doesNotMatch(emergencyHtml, /Message August…|Main navigation/);
});

test("renders the portfolio scenario directory", async () => {
  const response = await render("/prototype");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Choose the moment you want to review\./);
  assert.match(html, /\/prototype\/start/);
  assert.match(html, /\/prototype\/clinician-wait/);
  assert.match(html, /\/prototype\/emergency/);
});
