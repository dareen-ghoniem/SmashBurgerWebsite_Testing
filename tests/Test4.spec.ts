import { test, expect } from './Fixtures.ts';

test(
    '@regression @cart Remove item from Cart',
    {
        annotation: [
            {
                type: 'author',
                description: 'Dareen Ghoniem'
            },
            {
                type: 'description',
                description:
                    'Adds two items to the cart, removes the second item, recalculates subtotal, validates cart contents, and completes checkout.'
            },
            {
                type: 'preconditions',
                description:
                    'User can reach Smashburger dev site, start an order, and select a location.'
            },
            {
                type: 'expectedResults',
                description:
                    'After item removal, subtotal updates correctly, remaining items match expected items, checkout succeeds, and order is placed.'
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
            test_data,
            menu_cetegory_locators,
            menu_item_locators
        },
        testInfo
    ) => {

        // -----------------------------------------------------------
        // Variables
        // -----------------------------------------------------------
        const IncreaseTimes = 3;
        const DecreaseTimes = 1;

        const ItemSelectionsNumber: number[] = [];
        const ItemSelectedNames: string[] = [];

        const PriceInMenu: number[] = [];
        let expectedSubTotal = 0;

        let CartItems = { names: [] as string[], prices: [] as number[] };

        // -----------------------------------------------------------
        // Steps
        // -----------------------------------------------------------

        await test.step('Start order and select location', async () => {
            await page.goto('https://dev.smashburger.com/');
            await home.StartOrder(page);
            await home.PickLocation(page, '80246');
        });

        // -----------------------------------------------------------------
        // FIRST ITEM
        // -----------------------------------------------------------------
        await test.step('Add first item (Crispy Chicken Sandwich)', async () => {
            await menu.SelectCategory(page, menu_cetegory_locators.Chicken);
            await menu.SelectItem(page, menu_item_locators.Crispy_Chicken_Sandwich);

            ItemSelectionsNumber[0] = await menu.IncreaseItemQuantity(page, IncreaseTimes);
            PriceInMenu[0] = await menu.CalculatePrice(page);
            expectedSubTotal = PriceInMenu[0] * ItemSelectionsNumber[0];

            console.log('Expected Subtotal after item 1:', expectedSubTotal);

            const item1 = await menu.AddToOrder(page);
            ItemSelectedNames.push(item1);
        });

        // -----------------------------------------------------------------
        // SECOND ITEM
        // -----------------------------------------------------------------
        await test.step('Add second item (Scorchin Hot Crispy Chicken)', async () => {
            await menu.ReturnToMenu(page);

            await menu.SelectCategory(page, menu_cetegory_locators.Chicken);
            await menu.SelectItem(page, menu_item_locators.Scorchin_Hot_Crispy_Chicken_Sandwich);

            ItemSelectionsNumber[1] = 1;
            PriceInMenu[1] = await menu.CalculatePrice(page);
            expectedSubTotal += PriceInMenu[1] * ItemSelectionsNumber[1];

            console.log('Expected Subtotal after item 2:', expectedSubTotal);

            const item2 = await menu.AddToOrder(page);
            ItemSelectedNames.push(item2);
        });

        // -----------------------------------------------------------------
        // PROCEED TO CART
        // -----------------------------------------------------------------
        await test.step('Proceed to cart & validate initial subtotal', async () => {
            await menu.ProceedToCheckout(page);

            await cart.WaitForPriceUpdate(page);
            await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);

            CartItems = await cart.GetCartItems(page);
            console.log('Items in Cart before edit: ' + CartItems.names.join(', '));
            console.log('Prices in Cart before edit: ' + CartItems.prices.join(', '));
        });

        // -----------------------------------------------------------------
        // REMOVE SECOND ITEM
        // -----------------------------------------------------------------
        await test.step('Remove second item & verify updated subtotal', async () => {
            // Decrease quantity (this removes item if qty becomes 0)
            const secondItemName = ItemSelectedNames[1];
            await cart.DecreaseItemQuantity(page, secondItemName, DecreaseTimes);

            // Remove from expected arrays
            ItemSelectedNames.splice(1, 1);
            ItemSelectionsNumber[1] -= DecreaseTimes;

            // Wait until subtotal updates
            ItemSelectionsNumber[1] = ItemSelectionsNumber[1] - DecreaseTimes;
            await page.waitForTimeout(3000);
            expectedSubTotal = expectedSubTotal - PriceInMenu[1];
            await cart.WaitForPriceUpdate(page);


            // New subtotal = previous subtotal - removed item price

            console.log('Expected Subtotal after removal:', expectedSubTotal);

            await cart.VerifySubTotalPriceInCart(page, expectedSubTotal);

            CartItems = await cart.GetCartItems(page);
            console.log('Cart items after removal:', CartItems.names);
        });

        // -----------------------------------------------------------------
        // VALIDATE CART CONTENT
        // -----------------------------------------------------------------
        await test.step('Validate remaining items in cart', async () => {
            if (CartItems.names.length !== ItemSelectedNames.length) {
                throw new Error(
                    `Cart items (${CartItems.names.length}) do not match expected (${ItemSelectedNames.length})`
                );
            }

            for (const expectedName of ItemSelectedNames) {
                if (!CartItems.names.includes(expectedName)) {
                    throw new Error(`Expected item "${expectedName}" not found in cart`);
                }
            }
        });

        // -----------------------------------------------------------------
        // CHECKOUT PAGE
        // -----------------------------------------------------------------
        await test.step('Navigate to checkout & validate details', async () => {
            await cart.Checkout(page);

            await checkout.VerifyCheckoutPageLoaded(page);
            await checkout.verifyCheckoutAddress(page, 'Glendale', '80246');
            await checkout.verifyCheckoutItems(page, CartItems.names, CartItems.prices);
        });

        // -----------------------------------------------------------------
        // PAYMENT
        // -----------------------------------------------------------------
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

        // -----------------------------------------------------------------
        // PLACE ORDER
        // -----------------------------------------------------------------
        await test.step('Place order and verify confirmation', async () => {
            await checkout.PlaceOrder(page);
            await checkout.WaitForOrderCompletion(page);
            await confirm.OrderPlacedSuccessfully(page);
        });

    }
);