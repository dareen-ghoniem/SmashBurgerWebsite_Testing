import { test, expect } from '@playwright/test';
import { Test_Data } from '../Test_Data/Test_Data';
import { CartLocators } from '../Locators/Locators';

export class Cart {



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

  async WaitForPriceUpdate(page: any) {
    const SubTotalLocator = page.locator(CartLocators.subTotalPriceLocatorCart);
    await expect(SubTotalLocator).toHaveText(/^\$\d+(\.\d{2})?$/, { timeout: 10000 });//wait for subtotal to be updated
  }

  async GetItemPriceInCart(page: any, itemName: string): Promise<number> {
    const row = page.locator('table tr').filter({
      has: page.getByText(new RegExp(itemName, "i"))
    }).first();

    const priceText = await row.locator(CartLocators.CartItemPrice).innerText();
    return parseFloat(priceText.replace('$', '').trim());
  }


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


  async DecreaseItemQuantity(page: any, itemName: string, times: number) {
    // Locate the cart row by matching the product name inside the row.
    const itemRow = page.locator('table tr').filter({
      has: page.getByText(new RegExp(itemName, "i"))
    });

    const rowCount = await itemRow.count();
    if (rowCount === 0) {
      throw new Error(`No cart item found with name containing: "${itemName}"`);
    }

    // Use the first matching row
    const row = itemRow.first();

    // Click decrease button multiple times
    for (let i = 0; i < times; i++) {
      await row.getByRole('button', { name: 'Decrease' }).click();
    }
  }
}