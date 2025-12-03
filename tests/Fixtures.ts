import { test as base } from '@playwright/test';
import { Home } from './Home/Home';
import { Menu } from './Menu/Menu';
import { Cart } from './Cart/Cart';
import { Checkout } from './Checkout/Checkout';
import { OrderConfirmation } from './OrderConfirmation/OrderConfirmation';
import { Test_Data } from './Test_Data/Test_Data';
import { Menu_CetegoryLocators } from './Locators/Locators';
import { Menu_ItemLocators } from './Locators/Locators';

type CustomFixtures = {
  home: Home;
  menu: Menu;
  cart: Cart;
  checkout: Checkout;
  confirm: OrderConfirmation;
  test_data: typeof Test_Data;
  menu_cetegory_locators: typeof Menu_CetegoryLocators;
  menu_item_locators: typeof Menu_ItemLocators;
};

export const test = base.extend<CustomFixtures>({

  home: async ({}, use) => { await use(new Home()); },
  menu: async ({}, use) => { await use(new Menu()); },
  cart: async ({}, use) => { await use(new Cart()); },
  checkout: async ({}, use) => { await use(new Checkout()); },
  confirm: async ({}, use) => { await use(new OrderConfirmation()); },

  // Missing fixtures — add them here!!!
  test_data: async ({}, use) => { await use(Test_Data); },
  menu_cetegory_locators: async ({}, use) => { await use(Menu_CetegoryLocators); },
  menu_item_locators: async ({}, use) => { await use(Menu_ItemLocators); },

  // Override page fixture
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    test.setTimeout(Test_Data.TestTimeOut);

    await use(page);

    await context.close();
  }
});

export const expect = test.expect;

test.beforeEach(async ({ page }) => {
  console.log(" Global BeforeEach: Starting test setup");
  await page.unrouteAll({ behavior: "ignoreErrors" });
});


test.afterEach(async ({ page }, testInfo) => {
  console.log("Global AfterEach: Cleaning up");

  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ path: `errors/${testInfo.title}.png` });
  }
});