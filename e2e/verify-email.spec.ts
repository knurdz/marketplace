import { expect, test } from "@playwright/test";

test.describe("email verification result page", () => {
  test("shows success status after verified redirect", async ({ page }) => {
    await page.goto("/verify-email?verified=1");
    await expect(
      page.getByRole("heading", { name: /email verified/i }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText(
      /email verified successfully/i,
    );
  });

  test("shows failure alert for invalid verification link", async ({ page }) => {
    await page.goto("/verify-email?error=invalid_token");
    await expect(page.getByRole("heading", { name: /verify email/i })).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(
      /invalid or has expired/i,
    );
  });
});
