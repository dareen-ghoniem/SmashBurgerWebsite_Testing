import { test, expect } from '@playwright/test';
import { Home } from '../Home/Home';
import { Menu } from '../Menu/Menu';
import { Cart } from '../Cart/Cart';
import { HomeLocators } from '../Locators/Locators';
import { Menu_CetegoryLocators } from '../Locators/Locators';
import { Menu_ItemLocators } from '../Locators/Locators';
import { CartLocators } from '../Locators/Locators';





test('Mockup Image', async ({ page }) => {

  test.setTimeout(60000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  await page.route('**/_next/data/*/cart.json', async (route) => {
    const original = await route.fetch();
    const json = await original.json();

    const products = json?.pageProps?.dehydratedState?.queries?.[1]?.state?.data?.Products;

    if (products && products.length > 0) {
      console.log(`Found ${products.length} products in cart. Updating images...`);

      for (let i = 0; i < products.length; i++) {
        if (products[i].Image) {
          products[i].Image.Url =
            'https://images.squarespace-cdn.com/content/v1/5abdf4e6c3c16a2a7cfb472b/1606217059592-DN40B4DAWSIL3M73XWUD/logosalla.png';

          console.log(`✔ Updated image for item: ${products[i].Name}`);
        }
      }

      await route.fulfill({
        response: original,
        json: json,
      });
      return;
    }

    await route.continue();
  });

  await page.goto('https://dev.smashburger.com/');
  const expectedItems: string[] = []; // runtime item memory

  //new page object model classes
  const home = new Home();
  const MyMenu = new Menu();
  const MyCart = new Cart();

  // Use the page object model methods
  await home.StartOrder(page);
  await home.PickLocation(page, '80246');
  //menu actions
  await MyMenu.SelectCategory(page, Menu_CetegoryLocators.Smashburgers);
  await MyMenu.SelectItem(page, Menu_ItemLocators.SMOKED_BRISKET_BACON_SMASH);
  const item1 = await MyMenu.AddToOrder(page);
  expectedItems.push(item1);
  
  await MyMenu.ReturnToMenu(page);
  await MyMenu.SelectCategory(page, Menu_CetegoryLocators.Chicken);
  await MyMenu.SelectItem(page, Menu_ItemLocators.Crispy_Chicken_Sandwich);
  const item2 = await MyMenu.AddToOrder(page);
  expectedItems.push(item2);


  
  await page.getByRole('button', { name: 'Add OREO® COOKIES & CREAM SHAKE' }).click();
  //await page.waitForTimeout(1000); // wait for shake to be added NEEDs to be done by adding a selector check
 
  await MyMenu.ReturnToMenu(page);


  //Cart actions
  await MyCart.GoToCart(page);
  await page.waitForTimeout(2000); 
  await page.screenshot({ path: '..Screenshots/page.png', fullPage: true });




  await page.unrouteAll({ behavior: 'ignoreErrors' });

});