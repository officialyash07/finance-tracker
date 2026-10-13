import { test, expect } from "@playwright/test";

test("application loads successfully", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).not.toBeEmpty();
});

test("application does not display a Vite error overlay", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
});
