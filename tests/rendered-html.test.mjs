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

test("renders the August encounter without unsupported claims", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>August — Care that continues<\/title>/i);
  assert.match(html, /Ask August anything\./);
  assert.match(html, /Good morning, Parth/);
  assert.match(html, /AI guide \+ human care/);
  assert.match(html, /Upload result/);
  assert.doesNotMatch(html, /Secure · Private · Built by doctors/i);
  assert.doesNotMatch(html, /board.certified|licensed clinician|HIPAA/i);
  assert.doesNotMatch(html, />Preview\b|>Prototype\b/i);
});

test("renders a private August sidecar beside the clinician conversation", async () => {
  const response = await render("/cases/doctor-handoff");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Maya Rao/);
  assert.match(html, /Human clinician conversation/);
  assert.match(html, /Ask August/);
  assert.match(html, /Fictional sample clinician/);
  assert.doesNotMatch(html, /Maya Rao, MD|board.certified/i);
});

test("separates clinician reviewing from clinician replies", async () => {
  const response = await render("/cases/doctor-reviewing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Maya is reviewing/);
  assert.match(html, /No reply has been sent yet/);
  assert.match(html, /You can leave this screen/);
  assert.doesNotMatch(html, /Typical response today|guaranteed response/i);
});

test("renders a variation only at a signature moment", async () => {
  const comparison = await render("/cases/doctor-handoff/concierge");
  assert.equal(comparison.status, 200);
  assert.match(await comparison.text(), /variation-concierge/);

  const resolved = await render("/cases/emergency/concierge");
  assert.ok([301, 302, 307, 308].includes(resolved.status));
  assert.match(resolved.headers.get("location") ?? "", /\/cases\/emergency\/classic$/);
});

test("renders the focused prototype review hub", async () => {
  const response = await render("/cases");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Review one care encounter\./);
  assert.match(html, /One continuous care story/);
  assert.match(html, /Four hypotheses, three moments/);
  assert.match(html, /One recommended design per case/);
  assert.match(html, /\/cases\/symptom-intake\/classic/);
  assert.match(html, /\/cases\/doctor-handoff\/concierge/);
  assert.match(html, /\/cases\/emergency\/classic/);
  assert.doesNotMatch(html, /\/cases\/emergency\/concierge/);
});
