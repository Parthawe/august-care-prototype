import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const deterministicStates = {
  intake: ["empty", "concern", "gathering", "summary", "reviewing", "reply"],
  prescription: ["recommended", "review", "pharmacy", "sent"],
  lab: ["recommended", "nearby-lab", "confirmed"],
} as const;

async function send(page: Page, value: string) {
  const textbox = page.getByRole("textbox");
  await expect(textbox).toBeEnabled({ timeout: 10_000 });
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
      await expect(page.getByText("Not emergency care · Call 911 for emergencies.")).toBeVisible();
    }
  }
});

test("empty state shows privacy context, dismissible prompts, and accepts an image attachment", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00");

  await expect(page.getByText("End-to-end encrypted")).toBeVisible();
  await expect(page.getByText(/Messages stay with August/)).toBeVisible();
  await expect(page.getByText("Continue from another AI")).toBeVisible();
  await expect(page.getByText("Want a clinician to review this?")).toBeVisible();
  await expect(page.getByText("Connect your health records")).toBeVisible();
  await page.getByRole("button", { name: "Dismiss Continue from another AI" }).click();
  await expect(page.getByText("Continue from another AI")).toHaveCount(0);
  await expect(page.getByText("Hi Anuruddh. Tell me what’s going on.")).toHaveCount(0);

  await page.getByLabel("Add an image").setInputFiles({
    name: "throat-photo.png",
    mimeType: "image/png",
    buffer: Buffer.from("prototype-image"),
  });
  await expect(page.getByRole("img", { name: "throat-photo.png" })).toBeVisible();
  await expect(page.getByText("Image added")).toBeVisible();

  await send(page, "My throat hurts and I had a fever.");
  await expect(page).toHaveURL(/state=intake-concern/);
  await expect(page.getByText("End-to-end encrypted")).toHaveCount(0);
});

test("the patient always starts a new August conversation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-concern");

  await expect(page.getByText("Hi Anuruddh. Tell me what’s going on.")).toHaveCount(0);
  await expect(page.getByText("My throat has been hurting and I had a fever last night.")).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /Of course\. I can help you work through/ })).toBeVisible();
});

test("August shows deliberate medical review before replying", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-empty");

  await send(page, "My throat hurts and I had a fever.");
  await Promise.all([
    expect(page.getByText("My throat hurts and I had a fever.")).toBeVisible({ timeout: 1_000 }),
    expect(page.getByText("End-to-end encrypted")).toHaveCount(0, { timeout: 1_000 }),
    expect(page.getByText("August is thinking")).toBeVisible({ timeout: 1_000 }),
    expect(page.getByText(/Of course\. I can help you work through/)).toHaveCount(0, { timeout: 1_000 }),
  ]);

  await expect(page.locator("p").filter({ hasText: /Of course\. I can help you work through/ })).toBeVisible();
  await expect(page.getByText("August is thinking")).toHaveCount(0);
});

