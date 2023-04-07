const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// Set up options for ChromeDriver
const options = new chrome.Options();
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");

// Set up the driver
const driver = new webdriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .build();

// Navigate to the site
driver.get("https://www.loblaws.ca/");

// Wait for the "Shop Now" button to appear
const button = driver.wait(
  webdriver.until.elementLocated(webdriver.By.css("span.element-cta__text")),
  10000
);

// Log the button text to the console
button.getText().then((text) => {
  console.log(text);
});

// Quit the driver
driver.quit();
