import { GameDriver } from "../gameDriver";
import { BookSeries, CurrencyName } from "../..";

// Selenium web driver
const driver: GameDriver = new GameDriver();

GameDriver.globalSetup();

jest.setTimeout(100000);

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

describe("currency", () => {
    beforeEach( async () => {
        await driver.setupBookState(1);
        BookSeries.getBookNumberSeries(1);
    });

    test("Drop all coins", testDropAllCoins);
    test("Drop partial crowns", testDropPartialCrowns);
    test("Text Belt Pouch capacity", testMaxCapacity);
});

async function testDropAllCoins() {
    await driver.goToSection("sect1");

    // Test dropping all coins for various belt pouches
    await driver.increaseMoney(50);
    let actionChart = await driver.getActionChart();

    expect( actionChart.beltPouch[CurrencyName.CROWN]).toBe(50); 
    await driver.increaseMoney(-50);
    actionChart = await driver.getActionChart();
    expect( actionChart.beltPouch[CurrencyName.CROWN]).toBe(0);
    expect( actionChart.getBeltPouchUsedAmount() ).toBe(0);

    // Add 40 GC total
    await driver.increaseMoney(5, CurrencyName.CROWN);
    await driver.increaseMoney(20, CurrencyName.LUNE);
    await driver.increaseMoney(50, CurrencyName.KIKA);
    await driver.increaseMoney(5, CurrencyName.NOBLE);
    await driver.increaseMoney(50, CurrencyName.REN);
    await driver.increaseMoney(20, CurrencyName.SHEASUTORQ);
    await driver.increaseMoney(10, CurrencyName.ORLA);
    await driver.increaseMoney(5, CurrencyName.AIN);

    actionChart = await driver.getActionChart();
    expect( actionChart.getBeltPouchUsedAmount(false) ).toBe(40);

    await driver.increaseMoney(-30);
    actionChart = await driver.getActionChart();
    expect( actionChart.beltPouch[CurrencyName.CROWN] ).toBe(0);
    expect( actionChart.beltPouch[CurrencyName.LUNE] ).toBe(0);
    expect( actionChart.beltPouch[CurrencyName.KIKA] ).toBe(0);
    expect( actionChart.beltPouch[CurrencyName.NOBLE] ).toBe(0);
    expect( actionChart.beltPouch[CurrencyName.REN] ).toBe(0);
    expect( actionChart.beltPouch[CurrencyName.SHEASUTORQ] ).toBe(0);
    expect( actionChart.beltPouch[CurrencyName.ORLA] ).toBe(10);
    expect( actionChart.beltPouch[CurrencyName.AIN] ).toBe(5);

    await driver.increaseMoney(-10);
    actionChart = await driver.getActionChart();
    expect( actionChart.getBeltPouchUsedAmount(false) ).toBe(0);
}

async function testDropPartialCrowns() {
    await driver.goToSection("sect1");

    // Test dropping all coins for various belt pouches
    await driver.increaseMoney(6, CurrencyName.LUNE);
    let actionChart = await driver.getActionChart();

    expect( actionChart.getBeltPouchUsedAmount(false) ).toBe(1.5);
    expect( actionChart.getBeltPouchUsedAmount() ).toBe(1);

    await driver.increaseMoney(-1);
    actionChart = await driver.getActionChart();
    expect( actionChart.getBeltPouchUsedAmount(false) ).toBe(0.5);
    expect( actionChart.getBeltPouchUsedAmount() ).toBe(0);
}

async function testMaxCapacity() {
    await driver.goToSection("sect1");

    // Test dropping all coins for various belt pouches
    await driver.increaseMoney(50);
    await driver.increaseMoney(1, CurrencyName.REN);
    const actionChart = await driver.getActionChart();

    expect( actionChart.getBeltPouchUsedAmount(false) ).toBe(50);

}
