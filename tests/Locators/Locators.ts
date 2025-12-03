export const HomeLocators = {

}

export const Menu_CetegoryLocators = {
    Smashburgers: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[1]/a/img',
    AllAngusBigDogs: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[2]/a/img',
    AllTheTimeMenu: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[3]/a/img',
    Chicken: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[4]/a/img',
    MealDeals: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[5]/a/img',
    Salads: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[6]/a/img',
    Sides: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[7]/a/img',
    KidsMeals: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[8]/a/img',
    HandSpunShakes: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[9]/a/img',
    Beverages: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[10]/a/img',
    CreateYourOwn: '//*[@id="__next"]/div[2]/main/div/div[2]/ul/li[11]/a/img',

}

export const Menu_ItemLocators = {
    SMOKED_BRISKET_BACON_SMASH: '//*[@id="__next"]/div[2]/main/div[2]/ul/li[3]/a/img',
    //chicken items
    Crispy_Chicken_Sandwich: '//*[@id="__next"]/div[2]/main/div[2]/ul/li[1]/a/img',
    Scorchin_Hot_Crispy_Chicken_Sandwich: '//*[@id="__next"]/div[2]/main/div[2]/ul/li[2]/a/img',
    Double_Chicken_Smash_Burger: '//*[@id="__next"]/div[2]/main/div[2]/ul/li[3]/a/img',
    Chicken_Smash_Burger: '//*[@id="__next"]/div[2]/main/div[2]/ul/li[4]/a/img',
    //Creare your own
    Create_Your_Own_Burger: '//*[@id="__next"]/div[2]/main/div[2]/ul/li[1]/a/img',


}
export const MenuLocators = {
    MenuItemPriceLocator: '//*[@id="__next"]/div[2]/main/div[2]/div/div/form/div[1]/div[1]/span/strong',
}

export const CartLocators = {
    BagPrice: 0.1,
    TaxPercentage: 0.072,
    subTotalPriceLocatorCart: '//dt[normalize-space()="Subtotal"]/following-sibling::dd',
    CartTableRows: 'xpath=//main//table/tbody/tr',
    CartItemName: 'xpath=.//th//div[contains(@class, "font-bold")]',
    CartItemPrice: 'xpath=.//td//span[contains(@class, "font-bold")]'


}

export const CheckoutLocators = {
    FirstNameInput: '//*[@id="ContactFirstName"]',
    LastNameInput: '//*[@id="ContactLastName"]',
    EmailInput: '//*[@id="ContactEmail"]',
    PhoneInput: '//*[@id="ContactNumber"]',
    PasswordInput: '//*[@id="AccountPassword"]',
    CreditCradSelection: '//*[@id="headlessui-label-:r48:"]',
    CardNumberInput: '//*[@id="CardNumber"]',
    ExpirationDateInput: '//*[@id="ExpirationDate"]',
    CVVInput: '//*[@id="SecurityCode"]',
    PostalCodeInput: '//*[@id="PostalCode"]',
    confirmInput: '//*[@id="headlessui-dialog-panel-:r1p:"]/div[3]/button[1]',
    CloseButton: '//*[@id="headlessui-dialog-panel-:r1p:"]/div[3]/button[2]',
    CardErrorMessage: '//*[@id="cardNumber-error-msg"]',
    VisaReflected: '//*[@id="headlessui-label-:r1j:"]/div/span[1]',
    SubTotalLocator: '//*[@id="__next"]/div[2]/main/div[2]/div[2]/div/dl/div[1]/dd',
    TotalPriceAtCheckoutLocator: '//*[@id="__next"]/div[2]/main/div[2]/div[2]/div/dl/div[4]/dd',
    SignInPasswordInput: '//*[@id="Password"]',
    SignInEmailInput: '//*[@id="UserName"]',
    OrderSummaryRoot: 'getByTestId("page-checkout:order-summary")',
    CheckoutTableRows: 'xpath=//div[@data-testid="page-checkout-order-summary"]//table//tbody/tr',
    CheckoutItemName: 'xpath=.//td[contains(@class, "h5") and contains(@class, "block")]',
    CheckoutItemPrice: 'xpath=.//td[contains(@class, "block") and contains(@class,"px-2")]'
}




export const OrderConfirmationLocators = {
    PickupFromExpandButton: '//*[@id="headlessui-disclosure-button-:r24:"]/svg',
    PickUpLocationDetails: '//*[@id="headlessui-disclosure-panel-:r25:"]/address',
    OrderSummaryExpandButton: '//*[@id="headlessui-disclosure-button-:r26:"]/svg',
    OrderSummarySubTotal: '//*[@id="headlessui-disclosure-panel-:r27:"]/dl/div/div[1]/dd',
    OrderSummaryTotal: '//*[@id="headlessui-disclosure-panel-:r27:"]/dl/div/div[4]/dd',

}

