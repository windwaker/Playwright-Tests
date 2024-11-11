import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200/");
});

test.describe("Form Layouts Page", () => {
  test.beforeEach(async ({ page }) => {
    //
    await page.getByText("Forms").click();
    await page.getByText("Form Layouts").click();
  });

  test("input fields", async ({ page }) => {
    //
    const emailField = page
      .locator("nb-card", { hasText: "Using the Grid" })
      .getByRole("textbox", { name: "email" });

    await emailField.fill("test@test.com");
    await emailField.clear();
    await emailField.pressSequentially("test2@test.com", { delay: 500 });

    // generic assertion
    const inputValue = await emailField.inputValue();
    expect(inputValue).toEqual("test2@test.com");

    // locator assertion
    await expect(emailField).toHaveValue("test2@test.com");
  });

  test("radio buttons", async ({ page }) => {
    const usingTheGridForm = page.locator("nb-card", {
      hasText: "Using the Grid",
    });
    const option1Radio = usingTheGridForm
      .locator("nb-radio")
      .locator("label", { hasText: "Option 1" });

    //const option2Radio = usingTheGridForm.getByLabel("Option 2");
    const option2Radio = usingTheGridForm.getByRole("radio", {
      // getByRole is favoured over getByLabel
      name: "Option 2",
    });

    await option1Radio.click();
    await option2Radio.click({ force: true }); // radio is hidden by developers for unknown reason

    // Generic assertion
    const status = await option2Radio.isChecked();
    expect(status).toBeTruthy();

    // Web first assertion
    await expect(option2Radio).toBeChecked();
    await expect(option1Radio).not.toBeChecked();
  });
});

test("Check boxes", async ({ page }) => {
  await page.getByText("Modal & Overlays").click();
  await page.getByText("Toastr").click();

  const hideOnClick = page.getByRole("checkbox", { name: "Hide on click" });
  await hideOnClick.click({ force: true }); // will toggle the state
  await hideOnClick.check({ force: true }); // will not toggle the state
  await hideOnClick.uncheck({ force: true }); // will not toggle the state

  // check all checkboxes on page
  const allCheckBoxesOnPage = page.getByRole("checkbox");
  for (const checkbox of await allCheckBoxesOnPage.all()) {
    await checkbox.check({ force: true });
    expect(await checkbox.isChecked()).toBeTruthy();
  }
});
