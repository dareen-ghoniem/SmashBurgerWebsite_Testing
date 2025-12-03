import { test, expect } from './Fixtures.ts';

test(
  '@regression @checkout Basic scenario: add item to cart, validate cart, checkout, and place order',
  {
    annotation: [
      {
        type: 'author',
        description: 'Dareen Ghoniem'

      },
      {
        type: 'discription',
        description:
          'This test covers the whole basic user flow of adding an item to the cart, validating the cart contents and subtotal, proceeding to checkout, filling in payment details, and successfully placing an order.'
      },
      {
        type: 'preconditions',
        description:
          'User is able to reach Smashburger dev site, navigate the menu, select a location, and add items.'
      },
      {
        type: 'expectedResults',
        description:
          'Item is added correctly, cart subtotal matches expected total, checkout info and items match cart, card entry succeeds, order is placed.'
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

    await test.step('Calculate item price & add to order', async () => {
      PriceInMenu = await menu.CalculatePrice(page);
      ItemSelectionsNumber[0] = 1;
      expectedSubTotal = PriceInMenu * ItemSelectionsNumber[0];
      const item1 = await menu.AddToOrder(page);
      ItemSelectedNames.push(item1);
    });

    await test.step('Proceed to checkout and verify cart subtotal', async () => {
      await menu.ProceedToCheckout(page);
      await cart.WaitForPriceUpdate(page);
      await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);
    });

    await test.step('Capture cart items', async () => {
      CartItems = await cart.GetCartItems(page);
      console.log("Items in cart:", CartItems.names);
      console.log("Prices in cart:", CartItems.prices);
    });

    await test.step('Validate cart item count', async () => {
      if (CartItems.names.length !== ItemSelectedNames.length) {
        throw new Error(`Mismatch in expected vs actual cart item count`);
      }
      for (const itemName of ItemSelectedNames) {
        if (!CartItems.names.includes(itemName)) {
          throw new Error(`Item "${itemName}" not found in cart`);
        }
      }
    });

    await test.step('Checkout page validations', async () => {
      await cart.Checkout(page);
      await checkout.VerifyCheckoutPageLoaded(page);
      await checkout.verifyCheckoutAddress(page, "Glendale", "80246");
      await checkout.verifyCheckoutItems(page, CartItems.names, CartItems.prices);
    });

    await test.step('Sign in and fill payment info', async () => {
      await checkout.SignInDuringCheckout(page, 'dareenghoniem141@yahoo.com', 'D1234567m_');
      await checkout.FillCheckoutPaymentDetails(page, '4727 8573 1154 5385', '01/29', '476', '80246');
      await checkout.WaitForPaymentBoxToClose(page);
      await checkout.VerifyCardEnteredCorrectly(page);
      await checkout.CheckCheckoutErrors(page);
    });

    await test.step('Place order and verify confirmation', async () => {
      await checkout.PlaceOrder(page);
      await checkout.WaitForOrderCompletion(page);
      await confirm.OrderPlacedSuccessfully(page);
    });

  }
);

