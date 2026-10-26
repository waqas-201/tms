import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000/register";
const width = Number(process.argv[3] ?? 390);
const height = Number(process.argv[4] ?? 844);
const out = process.argv[5] ?? "C:\\Users\\ALICOM4\\AppData\\Local\\Temp\\opencode\\register.png";

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const doc = document.documentElement;
  const overflowing = [];
  for (const el of Array.from(document.querySelectorAll("body *"))) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > window.innerWidth + 1 || r.left < -1) {
      overflowing.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 140),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        text: (el.textContent || "").trim().slice(0, 60),
      });
    }
  }
  const card = document.querySelector("form")?.closest("div[class*='max-w-md']");
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    scrollWidth: doc.scrollWidth,
    horizontalOverflow: doc.scrollWidth - doc.clientWidth,
    cardRect: card ? card.getBoundingClientRect().toJSON() : null,
    overflowing: overflowing.slice(0, 25),
    inputsBelow16px: Array.from(document.querySelectorAll("input, textarea, select")).map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type"),
      fontSize: getComputedStyle(el).fontSize,
      width: Math.round(el.getBoundingClientRect().width),
      placeholder: el.getAttribute("placeholder"),
    })),
  };
});

console.log(JSON.stringify(report, null, 2));
await page.screenshot({ path: out, fullPage: true });
await browser.close();


