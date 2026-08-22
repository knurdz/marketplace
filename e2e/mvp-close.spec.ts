import { expect, test } from "@playwright/test";
import {
  ADMIN_EMAIL,
  clearSession,
  DEMO_PASSWORD,
  loginAs,
  registerBuyer,
  registerSeller,
} from "./fixtures/auth";
import {
  fillCheckoutAddress,
  minimalPngBuffer,
  placeOrderWithMethod,
} from "./helpers/checkout";

test.describe.configure({ mode: "serial" });

test.describe("Guide §10 — MVP close (Phase 6.18)", () => {
  // Unique forwarded IP per run so retries are not blocked by auth.register (5/hour/IP).
  test.use({
    extraHTTPHeaders: {
      "x-forwarded-for": `198.51.100.${(Date.now() % 200) + 1}`,
    },
  });
  const runId = Date.now();
  const buyerEmail = `e2e-buyer-${runId}@knurdz.demo`;
  const sellerEmail = `e2e-seller-${runId}@knurdz.demo`;
  const shopSlug = `e2e-shop-${runId}`;
  const freeTitle = `E2E Free ${runId}`;
  const paidTitle = `E2E Paid ${runId}`;

  let freeProductId = "";
  let paidProductId = "";
  let bankOrderId = "";

  test("register seller, admin approves seller, register buyer", async ({ page }) => {
    await registerSeller(page, {
      email: sellerEmail,
      name: `E2E Seller ${runId}`,
      shopName: `E2E Shop ${runId}`,
      slug: shopSlug,
    });
    await expect(page.getByText("Application under review")).toBeVisible({
      timeout: 15_000,
    });

    await clearSession(page);
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/admin/sellers");
    const row = page.locator("li").filter({ hasText: `E2E Shop ${runId}` });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByTestId("admin-approve-seller").click();
    await expect(row).toHaveCount(0, { timeout: 30_000 });

    await clearSession(page);
    await registerBuyer(page, {
      email: buyerEmail,
      name: `E2E Buyer ${runId}`,
    });
  });

  test("seller bank details + publish free and paid listings", async ({
    page,
  }) => {
    await clearSession(page);
    await loginAs(page, sellerEmail);

    await page.goto("/seller/shop");
    await page.locator("#bankName").fill("E2E Test Bank");
    await page.locator("#bankAccountName").fill("E2E Seller Account");
    await page.locator("#bankAccountNumber").fill("1234567890");
    await page.getByTestId("seller-bank-save").click();
    await expect(page.getByText("Bank details saved.")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/seller/listings/new");
    await page.locator("#title").waitFor({ state: "visible" });
    await expect(page.getByTestId("listing-save-draft")).toBeEnabled();
    await page.locator("#categoryId option").nth(1).waitFor();
    await page.locator("#title").fill(freeTitle);
    await page.locator("#description").fill("Free listing for E2E.");
    await page.locator("#categoryId").selectOption({ index: 1 });
    await page.locator("#isFree").check();
    await page.locator("#stock").fill("5");
    await page.getByTestId("listing-save-draft").click();
    await expect(page.getByTestId("listing-save-draft")).toHaveText(
      /Saving draft/i,
      { timeout: 5_000 },
    );
    await page.waitForURL("/seller/listings", { timeout: 30_000 });

    const freeHref = await page
      .getByRole("link", { name: freeTitle })
      .getAttribute("href");
    freeProductId = freeHref?.split("/").pop() ?? "";
    expect(freeProductId).toBeTruthy();
    await page
      .locator("li")
      .filter({ hasText: freeTitle })
      .getByTestId("listing-submit-review")
      .click();
    await expect(
      page.getByText(`"${freeTitle}" submitted for review`, { exact: false }),
    ).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/seller/listings/new");
    await page.locator("#title").waitFor({ state: "visible" });
    await expect(page.getByTestId("listing-save-draft")).toBeEnabled();
    await page.locator("#categoryId option").nth(1).waitFor();
    await page.locator("#title").fill(paidTitle);
    await page.locator("#description").fill("Paid listing for E2E bank path.");
    await page.locator("#categoryId").selectOption({ index: 1 });
    await page.locator("#price").fill("250");
    await page.locator("#stock").fill("5");
    await page.getByTestId("listing-save-draft").click();
    await expect(page.getByTestId("listing-save-draft")).toHaveText(
      /Saving draft/i,
      { timeout: 5_000 },
    );
    await page.waitForURL("/seller/listings", { timeout: 30_000 });

    const paidHref = await page
      .getByRole("link", { name: paidTitle })
      .getAttribute("href");
    paidProductId = paidHref?.split("/").pop() ?? "";
    expect(paidProductId).toBeTruthy();
    await page
      .locator("li")
      .filter({ hasText: paidTitle })
      .getByTestId("listing-submit-review")
      .click();
    await expect(
      page.getByText(`"${paidTitle}" submitted for review`, { exact: false }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test("admin approves both listings", async ({ page }) => {
    await clearSession(page);
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/admin/listings");

    for (const title of [freeTitle, paidTitle]) {
      const row = page.locator("li").filter({ hasText: title });
      await expect(row).toBeVisible({ timeout: 15_000 });
      await row.getByTestId("admin-approve-listing").click();
      await expect(row).toHaveCount(0, { timeout: 15_000 });
    }
  });

  test("buyer free checkout confirms paid", async ({ page }) => {
    await clearSession(page);
    await loginAs(page, buyerEmail);

    await page.goto(`/products/${freeProductId}`);
    await page.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    await page.getByRole("link", { name: "Checkout" }).click();

    await fillCheckoutAddress(page);
    await page.getByTestId("checkout-method-free").check();
    await page.getByTestId("checkout-place-order").click();
    await page.waitForURL(/\/checkout\/free/, { timeout: 30_000 });

    await page.getByTestId("free-confirm").click();
    await expect(page.getByText(/Payment confirmed|paid/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("buyer bank checkout + admin approves slip", async ({ page }) => {
    await clearSession(page);
    await loginAs(page, buyerEmail);

    await page.goto("/cart");
    await page.getByTestId("clear-cart").click();
    await expect(page.getByText(/empty/i)).toBeVisible({ timeout: 15_000 });

    await page.goto(`/products/${paidProductId}`);
    await page.getByTestId("add-to-cart").click();
    bankOrderId = await placeOrderWithMethod(page, "bank_transfer");

    await page.locator("#slip").setInputFiles({
      name: "e2e-slip.png",
      mimeType: "image/png",
      buffer: minimalPngBuffer(),
    });
    await page.getByTestId("bank-slip-upload").click();
    await expect(page.getByText(/awaiting admin verification/i)).toBeVisible({
      timeout: 30_000,
    });

    await clearSession(page);
    await loginAs(page, ADMIN_EMAIL);
    page.once("dialog", (dialog) => dialog.accept());
    await page.goto("/admin/payments/bank-slips");
    const slipRow = page.locator("li").filter({ hasText: bankOrderId });
    await expect(slipRow).toBeVisible({ timeout: 30_000 });
    await slipRow.getByTestId("admin-approve-bank-slip").click();
    await expect(slipRow).toHaveCount(0, { timeout: 30_000 });
  });

  test("PayHere sandbox path", async ({ page }) => {
    test.skip(
      process.env.PAYHERE_E2E !== "1",
      "Set PAYHERE_E2E=1 after Phase 6.17 console setup",
    );

    await clearSession(page);
    await loginAs(page, buyerEmail);

    await page.goto("/cart");
    if (await page.getByTestId("clear-cart").isVisible()) {
      await page.getByTestId("clear-cart").click();
    }

    await page.goto(`/products/${paidProductId}`);
    await page.getByTestId("add-to-cart").click();
    await page.goto("/checkout");
    await fillCheckoutAddress(page);
    await page.getByTestId("checkout-method-payhere").check();
    await page.getByTestId("checkout-place-order").click();
    await page.waitForURL(/\/checkout\/payhere/, { timeout: 30_000 });

    await page.getByTestId("payhere-continue").click();
    await page.waitForURL(/sandbox\.payhere\.lk/, { timeout: 30_000 });

    await page.locator('input[name="card_number"], #card_number').fill(
      "4916217501611292",
    );
    await page.locator('input[name="card_holder_name"]').fill("E2E Buyer");
    await page.locator('input[name="card_expiry"]').fill("12/30");
    await page.locator('input[name="card_cvv"], input[name="cvv"]').fill("123");
    await page.getByRole("button", { name: /pay|submit/i }).click();

    await page.waitForURL(/\/checkout\/payhere\/return/, { timeout: 60_000 });
    await expect(page.getByText(/paid|confirmed/i)).toBeVisible({
      timeout: 60_000,
    });
  });

  test("seller fulfills bank order", async ({ page }) => {
    await clearSession(page);
    await loginAs(page, sellerEmail);
    await page.goto(`/seller/orders/${bankOrderId}`);

    await page.getByTestId("fulfill-processing").click();
    await expect(page.getByText(/processing/i)).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("fulfill-shipped").click();
    await expect(page.getByText(/shipped/i)).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("fulfill-completed").click();
    await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 15_000 });
  });

  test("admin suspend blocks checkout", async ({ page }) => {
    await clearSession(page);
    await loginAs(page, ADMIN_EMAIL);
    await page.goto(`/admin/users?q=${encodeURIComponent(buyerEmail)}`);
    const userRow = page.locator("li").filter({ hasText: buyerEmail });
    await expect(userRow).toBeVisible({ timeout: 15_000 });
    await userRow.getByTestId("admin-suspend-user").click();
    await userRow.locator('textarea[name="reason"]').fill("E2E suspend test");
    await userRow.getByTestId("admin-suspend-confirm").click();
    await expect(userRow.getByText("Suspended")).toBeVisible({ timeout: 15_000 });

    await clearSession(page);
    await page.goto(`/login?next=${encodeURIComponent("/checkout")}`);
    await page.locator("#email").fill(buyerEmail);
    await page.locator("#password").fill(DEMO_PASSWORD);
    await page.getByTestId("login-submit").click();
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
