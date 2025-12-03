import { test, expect } from '@playwright/test';
import { CheckoutLocators } from '../Locators/Locators';    

export class Checkout {

    async VerifyCheckoutPageLoaded(page:any) {
        await expect(page).toHaveURL(/.*checkout/);
        await expect(page.getByRole('heading', { name: /CHECKOUT/i })).toBeVisible();
    }

    async FillCheckoutPersonalDetailsSignUp(page:any, Firstname:string ,Lastname:string, email:string, phone:string,PasswordInput:string) {
        await page.locator(CheckoutLocators.FirstNameInput).type(Firstname);
        await page.locator(CheckoutLocators.LastNameInput).type(Lastname);
        await page.locator(CheckoutLocators.EmailInput).type(email, { delay: 50 });

        const actualValue = await page.locator(CheckoutLocators.EmailInput).inputValue();
        console.log("EMAIL FIELD VALUE:", actualValue);
        await page.locator(CheckoutLocators.PhoneInput).type(phone);
        await page.locator(CheckoutLocators.PasswordInput).type(PasswordInput);
    }
    async FillCheckoutPaymentDetails(page:any, CardNumber:string, ExpirationDate:string, CVV:string, ZipCode:string) {
    
        //await page.locator(CheckoutLocators.CreditCradSelection).click();
        await page.getByRole('radio', { name: /CREDIT CARD/i }).click();

        // 2️ Wait for iframe to appear
    await page.waitForSelector('#hpc--card-frame', {
        state: 'attached',
        timeout: 15000
    });

    // 3️ Access the frame
    const cardFrame = page.frameLocator('#hpc--card-frame');

    // 4️ Fill Card Number
    await cardFrame.getByRole('textbox', { name: 'Card Number' }).fill(CardNumber);

    // 5️ Fill Expiration Date
    await cardFrame.getByRole('textbox', { name: 'Expiration Date' }).fill(ExpirationDate);

    // 6️ Fill Security Code
    await cardFrame.getByRole('textbox', { name: 'Security Code' }).fill(CVV);

    // 7️ Fill Postal Code
    await cardFrame.getByRole('textbox', { name: 'Postal Code' }).fill(ZipCode);

    // 8️ Confirm payment
    await page.getByRole('button', { name: 'Confirm' }).click();

    }

    async SignInDuringCheckout(page:any, email:string, password:string) {
        //await page.locator('#CheckoutForm').getByRole('link', { name: /SIGN IN/i }).click();
        await page.locator('//*[@id="CheckoutForm"]/div[3]/div[1]/a').click();
        await expect(page).toHaveURL(/.*sign-in/);
        await expect(page.getByRole('heading', { name: /SIGN IN/i })).toBeVisible();
        await page.locator('//*[@id="UserName"]').type(email, { delay: 50 });
        await page.locator('//*[@id="Password"]').fill(password);
        await page.getByRole('button', { name: /SIGN IN/i }).click();
        //await expect(page).not.toHaveURL(/.*sign-in/);
    }



    async VerifyCardEnteredCorrectly(page:any) {

    // 1️ If iframe STILL EXISTS → card entry FAILED
    const iframeStillVisible = await page.locator('#hpc--card-frame').isVisible();
    if (iframeStillVisible) {
        throw new Error(" Credit card frame is still visible — card entry failed.");
    }

    // 2️ Check if a card brand is shown (Visa, Mastercard, etc.)
    const cardBrandLocator = page.getByText(/Visa|Mastercard|Amex|Discover|Card Ending/i);

    if (await cardBrandLocator.isVisible()) {
        console.log(" Card entry successful — card brand displayed.");
        return;
    }
    }

    async PlaceOrder(page:any) {
        await page.getByRole('button', { name: /PLACE ORDER/i }).click();
        //await expect(page).not.toHaveURL(/.*checkout/);
    }

    async CheckCheckoutErrors(page:any) {

    console.log("Checking for checkout errors...");

    const errors = page.locator('text=required, text=invalid, .error, [data-error]');
    const count = await errors.count();

    if (count > 0) {
        for (let i = 0; i < count; i++) {
            console.log("❌ Error found:", await errors.nth(i).innerText());
        }
    }

    // Check FreedomPay frame still visible
    if (await page.locator('#hpc--card-frame').isVisible()) {
        console.log("❌ Card iframe still visible → card not validated.");
    } else {
        console.log("✅ Card iframe disappeared → card validated.");
    }
}

async GetCheckoutItems(page: any) {
  const rows = page.locator(CheckoutLocators.CheckoutTableRows);
  const count = await rows.count();

  const names: string[] = [];
  const prices: number[] = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    //-- Name
    const name = await row.locator(CheckoutLocators.CheckoutItemName).innerText();
    names.push(name.trim());
    console.log("Checkout item name:", name.trim());

    //-- Price
    const priceText = await row.locator(CheckoutLocators.CheckoutItemPrice).innerText();
    const price = parseFloat(priceText.replace("$", "").trim());
    prices.push(price);
    console.log("Checkout item price:", price);
  }

  return { names, prices };
}
}