test("intake gathers context, confirms it, and connects directly to Maya", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake");

  await send(page, "My throat hurts and I had a fever.");
  await expect(page).toHaveURL(/state=concern/);
  await expect(page.locator("p").filter({ hasText: "what the next best step might be" })).toBeVisible();
  await send(page, "Five days, worse today, 102 degrees.");
  await expect(page).toHaveURL(/state=gathering/);
  await expect(page.locator("p").filter({ hasText: "needs a careful safety check" })).toBeVisible();
  await send(page, "No trouble breathing, swallowing, fainting, or chest pain.");
  await expect(page.locator("p").filter({ hasText: "makes an emergency problem less likely" })).toBeVisible();
  await send(page, "No major conditions. Ibuprofen occasionally.");
  await expect(page.locator("p").filter({ hasText: "I’ve noted your health history and current medicines" })).toBeVisible();
  await send(page, "No medication allergies.");

  await expect(page).toHaveURL(/state=summary/);
  await expect(page.getByText(/a same-day clinician review is the safest next step/)).toBeVisible();
  await expect(page.getByText("Confirm what August gathered.")).toBeVisible();
  await page.getByRole("button", { name: "Confirm and connect" }).click();
  await expect(page.getByText(/I found Maya Rao because she is a licensed California clinician/)).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("header").getByText("August", { exact: true })).toBeVisible();
  await expect(page.getByText("August is connecting you with Maya")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Maya" })).toHaveCount(0);
  await expect(page.locator("header").getByText("Maya (Clinician)")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Continue conversation" })
    .click();
  await expect(page.getByText(/Hi Anuruddh\. I reviewed your fever/)).toBeVisible();
  await expect(page.locator("header").getByText("Maya (Clinician)")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Maya" })).toBeVisible();
  await expect(page.getByText(/choose a clinician/i)).toHaveCount(0);
});

test("the explicit handoff transitions between separate conversations", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/prototype-v2/00?state=intake-reviewing");

  const continueButton = page.getByRole("button", { name: "Continue conversation" });
  await expect(continueButton).toBeVisible({ timeout: 10_000 });
  await continueButton.click();

  const transition = page.getByRole("status", { name: "Opening Maya conversation" });
  await expect(transition).toBeVisible();
  await expect(transition.getByText("Maya", { exact: true })).toBeVisible();
  await expect(page.locator("header").getByText("Maya (Clinician)")).toBeVisible({ timeout: 2_000 });
  await expect(transition).toHaveCount(0, { timeout: 2_000 });
  await expect(page.locator("p").filter({ hasText: "Hi Anuruddh. I reviewed what you shared." })).toBeVisible();
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

test("Maya keeps the patient reply when the conversation advances to testing", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-reply");

  const reply = "I can drink normally and I have not noticed a rash.";
  await send(page, reply);

  await expect(page.getByText(reply, { exact: true })).toBeVisible();
  await expect(page.locator("p").filter({ hasText: "recommend a rapid strep test" })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText(reply, { exact: true })).toBeVisible();
});

test("Maya reviews one patient message before revealing her test recommendation", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/prototype-v2/00?state=intake-reply");

  const reply = "I can drink normally and I have not noticed a rash.";
  await send(page, reply);

  await expect(page.getByText(reply, { exact: true })).toBeVisible();
  await expect(page.getByLabel("Maya is reviewing the result")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator("p").filter({ hasText: "recommend a rapid strep test" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Message Maya" })).toBeDisabled();

  await expect(page.locator("p").filter({ hasText: "recommend a rapid strep test" })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByLabel("Maya is reviewing the result")).toHaveCount(0);
  await expect(page.getByText(reply, { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Maya" })).toBeEnabled({ timeout: 8_000 });
});

test("urgent symptoms pause the routine test plan", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-reply");

  const urgentReply = "I cannot swallow liquids and the rash is spreading.";
  await send(page, urgentReply);

  await expect(page.getByText(urgentReply, { exact: true })).toBeVisible();
  await expect(page.getByText(/needs urgent in-person assessment now/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/recommend a rapid strep test/)).toHaveCount(0);
  await expect(page).toHaveURL(/state=intake-reply/);
});

test("lab continuation offers only August-arranged nearby care", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/lab");
  await page.getByRole("button", { name: "Continue with August" }).click();
  await expect(page.getByText(/Mission Lab can take Maya’s order/)).toBeVisible();
  const mapLink = page.getByRole("link", { name: "Open in Google Maps" });
  await expect(mapLink).toBeVisible();
  await expect(mapLink).toHaveAttribute(
    "href",
    "https://www.google.com/maps/search/?api=1&query=2400%20Mission%20St%2C%20San%20Francisco",
  );
  await expect(mapLink).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("button", { name: "Yes, confirm appointment" })).toBeVisible();
  await expect(page.getByRole("button", { name: /upload|external/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Yes, confirm appointment" }).click();
  await expect(
    page.getByRole("heading", { name: "Your test result is ready" }),
  ).toBeVisible({ timeout: 8_000 });
  await expect(page).toHaveURL(/state=confirmed/);
});

test("August keeps the full lab conversation visible while thinking", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=lab-nearby-lab");

  const intakeMessage = page.getByText("My throat has been hurting and I had a fever last night.", { exact: true });
  const locationMessage = page.getByText(/Mission Lab can take Maya’s order/);
  await expect(intakeMessage).toBeVisible();
  await expect(locationMessage).toBeVisible();

  await send(page, "Yes, that time works for me.");

  await expect(page.getByText("August is thinking", { exact: true })).toBeVisible({ timeout: 1_000 });
  await expect(intakeMessage).toBeVisible();
  await expect(locationMessage).toBeVisible();
  await expect(page.getByText("Yes, that time works for me.", { exact: true })).toBeVisible();
});

test("August does not attach a lab result without clear patient consent", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=lab-confirmed");

  const rejection = "No, this is not my test.";
  await send(page, rejection);

  await expect(page.getByText(rejection, { exact: true })).toBeVisible();
  await expect(page.getByText(/I won’t add this result or notify Maya/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: /Open Maya conversation/ })).toHaveCount(0);
  await expect(page).toHaveURL(/state=lab-confirmed/);
});

test("Maya keeps her earlier messages when the medication decision arrives", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=prescription-recommended");

  await expect(page.getByText(/Hi Anuruddh\. I reviewed what you shared/)).toBeVisible();
  await expect(page.getByText("I can drink normally and I have not noticed a rash.", { exact: true })).toBeVisible();
  await expect(page.getByText(/Before I decide on medication, I recommend a rapid strep test today/)).toBeVisible();
  await expect(page.getByText("Please have August help me schedule the test.", { exact: true })).toBeVisible();
  await expect(page.locator("p").filter({ hasText: "I reviewed your positive rapid strep result" })).toBeVisible();
});

test("August keeps intake and testing history when pharmacy support begins", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=prescription-pharmacy");

  await expect(page.getByText(/Of course\. I can help you work through/)).toBeAttached();
  await expect(page.getByText(/Mission Lab can take Maya’s order/)).toBeAttached();
  await expect(page.getByText(/Your rapid strep result is ready/)).toBeAttached();
  await expect(page.locator("p").filter({ hasText: "Castro Community Pharmacy is" })).toBeVisible();
});

test("prescription completion ignores repeated confirmations and duplicate follow-ups", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=prescription-sent");

  await expect(page.getByText("Yes, send it there.", { exact: true })).toHaveCount(1);
  await send(page, "yes");
  await expect(page.getByText("yes", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/The prescription has already been sent/)).toHaveCount(0);

  await send(page, "When will the pharmacy confirm?");
  await expect(page.locator("p").filter({ hasText: "The prescription has already been sent" })).toBeVisible({ timeout: 6_000 });
  await send(page, "When will the pharmacy confirm?");
  await expect(page.getByText("When will the pharmacy confirm?", { exact: true })).toHaveCount(1);
  await expect(page.locator("p").filter({ hasText: "The prescription has already been sent" })).toHaveCount(1);
});

