import type { Page } from "@playwright/test";

export async function fillCheckoutAddress(page: Page): Promise<void> {
  await page.locator("#line1").fill("123 E2E Test Street");
  await page.locator("#city").fill("Colombo");
  await page.locator("#district").fill("Western");
  await page.locator("#postalCode").fill("00100");
}

export async function placeOrderWithMethod(
  page: Page,
  method: "free" | "bank_transfer" | "payhere",
): Promise<string> {
  await page.goto("/checkout");
  await fillCheckoutAddress(page);
  await page.getByTestId(`checkout-method-${method}`).check();
  await page.getByTestId("checkout-place-order").click();
  await page.waitForURL(/\/checkout\/(free|bank|payhere)/, { timeout: 30_000 });
  const url = new URL(page.url());
  const orderId = url.searchParams.get("orderId");
  if (!orderId) {
    throw new Error(`Missing orderId after checkout (${page.url()})`);
  }
  return orderId;
}

/** Minimal valid PNG (1×1) for bank slip upload tests. */
export function minimalPngBuffer(): Buffer {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}
