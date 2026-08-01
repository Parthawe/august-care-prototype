import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const deterministicStates = {
  intake: ["empty", "concern", "gathering", "summary", "reviewing", "reply"],
  prescription: ["recommended", "review", "pharmacy", "sent"],
  lab: ["recommended", "nearby-lab", "confirmed"],
} as const;

async function send(page: Page, value: string) {
  const textbox = page.getByRole("textbox");
  await textbox.fill(value);
  await page.getByRole("button", { name: "Send message" }).click();
}

test("the V2 entry opens the complete mobile journey", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2");
  await expect(page).toHaveURL(/\/prototype-v2\/00\?state=intake-empty$/);
  await expect(page.getByRole("region", { name: "August care" })).toBeVisible();
});

test("all 13 state URLs render deterministically", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  for (const [flow, states] of Object.entries(deterministicStates)) {
    for (const state of states) {
      await page.goto(`/prototype-v2/${flow}?state=${state}`);
      await expect(page).toHaveURL(
        new RegExp(`/prototype-v2/${flow}\\?state=${state}$`),
      );
      await expect(
        page.getByRole("region", { name: "August care" }),
      ).toBeVisible();
    }
  }
});

test("intake gathers context, confirms it, and connects directly to Maya", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake");

  await send(page, "My throat hurts and I had a fever.");
  await expect(page).toHaveURL(/state=concern/);
  await send(page, "Five days, worse today, 102 degrees.");
  await expect(page).toHaveURL(/state=gathering/);
  await send(page, "No trouble breathing, swallowing, fainting, or chest pain.");
  await send(page, "No major conditions. Ibuprofen occasionally.");
  await send(page, "No medication allergies.");

  await expect(page).toHaveURL(/state=summary/);
  await expect(page.getByText("Confirm what August gathered.")).toBeVisible();
  await page.getByRole("button", { name: "Confirm and connect" }).click();
  await expect(page.getByText("I found the right clinician for this visit.")).toBeVisible();
  await page
    .getByRole("button", { name: "Continue to Maya" })
    .click();
  await expect(page.getByText(/Hi Parth\. I reviewed your fever/)).toBeVisible();
  await expect(page.getByText(/choose a clinician/i)).toHaveCount(0);
});

test("prescription continuation ends at prescription sent", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/prescription");
  await page.getByRole("button", { name: "Read treatment plan" }).click();
  await page.getByRole("button", { name: "Ask August to send it" }).click();
  await page.getByRole("button", { name: "Confirm and send" }).click();
  await expect(page.getByRole("heading", { name: "Prescription sent" })).toBeVisible();
  await expect(page).toHaveURL(/state=sent/);
});

test("lab continuation offers only August-arranged nearby care", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/lab");
  await page.getByRole("button", { name: "Continue with August" }).click();
  await expect(page.getByText(/Mission Lab can take Maya’s order/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Yes, confirm appointment" })).toBeVisible();
  await expect(page.getByRole("button", { name: /upload|external/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Yes, confirm appointment" }).click();
  await expect(
    page.getByRole("heading", { name: "Appointment confirmed" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/state=confirmed/);
});

test("patient shell fills supported mobile viewports without reviewer chrome", async ({
  page,
}) => {
  await page.goto("/prototype-v2/intake?state=summary");
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("complementary")).toHaveCount(0);
  await expect(page.getByText(/prototype controls|current state|all starting points/i)).toHaveCount(0);
  await expect(page.getByText("Nothing is shared until you confirm")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  const shell = await page.getByRole("region", { name: "August care" }).boundingBox();
  expect(shell?.height).toBe(page.viewportSize()?.height);
});

test("patient UI contains no reviewer or prototype commentary", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  for (const [flow, states] of Object.entries(deterministicStates)) {
    for (const state of states) {
      await page.goto(`/prototype-v2/${flow}?state=${state}`);
      await expect(
        page.getByText(
          /prototype|clinician-selection|external-lab|fictional patient|reviewer/i,
        ),
      ).toHaveCount(0);
    }
  }
});

test("V2 shell has no serious or critical accessibility violations", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake?state=summary");
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(serious).toEqual([]);
});

test("summary editing stays inline inside the conversation", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake?state=summary");

  const trigger = page.getByRole("button", { name: "Edit Timing and severity" });
  await trigger.click();
  const editor = page.locator("textarea#summary-onset");
  await expect(editor).toBeVisible();
  await editor.fill(
    "Three days ago, worsening today, highest temperature 101°F.",
  );
  await page.getByRole("button", { name: "Save" }).click();
  await expect(editor).toHaveCount(0);
  await expect(
    page.getByText("Three days ago, worsening today, highest temperature 101°F."),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("complete journey runs from intake through testing and prescription", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00");

  await send(page, "My throat hurts and I had a fever.");
  await send(page, "Five days, worse today, 102 degrees.");
  await send(page, "No trouble breathing, swallowing, fainting, or chest pain.");
  await send(page, "No major conditions. Ibuprofen occasionally.");
  await send(page, "No medication allergies.");
  await page.getByRole("button", { name: "Confirm and connect" }).click();
  await expect(page.getByText(/licensed where you are/)).toBeVisible();
  await page.getByRole("button", { name: "Continue to Maya" }).click();
  await page.getByRole("button", { name: "Continue with Maya’s plan" }).click();
  await page.getByRole("button", { name: "Continue with August" }).click();
  await page.getByRole("button", { name: "Yes, confirm appointment" }).click();
  await page.getByRole("button", { name: "See Maya’s result and plan" }).click();
  await expect(page.getByText(/rapid strep test is positive/)).toBeVisible();
  await page.getByRole("button", { name: "Read treatment plan" }).click();
  await page.getByRole("button", { name: "Ask August to send it" }).click();
  await page.getByRole("button", { name: "Confirm and send" }).click();
  await expect(page.getByRole("heading", { name: "Prescription sent" })).toBeVisible();
  await expect(page).toHaveURL(/state=prescription-sent/);
});

test("conversation details explain recipient and privacy with accessible dismissal", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake?state=reviewing");

  const trigger = page.getByRole("button", { name: "Open conversation details" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Conversation details" });
  await expect(dialog.getByText("Maya sees only the summary you confirmed")).toBeVisible();
  await expect(dialog.getByText("Usually replies within 2 to 4 hours")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("header back follows the care context without showing a branch chooser", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/prescription?state=recommended");
  await page.getByRole("button", { name: "Go to previous care step" }).click();
  await expect(page).toHaveURL(/\/prototype-v2\/intake\?state=reply$/);
  await expect(page.getByText(/Hi Parth\. I reviewed your fever/)).toBeVisible();
  await expect(page.getByText(/choose a clinician|choose an outcome/i)).toHaveCount(0);
});

test("active clinician composer produces a real patient reply", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake?state=reply");
  await send(page, "Can I take this with food?");
  await expect(page.getByText("Can I take this with food?")).toBeVisible();
  await expect(page.getByText("Now", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add attachment" })).toHaveCount(0);
});
