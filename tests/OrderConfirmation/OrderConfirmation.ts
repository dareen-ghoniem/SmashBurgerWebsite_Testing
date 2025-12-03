import { expect } from '@playwright/test';
import { OrderConfirmationLocators } from '../Locators/Locators';

export class OrderConfirmation {
    async OrderPlacedSuccessfully(page:any) {
    await expect(page.getByText('Thank You')).toBeVisible();
  }
  
    async VerifyLocationContains(page: any, expectedWord: string) {

    const locationLocator = page.locator(
        '//*[@id="__next"]//main//*[contains(text(), "CO") or contains(text(), "CO ")]'
    ).first();

    await expect(locationLocator).toBeVisible({ timeout: 7000 });

    const text = await locationLocator.innerText();

    console.log("Order Confirmation Location:", text);

    expect(text.toLowerCase()).toContain(expectedWord.toLowerCase());
}
}
