import { expect, Locator, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  // increase the timeout for all tests in  this suite / file
  testInfo.setTimeout(testInfo.timeout + 10_000);

  await page.goto("http://uitestingplayground.com/ajax", {
    waitUntil: "domcontentloaded",
  });

  const ajaxButton = page.getByRole("button", {
    name: "Button Triggering AJAX Request",
  });

  await ajaxButton.click({ timeout: 16000 }); // app needs 15 secs
});

test("Auto-waiting", async ({ page }) => {
  const successMessage = page.locator(".bg-success");
  await expect(successMessage).toBeVisible({ timeout: 20000 });

  await successMessage.waitFor({ state: "attached" });
});

test("Alternative Waits", async ({ page }) => {
  const successMessage = page.locator(".bg-success");
  //const text = await successMessage.textContent();

  await page.waitForSelector(".bg-success");
  //expect to have text is favoured over getting text and then expecting on it
  expect(successMessage).toHaveText("Data loaded with AJAX get request.");
  //const text = page.locator(".bg-success").textContent();
  //expect(text).toEqual("Data loaded with AJAX get request.");
});

test("Network Wait", async ({ page }) => {
  const successMessage = page.locator(".bg-success");
  await page.waitForResponse("http://uitestingplayground.com/ajaxdata");
  expect(successMessage).toHaveText("Data loaded with AJAX get request.");
});

test("Network Wait predicate", async ({ page }) => {
  const successMessage = page.locator(".bg-success");
  // Alternative way with a predicate. Note no await.
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === "http://uitestingplayground.com/ajaxdata" &&
      response.status() === 200 &&
      response.request().method() === "GET"
  );

  await responsePromise;

  expect(successMessage).toHaveText("Data loaded with AJAX get request.");
});

test("Network Wait for all calls", async ({ page }) => {
  const successMessage = page.locator(".bg-success");
  // not reccomended
  await page.waitForLoadState("networkidle");

  expect(successMessage).toHaveText("Data loaded with AJAX get request.");
});

test("Timeouts", async ({ page }) => {
  test.slow(); // all timeouts increased by 3
  const successMessage = page.locator(".bg-success");
  await expect(successMessage).toBeVisible({ timeout: 20000 });
});
