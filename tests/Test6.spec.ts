import { test, expect } from './Fixtures.ts';

test(
  '@regression @checkout Negative Scenario to try to enter invalid card number',
  {
    annotation: [
      {
        type: 'author',
        description: 'Dareen Ghoniem'

      },
      {
        type: 'discription',
        description:
          'Validate that the system correctly handles invalid payment information during checkout and displays the appropriate error message'
      },
      {
        type: 'preconditions',
        description:
          'User successfully navigates to Smashburger dev site, selects a location, adds at least one item to the cart, and reaches the checkout payment step.'
      },
      {
        type: 'expectedResults',
        description:
          'When invalid card details are entered, the system must prevent order completion and show a clear error message indicating the payment failure.'
      }
    ]
  },

  async ({ page, home, menu, cart, checkout, confirm, menu_cetegory_locators, menu_item_locators }, testInfo) => {

    // -------------------------------------------------------------------------
    // Test Data & Variables
    // -------------------------------------------------------------------------
    let PriceInMenu: number;
    let expectedSubTotal: number;
    const ItemSelectionsNumber: number[] = [];
    const ItemSelectedNames: string[] = [];

    let CartItems = { names: [] as string[], prices: [] as number[] };

    // -------------------------------------------------------------------------
    // Test Steps
    // -------------------------------------------------------------------------


    await test.step('Start order and pick location', async () => {
      await page.goto('https://dev.smashburger.com/');
      await home.StartOrder(page);
      await home.PickLocation(page, '80246');
    });

    await test.step('Select category & item', async () => {
      await menu.SelectCategory(page, menu_cetegory_locators.Smashburgers);
      await menu.SelectItem(page, menu_item_locators.SMOKED_BRISKET_BACON_SMASH);
    });

    await test.step('add to order', async () => {
      const item1 = await menu.AddToOrder(page);
    });

    await test.step('Proceed to checkout', async () => {
      await menu.ProceedToCheckout(page);
      await cart.WaitForPriceUpdate(page);
    });



    await test.step('Checkout page loading validations', async () => {
      await cart.Checkout(page);
      await checkout.VerifyCheckoutPageLoaded(page);
    });

    await test.step('Sign in and fill payment info', async () => {
      await checkout.SignInDuringCheckout(page, 'dareenghoniem141@yahoo.com', 'D1234567m_');
      await checkout.FillCheckoutPaymentDetails(page, '4727 8573 1154 7777', '01/29', '476', '80246');
      await checkout.WaitForInvalidCardError(page);
    });



  }
);

