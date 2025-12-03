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
//import { OrderConfirmation } from './OrderConfirmation/OrderConfirmation';
import { OrderConfirmationLocators } from './Locators/Locators';

// Global variables to store data calculated during runtime
let startTime: number;
let endTime: number;
let navigationTime: number;
let finalUrl: string;

let ADD_TO_ORDER_BUTTON: any='//*[@id="__next"]/div[2]/main/div[2]/div/div/form/div[2]/div/button';


test('Smashburger create your own order now', async ({ page }) => {

  test.setTimeout(60000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  // Capture start time
  startTime = Date.now();

  await page.goto('https://dev.smashburger.com/');

   const expectedItems: string[] = []; // runtime item memory

  //new page object model classes
  const home = new Home();
  const MyMenu = new Menu();
  const MyCart = new Cart();
  const MyCheckout = new Checkout();
  const MyOrderConfirmation = new OrderConfirmation();

  // Use the page object model methods
  await home.StartOrder(page);
  await home.PickLocation(page,'80246');
  //menu actions
  await MyMenu.SelectCategory(page,Menu_CetegoryLocators.Smashburgers);
  await MyMenu.SelectItem(page,Menu_ItemLocators.SMOKED_BRISKET_BACON_SMASH);
  const price= await MyMenu.CalculatePrice(page);
  const item1 = await MyMenu.AddToOrder(page);
  expectedItems.push(item1);
  await MyMenu.ReturnToMenu(page);
  //Cart actions
  await MyMenu.GoToCart(page);
  await page.waitForTimeout(4000);
  await MyCart.VerifyTotalPrice(page,price);
  await MyCart.GetCartItems(page);
  await MyCart.Checkout(page);
  //Checkout actions
  await MyCheckout.VerifyCheckoutPageLoaded(page);
  await MyCheckout.SignInDuringCheckout(page,'dareenghoniem141@yahoo.com','D1234567m_');
  //await MyCheckout.FillCheckoutPersonalDetails(page,'Dareen','Wafik','dareenghoniem14@yahoo.com','3035551236','D1234567m_')
  await MyCheckout.FillCheckoutPaymentDetails(page,'4727 8573 1154 5385','01/29','476','80246');
  await page.waitForTimeout(2000);
  await MyCheckout.VerifyCardEnteredCorrectly(page);
  await MyCheckout.CheckCheckoutErrors(page);
  await MyCheckout.PlaceOrder(page);
  await page.waitForTimeout(10000);
  await MyOrderConfirmation.OrderPlacedSuccessfully(page);
  //await MyOrderConfirmation.VerifyLocationContains(page,'GLENDALE');

  
  //await MyCart.VerifyCart(page,expectedItems);

  //Cart.VerifyCart(page);







  // Capture end time and calculate duration
  endTime = Date.now();
  navigationTime = endTime - startTime;
  finalUrl = page.url();
  

  // These variables can now be used for logging, assertions, or other calculations.
  console.log(`The navigation and click took ${navigationTime} milliseconds.`);
  console.log(`The final URL is: ${finalUrl}`);
  

  // Example assertion using a calculated variable
  //expect(navigationTime).toBeLessThan(60000); // Expect the process to take less than 20 seconds

  // This prevents errors from background requests that are still
  // in-flight when the test finishes.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
