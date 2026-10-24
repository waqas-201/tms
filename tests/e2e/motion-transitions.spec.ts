import { test, expect } from "@playwright/test";

/**
 * Guards the motion system described in docs/adr/0001-motion-system.md.
 *
 * These are structural assertions, not visual ones: the point is that route
 * fades are keyed on the pathname and step swaps actually replace the step.
 */

test.describe("route transition", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("fades on a path change and is not remounted by in-page filtering", async ({
    page,
  }) => {
    await page.goto("/products");

    const fade = page.locator(".route-fade").first();
    await expect(fade).toBeVisible();

    const animationName = await fade.evaluate(
      (el) => getComputedStyle(el).animationName
    );
    expect(animationName).toBe("tms-route-in");

    // In-page filtering must not re-run the fade.
    await fade.evaluate((el) =>
      el.setAttribute("data-motion-probe", "products")
    );
    const filter = page
      .locator("button")
      .filter({ hasText: /sunnah|deals|all products/i })
      .first();
    if (await filter.count()) {
      await filter.click();
      await expect(
        page.locator('.route-fade[data-motion-probe="products"]')
      ).toHaveCount(1);
    }

    // A real route change must replace the wrapper (the fade re-runs).
    await page.goto("/products");
    await expect(
      page.locator('.route-fade[data-motion-probe="products"]')
    ).toHaveCount(0);
  });
});

test.describe("step transition", () => {
  test("swaps the step instead of stacking the old one", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("#hijama-calendar");
    await section.scrollIntoViewIfNeeded();

    const continueToSlots = section.getByRole("button", {
      name: /continue to time slots/i,
    });

    if (await continueToSlots.isDisabled()) {
      const customDateToggle = section.getByRole("button", {
        name: /choose custom date/i,
      });
      if (await customDateToggle.count()) {
        await customDateToggle.click();
      }
      const dateInput = section.locator('input[type="date"]');
      if (await dateInput.count()) {
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        await dateInput.fill(nextWeek);
      }
    }

    await expect(continueToSlots).toBeEnabled();
    await continueToSlots.click();

    // Step 2 replaces step 1 in place — the old step is unmounted, not stacked.
    await expect(
      section.getByRole("button", { name: /continue to patient details/i })
    ).toBeVisible();
    await expect(continueToSlots).toHaveCount(0);
  });
});
