/**
 * TEMPORARY audit script — screenshots + layout measurements of #hero.
 * Run: npx tsx scripts/hero-audit.ts
 * Delete after use.
 */
import { chromium, type Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = "C:/Users/ALICOM4/AppData/Local/Temp/opencode/hero-shots";
const URL = "http://127.0.0.1:3000/";

const VIEWPORTS = [
  { w: 390, h: 844, label: "iPhone 14" },
  { w: 360, h: 640, label: "small Android" },
  { w: 768, h: 1024, label: "tablet" },
  { w: 1280, h: 800, label: "desktop" },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

/** All in-page measurements for #hero, run via page.evaluate */
async function collect(page: Page) {
  // tsx/esbuild injects a `__name(...)` helper into functions it transpiles;
  // define it in the page context so the serialized function can run there.
  await page.evaluate("window.__name = window.__name || ((fn) => fn);");
  return page.evaluate(() => {
    const hero = document.querySelector("#hero");
    const out: Record<string, unknown> = {};
    const rect = (el: Element | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x * 100) / 100,
        y: Math.round(r.y * 100) / 100,
        width: Math.round(r.width * 100) / 100,
        height: Math.round(r.height * 100) / 100,
        top: Math.round(r.top * 100) / 100,
        bottom: Math.round(r.bottom * 100) / 100,
        right: Math.round(r.right * 100) / 100,
      };
    };
    const vis = (el: Element | null) => {
      if (!el) return { found: false };
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        found: true,
        offsetParentNotNull: (el as HTMLElement).offsetParent !== null,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        rect: rect(el),
        inViewport: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
        aboveFold: r.top < innerHeight && r.bottom > 0,
      };
    };

    // a. horizontal overflow
    out.overflow = {
      documentScrollWidth: document.documentElement.scrollWidth,
      windowInnerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      overflowPx:
        document.documentElement.scrollWidth - window.innerWidth,
    };

    if (!hero) {
      out.error = "#hero not found";
      return out;
    }

    // b. hero box
    out.heroRect = rect(hero);

    // helpers scoped to #hero
    const all = Array.from(hero.querySelectorAll<HTMLElement>("*"));

    // smallest element whose trimmed own text contains needle
    const findByText = (needle: string): HTMLElement | null => {
      const matches = all.filter(
        (el) => (el.textContent || "").replace(/\s+/g, " ").includes(needle)
      );
      if (!matches.length) return null;
      return matches.sort(
        (a, b) =>
          (a.textContent || "").length - (b.textContent || "").length
      )[0];
    };

    // c. clipping: scrollWidth > clientWidth + 2 (elements with content)
    out.clipped = all
      .filter(
        (el) =>
          el.clientWidth > 0 &&
          el.scrollWidth > el.clientWidth + 2 &&
          (el.textContent || "").trim().length > 0
      )
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: (el.className || "").toString().slice(0, 160),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
      }));

    // d. key elements
    const portrait = hero.querySelector<HTMLImageElement>(
      'img[alt*="Hakeem Tahir Hameed"]'
    );
    const trustRow = findByText("Zero Steroids or Synthetics");
    const metricStrip = findByText("35+ Years");
    const availPill = findByText("Available Today");
    const phoneMicro = findByText("Direct Matab");
    const selectLabel = findByText("Select Your Health Concern:");

    out.keyElements = {
      portraitImg: vis(portrait),
      trustRow: vis(trustRow),
      metricStrip: vis(metricStrip),
      availabilityPill: vis(availPill),
      phoneMicroText: vis(phoneMicro),
      selectYourHealthConcern: vis(selectLabel),
    };

    // buttons / links tap targets
    const interactive = Array.from(
      hero.querySelectorAll<HTMLElement>("button, a")
    );
    const tapTargets = interactive.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        className: (el.className || "").toString().slice(0, 120),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
        href: (el as HTMLAnchorElement).href || null,
        width: Math.round(r.width * 100) / 100,
        height: Math.round(r.height * 100) / 100,
        visible: r.width > 0 && r.height > 0 && el.offsetParent !== null,
        tooSmall: r.height > 0 && r.height < 40,
        offscreen: r.bottom < 0 || r.top > innerHeight,
      };
    });
    out.tapTargets = tapTargets;
    out.tapTargetsUnder40 = tapTargets.filter(
      (t) => t.tooSmall && t.visible
    );

    // e. .truncate elements
    out.truncateEls = Array.from(
      hero.querySelectorAll<HTMLElement>(".truncate")
    ).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        text: (el.textContent || "").replace(/\s+/g, " ").trim(),
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        truncated: el.scrollWidth > el.clientWidth + 1,
        visible: r.width > 0 && r.height > 0,
        rect: rect(el),
      };
    });

    // f. h1
    const h1 = hero.querySelector<HTMLElement>("h1");
    if (h1) {
      const cs = getComputedStyle(h1);
      const range = document.createRange();
      range.selectNodeContents(h1);
      const lineRects = Array.from(range.getClientRects()).filter(
        (r) => r.width > 0 && r.height > 0
      );
      // group rects by top position to count visual lines
      const tops = new Set(lineRects.map((r) => Math.round(r.top)));
      out.h1 = {
        text: (h1.textContent || "").replace(/\s+/g, " ").trim(),
        rect: rect(h1),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        fontFamily: cs.fontFamily,
        visualLines: tops.size,
        wraps: tops.size > 1,
        lineTops: Array.from(tops),
      };
    } else {
      out.h1 = null;
    }

    // extra: what's visible/hidden at a glance inside hero (direct sections)
    out.viewport = { width: innerWidth, height: innerHeight };

    return out;
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const results: Record<string, unknown> = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      reducedMotion: "reduce",
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const foldPath = path.join(OUT_DIR, `hero-${vp.w}x${vp.h}-fold.png`);
    const fullPath = path.join(OUT_DIR, `hero-${vp.w}x${vp.h}-full.png`);
    await page.screenshot({ path: foldPath, fullPage: false });
    await page.screenshot({ path: fullPath, fullPage: true });

    const measurements = await collect(page);
    results[`${vp.w}x${vp.h}`] = {
      label: vp.label,
      screenshots: { fold: foldPath, full: fullPath },
      measurements,
    };

    console.log(`✓ ${vp.label} ${vp.w}x${vp.h} done`);
    await context.close();
  }

  await browser.close();

  const jsonPath = path.join(OUT_DIR, "measurements.json");
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Saved ${jsonPath}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
