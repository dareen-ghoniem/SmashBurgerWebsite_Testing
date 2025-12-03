import { test, expect } from './Fixtures.ts';

test(
  '@regression @menu @create Create Your Own Burger - Full Flow',
  {
    annotation: [
      {
        type: 'author',
        description: 'Dareen Ghoniem'
      },
      {
        type: 'description',
        description:
          'Tests the Create Your Own burger flow including topping selection, price calculation, cart validation, checkout, payment, and order confirmation.'
      },
      {
        type: 'preconditions',
        description:
          'User must reach Smashburger dev site, start an order, and select a location.'
      },
      {
        type: 'expectedResults',
        description:
          'Burger price updates correctly based on selections, subtotal matches expected value, cart items are correct, checkout succeeds, and order is placed.'
      }
    ]
  },

  async (
    { page, home, menu, cart, checkout, confirm, test_data, menu_cetegory_locators, menu_item_locators },
    testInfo
  ) => {

    // -----------------------------------------------------------
    // Variables
    // -----------------------------------------------------------
    let PriceInMenu: number;
    let expectedSubTotal: number;
    const ItemSelectionsNumber: number[] = [];
    const ItemSelectedNames: string[] = [];
    let CartItems = { names: [] as string[], prices: [] as number[] };
    let CheckoutItems = { names: [] as string[], prices: [] as number[] };

    // -----------------------------------------------------------
    // Test Steps
    // -----------------------------------------------------------

    await test.step('Start order and pick location', async () => {
      await page.goto('https://dev.smashburger.com/');
      await home.StartOrder(page);
      await home.PickLocation(page, '80246');
    });

    await test.step('Navigate to "Create Your Own" burger', async () => {
      await menu.SelectCategory(page, menu_cetegory_locators.CreateYourOwn);
      await menu.SelectItem(page, menu_item_locators.Create_Your_Own_Burger);
    });

    /** ---------------------------------------------------------
     * BUILD YOUR BURGER
     ----------------------------------------------------------*/
    await test.step('Increase patty quantity & make selections', async () => {
      ItemSelectionsNumber[0] = await menu.IncreaseItemQuantity(page, 1); // patties

      // Select components
      await page.getByRole('radio', { name: 'Single Beef $6.99 Add 250' }).check();
      await page.getByRole('radio', { name: 'Classic Classic Add 190' }).check();
      await page.getByRole('radio', { name: 'American American Add 90' }).check();
      await page.locator('label').filter({ hasText: 'Pepper Jack$1.00Add 80' }).click();
      await page.locator('label').filter({ hasText: 'TomatoesAdd 5 Calories' }).click();
      await page.locator('label').filter({ hasText: 'Smash Sauce®Add 70 Calories' }).click();
      await page.locator('label').filter({ hasText: 'Smashed Avocado$1.70Add 70' }).click();

      // Wait until price updates (instead of waitForTimeout)
      //await page.waitForTimeout(5000); //TODO: replace with explicit wait
      const cheeseRadio = page.getByRole('radio', { name: /American American/i });
      await expect(cheeseRadio).toBeChecked();
    });

    /** ---------------------------------------------------------
     * PRICE CALCULATION
     ----------------------------------------------------------*/
    await test.step('Calculate burger price and add to order', async () => {
      PriceInMenu = await menu.CalculatePrice(page);

      console.log('Price in Menu:', PriceInMenu);

      expectedSubTotal = PriceInMenu * ItemSelectionsNumber[0];
      console.log('Expected Subtotal:', expectedSubTotal);

      const item1 = await menu.AddToOrder(page);
      ItemSelectedNames.push(item1);
    });

    /** ---------------------------------------------------------
     * CART VALIDATION
     ----------------------------------------------------------*/
    await test.step('Go to cart & validate subtotal', async () => {
      await menu.ProceedToCheckout(page);

      await cart.WaitForPriceUpdate(page);

      await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);
    });

    await test.step('Capture cart items', async () => {
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

    /** ---------------------------------------------------------
     * CHECKOUT PAGE
     ----------------------------------------------------------*/
    await test.step('Validate checkout page and address', async () => {
      await cart.Checkout(page);

      await checkout.VerifyCheckoutPageLoaded(page);
      await checkout.verifyCheckoutAddress(page, 'Glendale', '80246');
      await checkout.verifyCheckoutItems(page, CartItems.names, CartItems.prices);
    });

    /** ---------------------------------------------------------
     * PAYMENT
     ----------------------------------------------------------*/
    await test.step('Sign in and enter payment details', async () => {
      await checkout.SignInDuringCheckout(
        page,
        'dareenghoniem141@yahoo.com',
        'D1234567m_'
      );

      await checkout.FillCheckoutPaymentDetails(
        page,
        '4727 8573 1154 5385',
        '01/29',
        '476',
        '80246'
      );

      await checkout.WaitForPaymentBoxToClose(page);
      await checkout.VerifyCardEnteredCorrectly(page);
      await checkout.CheckCheckoutErrors(page);
    });

    /** ---------------------------------------------------------
     * PLACE ORDER
     ----------------------------------------------------------*/
    await test.step('Place order and verify confirmation', async () => {
      await checkout.PlaceOrder(page);
      await checkout.WaitForOrderCompletion(page);
      await confirm.OrderPlacedSuccessfully(page);
    });
  }
);