import { test, expect } from '@playwright/test';                  // Import Playwright test + expect assertion library
import { Home } from '../Home/Home';                              // Import Home Page Object
import { Menu } from '../Menu/Menu';                              // Import Menu Page Object
import { Cart } from '../Cart/Cart';                              // Import Cart Page Object
import { HomeLocators } from '../Locators/Locators';              // Import home locators (unused here but kept)
import { Menu_CetegoryLocators } from '../Locators/Locators';     // Import menu category locators
import { Menu_ItemLocators } from '../Locators/Locators';         // Import menu item locators
import { CartLocators } from '../Locators/Locators';              // Import cart locators



test('Mockup Image', async ({ page }) => {

  test.setTimeout(30000);                                         // Set max test time to 60 seconds
  await page.unrouteAll({ behavior: 'ignoreErrors' });            // Remove any existing routes safely

  await page.route('**/_next/data/*/cart.json', async (route) => {    // Intercept cart.json API
    const original = await route.fetch();                             // Fetch original response
    const json = await original.json();                               // Parse JSON body

    const products = json?.pageProps?.dehydratedState?.queries?.[1]?.state?.data?.Products;  // Extract product list from JSON

    if (products && products.length > 0) {                        // Ensure cart has products
      console.log(`Found ${products.length} products in cart. Updating images...`);

      for (let i = 0; i < products.length; i++) {                 // Loop through products
        if (products[i].Image) {                                  // Only update if image exists
          products[i].Image.Url =
            'https://images.squarespace-cdn.com/content/v1/5abdf4e6c3c16a2a7cfb472b/1606217059592-DN40B4DAWSIL3M73XWUD/logosalla.png'; // Replace image URL

          console.log(`✔ Updated image for item: ${products[i].Name}`);   // Log update
        }
      }

      await route.fulfill({                                       // Fulfill mock response with updated JSON
        response: original,
        json: json,
      });
      return;                                                     // Stop further processing if fulfilled
    }

    await route.continue();                                       // If no products, continue without modification
  });

  await page.goto('https://dev.smashburger.com/');                // Navigate to Smashburger dev site
  const expectedItems: string[] = [];                             // Array to store expected items added to cart

  //new page object model classes
  const home = new Home();                                        // Instantiate Home page object
  const MyMenu = new Menu();                                      // Instantiate Menu page object
  const MyCart = new Cart();                                      // Instantiate Cart page object

  // Use the page object model methods
  await home.StartOrder(page);                                    // Click "Start Order"
  await home.PickLocation(page, '80246');                         // Select location via ZIP code

  //menu actions
  await MyMenu.SelectCategory(page, Menu_CetegoryLocators.Smashburgers); // Open Smashburgers category
  await MyMenu.SelectItem(page, Menu_ItemLocators.SMOKED_BRISKET_BACON_SMASH); // Select a burger item
  const item1 = await MyMenu.AddToOrder(page);                    // Add item to cart
  expectedItems.push(item1);                                      // Push item name to expectations list

  await MyMenu.ReturnToMenu(page);                                // Return to menu page
  await MyMenu.SelectCategory(page, Menu_CetegoryLocators.Chicken); // Navigate to Chicken category
  await MyMenu.SelectItem(page, Menu_ItemLocators.Crispy_Chicken_Sandwich); // Select chicken sandwich
  const item2 = await MyMenu.AddToOrder(page);                    // Add second item to cart
  expectedItems.push(item2);                                      // Track second item



  await page.getByRole('button', { name: 'Add OREO® COOKIES & CREAM SHAKE' }).click(); // Add shake from upsell modal
  //await page.waitForTimeout(1000); // wait for shake to be added NEEDs to be done by adding a selector check

  await MyMenu.ReturnToMenu(page);                                // Return to menu after adding shake


  //Cart actions
  await MyMenu.GoToCart(page);                                    // Navigate to cart page
  await page.waitForTimeout(2000);                                // Wait for cart UI to stabilize (can replace with selector wait)
  await page.screenshot({ path: '..Screenshots/page.png', fullPage: true }); // Capture full-page screenshot of cart



  await page.unrouteAll({ behavior: 'ignoreErrors' });            // Clear routes at end of test

});
