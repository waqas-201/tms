import { chromium } from "playwright";

const URL = process.argv[2] || "http://127.0.0.1:3000/";

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("pageerror", (err) => console.log("PAGEERROR", err.message.slice(0, 800)));

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);

const info = await page.evaluate(() => {
  const hero = document.querySelector("#hero");
  const imgs = Array.from(document.querySelectorAll("img")).map((i) => ({
    alt: (i.getAttribute("alt") || "").slice(0, 60),
    src: (i.getAttribute("src") || "").slice(0, 90),
    insideHero: !!i.closest("#hero"),
  }));
  return {
    heroInner: hero ? hero.innerHTML.slice(0, 1500) : null,
    imgCount: imgs.length,
    heroImgs: imgs.filter((i) => i.insideHero),
    allImgsSample: imgs.slice(0, 10),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
