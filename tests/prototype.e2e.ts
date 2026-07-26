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

const patientUiPaths = [
  "/cases/home/classic",
  "/cases/symptom-intake/classic",
  "/cases/three-questions/classic",
  "/cases/visit-summary/classic",
  "/cases/eligibility/classic",
  "/cases/pricing-checkout/classic",
  "/cases/async-wait/classic",
  "/cases/doctor-reviewing/classic",
  "/cases/doctor-handoff/classic",
  "/cases/care-plan/classic",
  "/cases/follow-up/classic",
  ...edgePaths,
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
    await expectNoObscuredContent(page);
    await page.screenshot({
      path: testInfo.outputPath(
        `${path.replaceAll("/", "-").replace(/^-/, "")}.png`
      ),
      fullPage: true,
    });
  });
}

test("visit summary is derived from the patient's answers", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/cases/home/classic");
  await page
    .getByRole("textbox", { name: "Describe what’s going on" })
    .fill("My throat has hurt for five days and I have a fever.");
  await page.getByRole("button", { name: "Start conversation" }).click();

  const answers = [
    "Breathing is normal, I can swallow liquids, I have not fainted, and I have no chest pain.",
    "102 degrees last night, and I can swallow liquids.",
    "No medication allergies and no antibiotic reactions.",
    "No rash or one-sided swelling; a coworker recently had strep.",
  ];
  for (const [index, answer] of answers.entries()) {
    const composer = page.locator(".composer");
    await composer.getByRole("textbox").fill(answer);
    const send = composer.getByRole("button", { name: "Send message" });
    await expect(send).toBeEnabled();
    await send.click();
    if (index === answers.length - 1) {
      await expect(page.getByText("What August collected", { exact: true })).toBeVisible();
    } else {
      await expect(page.getByText(answer, { exact: true })).toBeVisible();
    }
  }

  await expect(
    page.getByText(
      "Temperature and swallowing: 102 degrees last night, and I can swallow liquids.",
      { exact: true }
    )
  ).toBeVisible();
  await expect(page.getByText(/101\.5°F/)).toHaveCount(0);
});

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

test("the four hypotheses change content at every signature moment", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  const expectations = [
    {
      path: "/cases/home/ambient",
      text: "What’s on your mind?",
    },
    {
      path: "/cases/symptom-intake/clinical",
      text: "Patient-reported · not shared with a clinician yet",
    },
    {
      path: "/cases/doctor-handoff/concierge",
      text: "Your clinician has the context",
    },
  ];
  for (const expectation of expectations) {
    await page.goto(expectation.path);
    await expect(page.getByText(expectation.text, { exact: true })).toBeVisible();
  }
});

test("follow-up can reopen the clinician conversation", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/cases/follow-up/classic");
  await page
    .getByRole("button", { name: "Message Maya about this visit" })
    .click();
  await expect(page.getByText("Sore throat visit", { exact: true })).toBeVisible();
  await expect(page.locator(".composer")).toBeVisible();
});

test("patient-facing text never renders below 12px", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  const failures: Array<{ path: string; undersized: unknown[] }> = [];
  for (const path of patientUiPaths) {
    await page.goto(path);
    const undersized = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>(".phone-frame *"))
        .filter((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          const hasOwnText = Array.from(element.childNodes).some(
            (node) =>
              node.nodeType === Node.TEXT_NODE &&
              Boolean(node.textContent?.trim())
          );
          return (
            hasOwnText &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            bounds.width > 0 &&
            bounds.height > 0 &&
            Number.parseFloat(style.fontSize) < 12
          );
        })
        .slice(0, 20)
        .map((element) => ({
          tag: element.tagName,
          className: element.className,
          text: element.textContent?.trim().slice(0, 80),
          size: getComputedStyle(element).fontSize,
        }))
    );
    if (undersized.length > 0) {
      failures.push({ path, undersized });
    }
  }
  expect(failures, JSON.stringify(failures)).toEqual([]);
});

test("patient-facing controls provide 44px touch targets", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  const failures: Array<{ path: string; controls: unknown[] }> = [];
  for (const path of patientUiPaths) {
    await page.goto(path);
    await expect(page.locator(".phone-frame")).toBeVisible();
    await page.waitForTimeout(75);
    const controls = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          ".phone-frame button, .phone-frame a, .phone-frame input, .phone-frame textarea"
        )
      )
        .filter((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            bounds.width > 0 &&
            bounds.height > 0
          );
        })
        .map((element) => {
          const target =
            element.closest<HTMLElement>("label") ?? element;
          const bounds = target.getBoundingClientRect();
          return {
            tag: element.tagName,
            className: element.className,
            name:
              element.getAttribute("aria-label") ??
              element.textContent?.trim().slice(0, 60),
            width: Math.round(bounds.width),
            height: Math.round(bounds.height),
          };
        })
        .filter((target) => target.width < 44 || target.height < 44)
        .slice(0, 20)
    );
    if (controls.length > 0) failures.push({ path, controls });
  }
  expect(failures, JSON.stringify(failures)).toEqual([]);
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