test("Maya and August keep separate conversation histories", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=prescription-sent");

  const pharmacyQuestion = "When will the pharmacy confirm?";
  await send(page, pharmacyQuestion);
  await expect(page.locator("p").filter({ hasText: "The prescription has already been sent" })).toBeVisible({ timeout: 6_000 });

  await page.getByRole("button", { name: "Chats", exact: true }).click();
  await page.getByRole("button", { name: /Maya Clinician/ }).click();
  await expect(page.getByText(/Penicillin V, 500 mg tablet/)).toBeVisible();
  await expect(page.getByText(pharmacyQuestion, { exact: true })).toHaveCount(0);
  await expect(page.getByText(/The prescription has already been sent/)).toHaveCount(0);

  await page.getByRole("button", { name: "Chats", exact: true }).click();
  await page.getByRole("button", { name: /August Care guide/ }).click();
  await expect(page.getByText(pharmacyQuestion, { exact: true })).toBeVisible();
  await expect(page.getByText(/The prescription has already been sent/)).toBeVisible();
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

  await page.goto("/prototype-v2/00?state=intake-reviewing");
  const continuation = page.getByRole("button", { name: "Continue conversation" });
  await expect(continuation).toBeVisible();
  await page.waitForTimeout(350);
  const continuationBox = await continuation.boundingBox();
  const composerBox = await page.locator("form").boundingBox();
  expect((continuationBox?.y ?? 0) + (continuationBox?.height ?? 0)).toBeLessThanOrEqual(composerBox?.y ?? Infinity);
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

test("reduced motion keeps the journey stable without visible animation", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/prototype-v2/00?state=intake-reviewing");

  const motion = await page.getByRole("button", { name: "Continue conversation" }).evaluate((element) => {
    const styles = getComputedStyle(element.closest("section") ?? element);
    return {
      animationDuration: Number.parseFloat(styles.animationDuration),
      transitionDuration: Number.parseFloat(styles.transitionDuration),
    };
  });

  expect(motion.animationDuration).toBeLessThanOrEqual(0.01);
  expect(motion.transitionDuration).toBeLessThanOrEqual(0.01);
});

