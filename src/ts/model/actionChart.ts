import { ActionChartItem, SectionItem, App, state, BookSeriesId, GndDiscipline, MgnDiscipline, KaiDiscipline, Item, translations, Combat, BookSeries, mechanicsEngine, LoreCircle, SetupDisciplines, randomTable, Disciplines, DebugMode, NewOrderDiscipline, Currency, CurrencyName, actionChartController } from "..";

/**
 * Bonus for CS/EP definition
 */
export interface Bonus {
    /** The bonus description */
    concept: string;
    /** The increment / decrement of the CS/EP */
    increment: number;
    /** Bonus" applies to Enemy */
    enemy?: boolean;
}

/**
 * Disciplines player has for a given book series
 */
export interface SeriesDisciplines {

    /** Disciplines ids */
    disciplines: string[];

    /**
     * The weapon codes for the "Weaponskill" disciplines.
     * On Kai series, it's a single weapon. On series >= Magnakai, they will be more than one
     */
    weaponSkill: string[];

    /**
     * Optional: a list of disabled disciplines
     * Book 24 forces the player to disable a discipline until end of mission in a few places
     * NOTE: Disabled disciplines will still be found in the disciplines array for compatability (KAILEVEL, etc.)
     */
    disabledDisciplines?: string[];
}

/**
 * The action chart / player state
 */
export class ActionChart {

    /** First book number with a limit on Special Items count */
    public static readonly BOOK_WITH_MAX_SPECIALS = 8;

    /** The original combat skill */
    public combatSkill = 0;

    /** The original endurance */
    public endurance = 0;

    /** The current endurance */
    public currentEndurance = 0;

    /** The player weapons (up to 2) */
    public weapons: ActionChartItem[] = [];

    /**
     * If true, the player will fight with no weapons (hand-to-hand).
     * This may seem stupid, but in book 12 there are places where, if you try to fight with the Sommerswerd, you die.
     */
    public fightUnarmed = false;

    /** The currently hand-to-hand selected weapon id. Empty string if the player has no weapon  */
    private selectedWeapon = "";

    /** Belt Pouch containing all currencies */
    public beltPouch: { [currency: string]: number } = {
        "crown" : 0,
        "lune" : 0,
        "kika" : 0,
        "noble" : 0,
        "ren": 0,
        "sheasutorq": 0,
        "orla" : 0,
        "ain" : 0
    };

    /** Number of meals (they count as backpack items) */
    public meals = 0;

    /** Number of fireseeds (they count as 1 special item) */
    public fireseeds = 0;

    /** Backpack items */
    public backpackItems: ActionChartItem[] = [];

    /** Special items */
    public specialItems: ActionChartItem[] = [];

    /** The player has a backpack? */
    public hasBackpack = true;

