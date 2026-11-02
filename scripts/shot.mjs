// Full-page screenshots at phone (390×844) and computer (1440×900) sizes.
// usage: node scripts/shot.mjs /path [name] [--full]
import { chromium } from "playwright";
const [, , path = "/", name = "page", flag] = process.argv;
const base = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [label, vp] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: label === "phone", hasTouch: label === "phone" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  if (flag === "--full") {
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += vp.height / 2) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: `.shots/${name}-${label}.png`, fullPage: flag === "--full" });
  console.log(label, errors.length ? "ERRORS: " + errors.join(" | ") : "no console errors");
  await ctx.close();
}
await browser.close();
