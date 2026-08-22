import type { Page } from "@playwright/test";

export const DEMO_PASSWORD = process.env.E2E_PASSWORD ?? "DemoPass123!";
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@knurdz.demo";

export async function loginAs(
  page: Page,
  email: string,
  password: string = DEMO_PASSWORD,
): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });
}

export async function registerBuyer(
  page: Page,
  params: { email: string; name: string; password?: string },
): Promise<void> {
  await page.goto("/register");
  await page.getByTestId("register-account-buyer").check();
  await page.locator("#name").fill(params.name);
  await page.locator("#email").fill(params.email);
  await page.locator("#password").fill(params.password ?? DEMO_PASSWORD);
  await page.getByTestId("register-submit").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/register"), {
    timeout: 30_000,
  });
}

export async function registerSeller(
  page: Page,
  params: {
    email: string;
    name: string;
    shopName: string;
    slug?: string;
    password?: string;
  },
): Promise<void> {
  await page.goto("/register");
  await page.getByTestId("register-account-seller").check();
  await page.locator("#shopName").waitFor({ state: "visible" });
  await page.locator("#name").fill(params.name);
  await page.locator("#email").fill(params.email);
  await page.locator("#shopName").fill(params.shopName);
  if (params.slug) {
    await page.locator("#slug").fill(params.slug);
  }
  await page.locator("#password").fill(params.password ?? DEMO_PASSWORD);
  await page.getByTestId("register-submit").click();
  await page.waitForURL(/\/seller\/pending/, { timeout: 30_000 });
}

export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
}
