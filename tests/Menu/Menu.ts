import { test, expect } from '@playwright/test';
import { Test_Data } from '../Test_Data/Test_Data';
import { Menu_CetegoryLocators, MenuLocators } from '../Locators/Locators';
import { Menu_ItemLocators } from '../Locators/Locators';
import { time } from 'console';


export class Menu {
  async SelectCategory(page: any, category: string) {

    await page.locator(category).click();

  }
  async SelectItem(page: any, item: string) {

    await page.locator(item).click();
    const BurgerNameLocatorInMenu = page.locator('//*[@id="__next"]/div[2]/main/div[2]/div/div/form/div[1]/div[1]/h1');
    const BurgerNameChoosen = await BurgerNameLocatorInMenu.innerText();

  }

  async AddToOrder(page: any): Promise<string> {

    const nameLocator = await page.locator('//*[@id="__next"]/div[2]/main/div[2]/div/div/form/div[1]/div[1]/h1');
    const ADD_TO_ORDER_BUTTON: any = '//*[@id="__next"]/div[2]/main/div[2]/div/div/form/div[2]/div/button';
    const itemName = await nameLocator.innerText();
    await page.locator(ADD_TO_ORDER_BUTTON).click();
    return itemName;

  }

  async ReturnToMenu(page: any) {
    await page.getByRole('link', { name: /RETURN TO MENU/i }).click();
  }

  async ProceedToCheckout(page: any) {

    await page.getByRole('link', { name: /PROCEED TO CHECKOUT/i }).click();
  }

  //check the price from menu item 
  async CalculatePrice(page: any): Promise<number> {
    const ItemPriceLocator = page.locator(MenuLocators.MenuItemPriceLocator);
    const ItemPriceText = await ItemPriceLocator.innerText();
    Test_Data.ItemPrice = parseFloat(ItemPriceText.replace('$', ''));
    Test_Data.TotalPrice += Test_Data.ItemPrice;
    console.log('Item Price is: ' + Test_Data.ItemPrice);
    return Test_Data.ItemPrice;

  }

  async GoToCart(page: any) {
    await page.locator('//*[@id="__next"]/div[2]/header/nav/div/a[3]').click();//cart icon

  }

  async IncreaseItemQuantity(page: any, times: number): Promise<number> {
    const ItemsQuantity = times + 1;
    for (let i = 0; i < times; i++) {
      await page.getByRole('button', { name: 'Increase' }).click();
    }
    return ItemsQuantity;
  }



}
