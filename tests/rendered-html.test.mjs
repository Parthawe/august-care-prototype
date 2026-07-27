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

test("renders the focused August-first messaging encounter", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>August — One continuous care conversation<\/title>/i,
  );
  assert.match(html, /Hi Parth—what would you like help with today\?/);
  assert.match(html, /Any trouble breathing or swallowing liquids\?/);
  assert.match(html, /Message August…/);
  assert.match(html, /Care conversations/);
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