    /**
     * Kai disciplines (books 1-5).
     * This stores disciplines player had at end of book 5. So, it will NEVER contain the 10 disciplines.
     * See getDisciplines() for how is handled.
     */
    private kaiDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [] };

    /** Magnakai disciplines (books 6-12). See kaiDisciplines comments */
    private magnakaiDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [] };

    /** Grand Master disciplines (books 13+). See kaiDisciplines comments */
    private grandMasterDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [] };

    /** New Order disciplines (books 21+). See kaiDisciplines comments */
    private newOrderDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [], disabledDisciplines: [] };

    /** Player annotations */
    public annotations = "";

    /** Use manual random table? */
    public manualRandomTable = true;

    /** Use extended Combat Results Table?
     * See LW club newsletter 29 (https://www.projectaon.org/en/pdf/lwcn/Newsletters-All.pdf , page 415)
     */
    public extendedCRT = false;

    /** The latests scroll position on the game section */
    public yScrollPosition = 0;

    /** Number of arrows on the quiver. This MUST be zero if the player has no quiver. */
    public arrows = 0;

    /** The player has used adgana previously? (see "pouchadgana" object) */
    public adganaUsed = false;

    /**
     * Restore 20 EP used?.
     * Archmaster level:
     * Archmasters are able to use their healing power to repair serious wounds sustained in battle. If, whilst in combat, their ENDURANCE is
     * reduced to 6 points or less, they can use their skill to restore 20 ENDURANCE points. This ability can only be used once every 100 days.
     */
    private restore20EPUsed = false;

    /**
     * New Order limits per section Curing to a total of 20 EP per book
     */
    public newOrderCuringEPRestored = 0;

    /**
     * Objects in safekeeping at Kai monastery
     */
    public kaiMonasterySafekeeping: SectionItem[] = [];

    /**
     * New Order Kai Name
     */
    public kaiName: string = "";

    /**
     * List of tags
     */
    public tags: string[] = [];

    constructor() {
        // Debug fast setup:
        if (App.debugMode === DebugMode.DEBUG || App.debugMode === DebugMode.TEST) {
            this.endurance = this.currentEndurance = 25;
            this.combatSkill = 15;
            this.manualRandomTable = (App.debugMode !== DebugMode.TEST);
            this.extendedCRT = false;
            switch (state.book.getBookSeries().id) {
                case BookSeriesId.NewOrder:
                    this.endurance = this.currentEndurance = 35;
                    this.combatSkill = 30;
                    // debug data for New Order
                    this.setDisciplines( [ NewOrderDiscipline.GrandWeaponmastery , NewOrderDiscipline.Deliverance, NewOrderDiscipline.GrandHuntmastery,
                        NewOrderDiscipline.Assimilance, NewOrderDiscipline.AnimalMastery ] );
                    this.setWeaponSkill( ["sword"] );
                    this.kaiName = "Kai Name";
                    break;
                case BookSeriesId.GrandMaster:
                    this.endurance = this.currentEndurance = 35;
                    this.combatSkill = 30;
                    // debug data for Grand Master
                    this.setDisciplines( [ GndDiscipline.GrandWeaponmastery , GndDiscipline.Deliverance, GndDiscipline.GrandHuntmastery,
                        GndDiscipline.Assimilance ] );
                    this.setWeaponSkill( ["axe", "sword"] );
                    break;

                case BookSeriesId.Magnakai:
                    // debug data for magnakai
                    this.setDisciplines( [ MgnDiscipline.Weaponmastery, MgnDiscipline.Curing, MgnDiscipline.Huntmastery ] );
                    this.setWeaponSkill( ["axe", "sword", "bow"] );
                    break;

                case BookSeriesId.Kai:
                    // debug data for kai series
                    this.setDisciplines( [ KaiDiscipline.Camouflage, KaiDiscipline.Hunting, KaiDiscipline.SixthSense,
                        KaiDiscipline.Healing, KaiDiscipline.Weaponskill ] );
                    this.setWeaponSkill( ["axe"] );
                    break;
            }
        }
    }

    /**
     * Returns the currently hand-to-hand selected weapon id.
     * @returns The currently selected weapon id. Empty string if the player has no weapon selected
     */
    public getSelectedWeapon(): string {
        if (this.fightUnarmed) {
            return "";
        }

        return this.selectedWeapon;
    }

    /**
     * Returns the Kai Weapon in inventory, if any
     */
    public getKaiWeapon(): string {
        if (this.hasObject("spawnsmite")) return "spawnsmite";
        if (this.hasObject("alema")) return "alema";
        if (this.hasObject("magnara")) return "magnara";
        if (this.hasObject("sunstrike")) return "sunstrike";
        if (this.hasObject("kaistar")) return "kaistar";
        if (this.hasObject("valiance")) return "valiance";
        if (this.hasObject("ulnarias")) return "ulnarias";
        if (this.hasObject("raumas")) return "raumas";
        if (this.hasObject("illuminatus")) return "illuminatus";
        if (this.hasObject("firefall")) return "firefall";
    }

    /**
     * Set the selected hand-to-hand weapon id.
     * This will set the fightUnarmed flag to false.
     * @param weaponId The new selected weapon id. No tests are done over this weapon id!
     */
    public setSelectedWeapon(weaponId: string) {
        this.selectedWeapon = weaponId;
        this.fightUnarmed = false;
    }

    /**
     * Get the selected weapon info
     * @param bow True if we should return the selected bow info. False to return the selected hand-to-hand weapon info.
     * @return The current weapon info. null if the is player has no weapon
     */
    public getSelectedWeaponItem(bow: boolean = false): Item {

        if (bow) {
            return this.getSelectedBow();
        }

        const weaponId = this.getSelectedWeapon();
        return weaponId ? state.mechanics.getObject(weaponId) : null;
    }

    /**
     * Pick an object
     * TODO: It's nonsense: It returns false ONLY if o is null. On all other cases, it throws an exception.
     * TODO: If o is null, throw an exception too, and do not return any value
     * @param aChartItem Object to pick
     * @return True if the object was really picked
     */
    public pick(aChartItem: ActionChartItem): boolean {

        if (!aChartItem) {
            return false;
        }
        const item = aChartItem.getItem();
        if (!item) {
            return false;
        }

        // Check incompatibilities
        if (item.incompatibleWith.length > 0) {
            for (const incompatibleId of item.incompatibleWith) {
                if (this.hasObject(incompatibleId)) {
                    const incombatibleObject = state.mechanics.getObject(incompatibleId);
                    throw translations.text("msgIncompatible", [incombatibleObject.name]);
                }
            }
        }

        switch (item.type) {
            case Item.WEAPON:
                if (this.weapons.length >= 2) {
                    throw translations.text("msgNoMoreWeapons");
                }
                // console.log('Picked weapon ' + item.id);
                this.weapons.push(aChartItem);
                this.checkCurrentWeapon();
                return true;

            case Item.SPECIAL: {

                // Check Special Items limit
                const nMax = ActionChart.getMaxSpecials();
                if (item.itemCount && nMax && (this.getNSpecialItems(false) + item.itemCount) > nMax) {
                    throw translations.text("msgNoMoreSpecialItems");
                }

                // If the object is an Arrow, check if the player has some quiver
                if (item.isArrow && !this.hasObject(Item.QUIVER) && !this.hasObject(Item.LARGE_QUIVER)) {
                    throw translations.text("noQuiversEnough");
                }

                if (item.id === Item.FIRESEED) {
                    this.increaseFireseeds(1);
                    if (!this.hasObject(item.id)) {
                        this.specialItems.push(aChartItem);
                    }
                } else {
                    this.specialItems.push(aChartItem);
                }             

                if (item.isWeapon()) {
                    this.checkCurrentWeapon();
                }

                if (item.isArrow) {
                    // The object is an Arrow. Drop a normal Arrow if needed
                    this.sanitizeArrowCount();
                }

                return true;
            }
            case Item.OBJECT:

                if (aChartItem.id === Item.BACKPACK) {
                    // Special case
                    if (this.hasBackpack) {
                        throw translations.text("msgAlreadyBackpack");
                    }

                    this.hasBackpack = true;
                    return true;
                }

                if ( !this.hasBackpack ) {
                    throw translations.text( "backpackLost" );
                }
                if ( ( this.getNBackpackItems(false) + item.itemCount ) > this.getMaxBackpackItems() ) {
                    throw translations.text( "msgNoMoreBackpackItems" );
                }
                if ( aChartItem.id === Item.MEAL ) {
                    // Special case
                    this.increaseMeals(1);
                } else {
                    this.backpackItems.push(aChartItem);
                }
                if (item.isWeapon()) {
                    this.checkCurrentWeapon();
                }
                console.log("Picked object " + aChartItem.id);
                return true;

            default: {
                const msg = "Unknown object type: " + item.type;
                mechanicsEngine.debugWarning(msg);
                throw msg;
            }
        }

    }

    /**
     * Returns the total number of backpack items, according to the number of slots each item consumes
     * @param roundToInteger If true (default), the total number of objects will be rounded up to an integer (Item.itemCount can have decimals)
     * @param useItemCount If true (default), use the value of itemCount, otherwise each item count as 1.
     * @returns The number of objects on the backpack
     */
    public getNBackpackItems(roundToInteger = true, useItemCount = true): number {
        let count = this.meals;
        for (const item of this.backpackItems) {
            const o = item.getItem();
            if (o) {
                count += useItemCount ? o.itemCount : 1;
            }
        }
        if (roundToInteger) {
            count = Math.ceil(count);
        }
        return count;
    }

    /**
     * Returns the total number of special items, according to the number of slots each item consum
     * @param roundToInteger If true, the total number of objects will be rounded up to a integer (Item.itemCount can have decimals)
     * @returns The number of Special Items
     */
    public getNSpecialItems(roundToInteger: boolean = true): number {
        let count = 0;
        for (const special of this.specialItems) {
            const o = special.getItem();
            if (o) {
                count += o.itemCount;
            }
        }
        if (roundToInteger) {
            count = Math.ceil(count);
        }
        return count;
    }

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease
     * @return The number of really picked meals
     */
    public increaseMeals(count: number): number {

        if (count > 0) {
            if (!this.hasBackpack) {
                throw translations.text("backpackLost");
            }

            const maxToPick = this.getMaxBackpackItems() - this.getNBackpackItems();
            if ( maxToPick < 0 ) {
                count = 0;
            } else if (count > maxToPick) {
                count = maxToPick;
            }
        }

        this.meals += count;

        // Sanitize for negative count values
        if (this.meals < 0) {
            this.meals = 0;
        }

        // console.log('Picked ' + count + ' meals');
        return count;
    }

    /**
     * Increase / decrease the fireseeds number
     * @param count Number to increase. Negative to decrease
     * @return The number of really picked fireseeds
     */
     public increaseFireseeds(count: number): number {
        const nMax = ActionChart.getMaxSpecials();
        if (count && nMax && !this.hasObject(Item.FIRESEED)) {
            if ( this.getNSpecialItems(false) + count > nMax)
                throw translations.text("msgNoMoreSpecialItems");
        }

        this.fireseeds += count;

        // Sanitize for negative count values
        if (this.fireseeds < 0) {
            this.fireseeds = 0;
        }

        return count;
    }

    /**
     * 
     * @param count Number to increase. Negative to decrease
     * @param currency The currency to add - defaults to Crowns
     * @returns Amount really picked.
     */
    public increaseMoney(count: number, excessToKaiMonastery: boolean = false, currency: string = CurrencyName.CROWN) 
    : number {
        const oldBeltPouchTotal = this.beltPouch[currency];
        let countRemaining = count;

        // If we are removing more than we have in a currency
        if (countRemaining < 0 && this.beltPouch[currency] < -countRemaining) {
            // Take as much as possible from the original currency
            countRemaining += this.beltPouch[currency];
            countRemaining = Math.round(countRemaining * 100) / 100;
            this.beltPouch[currency] = 0;

            // If the loss is not limited to one currency, find other currencies with remaining money
            if (currency === CurrencyName.CROWN) {
                for (const c of Object.keys(this.beltPouch)) {
                    if (countRemaining < 0 && this.beltPouch[c] > 0) {
                        // countRemaining needs to be in source currency, but increase money returns in target currency
                        countRemaining += -Currency.toCurrency(
                            actionChartController.increaseMoney(Currency.toCurrency(countRemaining, currency, c, false), false, excessToKaiMonastery, c),
                            c, currency);
                    }
                }
            }
        } else {
            // Never change a currency amount by fractional
            this.beltPouch[currency] += Math.floor(count);
            if (this.getBeltPouchUsedAmount(false) > 50) {
                const totalOverageInCrowns = this.getBeltPouchUsedAmount(false) - 50;
                const totalOverageInCurrency = Currency.toCurrency(totalOverageInCrowns, CurrencyName.CROWN, currency);
                if (excessToKaiMonastery && totalOverageInCurrency > 0) {
                    const kaimonastery = state.sectionStates.getSectionState("kaimonastery");
                    if(kaimonastery) {
                        kaimonastery.addObjectToSection(Item.MONEY, 0, false, totalOverageInCurrency, false, 0, currency);
                    }
                }
                this.beltPouch[currency] -= totalOverageInCurrency;
            }
        }

        // Double check all currencies for < 0
        for (const c in this.beltPouch) {
            if (this.beltPouch[c] < 0) {
                this.beltPouch[c] = 0;
            }
        }

        return this.beltPouch[currency.toString()] - oldBeltPouchTotal;
    }

    /** Returns total used size of Belt Pouch in Crowns across all currencies (uses exchange rate) */
    public getBeltPouchUsedAmount(roundDown: boolean = true) : number {
        let total: number = 0;
        for (const currency in this.beltPouch) {
            total += Currency.toCurrency(this.beltPouch[currency], currency, CurrencyName.CROWN, roundDown);
        }

        return total;    
    }

    public static combineBeltPouches(beltPouch1: { [currency: string]: number }, beltPouch2: { [currency: string]: number }) {
        const output = {};
        for (const currency in beltPouch1) {
            output[currency] = beltPouch1[currency] + beltPouch2[currency];
        }

        return output;
    }

    /**
     * Returns true if the player has the object
     * @param objectId The object id to test. "backpack" to check if the player has a backpack
     */
    public hasObject(objectId: string): boolean {
        if (objectId === Item.BACKPACK) {
            return this.hasBackpack;
        }

        return ActionChartItem.containsId(this.backpackItems, objectId) ||
            ActionChartItem.containsId(this.specialItems, objectId) ||
            ActionChartItem.containsId(this.weapons, objectId);
    }

    /**
     * Drop an object
     * @param objectId Object id to drop, or 'meal' to drop one meal, or 'backpack' to drop the
     * backpack.
     * @param dropCount Only for quivers/fireseeds. count === n. arrows/fireseeds to drop. It must to be >= 0
     * @param objectIndex If specified, object index in the Action Chart object array to drop. If it's not specified
     * the first object with the given objectId will be dropped
     * @returns The dropped item. null if no item was dropped
     */
    public drop(objectId: string, dropCount: number = 1, objectIndex: number = -1): ActionChartItem|null {

        if (objectId === Item.MEAL) {
            // Special
            this.increaseMeals(-1);
            return new ActionChartItem(Item.MEAL);
        }

        if (objectId === Item.BACKPACK) {
            // Special
            if (!this.hasBackpack) {
                return null;
            }

            this.hasBackpack = false;
            this.meals = 0;
            this.backpackItems = [];
            this.checkCurrentWeapon();
            return new ActionChartItem(Item.BACKPACK);
        }

        if (objectId === Item.FIRESEED) {
            this.increaseFireseeds(-dropCount);

            if (this.fireseeds > 0) {
                return new ActionChartItem(Item.FIRESEED);
            }
        }

        // Drop the object (find its position, and drop that position)
        const item = state.mechanics.getObject(objectId);
        if (!item) {
            return null;
        }
        const objectsArray = this.getObjectsByType(item.type);
        if (!objectsArray) {
            return null;
        }

        let index: number;
        if (objectIndex >= 0) {
            index = objectIndex;
        } else {
            index = ActionChartItem.findById(objectsArray, objectId);
        }
        if (index < 0) {
            return null;
        }

        const aChartItem = objectsArray[index];
        objectsArray.splice(index, 1);

        this.checkMaxEndurance();
        this.checkCurrentWeapon();

        if (aChartItem.id === Item.QUIVER || aChartItem.id === Item.LARGE_QUIVER) {
            // Decrease arrows count
            this.arrows -= dropCount;
            this.sanitizeArrowCount();
        }

        return aChartItem;
    }

    /**
     * Get an owned object info.
     * @param objectId Object id to get the information
     * @param index If specified and >= 0, object index in the Action Chart array. Otherwise, the
     * first owned object will be returned
     * @returns The object info. null if it was not found
     */
    public getActionChartItem(objectId: string, index: number = -1): ActionChartItem {
        const item = state.mechanics.getObject(objectId);
        if (!item) {
            return null;
        }
        const objectsArray = this.getObjectsByType(item.type);
        if (!objectsArray) {
            return null;
        }
        if (index < 0) {
            index = ActionChartItem.findById(objectsArray, objectId);
        }
        if (index < 0 || index >= objectsArray.length) {
            return null;
        }
        return objectsArray[index];
    }

    /**
     * Returns the array of objects of a given type
     * @param objectType The object types (Item.WEAPON, Item.SPECIAL or Item.OBJECT)
     * @returns The objects of that type. null if the object type was wrong
     */
    private getObjectsByType(objectType: string): ActionChartItem[] {
        let objectsArray: ActionChartItem[] = null;
        switch (objectType) {
            case Item.WEAPON:
                objectsArray = this.weapons;
                break;
            case Item.SPECIAL:
                objectsArray = this.specialItems;
                break;
            case Item.OBJECT:
                objectsArray = this.backpackItems;
                break;
            default:
                objectsArray = null;
        }
        return objectsArray;
    }

    /**
     * Check if the player still has its selected weapon
     */
    private checkCurrentWeapon() {

        if (this.selectedWeapon && this.hasObject(this.selectedWeapon)) {
            // All is ok
            return;
        }

        // Try to set the current weapon, only hand-to-hand weapons
        const weaponObjects = this.getWeaponObjects(true);
        if (weaponObjects.length === 0) {
            // No weapons
            this.selectedWeapon = "";
            this.fightUnarmed = false;
            return;
        } else if (weaponObjects.length >= 1) {
            // Get one
            this.selectedWeapon = weaponObjects[0].id;
            return;
        }
    }

    /**
     * Returns the maximum endurance of the player
     */
    public getMaxEndurance(): number {

        if (this.endurance <= 0) {
            // If the original endurance is zero, the player is dead
            return 0;
        }

        let e = this.endurance;
        const bonuses = this.getEnduranceBonuses();
        for (const bonus of bonuses) {
            e += bonus.increment;
        }
        return e;
    }

    /**
     * Checks if the current endurance if bigger than the maximum.
     * This can happens if an object that has effects (increase endurance) has ben dropped, or if the original endurance has changed
     */
    private checkMaxEndurance() {
        const max = this.getMaxEndurance();
        if (this.currentEndurance > max) {
            this.currentEndurance = max;
        }
    }

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease
     * @param permanent True if the increase is permanent (it changes the original endurance)
     */
    public increaseEndurance(count: number, permanent: boolean = false) {

        if (permanent) {
            // Change the original endurance
            this.endurance += count;
            if (this.endurance < 0) {
                this.endurance = 0;
            }
        }

        this.currentEndurance += count;
        this.checkMaxEndurance();
        if (this.currentEndurance < 0) {
            this.currentEndurance = 0;
        }
    }

    /**
     * Get the current combat skill.
     * @param combat The current combat. null to check default bonuses
     * @return The current combat skill. It includes bonuses for weapons and mindblast
     * discipline
     */
    public getCurrentCombatSkill(combat: Combat = null): number {

        let cs = this.combatSkill;
        const bonuses = this.getCurrentCombatSkillBonuses(combat).filter((b) => !b.enemy);
        for (const bonus of bonuses) {
            cs += bonus.increment;
        }

        return cs;
    }

    /**
     * Return true if the Weaponskill is active with the selected weapon for a given book series
     * @param bow True if we should test weaponskill with bow. False to check hand to hand currently selected weapon
     * @param bookSeriesId Book series disciplines to check. If not specified or null, current book series disciplines will be checked
     * @returns True if Weaponskill discipline is active for the currently selected hand to hand weapon, or for a owned bow
     */
    public isWeaponskillActive(bow: boolean = false, bookSeriesId: BookSeriesId|null = null): boolean|undefined {

        if (bookSeriesId === null) {
            // Current book series
            bookSeriesId = state.book.getBookSeries().id;
        }

        if (!this.hasDiscipline(BookSeries.series[bookSeriesId].weaponskillDiscipline, bookSeriesId)) {
            // Player has no weaponskill on that book series
            return false;
        }

        const currentWeapon = this.getSelectedWeaponItem(bow);
        if (!currentWeapon) {
            // Player has no weapon
            return false;
        }

        // Check if current weapon has a type appliable in the current weaponskill discipline
        for (const weaponType of this.getWeaponSkill(bookSeriesId)) {
            if (currentWeapon.isWeaponType(weaponType)) {
                return true;
            }
        }
    }

    /**
     * Check if the player has weaponskill with a given type of weapon with current book disciplines
     * @param weaponType Weapon type to check
     * @return True if the player has weaponskill with that weapon
     */
    public hasWeaponskillWith(weaponType: string): boolean {

        const bookSeries = state.book.getBookSeries();
        if (!this.hasDiscipline(bookSeries.weaponskillDiscipline)) {
            // Player has no Weaponskill
            return false;
        }
        return this.getWeaponSkill().includes(weaponType);
    }

    /**
     * Get bonuses for the selected weapon
     * @param noWeapon True if the combat is with no weapons
     * @param bowCombat True if it's a combat with bow
     * @param disabledObjectsIds Objects ids that cannot be used on this combat
     * @returns Action chart bonuses for the combat
     */
    private getWeaponCombatSkillBonuses(noWeapon: boolean, bowCombat: boolean, disabledObjectsIds: string[])
        : Bonus[] {

        const bonuses: Bonus[] = [];
        let currentWeapon: Item|null = this.getSelectedWeaponItem(bowCombat);

        // Check if the current weapon is disabled
        if (disabledObjectsIds.length > 0 && currentWeapon) {
            if (disabledObjectsIds.includes(currentWeapon.id)) {
                // Disabled
                currentWeapon = null;
            } else if (currentWeapon.weaponType && disabledObjectsIds.includes(currentWeapon.weaponType)) {
                // Base weapon disabled
                currentWeapon = null;
            }
        }

        // Weapons
        if (noWeapon || !currentWeapon) {
            // No current weapon:
            let bonus: number;

            if (state.book.getBookSeries().id >= BookSeriesId.GrandMaster) {
                if(this.hasMgnDiscipline(MgnDiscipline.Weaponmastery) && this.getDisciplines(BookSeriesId.GrandMaster).length >= 10) {
                    // Grand Master series + Grand Crown level
                    bonus = +3;
                } else {
                    // Grand Master series: No loss
                    bonus = 0;
                }
            } else if (this.hasMgnDiscipline(MgnDiscipline.Weaponmastery) && this.getDisciplines(BookSeriesId.Magnakai).length >= 8) {
                /*  Exception (Magnakai books):
                    Kai level "Scion-kai" with "Weaponmastery": ...Also, when in combat without a weapon they lose only 1 point
                    from their COMBAT SKILL.
                */
                bonus = -1;
            } else if (this.hasMgnDiscipline(MgnDiscipline.Weaponmastery) && this.getDisciplines(BookSeriesId.Magnakai).length >= 5) {
                /*  Exception (Magnakai books):
                    Kai level "Tutelary" with "Weaponmastery": Tutelaries are able to use defensive combat skills to great effect
                    when fighting unarmed. When entering combat without a weapon, Tutelaries lose only 2 points from their COMBAT SKILL,
                    instead of the usual 4 points.
                */
                bonus = -2;
            } else {
                // Other cases: Kai, or Magnakai with Weaponmastery with level < 5, or no Magnakai Weaponmastery
                bonus = -4;
            }

            if (bonus != 0) {
                bonuses.push({
                    concept: translations.text("noWeapon"),
                    increment: bonus
                });
            }

        } else if (this.isWeaponskillActive(bowCombat, BookSeriesId.NewOrder)) {
            // Grand Master / Grand Weaponmastery bonuses
            bonuses.push({
                concept: translations.text("grdweaponmastery"),
                increment: 5
            });
        } else if (this.isWeaponskillActive(bowCombat, BookSeriesId.GrandMaster)) {
            // Grand Master / Grand Weaponmastery bonuses
            // Exception: Book 13. It seems an errata, but it says EVERYWHERE it's +3 for bow bonus:
            const inc = state.book.bookNumber === 13 && bowCombat ? +3 : +5;
            bonuses.push({
                concept: translations.text("grdweaponmastery"),
                increment: inc
            });
        } else if (this.isWeaponskillActive(bowCombat, BookSeriesId.Magnakai) 
            && state.book.getBookSeries().id !== BookSeriesId.NewOrder) {
            // Magnakai / Weaponmastery bonuses

            let bonus = +3;
            /*  Exception (Magnakai books):
                Improvements: Scion-kai / Weaponmastery	/ When entering combat with a weapon they have mastered, Scion-kai may add 4 points
                (instead of the usual 3 points) to their COMBAT SKILL...
            */
            // Changed in v1.12: Seems this should not be applied to bow bonuses, it's just for hand to hand CS. See Disciplines
            // foot notes in book 13 about non-cumulative bonus
            if (!bowCombat && state.actionChart.getDisciplines(BookSeriesId.Magnakai).length >= 8) {
                // Scion-kai
                bonus = +4;
            }
            bonuses.push({
                concept: translations.text("weaponmastery"),
                increment: bonus
            });

        } else if (this.isWeaponskillActive(bowCombat, BookSeriesId.Kai)) {
            // Kai / Weaponskill bonus
            bonuses.push({
                concept: translations.text("weaponskill"),
                increment: +2
            });
        }

        // Check current weapon bonuses
        if (!noWeapon && currentWeapon && currentWeapon.combatSkillEffect) {
            const acWeapon = state.actionChart.getActionChartItem(currentWeapon.id);
            const bonus = currentWeapon.combatSkillEffect + acWeapon.damage;
            bonuses.push({
                concept: currentWeapon.name + (acWeapon.damage !== 0 ? " (damaged)" : ""),
                increment: bonus
            });
        }

        // Check current weapon bonuses against enemy
        if (!noWeapon && currentWeapon && currentWeapon.enemyCombatSkillEffect && currentWeapon.enemyCombatSkillEffect !== 0) {
            const acWeapon = state.actionChart.getActionChartItem(currentWeapon.id);
            const bonus = currentWeapon.enemyCombatSkillEffect;
            bonuses.push({
                concept: currentWeapon.name,
                increment: bonus,
                enemy: true
            });
        }

        if (bowCombat) {
            // Grand Master books, disciplines section foot note:
            // ...+2 Mentora bonus is therefore not cumulative with Grand Weaponmastery with Bow
            if (!this.isWeaponskillActive(true, BookSeriesId.GrandMaster)) {
                // OK, there is no Grand Weaponmastery with Bow

                /* Improved disciplines:
                    Kai level "Mentora" with "Weaponmastery": Mentoras skilled in Weaponmastery are more accurate when using all missile
                    weapons, whether fired (e.g. a bow) or thrown (e.g. a dagger). When using a bow or thrown weapon and instructed to pick a
                    number from the Random Number Table, add 2 to the number picked if you are a Mentora with the Magnakai Discipline
                    of Weaponmastery */
                if (state.book.getBookSeries().id !== BookSeriesId.NewOrder
                && this.hasMgnDiscipline(MgnDiscipline.Weaponmastery) && this.getDisciplines(BookSeriesId.Magnakai).length >= 7) {
                    bonuses.push({
                        concept: translations.text("mentora"),
                        increment: +2
                    });
                }
            }
        }

        return bonuses;
    }

    /**
     * Get total bonus for bow shots
     * @returns The bonus increment. It can be negative
     */
    public getBowBonus(): number {
        let bonus = 0;
        for (const b of this.getWeaponCombatSkillBonuses(false, true, [])) {
            bonus += b.increment;
        }
        return bonus;
    }

    /**
     * Get the current bonuses for combat skill
     * @param combat The current combat. null to check default bonuses
     * @return Array of objects with the bonuses concepts
     */
    public getCurrentCombatSkillBonuses(combat: Combat|null = null): Bonus[] {

        if (!combat) {
            // Create a fake combat with the default values
            combat = new Combat("Fake enemy", 0, 0);
            // apply all global rules (to setup disabled objects for example)
            mechanicsEngine.runGlobalRules(true, combat);
        }

        const bonuses: Bonus[] = [];

        // Current weapon bonuses
        if (!combat.mentalOnly && !combat.noObjectBonuses) {
            const noWeapon = combat.noWeaponCurrentTurn();
            for (const b of this.getWeaponCombatSkillBonuses(noWeapon, combat.bowCombat, combat.disabledObjects)) {
                bonuses.push(b);
            }
        }

        // Mindblast / Surge
        if (combat.psiSurge) {
            // Surge currently active

            const surgeDisciplineId = combat.getSurgeDiscipline();
            if (surgeDisciplineId === NewOrderDiscipline.KaiSurge) {
                bonuses.push({
                    concept: translations.text("kaisurge"),
                    increment: combat.getFinalSurgeBonus(NewOrderDiscipline.KaiSurge)
                });
            } else if (surgeDisciplineId === GndDiscipline.KaiSurge) {
                bonuses.push({
                    concept: translations.text("kaisurge"),
                    increment: combat.getFinalSurgeBonus(GndDiscipline.KaiSurge)
                });
            } else if (surgeDisciplineId === MgnDiscipline.PsiSurge) {
                bonuses.push({
                    concept: translations.text("psisurge"),
                    increment: combat.getFinalSurgeBonus(MgnDiscipline.PsiSurge)
                });
            }
        } else if (!combat.noMindblast) {
            if (((this.hasKaiDiscipline(KaiDiscipline.Mindblast) || this.hasMgnDiscipline(MgnDiscipline.PsiSurge) ||
                this.hasGndDiscipline(GndDiscipline.KaiSurge)) && state.book.getBookSeries().id !== BookSeriesId.NewOrder)
                || this.hasNewOrderDiscipline(NewOrderDiscipline.KaiSurge)
            ) {
                // Mindblast active
                bonuses.push({
                    concept: translations.text("mindblast"),
                    increment: combat.getFinalMindblastBonus()
                });
            }
        }

        if (!combat.mentalOnly) {
            if (combat.powerStrike) {
                bonuses.push({
                    concept: translations.text("powerstrike"),
                    increment: +1
                });
            }
        }

        // Other objects (not weapons). Ex. shield. They are not applied for bow combats
        if (!combat.mentalOnly && !combat.bowCombat && !combat.noObjectBonuses) {
            this.enumerateObjectsAsItems((o: Item) => {
                if (!o.isWeapon() && (o.combatSkillEffect || o.enemyCombatSkillEffect) && !combat.disabledObjects.includes(o.id)) {
                    bonuses.push({
                        concept: o.name,
                        increment: o.enemyCombatSkillEffect !== undefined ? o.enemyCombatSkillEffect : o.combatSkillEffect,
                        enemy: o.enemyCombatSkillEffect !== undefined
                    });
                }
            });
        }

        // Lore-circles bonuses
        // We disable these in a mental combat, but flavor-wise, we should
        // arguably still allow the Spirit circle. Although the game rules are
        // not that detailed.
        if (!combat.mentalOnly) {
            const circlesBonuses = LoreCircle.getCirclesBonuses(this.getDisciplines(BookSeriesId.Magnakai), "CS");
            for (const c of circlesBonuses) {
                bonuses.push(c);
            }
        }

        // Grand Master / New Order level bonus
        if (state.book.getBookSeries().id === BookSeriesId.GrandMaster || state.book.getBookSeries().id === BookSeriesId.NewOrder) {
            const startingSkillsCount = state.book.getBookSeries().id === BookSeriesId.NewOrder ? 5 : 4;
        
            const nGndDisciplines = this.getDisciplines(state.book.getBookSeries().id).length;
            if (nGndDisciplines > startingSkillsCount) {
                bonuses.push({
                    concept: translations.text("kaiLevel"),
                    increment: (nGndDisciplines - startingSkillsCount),
                });
            }
        }

        return bonuses;
    }

    /**
     * Function to enumerate backpack objects and special items. Optionally weapons can be included
     * @param callback Function to be called for each object. Parameter is each Item owned by the player
     * @param enumerateWeapons True if weapons should be enumerated
     */
    private enumerateObjectsAsItems(callback: (o: Item) => void, enumerateWeapons: boolean = false) {
        this.enumerateObjects((aItem) => { callback(aItem.getItem()); }, enumerateWeapons);
    }

    /**
     * Function to enumerate backpack objects and special items as ActionChartItems. Optionally weapons can be included
     * @param callback Function to be called for each object. Parameter is each Item owned by the player
     * @param enumerateWeapons True if weapons should be enumerated
     */
    private enumerateObjects(callback: (o: ActionChartItem) => void, enumerateWeapons: boolean = false) {

        const enumerateFunction = (index: number, aItem: ActionChartItem) => {
            if (!aItem.getItem()) {
                return;
            }
            callback(aItem);
        };

        // Check objects:
        if (enumerateWeapons) {
            $.each(this.weapons, enumerateFunction);
        }
        $.each(this.backpackItems, enumerateFunction);
        $.each(this.specialItems, enumerateFunction);
    }

    /**
     * Get the current bonuses for backpack slots
     * @returns Array of objects with the backpack slot bonuses
     */
    public getBackpackSlotsBonuses(): Bonus[] {
        const bonuses: Bonus[] = [];
        this.enumerateObjectsAsItems((o: Item) => {
            if (o.backpackSlotsBonusEffect) {
                bonuses.push({
                    concept: o.name,
                    increment: o.backpackSlotsBonusEffect
                });
            }
        });

        return bonuses;
    }

    /**
     * Get the current bonuses for endurance
     * @return Array of objects with the bonuses concepts
     */
    public getEnduranceBonuses(): Bonus[] {

        const bonuses: Bonus[] = [];
        this.enumerateObjectsAsItems((o: Item) => {
            if (o.enduranceEffect) {
                bonuses.push({
                    concept: o.name,
                    increment: o.enduranceEffect
                });
            }
        });

        const circlesBonuses = LoreCircle.getCirclesBonuses(this.getDisciplines(BookSeriesId.Magnakai), "EP");
        for (const c of circlesBonuses) {
            bonuses.push(c);
        }

        // Grand Master / New Order level bonus
        if (state.book.getBookSeries().id === BookSeriesId.GrandMaster || state.book.getBookSeries().id === BookSeriesId.NewOrder) {
            const startingSkillsCount = state.book.getBookSeries().id === BookSeriesId.NewOrder ? 5 : 4;

            const nGndDisciplines = this.getDisciplines(state.book.getBookSeries().id).length;
            if (nGndDisciplines > startingSkillsCount) {
                bonuses.push({
                    concept: translations.text("kaiLevel"),
                    increment: (nGndDisciplines - startingSkillsCount) * 2,
                });
            }
        }

        return bonuses;
    }

    /**
     * Returns the backpack objects and special items that are meals too
     * @return Meal-like object ids owned by the player
     */
    public getMealObjects(): string[] {

        const result:string[] = [];

        this.enumerateObjectsAsItems((o: Item) => {
            if (o.isMeal && !result.includes(o.id)) {
                result.push(o.id);
            }
        });
        return result;
    }

    /**
     * Returns all weapons and backpack / special item objects that can be
     * used as weapons
     * @param onlyHandToHand If it's true, only hand to hand weapons will be returned
     * @return All weapon objects
     */
    public getWeaponObjects(onlyHandToHand: boolean = false): Item[] {

        const result: Item[] = [];
        for (const aChartItem of this.getWeaponAChartItems(onlyHandToHand)) {
            result.push(aChartItem.getItem());
        }
        return result;
    }

    /**
     * Returns all weapons and backpack / special item objects that can be
     * used as weapons
     * @param onlyHandToHand If it's true, only hand to hand weapons will be returned
     * @return All weapon objects
     */
    public getWeaponAChartItems(onlyHandToHand: boolean = false): ActionChartItem[] {
        const result: ActionChartItem[] = [];
        // Traverse Weapons and Weapon-like objects
        this.enumerateObjects((aChartItem: ActionChartItem) => {
            const o = aChartItem.getItem();
            if (o.isWeapon() && (!onlyHandToHand || o.isHandToHandWeapon())) {
                result.push(aChartItem);
            }
        }, true);
        return result;
    }

    /**
     * Get the maximum arrows number the player can carry, given by the number of owned quivers
     * @returns The max. arrows number
     */
    public getMaxArrowCount(): number {

        // Compute the maximum number of arrows, given the carried quivers
        let max = 0;
        for (const aItem of this.specialItems) {
            if (aItem.id === Item.QUIVER) {
                // Only 6 arrows per quiver
                max += 6;
            }
            if (aItem.id === Item.LARGE_QUIVER) {
                // Large quiver holds 12
                max += 12;
            }
        }

        // Objects with isArrow="true" occupies the same space in quiver as a normal Arrow
        this.enumerateObjectsAsItems((o: Item) => {
            if (o.isArrow) {
                max -= 1;
            }
        });

        return max;
    }

    /**
     * Makes sure the arrow count fits our current quiver count
     */
    private sanitizeArrowCount() {
        const max = this.getMaxArrowCount();
        this.arrows = Math.max(0, Math.min(this.arrows, max));
    }

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     * @returns Number of really increased arrows. Arrows number on action chart is limited by the number of quivers
     */
    public increaseArrows(increment: number): number {
        const oldArrows = this.arrows;
        this.arrows += increment;
        this.sanitizeArrowCount();
        return this.arrows - oldArrows;
    }

    /**
     * Get the magnakai lore circles owned by the player
     */
    public getLoreCircles(): LoreCircle[] {
        return LoreCircle.getCircles(this.getDisciplines(BookSeriesId.Magnakai));
    }

    /** The player has "Mindshield" with the current book disciplines (no loyalty bonus here) */
    public hasMindShield(): boolean {
        return this.hasDiscipline(state.book.getBookSeries().mindshieldDiscipline);
    }

    /** The player has a bow and some arrow? */
    public canUseBow(): boolean {
        if (this.getSelectedBow() === null) {
            return false;
        }
        return this.arrows > 0;
    }

    /**
     * Get the selected bow weapon
     * TODO: This returns the bow with the maximum CS bonus. Allow to selected the current bow
     */
    public getSelectedBow(): Item {
        return this.getWeaponType(Item.BOW);
    }

    /**
     * Return the weapon of a given type, with the bigger bonus for combat skill.
     * null if the player has not that kind of weapon
     */
    public getWeaponType(weaponType: string): Item {
        let maxBonus = 0;
        let w: Item = null;
        for (const weapon of this.getWeaponObjects()) {
            if (weapon.isWeaponType(weaponType)) {
                if (weapon.combatSkillEffect >= maxBonus) {
                    maxBonus = weapon.combatSkillEffect;
                    w = weapon;
                }
            }
        }
        return w;
    }

    /**
     * The get the discipline id that supports +20 EP ability
     * @returns The discipline id that will be used. null if the +20EP cannot be used
     */
    public get20EPRestoreDiscipline(): string|null {
        if (this.hasNewOrderDiscipline(NewOrderDiscipline.Deliverance)) {
            return NewOrderDiscipline.Deliverance;
        }
        else if (this.hasGndDiscipline(GndDiscipline.Deliverance)) {
            return GndDiscipline.Deliverance;
        }
        else if ( this.hasMgnDiscipline(MgnDiscipline.Curing) 
            && this.getDisciplines(BookSeriesId.Magnakai).length >= 9
            //New Order does not allow the 20EP restore from Curing
            && state.book.getBookSeries().id !== BookSeriesId.NewOrder ) {
            return MgnDiscipline.Curing;
        }
        return null;
    }

    /**
     * The +20 EP can be used now?
     */
    public canUse20EPRestoreNow(): boolean {
        const disciplineId = this.get20EPRestoreDiscipline();
        if (!disciplineId || this.restore20EPUsed) {
            return false;
        }

        if (this.currentEndurance <= 0) {
            // Death -> no use
            return false;
        }

        let minEndurance: number;
        if (disciplineId === GndDiscipline.Deliverance || disciplineId === NewOrderDiscipline.Deliverance) {
            minEndurance = 8;
        } else {
            minEndurance = 6;
        }
        return this.currentEndurance <= minEndurance;
    }

    /**
     * Use the Magnakai Medicine Archmaster +20 EP.
     * @returns true if was really used. False if it cannot be used
     */
    public use20EPRestore(): boolean {
        if (!this.canUse20EPRestoreNow()) {
            return false;
        }
        this.restore20EPUsed = true;
        this.increaseEndurance(20);
        return true;
    }

    /**
     * Reset the +20 EP used flag
     */
    public reset20EPRestoreUsed() {
        this.restore20EPUsed = false;
    }

    /**
     * Reset the disabled disciplines
     */
    public resetDisabledDisciplines() {
        this.newOrderDisciplines.disabledDisciplines = [];
    }

    /**
     * PERMANENTLY damage the player's Kai Weapon
     */
    public damageKaiWeapon(damage: number|null) {
        const kaiWeapon = this.getActionChartItem(this.getKaiWeapon());
        if (kaiWeapon) {
            kaiWeapon.damage += damage;
        }
    }

    /**
     * Disable a discipline
     */
    public disableDiscipline(disciplineIndex: number) {
        const disciplineToDisable = this.newOrderDisciplines.disciplines[disciplineIndex]; 

        if (this.newOrderDisciplines.disabledDisciplines.indexOf(disciplineToDisable) === -1) {
            this.newOrderDisciplines.disabledDisciplines.push(disciplineToDisable);
        }
    }

    /**
     * Reset the New Order Curing EP Restored Counter
     */
    public resetNewOrderCuringEPRestoredUsed() {
        this.newOrderCuringEPRestored = 0;
    }

    /**
     * Return identifiers of backpack items
     */
    public getBackpackItemsIds(): string[] {
        return ActionChartItem.getIds(this.backpackItems);
    }

    /**
     * Return identifiers of special items
     */
    public getSpecialItemsIds(): string[] {
        return ActionChartItem.getIds(this.specialItems);
    }

    /**
     * Return identifiers of weapons
     */
    public getWeaponsIds(): string[] {
        return ActionChartItem.getIds(this.weapons);
    }

    /**
     * Returns player disciplines for a given book series
     * @param series Book series which get disciplines. If null or not specified, we get current book disciplines
     * @returns Disciplines for that series
     */
    public getDisciplines(series: BookSeriesId|null = null): string[] {
        return this.getSeriesDisciplines(series).disciplines;
    }

    /**
     * Returns player disciplines for a given book series
     * @param series Book series which get disciplines. If null or not specified, we get current book disciplines
     * @returns Disciplines for that series
     */
    public getDisabledDisciplines(series: BookSeriesId|null = null): string[] {
        return this.getSeriesDisciplines(series).disabledDisciplines ?? [];
    }

    /**
     * Player has a given discipline on a given book series?
     * @param disciplineId Discipline to check
     * @param seriesId Book series to check. If null or not specified, the current book series
     * @returns true if player has the discipline
     */
    public hasDiscipline(disciplineId: string, seriesId: BookSeriesId|null = null): boolean {
        if (App.debugMode === DebugMode.DEBUG || App.debugMode === DebugMode.TEST) {
            const possibleDisciplines = Disciplines.getSeriesDisciplines(seriesId !== null ? seriesId : state.book.getBookSeries().id);
            if (!possibleDisciplines.includes(disciplineId)) {
                mechanicsEngine.debugWarning(`Disciplines of book series ${seriesId} do not contains discipline ${disciplineId}`);
            }
        }

        const seriesDisciplines = this.getSeriesDisciplines(seriesId);
        if( seriesDisciplines.disabledDisciplines ) {
            const filtered = seriesDisciplines.disciplines
                .filter(x => !seriesDisciplines.disabledDisciplines.includes(x));
            return filtered.includes(disciplineId);
        } else {
            return this.getSeriesDisciplines(seriesId).disciplines.includes(disciplineId);
        }
    }

    /** Player has a given Kai discipline */
    public hasKaiDiscipline(disciplineId: KaiDiscipline): boolean {
        return this.hasDiscipline(disciplineId, BookSeriesId.Kai);
    }

    /** Player has a given Magnakai discipline */
    public hasMgnDiscipline(disciplineId: MgnDiscipline): boolean {
        return this.hasDiscipline(disciplineId, BookSeriesId.Magnakai);
    }

    /** Player has a given Grand Master discipline */
    public hasGndDiscipline(disciplineId: GndDiscipline): boolean {
        return this.hasDiscipline(disciplineId, BookSeriesId.GrandMaster);
    }

    /** Player has a given New Order discipline */
    public hasNewOrderDiscipline(disciplineId: NewOrderDiscipline): boolean {
        return this.hasDiscipline(disciplineId, BookSeriesId.NewOrder);
    }

    private getRealDisciplines(seriesId: BookSeriesId): SeriesDisciplines {
        switch (seriesId) {
            case BookSeriesId.Kai:
                return this.kaiDisciplines;
            case BookSeriesId.Magnakai:
                return this.magnakaiDisciplines;
            case BookSeriesId.GrandMaster:
                return this.grandMasterDisciplines;
            case BookSeriesId.NewOrder:
                return this.newOrderDisciplines;
            default:
                mechanicsEngine.debugWarning("ActionChart.getSeriesDisciplines: Wrong book series");
                return { disciplines: [], weaponSkill: [] };
        }
    }

    /**
     * Returns player disciplines and weaponskill for a given book series
     * @param series Book series which get disciplines. If null or not specified, we get current book series disciplines
     * @returns Disciplines for that series to apply. They can be different of the real disciplines with which the player finished the series
     */
    private getSeriesDisciplines(seriesId: BookSeriesId|null = null): SeriesDisciplines {
        const currentSeriesId = state.book.getBookSeries().id;
        if (seriesId === null) {
            seriesId = currentSeriesId;
        } else if (seriesId > currentSeriesId) {
            // Future series. If we are debugging, maybe we have disciplines in that series: Ignore them
            return { disciplines: [], weaponSkill: [] };
        }

        let seriesDisciplines = this.getRealDisciplines(seriesId);
        // If the player has played SOME book of a previous series, player has ALL disciplines of that series
        // and can benefit of loyalty bonuses
        if (seriesId < currentSeriesId && (seriesDisciplines.disciplines.length > 0 
            // New Order starts over with all Kai/Magnakai skills, but not Grandmaster - treat a check of GrandMaster as a check of New Order
            || currentSeriesId === BookSeriesId.NewOrder) && !(seriesId === BookSeriesId.GrandMaster && currentSeriesId === BookSeriesId.NewOrder)) { 
            if (seriesId === BookSeriesId.Kai && this.kaiDisciplines.weaponSkill.length === 0) {
                // If some book of Kai series has been played, now you should have Weaponskill with one weapon. But you can
                // end the series without chosing Weaponskill... So add a random weapon
                this.kaiDisciplines.weaponSkill.push( SetupDisciplines.kaiWeapons[randomTable.getRandomValue()] );
            }

            // In Kai series, you end with Weaponskill with one weapon. In later series, you end with Weaponskill with all weapons
            const weaponskill = ( seriesId === BookSeriesId.Kai ? this.kaiDisciplines.weaponSkill : SetupDisciplines.magnakaiWeapons );

            // Player has all disciplines
            seriesDisciplines = { disciplines: Disciplines.getSeriesDisciplines(seriesId), weaponSkill: weaponskill };
        }

        return seriesDisciplines;
    }

    /**
     * Set current disciplines for a given book series
     * @param series Book series which set disciplines. If null or not specified, we set current book series disciplines
     */
    public setDisciplines(disciplinesIds: string[], seriesId: BookSeriesId|null = null) {
        if (seriesId === null) {
            seriesId = state.book.getBookSeries().id;
        }
        this.getRealDisciplines(seriesId).disciplines = disciplinesIds;
    }

    /**
     * Get the weapon ids for the "Weaponskill" discipline.
     * On Kai series, it's a single weapon. On series >= Magnakai, they will be more than one
     * @param series Book series which get weapons. If null or not specified, we get current book series weapons
     */
    public getWeaponSkill(seriesId: BookSeriesId|null = null): string[] {
        return this.getSeriesDisciplines(seriesId).weaponSkill;
    }

    private setWeaponSkill(weaponSkill: string[], seriesId: BookSeriesId|null = null) {
        this.getSeriesDisciplines(seriesId).weaponSkill = weaponSkill;
    }

    /**
     * Return the maximum number of special items that can be picked on the current book.
     * @returns The max number. Zero if there is no limit on the current book
     */
    public static getMaxSpecials(): number {
        return state.book.bookNumber >= ActionChart.BOOK_WITH_MAX_SPECIALS ? 12 : 0;
    }

    /**
     * Return the maximum number of backpack items in the current book
     */
    public getMaxBackpackItems(): number {
        const bonuses = this.getBackpackSlotsBonuses();

        let backpackSlots = state.book.getBookSeries().id >= BookSeriesId.GrandMaster ? 10 : 8;
        for (const bonus of bonuses) {
            backpackSlots += bonus.increment;
        }
        
        return backpackSlots;
    }

    /**
     * Create an ActionChart instance from a plain object. The localStorage keys "state-book-xxxx" **MUST** to
     * be loaded before call to this member.
     * @param o The plain object
     * @returns The ActionChart instance
     */
    public static fromObject(o: any, bookNumber: number): ActionChart {

        // In version 1.6.3 / 1.7, the o.weaponSkill has been changed from string to string[] (magnakai)
        if ( o.disciplines && typeof o.weaponSkill === "string" ) {
            if ( o.actionChart.weaponSkill ) {
                o.actionChart.weaponSkill = [ o.actionChart.weaponSkill ];
            } else {
                o.actionChart.weaponSkill = [];
            }
        }

        // In version 1.6.3 / 1.7, we store the number of arrows (magnakai)
        if ( !o.arrows ) {
            o.arrows = 0;
        }

        // In version 1.12 disciplines of Kai, Magnakai and Grand Master are stored in ActionChart. Previously, only the
        // current book disciplines were stored
        if (!o.kaiDisciplines) {

            // Store current book disciplines
            const currentSeries = BookSeries.getBookNumberSeries(bookNumber);
            switch (currentSeries.id) {
                case BookSeriesId.Kai:
                    o.kaiDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
                case BookSeriesId.Magnakai:
                    o.magnakaiDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
                case BookSeriesId.GrandMaster:
                    o.grandMasterDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
                case BookSeriesId.NewOrder:
                    o.newOrderDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
            }
            delete o.disciplines;
            delete o.weaponSkill;

            // Try to load previous series final disciplines
            if (BookSeriesId.Kai < currentSeries.id) {
                const aChartEndKai = state.getPreviousBookActionChart(BookSeries.series[BookSeriesId.Kai].bookEnd);
                if (aChartEndKai) {
                    o.kaiDisciplines = aChartEndKai.kaiDisciplines;
                }
            }
            if (BookSeriesId.Magnakai < currentSeries.id) {
                const aChartEndMagnakai = state.getPreviousBookActionChart(BookSeries.series[BookSeriesId.Magnakai].bookEnd);
                if (aChartEndMagnakai) {
                    o.magnakaiDisciplines = aChartEndMagnakai.magnakaiDisciplines;
                }
            }
            // New Order starts fresh, don't load here

            // Setup uninitialiced properties
            if (!o.kaiDisciplines) {
                o.kaiDisciplines = { disciplines: [], weaponSkill: [] };
            }
            if (!o.magnakaiDisciplines) {
                o.magnakaiDisciplines = { disciplines: [], weaponSkill: [] };
            }
            if (!o.grandMasterDisciplines) {
                o.grandMasterDisciplines = { disciplines: [], weaponSkill: [] };
            }
            if (!o.newOrderDisciplines) {
                o.newOrderDisciplines = { disciplines: [], weaponSkill: [] };
            }
        }

        // Changed in 1.18. Multicurrency support
        if (o.beltPouch && typeof(o.beltPouch) === "number") {
            let oldBeltPouch = o.beltPouch;
            o.beltPouch = {};
            o.beltPouch[CurrencyName.CROWN] = oldBeltPouch;

            if (o.beltPouchNoble) {
                o.beltPouch[CurrencyName.NOBLE] = o.beltPouchNoble;
            }

            // Setup uninitialized properties
            Object.entries(CurrencyName).forEach(([key]) => {
                if (!o.beltPouch[key.toLowerCase()]) {
                   o.beltPouch[key.toLowerCase()] = 0;
                }
            });
        }

        const actionChart: ActionChart = $.extend(new ActionChart(), o);

        // Replace plain objects by ActionChartItem instances.
        // Changed in 1.12. In previous versiones, arrays were string[] with object ids
        actionChart.weapons = ActionChartItem.fromObjectsArray(actionChart.weapons);
        actionChart.backpackItems = ActionChartItem.fromObjectsArray(actionChart.backpackItems);
        actionChart.specialItems = ActionChartItem.fromObjectsArray(actionChart.specialItems);

        return actionChart;
    }
}
