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
      await expect(page.getByText("Pre-visit summary", { exact: true })).toBeVisible();
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
  await expect(consent).toHaveCount(3);
  expect(
    await consent.evaluateAll((inputs) =>
      inputs.every((input) => !(input as HTMLInputElement).checked)
    )
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Authorize $39 and submit" })
  ).toBeDisabled();
});

test("composer remains available in the clinician conversation", async ({ page }) => {
  await page.goto("/cases/doctor-handoff/classic");
  await expect(page.locator(".composer")).toBeVisible();
  await expect(page.getByText("Private to August", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Ask August/ }).click();
  await expect(
    page.getByText("Maya cannot see messages in this sidecar unless you choose to share them.")
  ).toBeVisible();
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

test("the default route opens the canonical August entry", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("textbox", { name: "Describe what’s going on" }),
  ).toBeVisible();
  await expect(page.getByText("Ask August anything.", { exact: true })).toBeVisible();

  await page
    .getByRole("textbox", { name: "Describe what’s going on" })
    .fill("My throat has been hurting.");
  await page.getByRole("button", { name: "Start conversation" }).click();

  await expect(
    page.getByText("My throat has been hurting.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Before we continue", {
      exact: false,
    }),
  ).toBeVisible();
});

test("portfolio scenario directory exposes focused shareable routes", async ({
  page,
}) => {
  await page.goto("/prototype");

  await expect(
    page.getByRole("link", {
      name: /Start with an empty August conversation/,
    }),
  ).toHaveAttribute("href", "/prototype/start");

  const routes = [
    "symptom",
    "prescription",
    "clinician-wait",
    "testing",
    "unreadable-report",
    "medication-appropriate",
    "medication-declined",
    "follow-up",
    "unsupported",
    "emergency",
  ];

  for (const route of routes) {
    await expect(page.locator(`a[href="/prototype/${route}"]`)).toHaveCount(1);
  }
});

test("each portfolio scenario route opens the unified prototype", async ({
  page,
}) => {
  const routes = [
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
  ];

  for (const route of routes) {
    await page.goto(`/prototype/${route}`);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/prototype/${route}$`));
  }
});

test("emergency suppresses routine navigation and composer", async ({ page }) => {
  await page.goto("/cases/emergency/classic");
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  await expect(page.locator(".composer")).toHaveCount(0);
  await expect(page.getByText(/After you contact emergency services/)).toHaveCount(0);
  await page.getByRole("button", { name: /Use a different concern/ }).click();
  await expect(page.getByText("Confirm before leaving")).toBeVisible();
  await page.getByRole("button", { name: /Stay on this screen/ }).click();
  await expect(
    page.getByRole("link", { name: /Call emergency services/ })
  ).toHaveAttribute("href", "tel:911");
});

test("blank entry cannot create a fabricated concern", async ({ page }) => {
  await page.goto("/");
  const start = page.getByRole("button", { name: "Start conversation" });
  await expect(start).toBeDisabled();
  await expect(page.getByText("My throat has hurt for five days")).toHaveCount(0);
});

test("August remains a distinct action beside the primary navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".bottom-nav-main")).toBeVisible();
  const assistant = page.locator(".bottom-nav-assistant");
  await expect(assistant).toHaveAttribute("aria-label", "Open August chat");
  await page
    .getByRole("button", { name: "Check a symptom Start in your words" })
    .click();
  await expect(assistant).toHaveClass(/active/);
  await expect(assistant).toHaveAttribute("aria-label", "August chat, current");
});

test("medication answers use the same emergency interruption", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Medication Assessment first" })
    .click();
  const composer = page.locator(".composer");
  await composer
    .getByRole("textbox")
    .fill("I took too much medication and think I overdosed.");
  await composer.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText("This may need emergency care now.", { exact: true })
  ).toBeVisible();
});

test("patient upload starts with a real file choice or explicit sample", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Upload result Review together" })
    .click();
  await expect(
    page.getByText("Nothing is attached until you select a file.", {
      exact: false,
    })
  ).toBeVisible();
  await page.getByRole("button", { name: "Use sample strep report" }).click();
  await expect(
    page.getByText("Sample document · prototype only", { exact: true })
  ).toBeVisible();
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

test("unified scenario shortcuts open every major review state", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");

  const scenarios = [
    { id: "symptom", text: "What was your highest temperature" },
    { id: "prescription", text: "Is this a new prescription or a refill?" },
    { id: "unsupported", text: "A useful next step" },
    { id: "clinician-wait", text: "Usually replies in 2–4 hours" },
    { id: "testing", text: "Choose how to complete the test" },
    { id: "result-review", text: "Waiting for Maya’s review" },
    { id: "prescription-appropriate", text: "Treatment is ready" },
    { id: "prescription-declined", text: "Medication is not appropriate" },
    { id: "follow-up", text: "How is your throat today" },
    { id: "care", text: "Your clinician conversations" },
    { id: "emergency", text: "This may need emergency care now." },
  ];

  await page.goto("/prototype/start");
  await expect(
    page.getByRole("textbox", { name: "Message August" }),
  ).toBeVisible();
  await expect(page.locator('[aria-live="polite"]')).toHaveText("");

  for (const scenario of scenarios) {
    const routes: Record<string, string> = {
      symptom: "symptom",
      prescription: "prescription",
      unsupported: "unsupported",
      "clinician-wait": "clinician-wait",
      testing: "testing",
      "result-review": "report-review",
      "prescription-appropriate": "medication-appropriate",
      "prescription-declined": "medication-declined",
      "follow-up": "follow-up",
      care: "care-inbox",
      emergency: "emergency",
    };
    await page.goto(`/prototype/${routes[scenario.id]}`);
    await expect(page.getByText(scenario.text, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/Preview|prototype/i)).toHaveCount(0);
  }
});

test("unified clinician delay keeps August private", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/clinician-wait");
  await page.getByRole("button", { name: "Ask August while you wait" }).click();
  await expect(page.getByText("Private · Maya cannot see this", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Private conversation · Maya cannot see messages below", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Message August" }).fill(
    "What can I do while I wait?",
  );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("What can I do while I wait?", { exact: true })).toBeVisible();
});

test("unified upload separates processing, confirmation, and clinician review", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/testing");
  await page.locator('input[type="file"]').last().setInputFiles({
    name: "rapid-strep-result.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test result"),
  });
  await expect(page.getByText("Ready to upload", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Upload report" }).click();
  await expect(page.getByText("Uploading", { exact: true })).toBeVisible();
  await expect(page.getByText("Processing", { exact: true })).toBeVisible({
    timeout: 2_000,
  });
  await expect(page.getByText("Confirm before sharing", { exact: true })).toBeVisible({
    timeout: 2_000,
  });
  await page.getByRole("button", { name: "Confirm and add for Maya" }).click();
  await expect(page.getByText("Waiting for Maya’s review", { exact: true })).toBeVisible();
});

test("unified emergency removes routine chat until urgent action begins", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/emergency");
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Call emergency services" }).click();
  await expect(page.getByText("Confirm where help is needed.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirm and call" }).click();
  await expect(page.getByText("Help contacted", { exact: true })).toBeVisible();
});

test("conversation header returns to the Care inbox", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype/symptom");
  await page.getByRole("button", { name: "Back to conversations" }).click();
  await expect(page.getByText("Your clinician conversations", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to conversations" })).toHaveCount(0);
});
