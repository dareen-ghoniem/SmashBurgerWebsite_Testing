import { test, expect } from '@playwright/test';
import { Test_Data } from '../Test_Data/Test_Data';
import { CartLocators } from '../Locators/Locators';

export class Cart {



  async VerifyCart(page: any, expectedItems: string[]) {
    const cartRows = page.locator(
      '//tbody/tr'
    );
    //const tbodyHTML = await page.locator('//*[@id="__next"]/div[2]/main/div[2]/table/tbody').innerHTML();

    // console.log("TBODY HTML:\n", tbodyHTML);

    const rowCount = await cartRows.count();

    const actualItems: string[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = cartRows.nth(i);
      const nameInCart = await row.locator('th').innerText(); // Assuming name is in <th>

      // locator for item name inside a specific row
      /*const itemNameLocator = cartRows
       .nth(i)
       .locator('.//th/div/div[1]');*/

      // extract text
      //const itemName = await itemNameLocator.innerText();
      console.log('Found item in cart: ' + nameInCart.trim());

      actualItems.push(nameInCart.trim());
    }

    // Assert lists match
    expect(actualItems).toEqual(expectedItems);

    console.log('Cart items verified successfully. Items in cart: ' + actualItems.join(', '));
    console.log('Expected items: ' + expectedItems.join(', '));
  }

  async VerifyTotalPrice(page: any, TotalPrice: number) {
    const TotalPriceLocator = page.locator('//*[@id="__next"]/div[2]/main/div[2]/div[2]/div[3]/div/dl/div[1]/dd');
    const TotalPriceText = await TotalPriceLocator.innerText();
    console.log('Total Price in Cart is: ' + TotalPriceText);
    const TotalPriceInCart = parseFloat(TotalPriceText.replace('$', ''));
    console.log('Total Price in Cart is: ' + TotalPriceInCart);
    expect(TotalPriceInCart).toBeCloseTo(TotalPrice, 2);

  }

  async Checkout(page: any) {
    await page.getByRole('link', { name: /CHECKOUT/i }).click();
    await expect(page).not.toHaveURL('https://dev.smashburger.com/cart');

  }

  async RemoveItemFromCart(page: any, itemName: string) { }

  async VerifySubTotalPriceInCart(page: any, expectedSubTotal: number) {
    const SubTotalLocator = page.locator(CartLocators.subTotalPriceLocatorCart);
    const SubTotalText = await SubTotalLocator.innerText();
    console.log('SubTotal Price in Cart is: ' + SubTotalText);
    const SubTotalInCart = parseFloat(SubTotalText.replace('$', ''));
    console.log('SubTotal Price in Cart is: ' + SubTotalInCart);
    expect(SubTotalInCart).toBeCloseTo(expectedSubTotal, 2);
  }
  async GetCartItems(page: any) {
     const rows = page.locator(CartLocators.CartTableRows);
  const count = await rows.count();

  const names: string[] = [];
  const prices: number[] = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    const name = await row.locator(CartLocators.CartItemName).innerText();
    names.push(name.trim());
    console.log('Cart item name: ' + name.trim());

    const priceText = await row.locator(CartLocators.CartItemPrice).innerText();
    const price = parseFloat(priceText.replace('$', '').trim());
    prices.push(price);
    console.log('Cart item price: ' + price);
  }

  return { names, prices };
}
  }