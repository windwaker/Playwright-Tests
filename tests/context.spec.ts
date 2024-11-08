import { test, chromium } from "@playwright/test";

test.only("No fixtures", async ({}) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await browser.newPage();

  //console.log(browser.browserType());
  await page.goto("https://www.amazon.co.uk");
  await page.waitForTimeout(10000);
  console.log("Default: " + (await context.cookies()));
});
