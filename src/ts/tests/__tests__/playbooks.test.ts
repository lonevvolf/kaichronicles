
/////////////////////////////////////////////////////////////////////////////////
// Setup
/////////////////////////////////////////////////////////////////////////////////

import { state, Book, projectAon, CombatMechanics } from "../..";
import { GameDriver } from "../gameDriver";
import { By } from "selenium-webdriver";

interface SectionConf {
    [bookId: number]: {
        [sectionId: string]: {
            money ?: number,
            equipment ?: string[]
        }
    }
}

GameDriver.globalSetup();

// To debug I add "sleeps", so increase the timeout
jest.setTimeout(30000);

// Selenium web driver
const driver: GameDriver = new GameDriver();

// Configuration for sections
const sectionsConfiguration: SectionConf = {
    3: {
        "sect152": {
            money: 10
        }
    },

    12: {
        "sect88": {
            equipment: [ "daggerofvashna" ]
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////
// Tests
/////////////////////////////////////////////////////////////////////////////////

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

async function noLogErrors() {
    expect( await driver.getLogErrors() ).toHaveLength(0);
}

async function noRandomTableErrors() {
    // TODO: This only tests the unconditional random tables, with no combinations between them

    if ( state.sectionStates.currentSection === Book.GAMERULZ_SECTION ) {
        // Don't run this test in this section. There is a sample link in '..old text like this "Some text" into the book..'
        // that do not respond to click, and this is ok
        return;
    }

    let done = false;
    let randomNumber = 0;
    while (!done) {
        let randomClicked = false;

        // Do meals before click any link: If not, an alert with "do meals first" will appear
        await doMeals();

        // Traverse clickable random table links
        for (const link of await driver.getElementsByCss(GameDriver.RANDOM_SELECTOR)) {
            if (await GameDriver.isClickable(link)) {
                await driver.setNextRandomValue(randomNumber);
                await driver.cleanClickAndWait(link);
                randomClicked = true;
            }
        }
        randomNumber++;
        if (!randomClicked || randomNumber >= 10) {
            done = true;
        } else {
            // Reload the section to test the next number
            await driver.loadCleanSection(state.sectionStates.currentSection, false);
            await configureCurrentSection();
        }
    }

    await noLogErrors();
}

async function noCombatErrorsWithElude(elude: boolean) {
    // Clean rendering messages
    await driver.cleanLog();

    const eludeButtons = elude ? await driver.getElementsByCss(CombatMechanics.ELUDE_BTN_SELECTOR) : null;

    for (const playTurnButton of await driver.getElementsByCss(CombatMechanics.PLAY_TURN_BTN_SELECTOR)) {
        while (await GameDriver.isClickable(playTurnButton)) {

            if (elude) {
                let eluded = false;
                // Check if there is any elude button visible
                for (const eludeButton of eludeButtons) {
                    if (await GameDriver.isClickable(eludeButton)) {
                        await driver.setNextRandomValue(0);
                        await driver.cleanClickAndWait(eludeButton);
                        eluded = true;
                        break;
                    }
                }
                if (eluded) {
                    break;
                }
            }

            // Play next turn
            await driver.setNextRandomValue(0);
            await driver.cleanClickAndWait(playTurnButton);
        }
    }
    await noLogErrors();
}

async function noCombatErrors() {
    await noCombatErrorsWithElude(false);
    await noCombatErrorsWithElude(true);
}

async function doMeals() {
    let meal = await driver.getElementByCss("div.mechanics-meal-ui");
    while (meal) {
        // Select do not eat
        await ( await meal.findElement(By.css("input[value='doNotEat']")) ).click();
        // Click ok
        await driver.cleanClickAndWait( meal.findElement(By.css("button")) );

        meal = await driver.getElementByCss("div.mechanics-meal-ui");
    }
}

async function noMealErrors() {
    // TODO: This only tests do not eat option
    await doMeals();
    await noLogErrors();
}

async function configureCurrentSection() {
    const bookCfg = sectionsConfiguration[state.book.bookNumber];
    if (!bookCfg) {
        return;
    }

    const sectionCfg = bookCfg[state.sectionStates.currentSection];
    if (!sectionCfg) {
        return;
    }

    if (sectionCfg.money) {
        await driver.increaseMoney(sectionCfg.money);
    }
    if (sectionCfg.equipment) {
        for (const objectId of sectionCfg.equipment) {
            await driver.pick(objectId);
        }
        await driver.fireInventoryEvents();
    }
}

async function prepareSectionTest(sectionId: string) {
    await driver.loadCleanSection(sectionId);
    await configureCurrentSection();
}

/////////////////////////////////////////////////////////////////////////////////
// Tests declaration
/////////////////////////////////////////////////////////////////////////////////

function declareSectionTests(sectionId: string) {
    describe(sectionId, () => {

        // Clean book state before each section test
        beforeEach( async () => { await prepareSectionTest(sectionId); });

        // Test there are no errors with initial section rendering
        test("No errors rendering section", noLogErrors );

        test("No errors playing combats", noCombatErrors );

        test("No errors choosing Random Table", noRandomTableErrors );

        test("No errors on meals", noMealErrors );
    });
}

function declarePlayBookTests(book: Book) {

    // jest runs out of memory if the closure references the book variable. So I'll use these instead:
    const bookNumber = book.bookNumber;
    const bookCode = book.getProjectAonBookCode();

    let sectionIds: string[];
    if (process.env.npm_config_kaisect) {
        sectionIds = [ process.env.npm_config_kaisect ];
    } else {
        sectionIds = book.getSectionsIds();
    }

    describe(bookCode, () => {

        // Load book state
        beforeAll( async () => {
            await driver.setupBookState(bookNumber);
        });

        // Declare section tests
        for (const sId of sectionIds) {
            declareSectionTests(sId);
        }
    });
}

let bookNumberToTest: number = 0;

// Test single book?
if (process.env.npm_config_kaibook) {
    bookNumberToTest = parseInt(process.env.npm_config_kaibook, 10);
    console.log("Just book " + bookNumberToTest.toFixed());
}

// Traverse books
for (let i = 0 ; i < projectAon.supportedBooks.length ; i++) {
    if (bookNumberToTest && (i + 1) !== bookNumberToTest) {
        continue;
    }

    if (process.env.KAILANG && process.env.KAILANG !== "en") {
        continue;
    }

    // Setup tests for this book
    driver.loadBookState(i + 1);
    declarePlayBookTests(state.book);
}