test("summary transition keeps conversation history settled", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-summary");

  const settledMessages = page.locator('[data-message-motion="settled"]');
  await expect(settledMessages).toHaveCount(9);
  await expect(page.getByText(/Thanks\. I’ve got the main details/).locator('xpath=ancestor::*[@data-message-motion="enter"]')).toBeVisible();
  await expect(page.getByText(/Reply yes to confirm/)).toBeVisible();
  await expect(page.getByText(/I won’t share anything with a clinician until you do/)).toBeVisible();

  const historicalAnimation = await settledMessages.first().evaluate((element) => getComputedStyle(element).animationName);
  expect(historicalAnimation).toBe("none");

  await page.goto("/prototype-v2/00?state=intake-reviewing");
  await expect(page.getByRole("heading", { name: "Confirm what August gathered." })).toBeVisible();
  await expect(page.getByText("Confirmed and shared with Maya")).toBeVisible();
  await expect(page.getByText(/Reply yes to confirm/)).toBeVisible();
  await expect(page.getByText("Everything looks right. You can share it.")).toBeVisible();
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
  test.setTimeout(60_000);
  await page.goto("/prototype-v2/00");

  await send(page, "My throat hurts and I had a fever.");
  await send(page, "Five days, worse today, 102 degrees.");
  await send(page, "No trouble breathing, swallowing, fainting, or chest pain.");
  await send(page, "No major conditions. Ibuprofen occasionally.");
  await send(page, "No medication allergies.");
  await send(page, "Everything looks right. You can share it.");
  await expect(page.getByText("Licensed in California")).toBeVisible();
  await page.getByRole("button", { name: "Continue conversation" }).click();
  await send(page, "I can drink normally and I have not noticed a rash.");
  await expect(page.locator("p").filter({ hasText: "recommend a rapid strep test" })).toBeVisible({ timeout: 10_000 });
  await send(page, "Please ask August to arrange it.");
  await page.getByRole("button", { name: "Open August conversation" }).click();
  await send(page, "Yes, that time works.");
  await send(page, "Yes, I completed this test. Add it to Maya’s visit.");
  await page.getByRole("button", { name: "Open Maya conversation" }).click();
  await expect(page.locator("p").filter({ hasText: "positive rapid strep result" })).toBeVisible();
  await expect(page.getByText("Please ask August to arrange it.", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Yes, I completed this test. Add it to Maya’s visit.", { exact: true })).toHaveCount(0);
  await send(page, "Show me the medication plan.");
  await send(page, "Ask August to send it to the pharmacy.");
  await page.getByRole("button", { name: "Open August conversation" }).click();
  await send(page, "Yes, send it there.");
  await expect(page.locator("p").filter({ hasText: "Done. I sent Maya’s prescription" })).toBeVisible();
  await expect(page).toHaveURL(/state=prescription-sent/);
});

test("Chats opens an inbox before entering Maya’s clean conversation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-reply");

  await page.getByRole("navigation").getByRole("button", { name: "Chats" }).click();
  await expect(page.locator("header").getByText("Chats", { exact: true })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Ask August or search chats" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Maya Clinician/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /August Care guide/ })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);

  await page.getByRole("button", { name: /Maya Clinician/ }).click();
  await expect(page.getByText(/Hi Anuruddh\. I reviewed what you shared/)).toBeVisible();
  await expect(page.getByText(/New messages here go directly to her/)).toHaveCount(0);
});

test("mobile navigation uses the compact reference dock with August at the far right", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-empty");

  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const buttons = navigation.getByRole("button");
  await expect(buttons).toHaveCount(5);
  await expect(buttons.nth(0)).toHaveAttribute("aria-label", "Activity");
  await expect(buttons.nth(1)).toHaveAttribute("aria-label", "Home");
  await expect(buttons.nth(2)).toHaveAttribute("aria-label", "Chats");
  await expect(buttons.nth(3)).toHaveAttribute("aria-label", "Library");
  await expect(buttons.nth(4)).toHaveAttribute("aria-label", "August");
  await expect(buttons.nth(1)).toBeDisabled();
  await expect(buttons.nth(3)).toBeDisabled();
  await expect(buttons.nth(4)).toBeDisabled();

  const shellBox = await page.getByRole("region", { name: "August care" }).boundingBox();
  const navigationBox = await navigation.boundingBox();
  const bottomGap = (shellBox?.y ?? 0) + (shellBox?.height ?? 0) - ((navigationBox?.y ?? 0) + (navigationBox?.height ?? 0));
  expect(bottomGap).toBeGreaterThanOrEqual(12);

  await navigation.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Good morning, Anuruddh" })).toBeVisible();

  await navigation.getByRole("button", { name: "Chats" }).click();
  await expect(page.locator("header").getByText("Chats", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Maya Clinician/ })).toHaveCount(0);

  await expect(navigation.getByRole("button", { name: "August" })).toBeDisabled();
});

