SmashBurger Website – Playwright Automation Framework
>> End-to-End UI Test Automation

This repository contains a complete Playwright + TypeScript automation framework for the SmashBurger Website, including:

✔ Page Object Model (POM)
✔ Data-Driven Tests (DDT)
✔ Dynamic waits + intercepts
✔ Full checkout flow validation
✔ Cart behavior tests
✔ Payment iframe handling
✔ Mocked API response tests

**Project Structure:**
tests/
│
├── Home/
│   └── Home.ts
├── Menu/
│   └── Menu.ts
├── Cart/
│   └── Cart.ts
├── Checkout/
│   └── Checkout.ts
├── OrderConfirmation/
│   └── OrderConfirmation.ts
│
├── Fixtures.ts      
├── Test1.spec.ts           
├── Test2.spec.ts      
├── Test3.spec.ts          
├── Test4.spec.ts            
├── Test5.spec.ts           
├── Test6.spec.ts             
├── Test7.spec.ts             
├── Mocks/
│   └── BurgerPictureMockUp.spec.ts

**Note:**
At the beginning of the project (inside Test_Data.ts), you will find the global TestTimeOut configuration.
This parameter controls the default timeout for all test cases, and is currently set to:
TestTimeOut = 60000; // 60 seconds
- This ensures a high test passing rate by:
- Allowing enough time for backend and frontend delays
- Avoiding implicit timeouts
- Ensuring cart item checks, dynamic price updates, and payment iframe loads proceed without failures
- Making tests rely fully on system execution time rather than arbitrary waiting
- You can freely modify this value to increase or decrease the global timeout for the entire test suite
- and running them all in parllel is dependant on laptop performance which may vary from one environment to another


Upcomming steps is for an installed Playwright extension on VS code:

- In git bash in VS: git clone https://github.com/dareen-ghoniem/SmashBurgerWebsite_Testing.git
  Or download ZIP and extract it.
  
- File → Open Folder
  Select:
  SmashBurgerWebsite_Testing/
  
- Run All Tests in parallel paste in cmd:
  npx playwright test
  
- Run Specific Test File paste in cmd:
  npx playwright test tests/Test1.spec.ts
  npx playwright test tests/Mocks/BurgerPictureMockUp.spec.ts
  
- Run Test in Headed Mode:
  npx playwright test --headed

- To Use 4 workers:
  npx playwright test --workers=4

