# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> application loads successfully
- Location: tests/app.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).not.toBeEmpty() failed

Locator:  locator('body')
Expected: not empty
Received: empty

Call log:
  - Expect "not toBeEmpty" locator('body') with timeout 5000ms
  - waiting for locator('body')
  - Test timeout of 30000ms exceeded.

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("application loads successfully", async ({ page }) => {
  4  |     const response = await page.goto("/");
  5  | 
  6  |     expect(response?.ok()).toBeTruthy();
> 7  |     await expect(page.locator("body")).not.toBeEmpty();
     |                                            ^ Error: expect(locator).not.toBeEmpty() failed
  8  | });
  9  | 
  10 | test("application does not display a Vite error overlay", async ({ page }) => {
  11 |     await page.goto("/");
  12 | 
  13 |     await expect(page.locator("vite-error-overlay")).toHaveCount(0);
  14 | });
  15 | 
```