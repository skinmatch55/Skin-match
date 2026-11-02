import { expect, test } from "@playwright/test";

// Paid features. Runs only against a local dev server started with DEV_FAKE_PLAN=pro (APP_TESTS=1).
test.skip(!process.env.APP_TESTS, "needs a paid account (local DEV_FAKE_PLAN)");

test("paid app: routine, products, conflicts, diary, account", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/signup");
  await page.locator("#auth-email").fill(`app-${info.project.name}-${Date.now()}@skinmatch-test.com`);
  await page.locator("#auth-password").fill("e2e-password-123");
  await page.getByTestId("auth-submit").click();
  await page.waitForURL("**/routine");

  await page.getByTestId("try-example").click();
  await page.getByTestId("skin-oily").click();
  await expect(page.getByTestId("full-result")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Retinoid nights").first()).toBeVisible();

  // products: add one, delete it
  await page.goto("/products");
  await expect(page.getByText(/of 40 on your shelf/)).toBeVisible();
  await page.getByPlaceholder("Add a product by name").fill("differin");
  await page.getByRole("option").first().click();
  await expect(page.getByText("Adapalene Gel 0.1%")).toBeVisible();
  await page.getByRole("button", { name: "Remove Adapalene Gel 0.1%" }).click();
  await expect(page.getByText("Adapalene Gel 0.1%")).toHaveCount(0);

  // routine re-check after a shelf change
  await page.getByPlaceholder("Add a product by name").fill("panoxyl 10");
  await page.getByRole("option").first().click();
  await expect(page.getByText(/Acne Foaming Wash 10%/)).toBeVisible();
  await page.goto("/routine");
  await expect(page.getByText("Your shelf changed.")).toBeVisible();
  await page.getByTestId("recheck").first().click();
  await expect(page.getByText("Your shelf changed.")).toHaveCount(0, { timeout: 15_000 });

  // conflict checker
  await page.goto("/conflicts");
  await page.getByLabel("First product").fill("retinol 0.5");
  await page.getByRole("button", { name: /Retinol 0.5% in Squalane/ }).first().click();
  await page.getByLabel("Second product").fill("persa");
  await page.getByRole("button", { name: /Persa-Gel/ }).first().click();
  await expect(page.getByText("Retinoid × Benzoyl peroxide")).toBeVisible();

  // diary
  await page.goto("/diary");
  await page.getByRole("radio", { name: "2" }).first().click();
  await page.getByTestId("diary-save").click();
  await expect(page.getByText("History")).toBeVisible();

  // account: billing + cancel is 2 taps away
  await page.goto("/account");
  await expect(page.getByTestId("billing")).toContainText("Pro");
  await page.getByTestId("cancel-sub").click();
  await expect(page.getByRole("button", { name: "Yes, cancel" })).toBeVisible();
  expect(errors).toEqual([]);
});