test("Chats search filters threads and can hand a question directly to August", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-empty");
  await page.getByRole("navigation").getByRole("button", { name: "Chats" }).click();

  const search = page.getByRole("searchbox", { name: "Ask August or search chats" });
  await search.fill("headache after lunch");
  await expect(page.getByRole("button", { name: /Ask August headache after lunch/ })).toBeVisible();
  await search.press("Enter");
  await expect(page.getByRole("textbox", { name: "Message August" })).toHaveValue("headache after lunch");
});

test("Chats floating action starts a fresh August conversation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-empty");
  await page.getByRole("navigation").getByRole("button", { name: "Chats" }).click();

  const newAugustChat = page.getByRole("button", { name: "Start a new August chat" });
  await expect(newAugustChat).toBeVisible();
  await expect(newAugustChat.locator('[data-august-mark="true"]')).toHaveText("a");
  await newAugustChat.click();
  await expect(page.getByRole("textbox", { name: "Message August" })).toBeVisible();
});

test("conversation header provides search and inert prototype-only options", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-concern");

  await expect(page.getByRole("button", { name: "Search conversation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Conversation options unavailable in prototype" })).toBeDisabled();
  await page.getByRole("button", { name: "Search conversation" }).click();
  const search = page.getByRole("searchbox", { name: "Search this conversation" });
  await search.fill("temperature");
  await search.press("Enter");
  await expect(page.getByText("1 match")).toBeVisible();
  await page.getByRole("button", { name: "Close conversation search" }).click();
  await expect(search).toHaveCount(0);
});

test("August handles natural booking replies without leaving the chat", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=lab-nearby-lab");

  await send(page, "No, I need a different time.");
  await expect(page.getByText(/which day, time, or area works better/)).toBeVisible();
  await expect(page).toHaveURL(/state=lab-nearby-lab/);

  await send(page, "Yes, this time works.");
  await expect(page.getByText(/You’re scheduled for tomorrow/)).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/state=lab-confirmed/);
});

test("conversation options do not open a drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/intake?state=reviewing");

  await expect(page.getByRole("button", { name: "Conversation options unavailable in prototype" })).toBeDisabled();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("header back is always present and opens the Chats tab", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/prototype-v2/00?state=intake-empty");
  await page.getByRole("button", { name: "Back to Chats" }).click();
  await expect(page.locator("header").getByText("Chats", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Maya Clinician/ })).toHaveCount(0);

  await page.goto("/prototype-v2/prescription?state=recommended");
  await page.getByRole("button", { name: "Back to Chats" }).click();
  await expect(page.locator("header").getByText("Chats", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Maya Clinician/ })).toBeVisible();
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

test("Maya presence reflects whether she is reviewing or available", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto("/prototype-v2/00?state=lab-recommended");
  await expect(page.locator("header").getByText("Reviewing", { exact: true })).toBeVisible();
  await expect(page.locator("header").getByText("Online", { exact: true })).toBeVisible({ timeout: 10_000 });

  await page.goto("/prototype-v2/00?state=prescription-recommended");
  await expect(page.locator("header").getByText("Online", { exact: true })).toBeVisible();
});

test("Maya pauses before explaining the medication plan", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/prototype-v2/00?state=prescription-review");

  await expect(page.getByText("Show me the medication plan.", { exact: true })).toBeVisible();
  await expect(page.getByText(/Maya is reviewing/i)).toBeVisible();
  await expect(page.getByText(/Penicillin V, 500 mg tablet/)).toHaveCount(0);
  await expect(page.locator("[data-message-motion]").filter({ hasText: "Penicillin V, 500 mg tablet." })).toBeVisible({ timeout: 10_000 });
});
