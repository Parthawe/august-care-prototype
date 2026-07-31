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

test("reviewer hub exposes the three authored starting points", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2");
  await expect(page.getByRole("link", { name: /Start with August/ })).toHaveAttribute(
    "href",
    "/prototype-v2/intake",
  );
  await expect(page.getByRole("link", { name: /Prescription/ })).toHaveAttribute(
    "href",
    "/prototype-v2/prescription",
  );
  await expect(page.getByRole("link", { name: /Nearby lab/ })).toHaveAttribute(
    "href",
    "/prototype-v2/lab",
  );
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
        page.getByRole("region", { name: "August care prototype" }),
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
  await expect(page.getByText("Maya is reviewing your visit.")).toBeVisible();
  await page
    .getByRole("button", { name: "Open Care conversation" })
    .click();
  await expect(page.getByText(/Hi Parth—I reviewed your fever/)).toBeVisible();
  await expect(page.getByText(/choose a clinician/i)).toHaveCount(0);
});

test("prescription continuation ends at prescription sent", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/prescription");
  await page.getByRole("button", { name: "Review prescription" }).click();
  await page.getByRole("button", { name: "Send to this pharmacy" }).click();
  await page.getByRole("button", { name: "Confirm pharmacy" }).click();
  await expect(page.getByRole("heading", { name: "Prescription sent" })).toBeVisible();
  await expect(page).toHaveURL(/state=sent/);
});

test("lab continuation offers only August-arranged nearby care", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/lab");
  await page.getByRole("button", { name: "View test option" }).click();
  await expect(page.getByText("August arranged a nearby lab.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm nearby lab" })).toBeVisible();
  await expect(page.getByRole("button", { name: /upload|external/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Confirm nearby lab" }).click();
  await expect(
    page.getByRole("heading", { name: "Appointment confirmed" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/state=confirmed/);
});

test("patient shell fits supported mobile widths and hides reviewer controls", async ({
  page,
}) => {
  await page.goto("/prototype-v2/intake?state=summary");
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(
    page.getByRole("complementary", { name: "Prototype controls" }),
  ).toBeHidden();
  await expect(
    page.getByRole("textbox", { name: "Message August" }),
  ).toBeVisible();
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
