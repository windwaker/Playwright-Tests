import { test, expect } from '@playwright/test';
import { convertDateToWebFormat } from '../utils/dateUtils';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200/');
});

test.describe('Form Layouts Page', () => {
  test.beforeEach(async ({ page }) => {
    //
    await page.getByText('Forms').click();
    await page.getByText('Form Layouts').click();
  });

  test('input fields', async ({ page }) => {
    //
    const emailField = page
      .locator('nb-card', { hasText: 'Using the Grid' })
      .getByRole('textbox', { name: 'email' });

    await emailField.fill('test@test.com');
    await emailField.clear();
    await emailField.pressSequentially('test2@test.com', { delay: 500 });

    // generic assertion
    const inputValue = await emailField.inputValue();
    expect(inputValue).toEqual('test2@test.com');

    // locator assertion
    await expect(emailField).toHaveValue('test2@test.com');
  });

  test('radio buttons', async ({ page }) => {
    const usingTheGridForm = page.locator('nb-card', {
      hasText: 'Using the Grid',
    });
    const option1Radio = usingTheGridForm
      .locator('nb-radio')
      .locator('label', { hasText: 'Option 1' });

    //const option2Radio = usingTheGridForm.getByLabel("Option 2");
    const option2Radio = usingTheGridForm.getByRole('radio', {
      // getByRole is favoured over getByLabel
      name: 'Option 2',
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

test('Check boxes', async ({ page }) => {
  await page.getByText('Modal & Overlays').click();
  await page.getByText('Toastr').click();

  const hideOnClick = page.getByRole('checkbox', { name: 'Hide on click' });
  await hideOnClick.click({ force: true }); // will toggle the state
  await hideOnClick.check({ force: true }); // will not toggle the state
  await hideOnClick.uncheck({ force: true }); // will not toggle the state

  // check all checkboxes on page
  const allCheckBoxesOnPage = page.getByRole('checkbox');
  for (const checkbox of await allCheckBoxesOnPage.all()) {
    await checkbox.check({ force: true });
    expect(await checkbox.isChecked()).toBeTruthy();
  }
});

test('Select dropdowns', async ({ page }) => {
  const themeSelector = page.locator('ngx-header').locator('nb-select');

  await themeSelector.click();

  // const options = page
  //   .locator("nb-option-list")
  //   .locator("nb-option", { hasText: "Dark" });

  // await options.click();

  const altOptions = page.locator('nb-option-list').locator('nb-option');

  await expect(altOptions).toHaveText(['Light', 'Dark', 'Cosmic', 'Corporate']);

  await altOptions.filter({ hasText: 'Cosmic' }).click();

  const header = page.locator('nb-layout-header');
  await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)');

  const colors = {
    Light: 'rgb(255, 255, 255)',
    Dark: 'rgb(34, 43, 69)',
    Cosmic: 'rgb(50, 50, 89)',
    Corporate: 'rgb(255, 255, 255)',
  };

  await themeSelector.click();
  for (const color in colors) {
    await altOptions.filter({ hasText: color }).click();
    await expect(header).toHaveCSS('background-color', colors[color]);
    await themeSelector.click(); //click again to setup up menu for next iteration
  }
});

test('Tooltips', async ({ page }) => {
  // GOTO sources tab in devtools and press CMD + backslash to pause DOM in debugger
  await page.getByText('Modal & Overlays').click();
  await page.getByText('Tooltip').click();

  const tooltipPlacementCard = page.locator('nb-card', {
    hasText: 'Tooltip Placements',
  });

  const topButton = tooltipPlacementCard.getByRole('button', { name: 'Top' });
  await expect(topButton).toBeVisible();

  const tooltip = await page.locator('nb-tooltip');
  await topButton.hover();
  const textOfTooltip = await tooltip.textContent();
  expect(textOfTooltip).toEqual('This is a tooltip');
  //await topButton.hover();
  await expect(tooltip).toBeVisible();
});

test('Dialog boxes', async ({ page }) => {
  await page.getByText('Tables & Data').click();
  await page.getByText('Smart Table').click();

  page.on('dialog', (dialog) => {
    expect(dialog.message()).toEqual('Are you sure you want to delete?');
    dialog.accept();
  });

  await page
    .getByRole('table')
    .locator('tr', { hasText: 'mdo@gmail.com' })
    .locator('.nb-trash')
    .click();

  await expect(
    page.getByRole('table').locator('tr').first().allInnerTexts()
  ).not.toContain('mdo@gmail.com');

  // table rows will be replaced on page refresh
});

test.describe('Find specific user in table and modify their age.', () => {
  test('Web tables', async ({ page }) => {
    await page.getByText('Tables & Data').click();
    await page.getByText('Smart Table').click();

    const targetRow = page.getByRole('row', { name: 'twitter@outlook.com' });
    await targetRow.locator('.nb-edit').click();
    // clicking the edit button changes the DOM element to an input field
    // so we need a different locator strategy
    await targetRow.locator('input-editor').getByPlaceholder('Age').clear();
    await targetRow.locator('input-editor').getByPlaceholder('Age').fill('35');
    await targetRow.locator('.nb-checkmark').click();
  });

  test('Web tables, more complex scenario', async ({ page }) => {
    await page.getByText('Tables & Data').click();
    await page.getByText('Smart Table').click();
    // Find row by text in specific column
    const pagination = page.locator('.ng2-smart-pagination-nav');
    await pagination.locator('li a').getByText('2').click();

    const targetRowById = page
      .getByRole('row', { name: '11' })
      .filter({ has: page.locator('td').nth(1).getByText('11') });

    await targetRowById.locator('.nb-edit').click();
    await page.locator('input-editor').getByPlaceholder('E-mail').clear();
    await page
      .locator('input-editor')
      .getByPlaceholder('E-mail')
      .fill('fake@fake.com');
    await page.locator('.nb-checkmark').click();

    await expect(targetRowById.locator('td').nth(5)).toHaveText(
      'fake@fake.com'
    );
  });

  test('Web tables, validate multiple rows', async ({ page }) => {
    await page.getByText('Tables & Data').click();
    await page.getByText('Smart Table').click();

    // test the filter functionality of the table
    const agesTestData = ['20', '30', '40', '200']; // test data

    for (let age of agesTestData) {
      await page.locator('th').getByPlaceholder('Age').clear();
      await page.locator('th').getByPlaceholder('Age').fill(age);
      await page.waitForTimeout(500);
      const ageRows = page.locator('tbody tr');

      for (let row of await ageRows.all()) {
        const cellValue = await row.locator('td').last().textContent();
        // a better approach would be to have the 200 in a seperate test case
        if (age == '200') {
          expect(await page.getByRole('table').textContent()).toContain(
            'No data found'
          );
        } else {
          expect(cellValue).toEqual(age);
        }
      }
    }
  });
});

test('Date picker', async ({ page }) => {
  await page.getByText('Forms').click();
  await page.getByText('Datepicker').click();

  const commonDatepicker = page
    .locator('nb-card', {
      hasText: 'Common Datepicker',
    })
    .getByPlaceholder('Form Picker');

  await commonDatepicker.click();
  await page
    .locator('.day-cell.ng-star-inserted:not(.bounding-month)')
    .getByText('1', { exact: true })
    .click();

  await expect(commonDatepicker).toHaveValue('Nov 1, 2024');
});

test('Date picker advanced', async ({ page }) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  await page.getByText('Forms').click();
  await page.getByText('Datepicker').click();
  const commonDatepicker = page
    .locator('nb-card', {
      hasText: 'Common Datepicker',
    })
    .getByPlaceholder('Form Picker');

  await commonDatepicker.click();

  let date = new Date();
  date.setDate(date.getDate() + 1);
  const offsetDate = date.getDate().toString();

  await page
    .locator('.day-cell.ng-star-inserted:not(.bounding-month)')
    .getByText(offsetDate, { exact: true })
    .click();

  await expect(commonDatepicker).toHaveValue(convertDateToWebFormat(date));
});

test('Date picker month selector', async ({ page }) => {
  await page.getByText('Forms').click();
  await page.getByText('Datepicker').click();
  const commonDatepicker = page
    .locator('nb-card', {
      hasText: 'Common Datepicker',
    })
    .getByPlaceholder('Form Picker');

  await commonDatepicker.click();

  let calendarMonthAndYear = await page
    .locator('nb-calendar-view-mode')
    .textContent();

  let date = new Date();
  date.setDate(date.getDate() + 365);
  const expectedDate = date.getDate().toString();
  const expectedMonth = date.toLocaleString('En-US', { month: 'long' });
  const expectedYear = date.getFullYear().toString();

  const monthAndYearWebFormat = ` ${expectedMonth} ${expectedYear} `;

  while (!calendarMonthAndYear.includes(monthAndYearWebFormat)) {
    await page
      .locator('nb-calendar-pageable-navigation [data-name="chevron-right"]')
      .click();
    calendarMonthAndYear = await page
      .locator('nb-calendar-view-mode')
      .textContent();
  }

  await page
    .locator('.day-cell.ng-star-inserted:not(.bounding-month)')
    .getByText(expectedDate, { exact: true })
    .click();

  await expect(commonDatepicker).toHaveValue(convertDateToWebFormat(date));
});

test('Sliders attributes', async ({ page }) => {
  // not reccomended approach
  // update slider x and y attributes
  const tempGuage = page.locator(
    '[tabtitle="Temperature"] ngx-temperature-dragger circle'
  );

  await tempGuage.evaluate((node) => {
    node.setAttribute('cx', '232.630');
    node.setAttribute('cy', '232.630');
  });

  await tempGuage.click(); // trigger an event on the element so ui is updated
});

test.only('Sliders mouse movement up', async ({ page }) => {
  const tempBox = page.locator(
    '[tabtitle="Temperature"] ngx-temperature-dragger'
  );
  // scroll box into view
  await tempBox.scrollIntoViewIfNeeded();
  const box = await tempBox.boundingBox(); // coordinates start from top left
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y); // start from the centre of the box
  await page.mouse.down(); //left click and hold
  await page.mouse.move(x + 100, y);
  await page.mouse.move(x + 100, y + 100);
  await page.mouse.up(); // release mouse click

  await expect(tempBox).toContainText('30');
});

test.only('Sliders mouse movement down', async ({ page }) => {
  const tempBox = page.locator(
    '[tabtitle="Temperature"] ngx-temperature-dragger'
  );
  // scroll box into view
  await tempBox.scrollIntoViewIfNeeded();
  const box = await tempBox.boundingBox(); // coordinates start from top left
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y); // start from the centre of the box
  await page.mouse.down(); //left click and hold
  await page.mouse.move(x - 100, y);
  await page.mouse.move(x - 100, y + 150);
  await page.mouse.up(); // release mouse click

  await expect(tempBox).toContainText('12'); // 12 is minimum value
});
