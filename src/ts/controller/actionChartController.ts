import { setupController, views, actionChartView, state, ActionChartItem, SectionItem, EquipmentSectionMechanics, translations, template, mechanicsEngine, Item, SpecialObjectsUse, CombatMechanics, Bonus, InventoryState, CurrencyName, NewOrderDiscipline } from "..";

/**
 * The action chart controller
 */
export const actionChartController = {

    /**
     * Render the action chart
     */
    index() {

        if (!setupController.checkBook()) {
            return;
        }

        void views.loadView("actionChart.html")
            .then(() => {
                actionChartView.fill(state.actionChart);
                template.addSectionReadyMarker();
            });
    },

    /**
     * Pick an object by its id
     * @param objectId The object id to pick
     * @param showError True we should show a toast if the player
     * cannot pick the object
     * @param fromUITable True if we are picking the object from the UI
     * @return True if the object has been get. False if the object cannot be get
     */
    pick(objectId: string, showError: boolean = false): boolean {
        return actionChartController.pickActionChartItem(new ActionChartItem(objectId), showError, false);
    },

    /**
     * Pick an object from the user interface
     * @param sectionItem The object to pick
     * @return True if the object has been get. False if the object cannot be get
     */
    pickFromUi(sectionItem: SectionItem): boolean {
        const aChartItem = new ActionChartItem(sectionItem.id, sectionItem.usageCount);
        return actionChartController.pickActionChartItem(aChartItem, true, true);
    },

    /**
     * Pick an object
     * @param aChartItem The object to pick
     * @param showError True we should show a toast if the player
     * cannot pick the object
     * @param fromUITable True if we are picking the object from the UI
     * @return True if the object has been get. False if the object cannot be get
     */
    pickActionChartItem(aChartItem: ActionChartItem, showError: boolean = false, fromUITable: boolean = false): boolean {
        try {
            // Get object info
            const o = aChartItem.getItem();
            if (o === null) {
                return false;
            }

            // Check if the section has restrictions about picking objects
            // This will throw an exception if no more objects can be picked
            if (fromUITable) {
                EquipmentSectionMechanics.checkMoreObjectsCanBePicked(aChartItem.id);
            }

            // Try to pick the object
            if (!state.actionChart.pick(aChartItem)) {
                return false;
            }

            // Show toast
            actionChartView.showInventoryMsg("pick", o, translations.text("msgGetObject", [o.name]));

            // Update player statistics (for objects with effects)
            actionChartView.updateStatistics();
            template.updateStatistics();

            return true;
        } catch (e) {
            // Error picking
            if (showError) {
                toastr.error(e);
            }
            console.log(e); // This is not really an application error, so do not call mechanicsEngine.debugWarning()
            return false;
        }
    },

    /**
     * The player pick a set of objects
     * @param arrayOfItems Array with object to pick
     */
    pickItemsList(arrayOfItems: ActionChartItem[]) {
        let renderAvailableObjects = false;
        const sectionState = state.sectionStates.getSectionState();
        for (const item of arrayOfItems) {
            if (!actionChartController.pickActionChartItem(item, true, false)) {
                // Object cannot be picked. Add the object as available on the current section
                sectionState.addActionChartItemToSection(item);
                renderAvailableObjects = true;
            }
        }
        if (renderAvailableObjects) {
            // Render available objects on this section (game view)
            mechanicsEngine.fireInventoryEvents();
        }
    },

    /**
     * Drop an object
     * @param objectId The object to drop,
     * or "allweapons" to drop all weapons (it does not drop special items weapons)
     * or "allhandtohand" to drop all hand to hand weapons (it does not drop special items weapons)
     * or "allweaponlike" to drop all weapons and special items weapons
     * or "backpackcontent" to drop all backpack content, but not the backpack
     * or "currentweapon" to drop the current weapon
     * or "allspecial" to drop all the special items
     * or "allspecialgrdmaster" to drop all the special items except the ones allowed when beginning Grand Master serie
     * or "allmeals" to drop all meals
     * or "all" to drop all (weapons, backpack, special items, and money)
     * or "allobjects" to drop all objects (weapons, backpack content, special items)
     * @param availableOnSection Only applies if objectId is really an object id. True if the object should be available on
     * the current section
     * @param fromUI True if the action is fired from the UI
     * @param dropCount Object count to drop (only for quivers/fireseeds. count === n. arrows/fireseeds to drop)
     * @param objectIndex Only applies if objectId is an object id. If specified, object index in the Action Chart object
     * array to drop. If it's not specified the first object with the given objectId will be dropped (there can be more than one
     * item with the same id)
     * @returns If objectId was an really object id and the object was deleted, it returns the delete object info.
     * Otherwise, it returns true if something was deleted, or false if not
     */
    drop(objectId: string, availableOnSection: boolean = false, fromUI: boolean = false, dropCount: number = 1,
         objectIndex: number = -1): boolean|ActionChartItem {

        if (objectId === "allweapons") {
            actionChartController.dropItemsList(state.actionChart.getWeaponsIds());
            return true;
        }

        if (objectId === "allhandtohand") {
            for(const w of state.actionChart.getWeaponsIds()) {
                const i = state.actionChart.getActionChartItem(w);
                if(i.getItem().isHandToHandWeapon()) {
                    this.drop(i.getItem().id);
                }
            }
            return true;
        }

        if (objectId === "currentweapon") {
            const selectedWeapon = state.actionChart.getSelectedWeapon();
            if (selectedWeapon) {
                this.drop(selectedWeapon);
            }
            return true;
        }

        if (objectId === "allweaponlike") {
            const weaponsIds = <string[]>[];
            for (const w of state.actionChart.getWeaponObjects(false)) {
                weaponsIds.push(w.id);
            }
            actionChartController.dropItemsList(weaponsIds);
            return true;
        }

        if (objectId === "backpackcontent") {
            actionChartController.dropBackpackContent();
            return true;
        }

        if (objectId === "allspecial") {
            actionChartController.dropItemsList(state.actionChart.getSpecialItemsIds());
            return true;
        }

        if (objectId === "allspecialgrdmaster") {
            actionChartController.dropItemsList(state.actionChart.getSpecialItemsIds().filter((itemId) => {
                return !Item.ALLOWED_GRAND_MASTER.includes(itemId);
            }));
            return true;
        }

        if (objectId === "allmeals") {
            actionChartController.increaseMeals(-state.actionChart.meals);
            return true;
        }

        if (objectId === "all" || objectId === "allobjects") {

            if (objectId === "all") {
                actionChartController.drop("backpack");
                actionChartController.increaseMoney(- state.actionChart.beltPouch);
            } else {
                // objectId === 'allobjects' => Backpack content, but not the backpack itself
                actionChartController.drop("backpackcontent");
            }

            actionChartController.drop("allweapons");
            actionChartController.drop("allspecial");
            return true;
        }

        if (objectId === "kaiweapon") {
            return actionChartController.drop(state.actionChart.getKaiWeapon());
        }

        const droppedItem = state.actionChart.drop(objectId, dropCount, objectIndex);
        if (droppedItem) {
            const item = droppedItem.getItem();

            actionChartView.showInventoryMsg("drop", item, translations.text("msgDropObject", [item.name]));

            // Update the action chart view
            actionChartView.updateObjectsLists();
            actionChartView.fillKaiWeapon(state.actionChart);

            // Update player statistics (for objects with effects)
            actionChartView.updateStatistics();
            template.updateStatistics();

            if (availableOnSection) {
                // Add the droped object as available on the current section
                const sectionState = state.sectionStates.getSectionState();
                sectionState.addActionChartItemToSection(droppedItem, dropCount);

                // Render available objects on this section (game view)
                mechanicsEngine.fireInventoryEvents(fromUI, item);
            }
            return droppedItem;
        } else {
            return false;
        }
    },

    /**
     * Drop all backpack content
     */
    dropBackpackContent() {
        actionChartController.increaseMeals(-state.actionChart.meals);
        actionChartController.dropItemsList(state.actionChart.getBackpackItemsIds());
    },

    /**
     * Drop an array of objects
     * @param arrayOfItems Array of the objects ids to drop.
     */
    dropItemsList(arrayOfItems: string[]) {
        // arrayOfItems can be a reference to a state.actionChart member, so don't
        // traverse it as is, or we will lose elements
        const elementsToDrop = arrayOfItems.clone();
        for (const objectId of elementsToDrop) {
            actionChartController.drop(objectId, false, false);
        }
    },

    /**
     * Drop a set of objects by its index
     * @param arrayOfItems Source array of objects
     * @param indices Indices to arrayOfItems of objects to drop. IT MUST NOT CONTAIN DUPLICATED INDICES !!!
     * @returns Dropped objects
     */
    dropItemIndicesList(arrayOfItems: ActionChartItem[], indices: number[]): ActionChartItem[] {

        // We will delete objects one by one. To be sure indices still valid, delete in descending orde
        indices = indices.clone();
        indices.sort();
        indices.reverse();

        // Drop objects
        const droppedItems: ActionChartItem[] = [];
        for (const index of indices) {
            if (index < 0 || index >= arrayOfItems.length) {
                continue;
            }
            const item = arrayOfItems[index];
            let count = 0;

            if(item.id === Item.FIRESEED) {
                // Erase all fireseeds
                count = state.actionChart.fireseeds;
            } else if(item.id === Item.QUIVER) {
                // Erase one quiver
                count = state.actionChart.arrows % 6;
            }

            if (actionChartController.drop(item.id, false, false, count, index)) {
                droppedItems.push(item);
            }
        }
        return droppedItems;
    },

    /**
     * Use an object
     * @param objectId The object to use
     * @param dropObject True if the object should be dropped from the action chart
     * @param index If used object was a owned object, this is the object index in its Action Chart array. If not specified
     * or < 0, the first owned object will be used
     * @param displayToast True if a message must be displayed
     */
    use(objectId: string, dropObject: boolean = true, index: number = -1, displayToast = false, applyEffect = true) {
        // Get the object
        const o = state.mechanics.getObject(objectId);
        if (!o) {
            return;
        }

        if (o.usage && applyEffect) {
            // Do the usage action:
            if (o.usage.cls === Item.ENDURANCE) {
                actionChartController.increaseEndurance(o.usage.increment);
                // Check if a meal should be consumed as well (note that meal-like objects are not observed here, since New Order hasn't offered any yet)
                if (o.usage.takenWithMeal && !state.actionChart.hasDiscipline(NewOrderDiscipline.GrandHuntmastery)) {
                    actionChartController.increaseMeals(-1);
                } else if (o.usage.takenWithLaumspur && !state.actionChart.hasDiscipline(NewOrderDiscipline.Herbmastery)) {
                    actionChartController.use("laumspurpotion4");
                }
            } else if (o.usage.cls === Item.COMBATSKILL) {
                // Combat skill modifiers only apply to the current section combats
                const sectionState = state.sectionStates.getSectionState();
                sectionState.combatSkillUsageModifier(o.usage.increment);
            } else if (o.usage.cls === "special") {
                // Special usage
                SpecialObjectsUse.use(o);
            }
        }

        if (displayToast) {
            toastr.info(translations.text("objectUsed", [o.name]));
        }

        // Update player statistics
        actionChartView.updateStatistics();
        template.updateStatistics();

        // Owned object to drop?
        if (dropObject) {
            // Decrease the usageCount. If there are no more uses, drop the object
            const aChartItem = state.actionChart.getActionChartItem(objectId, index);
            if (aChartItem) {
                // Be sure usageCount is not null
                if (!aChartItem.usageCount) {
                    aChartItem.usageCount = 0;
                }
                aChartItem.usageCount--;
                if (aChartItem.usageCount <= 0) {
                    actionChartController.drop(objectId, false, false, 0, index);
                } else {
                    actionChartView.updateObjectsLists();
                }
            }
        }

        // Fire mechanics rules
        mechanicsEngine.fireObjectUsed(objectId);
    },

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease
     */
    increaseMeals(count: number) {
        try {
            state.actionChart.increaseMeals(count);
            const o = state.mechanics.getObject("meal");
            if (count > 0) {
                actionChartView.showInventoryMsg("pick", o,
                    translations.text("msgGetMeal", [count]));
            } else if (count < 0) {
                actionChartView.showInventoryMsg("drop", o,
                    translations.text("msgDropMeal", [-count]));
            }
        } catch (e) {
            toastr.error(e);
        }
    },

    /**
     * Increase / decrease the money counter
     * @param count Number to increase. Negative to decrease
     * @param availableOnSection The dropped money should be available on the current section? Only applies if count < 0
     * @param excessToKaiMonastry If true and if the belt pouch exceed 50, the excess is stored in the kaimonastry section
     * @param currencyId The currency to increase or decrease (defaults to Crowns)
     * @returns Amount really picked.
     */
    increaseMoney(count: number, availableOnSection: boolean = false, excessToKaiMonastry = false, currencyId: string = CurrencyName.CROWN): number {
        const amountPicked = state.actionChart.increaseMoney(count, excessToKaiMonastry, currencyId);
        const o = state.mechanics.getObject("money");
        if (amountPicked > 0) {
            actionChartView.showInventoryMsg("pick", o,
                translations.text("msgGetMoney", [amountPicked, translations.text(currencyId)]));

        } else if (amountPicked < 0) {
            actionChartView.showInventoryMsg("drop", o, 
                translations.text("msgDropMoney", [[-amountPicked], translations.text(currencyId)]));
            
            if (availableOnSection && count < 0) {
                // Add the dropped money as available on the current section
                const sectionState = state.sectionStates.getSectionState();
                sectionState.addObjectToSection(Item.MONEY, 0, false, -count, false, 0, currencyId);
            }
        }
        actionChartView.updateMoney();
        return amountPicked;
    },

    /**
     * Display a toast with an endurance increase / decrease
     * @param count Number to increase. Negative to decrease
     * @param permanent True if the increase is permanent (it changes the original endurance)
     */
    displayEnduranceChangeToast(count: number, permanent: boolean) {
        if (count > 0) {
            toastr.success(translations.text("msgEndurance", ["+" + count.toFixed()]));
        } else if (count < 0) {
            let toast = translations.text("msgEndurance", [count]);
            if (permanent) {
                toast += " (" + translations.text("permanent") + ")";
                toastr.error(toast);
            } else {
                toastr.warning(toast);
            }
        }
    },

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease
     * @param toast False if no message should be show
     * @param permanent True if the increase is permanent (it changes the original endurance)
     */
    increaseEndurance(count: number, toast: boolean = true, permanent: boolean = false) {

        state.actionChart.increaseEndurance(count, permanent);

        if (toast) {
            // Display toast
            actionChartController.displayEnduranceChangeToast(count, permanent);
        }

        if (count < 0) {
            mechanicsEngine.testDeath();
            // Check if the Psi-surge should be disabled
            CombatMechanics.checkSurgeEnabled();
        } else {
            // Check if +20EP button is still available
            actionChartView.updateRestore20EPState();
        }

        template.updateStatistics();

    },

    /**
     * Increase / decrease the current endurance restored in the book
     * @param count Number to increase. Negative to decrease
     */
    increaseNewOrderCuringEPRestored(count: number) {
        state.actionChart.newOrderCuringEPRestored += count;
    },

    /**
     * Get the current endurance restored in the book
     */
    getNewOrderCuringEPRestored() : number {
        return state.actionChart.newOrderCuringEPRestored;
    },

    /** Set the current endurance, just for debug */
    setEndurance(endurance: number) {
        actionChartController.increaseEndurance(endurance - state.actionChart.currentEndurance);
    },

    /**
     * Increase / decrease the combat skill permanently
     * @param count Number to increase. Negative to decrease
     * @param showToast True if we should show a "toast" on the UI with the CS increase
     */
    increaseCombatSkill(count: number, showToast: boolean = true) {
        state.actionChart.combatSkill += count;
        if (showToast) {
            if (count > 0) {
                toastr.success(translations.text("msgCombatSkill", ["+" + count.toFixed()]));
            } else if (count < 0) {
                toastr.warning(translations.text("msgCombatSkill", [count]));
            }
        }
        template.updateStatistics();
    },

    /**
     * Set the current weapon
     * @param weaponId The weapon id to set selected
     */
    setSelectedWeapon(weaponId: string) {
        if (state.actionChart.getSelectedWeapon() === weaponId) {
            return;
        }

        if (!state.actionChart.hasObject(weaponId)) {
            return;
        }

        state.actionChart.setSelectedWeapon(weaponId);
        actionChartController.updateSelectedWeaponUI();
    },

    /**
     * Change the "Fight unarmed" flag.
     * @param fightUnarmed New value for "Fight unarmed" flag
     */
    setFightUnarmed(fightUnarmed: boolean) {
        state.actionChart.fightUnarmed = fightUnarmed;
        actionChartController.updateSelectedWeaponUI();
    },

    /**
     * Update the UI related to the currently selected weapon
     */
    updateSelectedWeaponUI() {

        // Update weapon list
        actionChartView.updateWeapons();

        // There can be weapons on backpack / special items, so update these lists
        actionChartView.updateObjectsLists();

        // Update statistics
        actionChartView.updateStatistics();
        template.updateStatistics();

        // Show toast with the weapon change
        const weapon = state.actionChart.getSelectedWeaponItem(false);
        const name = weapon ? weapon.name : translations.text("noneFemenine");
        toastr.info(translations.text("msgCurrentWeapon", [name]));
    },

    /**
     * Returns a string with a set of bonuses
     * @param {Array} Bonuses to render
     * @return {string} The bonuses text
     */
    getBonusesText(bonuses: Bonus[]) {
        const txt = [];
        for (const bonus of bonuses) {
            let txtInc = bonus.increment.toString();
            if (bonus.increment > 0) {
                txtInc = "+" + txtInc;
            }

            txt.push(bonus.concept + ": " + txtInc);
        }
        return txt.join(", ");
    },

    /**
     * Restore the inventory from an object generated with ActionChart.getInventoryState.
     * This does not replace the current inventory, just append objects to the current.
     * @param inventoryState Inventory to recover. Objects restored will be removed from the state
     * @param recoverWeapons Should we recover weapons (includes special items)?
     */
    restoreInventoryState(inventoryState: InventoryState, recoverWeapons: boolean) {

        if (!state.actionChart.hasBackpack && inventoryState.hasBackpack) {
            actionChartController.pick(Item.BACKPACK, false);
        }
        inventoryState.hasBackpack = false;

        for(const currency in inventoryState.beltPouch) {
            actionChartController.increaseMoney(inventoryState.beltPouch[currency], false, false, currency);
            inventoryState.beltPouch[currency] = 0;
        }

        actionChartController.increaseMeals(inventoryState.meals);
        inventoryState.meals = 0;

        actionChartController.pickItemsList(inventoryState.backpackItems);
        inventoryState.backpackItems = [];

        if (recoverWeapons) {
            actionChartController.pickItemsList(inventoryState.weapons);
            inventoryState.weapons = [];
        }

        if (recoverWeapons) {
            actionChartController.pickItemsList(inventoryState.specialItems);
            inventoryState.specialItems = [];
        } else {
            // Recover only non-weapon special items
            actionChartController.pickItemsList(inventoryState.getAndRemoveSpecialItemsNonWeapon());
        }

        // This must be done after picking quivers (special items)
        actionChartController.increaseArrows(inventoryState.arrows);
        inventoryState.arrows = 0;
    },

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     * @returns Number of really increased arrows. Arrows number on action chart is limited by the number of quivers
     */
    increaseArrows(increment: number): number {
        const realIncrement = state.actionChart.increaseArrows(increment);
        const o = state.mechanics.getObject("arrow");

        if (realIncrement > 0) {
            const gotText = realIncrement === 1 ? translations.text("msgGetArrow", [realIncrement]) : translations.text("msgGetArrows", [realIncrement]);

            actionChartView.showInventoryMsg("pick", o, gotText );
        } else if (increment < 0) {
            const lostText = increment === -1 ? translations.text("msgDropArrow", [-increment]) : translations.text("msgDropArrows", [-increment]);
            // If increment is negative, show always the original amount, not the real (useful for debugging)
            actionChartView.showInventoryMsg("drop", o, lostText);
        } else if (increment > 0 && realIncrement === 0) {
            // You cannot pick more arrows (not quivers enough)
            toastr.error(translations.text("noQuiversEnough"));
        }

        return realIncrement;
    },

    /**
     * Use the Magnakai Medicine Archmaster +20 EP.
     */
    use20EPRestore() {
        if (state.actionChart.use20EPRestore()) {
            toastr.success(translations.text("msgEndurance", ["+20"]));
            template.updateStatistics();
        }
    },

    disableDiscipline(disciplineIndex: number) {
        state.actionChart.disableDiscipline(disciplineIndex);
    },

    /** Return page */
    getBackController() { return "game"; },

};
