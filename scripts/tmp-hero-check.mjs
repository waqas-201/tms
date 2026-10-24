import { chromium } from "playwright";

const URL = process.argv[2] || "http://127.0.0.1:3100/";

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("console", (msg) => console.log("CONSOLE", msg.type(), msg.text().slice(0, 300)));
page.on("pageerror", (err) => console.log("PAGEERROR", err.message.slice(0, 500)));

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);

const info = await page.evaluate(() => {
  const hero = document.querySelector("#hero");
  const img = document.querySelector('#hero img[alt*="Hakeem Tahir Hameed"]');
  const wrapper = hero?.parentElement;
  return {
    heroFound: !!hero,
    heroDisplay: hero ? getComputedStyle(hero).display : null,
    heroHeight: hero ? hero.getBoundingClientRect().height : null,
    imgFound: !!img,
    imgSrc: img ? img.getAttribute("src") : null,
    imgVisible: img
      ? (() => {
          const r = img.getBoundingClientRect();
          return { w: r.width, h: r.height, complete: img.complete, naturalW: img.naturalWidth };
        })()
      : null,
    wrapperStyle: wrapper ? wrapper.getAttribute("style") : null,
    wrapperOpacity: wrapper ? getComputedStyle(wrapper).opacity : null,
  };
});
console.log(JSON.stringify(info, null, 2));

await page.screenshot({ path: "C:/Users/ALICOM4/AppData/Local/Temp/opencode/hero-check/hero-debug.png" });
await browser.close();
