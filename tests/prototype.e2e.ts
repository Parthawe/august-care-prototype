import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const signatureMoments = [
  "/cases/home/classic",
  "/cases/symptom-intake/ambient",
  "/cases/doctor-handoff/concierge",
];

const edgePaths = [
  "/cases/report-upload/classic",
  "/cases/prescription-request/classic",
  "/cases/emergency/classic",
  "/cases/unsupported/classic",
];

async function expectNoObscuredContent(page: Parameters<typeof test>[0]["page"]) {
  await page.evaluate(() => {
    const activeScroll =
      document.querySelector(".conversation-body") ??
      document.querySelector(".summary-screen") ??
      document.querySelector(".home-screen");
    activeScroll?.scrollTo({ top: activeScroll.scrollHeight });
  });
  await page.waitForTimeout(50);
  const result = await page.evaluate(() => {
    const composer = document.querySelector(".composer")?.getBoundingClientRect();
    const nav = document.querySelector(".bottom-nav")?.getBoundingClientRect();
    const activeScroll =
      document.querySelector(".conversation-body") ??
      document.querySelector(".summary-screen") ??
      document.querySelector(".home-screen");
    if (!activeScroll) return { okay: true };
    const contentRoot =
      activeScroll.matches(".summary-screen")
        ? activeScroll.querySelector(".page-body")
        : activeScroll;
    const last = contentRoot?.lastElementChild?.getBoundingClientRect();
    const obstructionTop = Math.min(
      composer?.top ?? Number.POSITIVE_INFINITY,
      nav?.top ?? Number.POSITIVE_INFINITY
    );
    return {
      okay: !last || !Number.isFinite(obstructionTop) || last.bottom <= obstructionTop + 1,
      lastBottom: last?.bottom,
      obstructionTop,
    };
  });
  expect(result.okay, JSON.stringify(result)).toBe(true);
}

for (const path of signatureMoments) {
  test(`signature moment ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expect(page.locator(".phone-frame")).toBeVisible();
    await expect(page.getByText(/Preview|prototype/i)).toHaveCount(0);
    await expectNoObscuredContent(page);
    await page.screenshot({
      path: testInfo.outputPath(
        `${path.replaceAll("/", "-").replace(/^-/, "")}.png`
      ),
      fullPage: true,
    });
  });
}

for (const path of edgePaths) {
  test(`resolved edge path ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expect(page.locator(".phone-frame")).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(
        `${path.replaceAll("/", "-").replace(/^-/, "")}.png`
      ),
      fullPage: true,
    });
  });
}

test("checkout consent starts unchecked and blocks progress", async ({ page }) => {
  await page.goto("/cases/pricing-checkout/classic");
  const consent = page.locator(".consent-row input");
  await expect(consent).not.toBeChecked();
  await expect(page.getByRole("button", { name: /Pay and send/ })).toBeDisabled();
});

test("composer remains available in the clinician conversation", async ({ page }) => {
  await page.goto("/cases/doctor-handoff/classic");
  await expect(page.locator(".composer")).toBeVisible();
  await expect(page.getByText("Private to August", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Ask August/ }).click();
  await expect(page.getByText("Maya cannot see messages in this sidecar.")).toBeVisible();
  await expect(page.locator(".composer")).toBeVisible();
});

test("emergency suppresses routine navigation and composer", async ({ page }) => {
  await page.goto("/cases/emergency/classic");
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  await expect(page.locator(".composer")).toHaveCount(0);
  await expect(page.getByText(/After you contact emergency services/)).toHaveCount(0);
  await page.getByRole("button", { name: /Use a different concern/ }).click();
  await expect(page.getByText("Confirm before leaving")).toBeVisible();
  await page.getByRole("button", { name: /Stay on this screen/ }).click();
  await page.getByRole("button", { name: /Call emergency services/ }).click();
  await expect(page.getByText(/After you contact emergency services/)).toBeVisible();
});

test("supports keyboard focus and 200% root text sizing", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/cases/doctor-handoff/classic");
  const before = await page.locator(".message-bubble").first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize)
  );
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "32px";
  });
  const after = await page.locator(".message-bubble").first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize)
  );
  expect(after).toBeGreaterThanOrEqual(before * 2);
  await expect(page.locator(".composer")).toBeVisible();
  await expectNoObscuredContent(page);

  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(["BUTTON", "INPUT", "A", "TEXTAREA"]).toContain(focused);
});

test("has no serious accessibility violations", async ({ page }) => {
  await page.goto("/cases/doctor-handoff/classic");
  const results = await new AxeBuilder({ page })
    .disableRules(["landmark-one-main"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  expect(serious).toEqual([]);
});
