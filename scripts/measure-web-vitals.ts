import { chromium } from "@playwright/test";

interface MetricReport {
  fcp: number;
  lcp: number;
  lcpElement: string;
  cls: number;
  shifts: Array<{ value: number; sources: string }>;
  tbt: number;
  longTasks: Array<{ duration: number; startTime: number }>;
  domContentLoaded: number;
  load: number;
  resourceBreakdown: Record<string, { count: number; bytes: number }>;
  totalBytes: number;
}

async function runAudit(url: string, isMobile: boolean): Promise<MetricReport> {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext(
    isMobile
      ? {
          viewport: { width: 390, height: 844 },
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          isMobile: true,
          hasTouch: true,
          deviceScaleFactor: 3,
        }
      : {
          viewport: { width: 1366, height: 768 },
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          isMobile: false,
          hasTouch: false,
          deviceScaleFactor: 1,
        }
  );

  const page = await context.newPage();
  const cdp = await page.context().newCDPSession(page);

  // Emulate throttling if mobile
  if (isMobile) {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 40,
      downloadThroughput: (4 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
    });
  }

  const resourceBreakdown: Record<string, { count: number; bytes: number }> = {};
  let totalBytes = 0;

  page.on("response", async (res) => {
    try {
      const type = res.request().resourceType();
      const headers = res.headers();
      const length = parseInt(headers["content-length"] || "0", 10);
      if (!resourceBreakdown[type]) {
        resourceBreakdown[type] = { count: 0, bytes: 0 };
      }
      resourceBreakdown[type].count += 1;
      resourceBreakdown[type].bytes += length;
      totalBytes += length;
    } catch (e) {}
  });

  await page.addInitScript(() => {
    (window as any).__vitals = {
      fcp: 0,
      lcp: 0,
      lcpElement: "",
      cls: 0,
      shifts: [],
      tbt: 0,
      longTasks: [],
    };

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            (window as any).__vitals.fcp = entry.startTime;
          }
        }
      }).observe({ type: "paint", buffered: true });
    } catch (e) {}

    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const last = entries[entries.length - 1] as any;
        if (last) {
          (window as any).__vitals.lcp = last.startTime;
          if (last.element) {
            (window as any).__vitals.lcpElement =
              last.element.tagName +
              (last.element.id ? "#" + last.element.id : "") +
              (last.element.className ? "." + String(last.element.className).trim().split(/\s+/).slice(0, 3).join(".") : "") +
              (last.element.src ? " [src=" + last.element.src.substring(0, 60) + "]" : "");
          }
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {}

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            (window as any).__vitals.cls += entry.value;
            const sources = (entry.sources || [])
              .map((s: any) => (s.node ? s.node.nodeName + (s.node.className ? "." + s.node.className : "") : "unknown"))
              .join(", ");
            (window as any).__vitals.shifts.push({ value: entry.value, sources });
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch (e) {}

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.duration > 50) {
            (window as any).__vitals.tbt += entry.duration - 50;
            (window as any).__vitals.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      }).observe({ type: "longtask", buffered: true });
    } catch (e) {}
  });

  await page.goto(url, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(2500);

  const vitals = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      ...(window as any).__vitals,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : 0,
      load: nav ? nav.loadEventEnd : 0,
    };
  });

  await browser.close();

  return {
    ...vitals,
    resourceBreakdown,
    totalBytes,
  };
}

async function main() {
  const url = process.argv[2] || process.env.AUDIT_URL || "https://www.tameeresehat.com/";
  console.log("=== Auditing Live Site: " + url + " ===");

  console.log("\n--- Testing Mobile (Emulated iPhone 4x CPU Throttling) ---");
  const mobile = await runAudit(url, true);
  console.log(`FCP: ${mobile.fcp.toFixed(0)} ms`);
  console.log(`LCP: ${mobile.lcp.toFixed(0)} ms`);
  console.log(`LCP Element: ${mobile.lcpElement}`);
  console.log(`CLS: ${mobile.cls.toFixed(4)}`);
  console.log(`TBT: ${mobile.tbt.toFixed(0)} ms (Long tasks: ${mobile.longTasks.length})`);
  console.log(`DOMContentLoaded: ${mobile.domContentLoaded.toFixed(0)} ms`);
  console.log(`Load: ${mobile.load.toFixed(0)} ms`);
  console.log(`Total Download: ${(mobile.totalBytes / 1024).toFixed(1)} KB`);
  console.log("Layout Shifts:", JSON.stringify(mobile.shifts, null, 2));
  console.log("Resource Breakdown:", JSON.stringify(mobile.resourceBreakdown, null, 2));

  console.log("\n--- Testing Desktop ---");
  const desktop = await runAudit(url, false);
  console.log(`FCP: ${desktop.fcp.toFixed(0)} ms`);
  console.log(`LCP: ${desktop.lcp.toFixed(0)} ms`);
  console.log(`LCP Element: ${desktop.lcpElement}`);
  console.log(`CLS: ${desktop.cls.toFixed(4)}`);
  console.log(`TBT: ${desktop.tbt.toFixed(0)} ms (Long tasks: ${desktop.longTasks.length})`);
  console.log(`DOMContentLoaded: ${desktop.domContentLoaded.toFixed(0)} ms`);
  console.log(`Load: ${desktop.load.toFixed(0)} ms`);
  console.log(`Total Download: ${(desktop.totalBytes / 1024).toFixed(1)} KB`);
  console.log("Layout Shifts:", JSON.stringify(desktop.shifts, null, 2));
}

main().catch(console.error);
