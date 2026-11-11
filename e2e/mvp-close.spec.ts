import { expect, test } from "@playwright/test";

/**
 * Contact-request marketplace smoke:
 * buyer sends request → contacts visible → seller marks sold/cancelled.
 * Requires seeded demo users with phones (npm run seed).
 */

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL ?? "buyer@knurdz.demo";
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD ?? "DemoPass123!";
const SELLER_EMAIL = process.env.E2E_SELLER_EMAIL ?? "seller@knurdz.demo";
const SELLER_PASSWORD = process.env.E2E_SELLER_PASSWORD ?? "DemoPass123!";

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });
}

test.describe("contact request flow", () => {
  test("buyer request shows seller contact; seller can cancel", async ({
    page,
  }) => {
    await login(page, BUYER_EMAIL, BUYER_PASSWORD);
    await page.goto("/products/seed_demo_product");
    await expect(page.getByTestId("buy-request")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByTestId("buy-quantity").fill("1");
    await page.getByTestId("buy-request").click();
    await page.waitForURL(/\/requests\//, { timeout: 30_000 });
    await expect(page.getByTestId("request-contact-phone")).toBeVisible();
    await expect(page.getByTestId("request-contact-email")).toBeVisible();
    await expect(page.getByTestId("request-status")).toContainText(/requested/i);

    const requestUrl = page.url();
    const requestId = requestUrl.split("/").pop();
    expect(requestId).toBeTruthy();

    await page.goto("/account");
    // sign out via account menu if available; fall back to login as seller
    await page.goto("/login");
    await login(page, SELLER_EMAIL, SELLER_PASSWORD);
    await page.goto(`/seller/requests/${requestId}`);
    await expect(page.getByTestId("request-contact-phone")).toBeVisible();
    await expect(page.getByTestId("seller-mark-cancelled")).toBeVisible();
    await page.getByTestId("seller-mark-cancelled").click();
    await page.getByTestId("seller-mark-cancelled-confirm").click();
    await expect(page.getByTestId("request-status")).toContainText(
      /cancelled/i,
      { timeout: 15_000 },
    );
  });

  test("seller mark sold decreases stock", async ({ page }) => {
    await login(page, BUYER_EMAIL, BUYER_PASSWORD);
    await page.goto("/products/seed_demo_product");
    const stockText = await page
      .locator("text=/in stock/i")
      .first()
      .textContent();
    const before = Number((stockText ?? "").match(/(\d+)/)?.[1] ?? "0");

    await page.getByTestId("buy-quantity").fill("1");
    await page.getByTestId("buy-request").click();
    await page.waitForURL(/\/requests\//, { timeout: 30_000 });
    const requestId = page.url().split("/").pop();

    await page.goto("/login");
    await login(page, SELLER_EMAIL, SELLER_PASSWORD);
    await page.goto(`/seller/requests/${requestId}`);
    await page.getByTestId("seller-mark-sold").click();
    await page.getByTestId("seller-mark-sold-confirm").click();
    await expect(page.getByTestId("request-status")).toContainText(/sold/i, {
      timeout: 15_000,
    });

    await page.goto("/products/seed_demo_product");
    const afterText = await page
      .locator("text=/in stock/i")
      .first()
      .textContent();
    const after = Number((afterText ?? "").match(/(\d+)/)?.[1] ?? "0");
    if (before > 0) {
      expect(after).toBe(before - 1);
    }
  });
});
