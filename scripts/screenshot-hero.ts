import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();
  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err));
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "page-preview.png", fullPage: true });
  await page.locator("#hero").screenshot({ path: "hero-preview.png" });
  console.log("Successfully captured hero-preview.png and page-preview.png");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
