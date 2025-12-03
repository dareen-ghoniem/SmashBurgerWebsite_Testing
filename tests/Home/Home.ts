import { test, expect } from '@playwright/test';

export class Home {
  async StartOrder(page: any) {
    await page.getByRole('banner').getByRole('link', { name: 'Order Now' }).click();
    await expect(page).not.toHaveURL('https://dev.smashburger.com/');


  }
  async PickLocation(page: any, location: any) {

    await expect(page.getByRole('heading', { name: 'Find a Location' })).toBeVisible();
    await page.getByRole('combobox').click();
    await page.getByRole('combobox', { name: 'Search' }).fill(location);
    //await page.getByRole('listbox').selectOption({ label: 'Search for "80246"' });
    await page.getByRole('option', { name: /Search for/i }).click();
    await page.getByRole('button', { name: 'SEARCH' }).click();
    await page.getByRole('button', { name: /START ORDER AT THE GLENDALE, CO LOCATION/i }).click();
    await expect(page.getByRole('heading', { name: /Smashburger MENU/i })).toBeVisible();

  }

}
