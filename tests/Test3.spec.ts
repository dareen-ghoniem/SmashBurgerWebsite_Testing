import { test, expect } from './Fixtures.ts';

test(
  '@regression @cart Modify Quantity of Items in Cart',
  {
    annotation: [
      {
        type: 'author',
        description: 'Dareen Ghoniem'
      },
      {
        type: 'description',
        description:
          'Validates modifying item quantities in cart, recalculating subtotal, and completing checkout.'
      },
      {
        type: 'preconditions',
        description:
          'User can navigate to Smashburger dev site, start an order, and select a location.'
      },
      {
        type: 'expectedResults',
        description:
          'Subtotal updates correctly after quantity changes; cart displays updated values; checkout succeeds.'
      }
    ]
  },

  async (
    { page, home, menu, cart, checkout, confirm, test_data, menu_cetegory_locators, menu_item_locators },
    testInfo
  ) => {

    // -----------------------------------------------------------
    // Test Variables
    // -----------------------------------------------------------
    let PriceInMenu: number;
    let expectedSubTotal: number;
    let item1: string;
    const ItemSelectionsNumber: number[] = [];
    const ItemSelectedNames: string[] = [];
    const IncreaseTimes = 3;
    const DecreaseTimes = 1;

    let CartItems = { names: [] as string[], prices: [] as number[] };

    // -----------------------------------------------------------
    // Steps
    // -----------------------------------------------------------

    await test.step('Start order & pick location', async () => {
      await page.goto('https://dev.smashburger.com/');
      await home.StartOrder(page);
      await home.PickLocation(page, '80246');
    });

    /** ---------------------------------------------------------
     * SELECT ITEM & INCREASE QUANTITY
     ----------------------------------------------------------*/
    await test.step('Select item and increase quantity', async () => {
      await menu.SelectCategory(page, menu_cetegory_locators.Chicken);
      await menu.SelectItem(page, menu_item_locators.Crispy_Chicken_Sandwich);

      ItemSelectionsNumber[0] = await menu.IncreaseItemQuantity(page, IncreaseTimes);

      PriceInMenu = await menu.CalculatePrice(page);
      expectedSubTotal = PriceInMenu * ItemSelectionsNumber[0];
      console.log('Expected subtotal before checkout:', expectedSubTotal);

      item1 = await menu.AddToOrder(page);
      ItemSelectedNames.push(item1);
    });

    /** ---------------------------------------------------------
     * GO TO CART & VALIDATE INITIAL SUBTOTAL
     ----------------------------------------------------------*/
    await test.step('Proceed to checkout and validate initial subtotal', async () => {
      await menu.ProceedToCheckout(page);

      await cart.WaitForPriceUpdate(page);

      await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);

      CartItems = await cart.GetCartItems(page);
      console.log('Cart items before edit:', CartItems.names);
    });

    /** ---------------------------------------------------------
     * MODIFY QUANTITY (DECREASE) & REVALIDATE SUBTOTAL
     ----------------------------------------------------------*/
    await test.step('Decrease item quantity and validate updated subtotal', async () => {
      const priceBefore = await cart.GetItemPriceInCart(page, item1);
      await cart.DecreaseItemQuantity(page, item1, DecreaseTimes);
      await expect(async () => {
        const priceAfter = await cart.GetItemPriceInCart(page, item1);
        expect(priceAfter).toBeLessThan(priceBefore);
      }).toPass({ timeout: 5000 });
      //console.log(`Item quantity for "${item1}" before decrease: ${ItemQuantityBefore}, after decrease: ${ItemQuantityAfter}`);


      // update expected subtotal after decrease
      ItemSelectionsNumber[0] = ItemSelectionsNumber[0] - DecreaseTimes;
      page.waitForTimeout(2000);



      await cart.WaitForPriceUpdate(page);

      expectedSubTotal = PriceInMenu * ItemSelectionsNumber[0];
      console.log('Expected subtotal after edit:', expectedSubTotal);

      await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);

      CartItems = await cart.GetCartItems(page);
      console.log('Cart items after edit:', CartItems.names);
    });

    /** ---------------------------------------------------------
     * VALIDATE CART ITEM COUNT
     ----------------------------------------------------------*/
    await test.step('Validate cart item count', async () => {
      if (CartItems.names.length !== ItemSelectedNames.length) {
        throw new Error(
          `Mismatch in expected vs actual cart item count`
        );
      }

      for (const itemName of ItemSelectedNames) {
        if (!CartItems.names.includes(itemName)) {
          throw new Error(`Item "${itemName}" not found in cart`);
        }
      }
    });

    /** ---------------------------------------------------------
     * CHECKOUT PAGE VALIDATION
     ----------------------------------------------------------*/
    await test.step('Checkout page validations', async () => {
      await cart.Checkout(page);

      await checkout.VerifyCheckoutPageLoaded(page);
      await checkout.verifyCheckoutAddress(page, 'Glendale', '80246');
      await checkout.verifyCheckoutItems(page, CartItems.names, CartItems.prices);
    });

    /** ---------------------------------------------------------
     * PAYMENT
     ----------------------------------------------------------*/
    await test.step('Sign in and enter payment details', async () => {
      await checkout.SignInDuringCheckout(page, 'dareenghoniem141@yahoo.com', 'D1234567m_');

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