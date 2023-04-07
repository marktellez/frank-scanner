const categories = {
  "Agriculture And Food Supply": [
    "Agriculture",
    "Food Processing And Services",
    "Life Sciences",
    "Agriculture Other",
  ],
  "Natural Resources And Energy": [
    "Mining",
    "Oil",
    "Gas",
    "Utilities",
    "Clean Energy",
  ],
  "Commercial Re And Construction": [
    "Commercial ReDevelopers",
    "Building Materials",
    "Landlords",
    "Cre Engineering",
  ],
  "Manufacturing And Product Goods": [
    "Materials",
    "Chemicals",
    "Pharmaceutical",
    "Machinery",
    "Automotive",
    "Medical Equipment And Supplies",
    "Electronics And Computers",
    "Printing And Related Activities",
    "Construction Materials",
  ],
  "Medical And Senior Living": [
    "Hospitals",
    "Patient Care",
    "Assisted Living",
    "Retirement Facilities",
    "Health Sciences",
    "Medical Technology",
  ],
  "Transportation And Distribution": [
    "Warehousing",
    "Distribution",
    "Shipping Ports",
    "Transportation",
    "Aviation",
    "Maritime And Sea",
  ],
  "Hospitalty, Recreation And Spirits": [
    "Hospitality",
    "Recreation",
    "Tourism",
    "Spirit Manufacturing",
    "Wine And Vineyards",
  ],
  "Aerospace And Defense": ["Aerospace", "Defense"],
  "Consumer Goods": ["Retail"],
  "Information And CommunicationTechnology": [
    "Information Technology",
    "Telecommunication",
    "Communication Technology",
    "Software",
  ],
  "Asset Light Sectors": [
    "Arts Media And Entertainment",
    "Child Care",
    "Family Services",
    "Professional Services",
    "Marketing",
    "Insurance",
    "Media And Design",
    "Sales",
    "Staffing",
    "Health And Wellness",
  ],
  "Community Facilites": [
    "Community Centers",
    "Childcare Centers",
    "Educational Facilities",
  ],
  NonMarketable: [
    "Business And Finance",
    "Government Related",
    "Non Profit",
    "Libraries",
    "Museum",
    "Lending And Venture Capital",
    "Public Services",
  ],
};

const puppeteer = require("puppeteer");
const { LanguageServiceClient } = require("@google-cloud/language");

(async () => {
  async function classifyWebsite(url) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      executablePath: "/usr/bin/chromium-browser",
    });

    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle2" }); // Wait for the page to fully load

      // Extract the text content from the rendered page
      const textContent = await page.evaluate(() => {
        return document.querySelector("body").innerText;
      });

      // Classify the text content using Google Cloud Natural Language API
      const languageClient = new LanguageServiceClient();
      const [classification] = await languageClient.classifyText({
        document: { content: textContent, type: "PLAIN_TEXT" },
      });
      const categories = classification.categories.map(
        (category) => category.name
      );

      await browser.close();

      const matchedCategories = Object.entries(categories).reduce(
        (acc, [parentCategory, subcategories]) => {
          const matchedSubcategories = subcategories.filter((subcategory) =>
            categories.includes(subcategory)
          );
          if (matchedSubcategories.length > 0) {
            acc.push(parentCategory);
            acc.push(...matchedSubcategories);
          }
          return acc;
        },
        []
      );

      return matchedCategories;
    } catch (err) {
      console.error(err);
      await browser.close();
      return [];
    }
  }

  classifyWebsite("https://www.localfoodandfarm.coop/")
    .then((categories) => {
      console.log(categories);
    })
    .catch((err) => {
      console.error(err);
    });
})();
