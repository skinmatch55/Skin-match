// Screens of the paid app for a fresh account (local dev with DEV_FAKE_PLAN).
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [label, vp] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: label === "phone", hasTouch: label === "phone" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && !/TUNNEL|kwop/i.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/signup", { waitUntil: "networkidle" });
  await page.screenshot({ path: `.shots/a0-signup-${label}.png` });
  await page.locator("#auth-email").fill(`app-${label}-${Date.now()}@example.com`);
  await page.locator("#auth-password").fill("supersecret123");
  await page.getByTestId("auth-submit").click();
  await page.waitForURL("**/routine", { timeout: 20000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `.shots/a1-routine-empty-${label}.png` });
  await page.getByTestId("try-example").click();
  await page.getByTestId("skin-sensitive").click();
  await page.getByTestId("full-result").waitFor({ timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `.shots/a2-routine-${label}.png`, fullPage: true });
  for (const p of ["products", "conflicts", "diary", "account"]) {
    await page.goto(base + "/" + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `.shots/a3-${p}-${label}.png`, fullPage: true });
  }
  console.log(label, errors.length ? "ERRORS: " + errors.join(" | ") : "clean");
  await ctx.close();
}
await browser.close();
