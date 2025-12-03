import { test, expect } from '@playwright/test';
import { CheckoutLocators } from '../Locators/Locators';

export class Checkout {

    async VerifyCheckoutPageLoaded(page: any) {
        await expect(page).toHaveURL(/.*checkout/);
        await expect(page.getByRole('heading', { name: /CHECKOUT/i })).toBeVisible();
    }

    async FillCheckoutPersonalDetailsSignUp(page: any, Firstname: string, Lastname: string, email: string, phone: string, PasswordInput: string) {
        await page.locator(CheckoutLocators.FirstNameInput).type(Firstname);
        await page.locator(CheckoutLocators.LastNameInput).type(Lastname);
        await page.locator(CheckoutLocators.EmailInput).type(email, { delay: 50 });

        const actualValue = await page.locator(CheckoutLocators.EmailInput).inputValue();
        console.log("EMAIL FIELD VALUE:", actualValue);
        await page.locator(CheckoutLocators.PhoneInput).type(phone);
        await page.locator(CheckoutLocators.PasswordInput).type(PasswordInput);
    }
    async FillCheckoutPaymentDetails(page: any, CardNumber: string, ExpirationDate: string, CVV: string, ZipCode: string) {

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


    async WaitForPaymentBoxToClose(page: any) {
        const frameSelector = '#hpc--card-frame';

        // Wait until the iframe disappears (meaning payment dialog closed)
        await page.waitForSelector(frameSelector, {
            state: 'detached',
            timeout: 10000
        });

        // Extra buffer to stabilize the UI
        await page.waitForTimeout(1000);
    }

    async SignInDuringCheckout(page: any, email: string, password: string) {
        //await page.locator('#CheckoutForm').getByRole('link', { name: /SIGN IN/i }).click();
        await page.locator('//*[@id="CheckoutForm"]/div[3]/div[1]/a').click();
        await expect(page).toHaveURL(/.*sign-in/);
        await expect(page.getByRole('heading', { name: /SIGN IN/i })).toBeVisible();
        await page.locator('//*[@id="UserName"]').type(email, { delay: 50 });
        await page.locator('//*[@id="Password"]').fill(password);
        await page.getByRole('button', { name: /SIGN IN/i }).click();
        //await expect(page).not.toHaveURL(/.*sign-in/);
    }



    async VerifyCardEnteredCorrectly(page: any) {

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

    async PlaceOrder(page: any) {
        await page.getByRole('button', { name: /PLACE ORDER/i }).click();
        //await expect(page).not.toHaveURL(/.*checkout/);
    }

    async WaitForOrderCompletion(page: any) {

        // 1️⃣ Wait until URL no longer contains /checkout
        await expect(page).not.toHaveURL(/checkout/, { timeout: 15000 });
        // 2️⃣ Wait until "Thank You" text is visible
        await expect(page.getByText('Thank You')).toBeVisible({ timeout: 10000 });

        // 3️⃣ Small buffer to stabilize (only 1 second)
        await page.waitForTimeout(1000);

        console.log(" Order placed successfully and confirmation page loaded.");
    }

    async CheckCheckoutErrors(page: any) {

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


    async verifyCheckoutAddress(page: any, city: string, zip: string) {

        // Correct and stable locator
        const addressLocator = page.locator('xpath=//*[@id="CheckoutForm"]/div[1]/address');

        // Ensure it's visible
        await expect(addressLocator).toBeVisible({ timeout: 10000 });

        // Read the text
        const addressText = (await addressLocator.innerText()).trim();
        console.log("Actual address text:", addressText);

        // Validate city
        if (!addressText.toLowerCase().includes(city.toLowerCase())) {
            throw new Error(
                `Address validation failed:\nExpected city "${city}"\nFound: "${addressText}"`
            );
        }

        // Validate ZIP
        if (!addressText.includes(zip)) {
            throw new Error(
                `Address validation failed:\nExpected zip "${zip}"\nFound: "${addressText}"`
            );
        }

        console.log(`✔ Address validated successfully! Found "${city}" and "${zip}" in:\n${addressText}`);
    }

    async getCheckoutItems(page: any) {
        const rows = page.locator(`xpath=${CheckoutLocators.CheckoutRows}`);
        const count = await rows.count();

        console.log("Checkout rows found:", count);

        const items: { name: string; price: number }[] = [];

        for (let i = 0; i < count; i++) {
            const row = rows.nth(i);

            // Item name
            const name = await row.locator(`xpath=${CheckoutLocators.CheckoutItemName}`).innerText();

            // Item price
            const priceText = await row.locator(`xpath=${CheckoutLocators.CheckoutItemPrice}`).innerText();
            const price = parseFloat(priceText.replace('$', '').trim());

            items.push({ name: name.trim(), price });
        }

        return items;
    }

    async verifyCheckoutItems(
        page: any,
        expectedNames: string[],
        expectedPrices: number[]
    ) {
        const rows = page.locator('xpath=//*[@id="CheckoutForm"]/div[4]/table/tbody/tr');
        const count = await rows.count();

        console.log("Checkout rows found:", count);

        if (count !== expectedNames.length) {
            throw new Error(
                `Item count mismatch.\nExpected ${expectedNames.length} items\nFound ${count}`
            );
        }

        for (let i = 0; i < count; i++) {
            const row = rows.nth(i);

            // --- Item Name ---
            const nameLocator = row.locator('xpath=.//td[2]');
            const nameText = (await nameLocator.innerText()).trim();

            if (!nameText.includes(expectedNames[i])) {
                throw new Error(
                    `Item name mismatch at row ${i + 1}\nExpected: "${expectedNames[i]}"\nFound: "${nameText}"`
                );
            }

            // --- Item Price ---
            const priceLocator = row.locator('xpath=.//td[3]');
            const priceText = (await priceLocator.innerText()).trim();
            const price = parseFloat(priceText.replace('$', ''));

            if (price !== expectedPrices[i]) {
                throw new Error(
                    `Price mismatch at row ${i + 1}\nExpected: ${expectedPrices[i]}\nFound: ${price}`
                );
            }

            console.log(`✔ Item ${i + 1} OK → ${nameText} | $${price}`);
        }

        console.log("✔ All checkout items match the cart values!");
    }


    async WaitForInvalidCardError(page: any) {
        // 1. Ensure iframe is attached
        await page.waitForSelector('#hpc--card-frame', {
            timeout: 15000
        });

        // 2. Switch into the iframe
        const cardFrame = page.frameLocator('#hpc--card-frame');

        // 3. Locate the error message inside the iframe
        const errorMessage = cardFrame.locator(CheckoutLocators.CardErrorMessage);

        // 4. Wait for it to appear
        await expect(errorMessage).toBeVisible({
            timeout: 10000
        });

        // 5. Get error text (optional but helpful for debugging)
        const text = await errorMessage.innerText();
        console.log("❌ Card Error Message Shown:", text);
    }



}