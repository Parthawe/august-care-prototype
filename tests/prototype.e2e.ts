import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const flowRoutes = [
  "start",
  "symptom",
  "prescription",
  "clinician-wait",
  "care-inbox",
  "testing",
  "report-review",
  "unreadable-report",
  "medication-appropriate",
  "medication-declined",
  "follow-up",
  "unsupported",
  "emergency",
] as const;

async function expectIsolatedShell(page: Page) {
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "New conversation" }),
  ).toHaveCount(0);
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  await expect(page.locator(".reviewer-rail")).toHaveCount(0);
}

test("the main entry opens the flow directory", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/prototype$/);
  await expect(page.getByText("Choose one small flow.", { exact: true })).toBeVisible();
});

test("the directory contains only the 13 independent flows", async ({
  page,
}) => {
  await page.goto("/prototype");

  await expect(page.locator('a[href^="/prototype/"]')).toHaveCount(13);
  await expect(page.locator('a[href^="/cases/"]')).toHaveCount(0);
  await expect(page.getByText("One continuous care story")).toHaveCount(0);

  for (const route of flowRoutes) {
    await expect(page.locator(`a[href="/prototype/${route}"]`)).toHaveCount(1);
  }
});

test("every flow opens without global or cross-case navigation", async ({
  page,
}) => {
  for (const route of flowRoutes) {
    await page.goto(`/prototype/${route}`);
    await expect(page).toHaveURL(new RegExp(`/prototype/${route}$`));
    await expect(page.getByRole("main")).toBeVisible();
    await expectIsolatedShell(page);
  }
});

test("legacy case links resolve into an isolated flow", async ({ page }) => {
  await page.goto("/cases/doctor-handoff/concierge");
  await expect(page).toHaveURL(/\/prototype\/care-inbox$/);
  await expectIsolatedShell(page);
});

test("the start flow ends after August asks its first question", async ({
  page,
}) => {
  await page.goto("/prototype/start");
  const textbox = page.getByRole("textbox", { name: "Message August" });
  await textbox.fill("My throat started hurting today.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(
    page.getByText("The opening is ready", { exact: true }),
  ).toBeVisible();
  await expect(textbox).toBeDisabled();
  await expectIsolatedShell(page);
});

test("the intake flow stops at its summary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/symptom");
  const textbox = page.getByRole("textbox", { name: "Message August" });

  await textbox.fill("102 F with white patches.");
  await page.getByRole("button", { name: "Send message" }).click();
  await textbox.fill("No medication allergies or major conditions.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Intake flow complete.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm summary" })).toHaveCount(0);
});

test("clinician waiting remains a handoff-only flow", async ({ page }) => {
  await page.goto("/prototype/clinician-wait");

  await expect(page.getByText("Handoff flow complete.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check for a reply" })).toHaveCount(0);
  await page.getByRole("button", { name: "Ask August while you wait" }).click();
  await expect(page.getByRole("button", { name: "Return to Maya" })).toBeVisible();
  await expectIsolatedShell(page);
});

test("care inbox contains only the active Maya and August threads", async ({
  page,
}) => {
  await page.goto("/prototype/care-inbox");

  await expect(page.getByText("Dr. Chen", { exact: false })).toHaveCount(0);
  const mayaThread = page.getByRole("button", {
    name: /Maya.*Reviewing your visit/i,
  });
  await expect(mayaThread).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /August.*Ask August privately about this care flow/i,
    }),
  ).toBeVisible();
  await mayaThread.click();
  await expect(page.getByRole("button", { name: "Check for a reply" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Back to conversations" })).toBeVisible();
});

test("report review stops before clinical interpretation", async ({ page }) => {
  await page.goto("/prototype/report-review");

  await expect(page.getByText("Report flow complete.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check for an update" })).toHaveCount(0);
  await expectIsolatedShell(page);
});

test("medication outcomes end before follow-up", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");

  await page.goto("/prototype/medication-appropriate");
  await page.getByRole("button", { name: "Review medication plan" }).click();
  await page.getByRole("button", { name: "Choose a pharmacy" }).click();
  await page.getByRole("button", { name: "Confirm pharmacy" }).click();
  await expect(
    page.getByText("Fulfillment flow complete.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "View care plan" })).toHaveCount(0);

  await page.goto("/prototype/medication-declined");
  await page.getByRole("button", { name: "View alternative plan" }).click();
  await expect(
    page.getByText("Decision flow complete.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "View care plan" })).toHaveCount(0);
});

test("follow-up does not restart intake when symptoms worsen", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/follow-up");
  const textbox = page.getByRole("textbox", { name: "Message August" });
  await textbox.fill("I am worse and have a new fever.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(
    page.getByText(/contact Maya in your existing care conversation/i),
  ).toBeVisible();
  await expect(page.getByText("August will check in", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/I want to recheck safety before deciding/i),
  ).toHaveCount(0);
});

test("emergency guidance ends in a terminal state", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/emergency");
  await page.getByRole("button", { name: "Call emergency services" }).click();
  await page.getByRole("button", { name: "Confirm and call" }).click();
  await page
    .getByRole("button", { name: "Safety check before leaving" })
    .click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm signs stopped" }).click();

  await expect(
    page.getByText("Urgent guidance is complete.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expectIsolatedShell(page);
});

test("isolated flows fit every supported mobile width", async ({ page }) => {
  await page.goto("/prototype/symptom");
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("textbox", { name: "Message August" })).toBeVisible();
});

test("isolated flow has no serious accessibility violations", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/symptom");
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(serious).toEqual([]);
});
