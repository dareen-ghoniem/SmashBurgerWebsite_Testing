import { test, expect } from './Fixtures.ts';

test(
  '@regression @menu @cart Add Multiple Inputs - validate subtotal and cart contents',
  {
    annotation: [
      {
        type: 'author',
        description: 'Dareen Ghoniem'
      },
      {
        type: 'description',
        description:
          'Adds multiple items with different quantities to cart, validates subtotal, item names, and prepares for checkout.'
      },
      {
        type: 'preconditions',
        description:
          'User can access Smashburger dev site, select a location, navigate the menu, and add items.'
      },
      {
        type: 'expectedResults',
        description:
          'Correct computed subtotal, matching cart contents, and correct item quantities appear in cart.'
      }
    ]
  },

  async (
    {
      page,
      home,
      menu,
      cart,
      checkout,
      confirm,
      menu_cetegory_locators,
      menu_item_locators
    },
    testInfo
  ) => {

    // -------------------------------------------------------------------------
    // Test Variables
    // -------------------------------------------------------------------------
    let PriceInMenu: number;
    let expectedSubTotal: number = 0;
    const ItemSelectionsNumber: number[] = [];
    const ItemSelectedNames: string[] = [];
    let CartItems = { names: [] as string[], prices: [] as number[] };

    // -------------------------------------------------------------------------
    // Test Steps
    // -------------------------------------------------------------------------

    await test.step('Start order & pick location', async () => {
      await page.goto('https://dev.smashburger.com/');
      await home.StartOrder(page);
      await home.PickLocation(page, '80246');
    });

    /** --------------------------------------------
     * FIRST ITEM 
     * Crispy Chicken Sandwich with quantity = 3
     * --------------------------------------------
     */
    await test.step('Select first menu item', async () => {
      await menu.SelectCategory(page, menu_cetegory_locators.Chicken);
      await menu.SelectItem(page, menu_item_locators.Crispy_Chicken_Sandwich);

      ItemSelectionsNumber[0] = await menu.IncreaseItemQuantity(page, 3);
      PriceInMenu = await menu.CalculatePrice(page);

      console.log('Price In Menu (Item 1):', PriceInMenu);

      expectedSubTotal += PriceInMenu * ItemSelectionsNumber[0];
      console.log('Expected SubTotal After Item 1:', expectedSubTotal);

      const item1 = await menu.AddToOrder(page);
      ItemSelectedNames.push(item1);
    });

    /** --------------------------------------------
     * SECOND ITEM  
     * Scorchin Hot Crispy Chicken Sandwich
     * --------------------------------------------
     */
    await test.step('Select second menu item', async () => {
      await menu.ReturnToMenu(page);
      await menu.SelectCategory(page, menu_cetegory_locators.Chicken);
      await menu.SelectItem(page, menu_item_locators.Scorchin_Hot_Crispy_Chicken_Sandwich);

      ItemSelectionsNumber[1] = 1;
      PriceInMenu = await menu.CalculatePrice(page);

      console.log('Price In Menu (Item 2):', PriceInMenu);

      expectedSubTotal += (PriceInMenu * ItemSelectionsNumber[1]);
      console.log('Expected SubTotal After Item 2:', expectedSubTotal);

      const item2 = await menu.AddToOrder(page);
      ItemSelectedNames.push(item2);
    });

    /** --------------------------------------------
     * PROCEED TO CHECKOUT
     * --------------------------------------------
     */
    await test.step('Proceed to checkout', async () => {
      await menu.ProceedToCheckout(page);
    });

    /** --------------------------------------------
     * CART VALIDATION
     * --------------------------------------------
     */
    await test.step('Validate subtotal in cart', async () => {
      await cart.WaitForPriceUpdate(page);
      console.log('Expected Subtotal Before Cart Check:', expectedSubTotal);
      await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);
    });

    await test.step('Validate cart items & counts', async () => {
      CartItems = await cart.GetCartItems(page);

      console.log('Items in Cart:', CartItems.names);
      console.log('Prices in Cart:', CartItems.prices);

      // Validate number of items
      if (CartItems.names.length !== ItemSelectedNames.length) {
        throw new Error(
          `Mismatch! Cart has ${CartItems.names.length} items but ${ItemSelectedNames.length} were selected.`
        );
      }

      // Validate each selected item exists in cart
      for (const item of ItemSelectedNames) {
        if (!CartItems.names.includes(item)) {
          throw new Error(`Item "${item}" not found in cart`);
        }
      }
    });

    /** --------------------------------------------
     * CHECKOUT PREP
     * --------------------------------------------
     */


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