import { GameDriver } from "../gameDriver";
import { KaiDiscipline, MgnDiscipline, GndDiscipline } from "../../model/disciplinesDefinitions";
import { Book, Item } from "../..";

// Selenium web driver
const driver: GameDriver = new GameDriver();

GameDriver.globalSetup();

jest.setTimeout(2000000);

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

describe("combat", () => {

    test("noMindblast", async () => {
        await driver.setupBookState(1);
        await driver.setDisciplines( [ KaiDiscipline.Mindblast]  );
        await driver.goToSection("sect133");
        expect( await driver.getCombatRatio() ).toBe(-5);
    });

    test("noPsiSurge", async () => {
        await driver.setupBookState(6);
        await driver.setDisciplines( [ MgnDiscipline.PsiSurge ] );
        await driver.goToSection("sect156");
        // No mindblast bonus:
        expect( await driver.getCombatRatio() ).toBe(-2);
        // No Psi-surge check available:
        expect( await (await driver.getSurgeCheckbox()).isDisplayed() ).toBe(false);
    });

    test("noKaiSurge", async () => {
        await driver.setupBookState(13);
        await driver.setDisciplines( [ GndDiscipline.KaiSurge ] );
        await driver.goToSection("sect56");
        // No mindblast bonus:
        expect( await driver.getCombatRatio() ).toBe(-6);
        // No Kai-surge check available:
        expect( await (await driver.getSurgeCheckbox()).isDisplayed() ).toBe(false);
    });

    test("maxEludeTurn", async () => {
        await driver.setupBookState(6);
        await driver.goToSection("sect116");

        // Expect to elude to be clickable in first turn
        const eludeBtn = await driver.getEludeCombatButton();
        expect(await GameDriver.isClickable(eludeBtn)).toBe(true);

        // Play turn
        await driver.setNextRandomValue(0);
        await driver.clickPlayCombatTurn();

        // Expect to elude to be not visible
        expect(await eludeBtn.isDisplayed()).toBe(false);
    });

    test("mindblastBonus", async () => {
        await driver.setupBookState(5);
        await driver.setDisciplines( [ KaiDiscipline.Mindblast ] );
        await driver.goToSection("sect110");

        expect( await driver.getCombatRatio() ).toBe(-4);
    });

    test("psiSurgeBonus", async () => {
        await driver.setupBookState(10);
        await driver.setDisciplines( [ MgnDiscipline.PsiSurge ] );
        await driver.goToSection("sect81");

        // Check use Kai Surge. Expect CS increase
        await driver.cleanClickAndWait( await driver.getSurgeCheckbox() );
        expect( await driver.getCombatRatio() ).toBe(-9);
    });

    test("kaiSurgeBonus", async () => {
        await driver.setupBookState(13);
        await driver.setDisciplines( [ GndDiscipline.KaiSurge ] );
        await driver.goToSection("sect301");

        // Check use Kai Surge. Expect CS increase
        await driver.cleanClickAndWait( await driver.getSurgeCheckbox() );
        expect( await driver.getCombatRatio() ).toBe(0);
    });

    test("eludeEnemyEP", async () => {
        await driver.setupBookState(13);
        await driver.pick("sommerswerd");
        await driver.goToSection("sect38");

        await driver.setNextRandomValue(0);
        await driver.clickPlayCombatTurn();

        for (let i = 0; i < 4 ; i++) {
            await driver.setNextRandomValue(0);
            await driver.clickPlayCombatTurn();
        }
        // Enemy EP here = 40

        await driver.setNextRandomValue(5);
        await driver.clickPlayCombatTurn();

        // EP = 37. Expect no elude allowed
        const eludeBtn = await driver.getEludeCombatButton();
        expect( await eludeBtn.isDisplayed() ).toBe(false);

        await driver.setNextRandomValue(3);
        await driver.clickPlayCombatTurn();

        // EP = 36. Expect elude allowed
        expect( await GameDriver.isClickable(eludeBtn) ).toBe(true);
    });

    test("combatSkillModifier", async () => {
        await driver.setupBookState(13);
        await driver.setDisciplines([]);
        await driver.goToSection("sect86");
        expect( await driver.getCombatRatio() ).toBe(-10);
    });

    test("combatSkillModifierIncrement", async () => {
        await driver.setupBookState(11);
        await driver.setDisciplines([MgnDiscipline.AnimalControl, MgnDiscipline.Curing, MgnDiscipline.Huntmastery]);
        await driver.pick("psychicring");
        await driver.pick("silverhelm");
        await driver.goToSection("sect270");
        expect( await driver.getCombatRatio() ).toBe(-5);
    });
});

// setDisciplines -> See setDisciplines.tests.ts

