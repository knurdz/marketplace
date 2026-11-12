import { expect, test } from "@playwright/test";

test.describe("home just listed", () => {
  test("storefront home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
  });
});
