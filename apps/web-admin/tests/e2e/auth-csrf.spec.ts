import { expect, test } from "@playwright/test";

test("login page renders auth form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test("protected dashboard redirects unauthenticated users", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("browser receives csrf cookie after failed auth mutation path is exercised", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("missing@example.com");
  await page.getByLabel(/password/i).fill("wrong-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForLoadState("networkidle");
  const csrf = (await page.context().cookies()).find((cookie) => cookie.name === "clorisa_csrf");
  expect(csrf?.sameSite).toBeTruthy();
});
