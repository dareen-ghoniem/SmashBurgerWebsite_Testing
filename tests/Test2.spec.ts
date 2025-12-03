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

test('Smashburger create your own order now', async ({ page }) => {

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
    var PriceInCart: number;
    var PriceInCheckout: number;
    var ItemSelectionsNumber: number[] = []; //number of selections made for the create your own burger 
    var CartItems={
        names: [] as string[],
        prices: [] as number[]
    };
    var CheckoutItems={
        names: [] as string[],
        prices: [] as number[]
    };

    // Use the page object model methods
    await home.StartOrder(page);
    await home.PickLocation(page, '80246');
    //menu actions
    await MyMenu.SelectCategory(page, Menu_CetegoryLocators.CreateYourOwn);
    await MyMenu.SelectItem(page, Menu_ItemLocators.Create_Your_Own_Burger);
    //increase patty to 2 and make selections
    await page.getByRole('button', { name: 'Increase' }).click();
    ItemSelectionsNumber[0] = 2; // patty
    //choose your own selections
    await page.getByRole('radio', { name: 'Single Beef $6.99 Add 250' }).check();
    await page.getByRole('radio', { name: 'Classic Classic Add 190' }).check();
    await page.getByRole('radio', { name: 'American American Add 90' }).check();
    await page.locator('label').filter({ hasText: 'Pepper Jack$1.00Add 80' }).click();
    await page.locator('label').filter({ hasText: 'TomatoesAdd 5 Calories' }).click();
    await page.locator('label').filter({ hasText: 'Smash Sauce®Add 70 Calories' }).click();
    await page.locator('label').filter({ hasText: 'Smashed Avocado$1.70Add 70' }).click();
    await page.waitForTimeout(5000); // wait for selections to register
    //calculate expected subtotal
    PriceInMenu = await MyMenu.CalculatePrice(page);
    console.log('Price in Menu is: ' + PriceInMenu);
    expectedSubTotal = PriceInMenu * ItemSelectionsNumber[0];
    console.log('Expected SubTotal is: ' + expectedSubTotal);
    const item1 = await MyMenu.AddToOrder(page);
    await MyMenu.ProceedToCheckout(page);
    //Cart actions
    await page.waitForTimeout(4000);
    await MyCart.VerifySubTotalPriceInCart(page, expectedSubTotal);
    CartItems= await MyCart.GetCartItems(page);
    console.log('Items in Cart: ' + CartItems.names.join(', '));
    console.log('Prices in Cart: ' + CartItems.prices.join(', '));
    await MyCart.Checkout(page);
    //Checkout actions
    await MyCheckout.VerifyCheckoutPageLoaded(page);
    //CheckoutItems=await MyCheckout.GetCheckoutItems(page); TODO
    console.log('Items in Checkout: ' + CheckoutItems.names.join(', '));
    console.log('Prices in Checkout: ' + CheckoutItems.prices.join(', '));
    await MyCheckout.SignInDuringCheckout(page, 'dareenghoniem141@yahoo.com', 'D1234567m_');
    await MyCheckout.FillCheckoutPaymentDetails(page, '4727 8573 1154 5385', '01/29', '476', '80246');
    await page.waitForTimeout(2000);
    await MyCheckout.VerifyCardEnteredCorrectly(page);
    await MyCheckout.CheckCheckoutErrors(page);
    await MyCheckout.PlaceOrder(page);
    await page.waitForTimeout(10000);
    await MyOrderConfirmation.OrderPlacedSuccessfully(page);








});