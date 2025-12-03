import { test, expect } from './Fixtures.ts';

// -------------------------
// 🔥 Data-Driven Inputs
// -------------------------
const testData = [
  {
    category: "Smashburgers",
    item: "SMOKED_BRISKET_BACON_SMASH"
  },
  {
    category: "Chicken",
    item: "Crispy_Chicken_Sandwich"
  }
  // Add more sets as needed!
];


// -------------------------
// 🔥 Data-Driven Test
// -------------------------
for (const data of testData) {
  test(
    `@regression @checkout Purchase item: ${data.item} from category: ${data.category}`,
    {
      annotation: [
        {
          type: 'author',
          description: 'Dareen Ghoniem'
        },
        {
          type: 'description',
          description:
            'DDT test for validating the checkout flow across multiple menu categories and items.'
        },
        {
          type: 'preconditions',
          description:
            'User reaches Smashburger dev site, selects a location, and can navigate menu categories.'
        },
        {
          type: 'expectedResults',
          description:
            'Item is added correctly, cart subtotal matches expected price, checkout details match, and order is placed successfully.'
        }
      ]
    },

    async (
      { page, home, menu, cart, checkout, confirm, menu_cetegory_locators, menu_item_locators },
      testInfo
    ) => {

      // -------------------------
      // Variables
      // -------------------------
      let PriceInMenu: number;
      let expectedSubTotal: number;
      const ItemSelectionsNumber: number[] = [];
      const ItemSelectedNames: string[] = [];
      let CartItems = { names: [] as string[], prices: [] as number[] };


      // -------------------------
      // Test Steps
      // -------------------------

      await test.step('Start order and pick location', async () => {
        await page.goto('https://dev.smashburger.com/');
        await home.StartOrder(page);
        await home.PickLocation(page, '80246');
      });

      await test.step(`Select category "${data.category}" & item "${data.item}"`, async () => {
        const categoryKey = data.category as keyof typeof menu_cetegory_locators;
        await menu.SelectCategory(page, menu_cetegory_locators[categoryKey]);
        const itemKey = data.item as keyof typeof menu_item_locators;
        await menu.SelectItem(page, menu_item_locators[itemKey]);
      });

      await test.step('Calculate price & add item', async () => {
        PriceInMenu = await menu.CalculatePrice(page);
        ItemSelectionsNumber[0] = 1;
        expectedSubTotal = PriceInMenu * ItemSelectionsNumber[0];

        const itemName = await menu.AddToOrder(page);
        ItemSelectedNames.push(itemName);
      });

      await test.step('Proceed to cart & verify subtotal', async () => {
        await menu.ProceedToCheckout(page);
        await cart.WaitForPriceUpdate(page);

        await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);
      });

      await test.step('Capture & validate cart items', async () => {
        CartItems = await cart.GetCartItems(page);

        if (CartItems.names.length !== ItemSelectedNames.length) {
          throw new Error(
            `Mismatch in cart count. Expected ${ItemSelectedNames.length}, got ${CartItems.names.length}`
          );
        }

        for (const name of ItemSelectedNames) {
          if (!CartItems.names.includes(name)) {
            throw new Error(`Item "${name}" not found in cart`);
          }
        }
      });

      await test.step('Checkout page validations', async () => {
        await cart.Checkout(page);
        await checkout.VerifyCheckoutPageLoaded(page);
        await checkout.verifyCheckoutAddress(page, "Glendale", "80246");
        await checkout.verifyCheckoutItems(page, CartItems.names, CartItems.prices);
      });

      await test.step('Sign in & enter payment details', async () => {
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

      await test.step('Place order & validate confirmation', async () => {
        await checkout.PlaceOrder(page);
        await checkout.WaitForOrderCompletion(page);
        await confirm.OrderPlacedSuccessfully(page);
      });

    }
  );
}