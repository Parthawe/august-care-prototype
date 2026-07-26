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

test("renders the August care prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>August — Care that continues<\/title>/i);
  assert.match(html, /Ask August anything\./);
  assert.match(html, /Good morning, Parth/);
  assert.match(html, /Secure · Private · Built by doctors/);
  assert.match(html, /Private by design/);
  assert.match(html, /Upload result/);
  assert.match(html, /class="august-tab[^"]*".*?August<\/span><\/span><\/nav>/s);
  assert.doesNotMatch(html, /Your site is taking shape/);
  assert.doesNotMatch(html, /Product design prototype/);
});

test("renders a direct clinician handoff case", async () => {
  const response = await render("/cases/doctor-handoff");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Maya Rao, MD/);
  assert.match(html, /Dr\. Rao replied · 10:18 AM/);
  assert.match(html, /Ask August/);
  assert.doesNotMatch(html, /Dr\. Rao is reviewing/);
});

test("separates clinician reviewing from clinician replies", async () => {
  const response = await render("/cases/doctor-reviewing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Dr\. Rao is reviewing/);
  assert.match(html, /Typical response today: 30–60 minutes/);
  assert.match(html, /You can leave this screen/);
  assert.doesNotMatch(html, /Dr\. Rao replied · 10:18 AM/);
});

test("renders a variation for a scenario", async () => {
  const response = await render("/cases/doctor-handoff/concierge");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /variation-concierge/);
  assert.match(html, /Maya Rao, MD/);
});

test("renders the prototype case directory", async () => {
  const response = await render("/cases");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Review by case\./);
  assert.match(html, /Recommended interview path/);
  assert.match(html, /Each tests a different idea/);
  assert.match(html, /\/cases\/symptom-intake\/classic/);
  assert.match(html, /\/cases\/doctor-reviewing\/classic/);
  assert.match(html, /\/cases\/doctor-handoff\/concierge/);
});
