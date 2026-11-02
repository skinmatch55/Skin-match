import { expect, test } from "@playwright/test";

// The blueprint's whole funnel, as a brand-new visitor. Never pays.
test("landing → example → work → locked → sign-up → paywall → checkout sheet → account", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("cancel out");
  // no price anywhere on the landing page
  await expect(page.locator("body")).not.toContainText("$");
  await expect(page.getByRole("link", { name: /pricing/i })).toHaveCount(0);

  // the first action, in the hero
  await page.getByTestId("try-example").click();
  await page.getByTestId("skin-combination").click();
  await expect(page.getByText("Checking your routine…")).toBeVisible();
  await expect(page.getByTestId("locked-result")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("first-conflict")).toBeVisible();
  await expect(page.getByText(/conflicts? found on your shelf/)).toBeVisible();

  // unlock → sign-up sheet
  await page.getByTestId("unlock-button").click();
  await expect(page.getByTestId("auth-sheet")).toBeVisible();
  await expect(page.getByText("Save your routine check")).toBeVisible();
  const email = `e2e-${info.project.name}-${Date.now()}@skinmatch-test.com`;
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("e2e-password-123");
  await page.getByTestId("auth-submit").click();

  // paywall over their result
  const paywall = page.getByTestId("paywall");
  await expect(paywall).toBeVisible({ timeout: 20_000 });
  await expect(paywall.getByText("Your routine check is ready.")).toBeVisible();
  await expect(page.getByTestId("plan-pro")).toHaveAttribute("aria-checked", "true");
  await expect(paywall.getByText("/ day").first()).toBeVisible();

  // checkout sheet opens inside the page (or a friendly notice when payments are off / unreachable)
  await page.getByTestId("paywall-continue").click();
  const sheet = page.getByTestId("checkout-sheet");
  const notice = paywall.getByRole("status");
  await expect(sheet.or(notice)).toBeVisible({ timeout: 20_000 });
  if (await sheet.isVisible()) {
    await page.getByRole("button", { name: "Close checkout" }).click();
    await expect(sheet).toBeHidden();
  }

  // close the paywall → sticky unlock bar
  await page.getByTestId("paywall-close").click();
  await expect(page.getByTestId("sticky-unlock")).toBeVisible();

  // returning visitor lands on their result
  await page.goto("/");
  await expect(page).toHaveURL(/\/result\//);
  await expect(page.getByTestId("locked-result")).toBeVisible({ timeout: 15_000 });

  // account
  await page.goto("/account");
  await expect(page.getByRole("main").getByText(email)).toBeVisible();
  expect(errors).toEqual([]);
});