describe("test", () => {
    test("hasDiscipline", async () => {
        await driver.setupBookState(13);

        await driver.setDisciplines([]);
        await driver.goToSection("sect84");
        expect( await driver.choiceIsEnabled("sect7") ).toBe(false);
        expect( await driver.choiceIsEnabled("sect171") ).toBe(true);

        await driver.setDisciplines([GndDiscipline.AnimalMastery]);
        await driver.goToSection("sect84");
        expect( await driver.choiceIsEnabled("sect7") ).toBe(true);
        expect( await driver.choiceIsEnabled("sect171") ).toBe(false);
    });

    test("hasObject", async () => {
        await driver.setupBookState(13);
        await driver.pick("sommerswerd");
        await driver.goToSection("sect290");
        expect( await driver.choiceIsEnabled("sect199") ).toBe(true);
        expect( await driver.choiceIsEnabled("sect316") ).toBe(false);

        await driver.drop("sommerswerd", true);
        await driver.goToSection("sect290");
        expect( await driver.choiceIsEnabled("sect199") ).toBe(false);
        expect( await driver.choiceIsEnabled("sect316") ).toBe(true);

        // Pick object from section, expect allow to go to section right now
        await driver.pick("sommerswerd", true);
        expect( await driver.choiceIsEnabled("sect199") ).toBe(true);
        expect( await driver.choiceIsEnabled("sect316") ).toBe(false);
    });

    test("canUseBow", async () => {
        await driver.setupBookState(13);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);

        // Only bow, you cannot shoot
        await driver.pick(Item.BOW);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);

        // Bow and quiver, but no arrows, you cannot shoot
        await driver.pick(Item.QUIVER);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);

        await driver.increaseArrows(1);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(true);

        // If you pick the bow from the section, expect to shoot immediately
        await driver.drop(Item.BOW, true);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);
        await driver.pick(Item.BOW, true);
        expect( await driver.choiceIsEnabled("sect225") ).toBe(true);
    });
});

describe("expressions", () => {

    test("ENDURANCE", async () => {
        await driver.setupBookState(13);

        async function setup(endurance: number, randomValue: number) {
            await driver.loadCleanSection(Book.INITIAL_SECTION);
            await driver.setDisciplines([]);
            await driver.setEndurance(endurance);
            await driver.goToSection("sect91");
            await driver.setNextRandomValue(randomValue);
            await driver.clickRandomLink();
        }

        await setup(20, 6);
        // Expect to get +2 and go to sect184
        expect( await driver.choiceIsEnabled("sect184") ).toBe(true);
        await setup(19, 7);
        expect( await driver.choiceIsEnabled("sect184") ).toBe(false);
    });

    test("COMBATSDURATION", async () => {
        await driver.setupBookState(13);

        async function playCombat(randomValues: number[]) {
            await driver.loadCleanSection("sect100");
            for (const r of randomValues) {
                await driver.setNextRandomValue(r);
                await driver.clickPlayCombatTurn();
            }
        }

        await driver.setDisciplines([]);
        await playCombat([5, 5, 5, 5, 0]);
        expect( await driver.choiceIsEnabled("sect254") ).toBe(true);

        await driver.setDisciplines([]);
        await playCombat([4, 4, 4, 4, 0, 0]);
        expect( await driver.choiceIsEnabled("sect37") ).toBe(true);
    });

    test("BOWBONUS", async () => {

        async function shot(expectedRandom: number) {
            await driver.goToSection("sect99");
            await driver.setNextRandomValue(0);
            await driver.clickRandomLink();
            expect( await driver.getRandomFinalValue() ).toBe(expectedRandom);
        }

        async function setInventory(silverBow: boolean) {
            await driver.pick(silverBow ? "silverbowduadon" : Item.BOW);
            await driver.pick(Item.QUIVER);
            await driver.increaseArrows(6);
        }

        await driver.setupBookState(12);

        // Expect -4 if no bow:
        await driver.setDisciplines([]);
        await shot(-4);

        // Expect no bonus if no Weaponskill with bow
        await driver.loadCleanSection(Book.INITIAL_SECTION);
        await driver.setDisciplines([MgnDiscipline.Weaponmastery]);
        await driver.setWeaponskill([]);
        await setInventory(false);
        await shot(0);

        // Expect bow bonus
        await driver.loadCleanSection(Book.INITIAL_SECTION);
        await driver.setDisciplines([MgnDiscipline.Weaponmastery]);
        await driver.setWeaponskill([Item.BOW]);
        await setInventory(false);
        await shot(3);

        // Expect bow bonus + Silver Bow of Duadon bonus
        await driver.loadCleanSection(Book.INITIAL_SECTION);
        await driver.setDisciplines([MgnDiscipline.Weaponmastery]);
        await driver.setWeaponskill([Item.BOW]);
        await setInventory(true);
        await shot(6);

        // TODO: Test Grand Master bonus when book 14 is ready (book 13 has erratas with this and is not reliable)
        // TODO: Test loyalty bonus in Grand Master
    });
});

test("endurance", async () => {
    await driver.setupBookState(13);
    await driver.setDisciplines([]);
    await driver.setEndurance(10);
    await driver.goToSection("sect92");
    expect( (await driver.getActionChart()).currentEndurance ).toBe(5);
});

test("death", async () => {
    await driver.setupBookState(13);
    await driver.pick("healingpotion");
    await driver.setDisciplines([GndDiscipline.Deliverance]);
    await driver.goToSection("sect99");
    expect( (await driver.getActionChart()).currentEndurance ).toBe(0);
    expect( await (await driver.getElementById("mechanics-death")).isDisplayed() ).toBe(true);

    // TODO: Create a mechanics.tests.ts for this, and test everything else is disabled (choices, etc), test "mechanics-death" options
    // Expect do not use objects or curing button
    await driver.goToActionChart();
    expect( await GameDriver.isClickable( await driver.getElementById("achart-restore20Ep") ) ).toBe(false);
    expect( await driver.getUseObjectLink("healingpotion") ).toBe(null);
});
