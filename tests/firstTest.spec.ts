import { expect, Locator, test } from "@playwright/test";

test.use({
  launchOptions: {
    slowMo: process.env.SLO_MO ? 1_000 : 0,
    //args: ["--start-maximized"],
    headless: false,
  },
});

test.beforeAll(() => {
  // potential location to seed the test DB etc.
});

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200/", { waitUntil: "domcontentloaded" });
  await page.getByText("Forms").click();
  await page.getByText("Form Layouts").click();
});

test("Locator syntax rules", async ({ page }) => {
  // refactor to avoid index method
  await page.locator(".shape-rectangle").first().click();
});

test("Child elements", async ({ page }) => {
  // combining locators
  await page.locator('nb-card nb-radio :text-is("Option 1")').click();
  // chaining locators
  await page
    .locator("nb-card")
    .locator("nb-radio")
    .locator(':text-is("Option 2")')
    .click();
  // mix regular locators and user facing locators
  await page
    .locator("nb-card")
    .getByRole("button", { name: "Sign In" })
    .nth(0) // same as first(), try to avoid index methods
    .click();
});

test("Parent elements", async ({ page }) => {
  await page
    .locator("nb-card", { hasText: "Using the Grid" })
    .getByRole("textbox", { name: "Email" })
    .click();

  await page.locator("nb-card", { has: page.locator("#inputEmail1") }).click();

  await page
    .locator("nb-card")
    .filter({ hasText: "Basic form" })
    .getByRole("textbox", { name: "Email" })
    .click();

  await page
    .locator("nb-card")
    .filter({ has: page.locator(".status-danger") })
    .getByRole("textbox", { name: "Password" })
    .click();

  await page
    .locator("nb-card")
    .filter({ has: page.locator("nb-checkbox") })
    .filter({ hasText: "Sign in" })
    .getByRole("textbox", { name: "Email" })
    .click();

  await page
    .locator(':text-is("Inline form")')
    .locator("..")
    .getByRole("textbox", { name: "Email" })
    .click();
});

test("Reusing Locators", async ({ page }) => {
  // Arrange
  const emailAddress: string = "test@test.com";
  const password: string = "Password123";

  const basicForm: Locator = page
    .locator("nb-card")
    .filter({ hasText: "Basic form" });

  const emailField = basicForm.getByRole("textbox", { name: "Email" });
  const passwordField = basicForm.getByRole("textbox", { name: "Password" });
  const checkBox = basicForm.locator("nb-checkbox").getByText("Check me out");
  const submitButton: Locator = basicForm.getByRole("button", {
    // name attribute can be used in any case
    name: "SuBmIt",
  });

  // Act
  await emailField.fill(emailAddress);
  await passwordField.fill(password);
  await checkBox.click();
  await submitButton.click();

  // Assert
  await expect(emailField).toHaveValue(emailAddress);
  await expect(passwordField).toHaveValue(password);
  await expect(checkBox).toBeChecked();
});

test("Extracting values from the DOM", async ({ page }) => {
  const basicForm: Locator = page
    .locator("nb-card")
    .filter({ hasText: "Basic form" });

  const usingTheGridForm: Locator = page
    .locator("nb-card")
    .filter({ hasText: "Using the Grid" });

  const buttonText = await basicForm.locator("button").textContent();

  expect(buttonText).toEqual("Submit");

  const radioValues = await usingTheGridForm
    .locator("nb-radio")
    .allTextContents();

  expect(radioValues).toContain("Option 2");

  // input value
  const emailField = basicForm.getByRole("textbox", { name: "Email" });
  await emailField.fill("test@test.com");
  const emailValue = await emailField.inputValue();
  expect(emailValue).toBe("test@test.com");
  const emailPlaceholder = await emailField.getAttribute("placeholder");
  expect(emailPlaceholder).toBe("Email");
});

test("Assertions", async ({ page }) => {
  // Generic Assertions
  const value = 5;
  expect(value).toEqual(5);

  const basicFormButton: Locator = page
    .locator("nb-card")
    .filter({ hasText: "Basic form" })
    .locator("button");

  const text = await basicFormButton.textContent();
  expect(text).toEqual("Submit");

  // Locator Assertions
  await expect(basicFormButton).toHaveText("Submit");

  // Soft Assertion
  await expect.soft(basicFormButton).toHaveText("Blah");
  // will still happen even though above soft assertion wil fail
  basicFormButton.click();
});
