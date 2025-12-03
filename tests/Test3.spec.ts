import { test, expect } from '@playwright/test';
import { Home } from './Home/Home';
import { Menu } from './Menu/Menu';
import { Cart } from './Cart/Cart';
import { HomeLocators } from './Locators/Locators';
import { Menu_CetegoryLocators } from './Locators/Locators';
import { Menu_ItemLocators } from './Locators/Locators';
import { CartLocators } from './Locators/Locators';
import { CheckoutLocators } from './Locators/Locators';
import { Checkout } from './Checkout/Checkout';
import { OrderConfirmation } from './OrderConfirmation/OrderConfirmation';
import { OrderConfirmationLocators } from './Locators/Locators';
import { Console, time } from 'console';

test('Add Multiple Inputs', async ({ page }) => {

    test.setTimeout(120000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.goto('https://dev.smashburger.com/');
    //new page object model classes
    const home = new Home();
    const MyMenu = new Menu();
    const MyCart = new Cart();
    const MyCheckout = new Checkout();
    const MyOrderConfirmation = new OrderConfirmation();
    var PriceInMenu: number;
    var expectedSubTotal: number;
    var ItemSelectionsNumber: number[] = []; //number of selections made for the create your own burger 
    var ItemSelectedNames: string[] = [];
    var CartItems = {
        names: [] as string[],
        prices: [] as number[]
    };
    var CheckoutItems = {
        names: [] as string[],
        prices: [] as number[]
    };

    // Use the page object model methods
    await home.StartOrder(page);
    await home.PickLocation(page, '80246');
    //menu actions
    await MyMenu.SelectCategory(page, Menu_CetegoryLocators.Chicken);
    await MyMenu.SelectItem(page, Menu_ItemLocators.Crispy_Chicken_Sandwich);
    PriceInMenu = await MyMenu.CalculatePrice(page);
    ItemSelectionsNumber[0] = 1;
    console.log('Price in Menu is: ' + PriceInMenu);
    expectedSubTotal = (PriceInMenu * ItemSelectionsNumber[0]);
    console.log('Expected SubTotal is: ' + expectedSubTotal);
    const item1 = await MyMenu.AddToOrder(page);
    ItemSelectedNames.push(item1);
    await MyMenu.ReturnToMenu(page);
    await MyMenu.SelectCategory(page, Menu_CetegoryLocators.Chicken);
    await MyMenu.SelectItem(page, Menu_ItemLocators.Scorchin_Hot_Crispy_Chicken_Sandwich);
    PriceInMenu = await MyMenu.CalculatePrice(page);
    ItemSelectionsNumber[1] = 1;
    console.log('Price in Menu is: ' + PriceInMenu);
    expectedSubTotal = expectedSubTotal + (PriceInMenu * ItemSelectionsNumber[1]);
    console.log('Expected SubTotal is: ' + expectedSubTotal);
    const item2 = await MyMenu.AddToOrder(page);
    ItemSelectedNames.push(item2);
    await MyMenu.ProceedToCheckout(page);
    //Cart actions
    await page.waitForTimeout(6000);
    console.log('expected subtotal before verifying in cart: ' + expectedSubTotal);
    await MyCart.VerifySubTotalPriceInCart(page, expectedSubTotal);
    CartItems = await MyCart.GetCartItems(page);
    console.log('Items in Cart: ' + CartItems.names.join(', '));
    console.log('Prices in Cart: ' + CartItems.prices.join(', '));
    
    if (CartItems.names.length !== ItemSelectedNames.length) {
        throw new Error(`Number of items in cart (${CartItems.names.length}) does not match number of items selected (${ItemSelectedNames.length})`);
    }
    for (const itemName of ItemSelectedNames) {
        if (!CartItems.names.includes(itemName)) {
            throw new Error(`Item "${itemName}" not found in cart`);
        }
    }
    await MyCart.Checkout(page);
});