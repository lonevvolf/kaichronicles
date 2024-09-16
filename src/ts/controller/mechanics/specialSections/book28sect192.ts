import { state, gameController, Mechanics } from "../../..";

/**
 * Generate trader with funny deals
 * This has an issue:
 * If you buy an item, then drop a special item, then drop the purchased item, then pick up the special item, the already purchased item will cost money
 */
export const book28sect192 = {

    run() {
        const sectionState = state.sectionStates.getSectionState();
        var itemPrice = 4;
        var refresh = false;
        const items = ["klorvapotion", "sabitoroot", "anduiflask"];

        // If there is one item left with a price of 4, reduce it to 2 (total cost of 3 items will be 10)
        if (sectionState.objects.filter((o) => o.price > 0).length === 1) {
            itemPrice = 2;
        }

        // If there is a Special Item on the section, make the items free
        if (sectionState.getCntSectionObjects("special")) {
            itemPrice = 0;
        }

        // If the price has changed, update the objects and mark for refresh
        if (sectionState.objects && sectionState.objects.length && sectionState.objects[0].price != itemPrice) {
            items.forEach((itemToUpdate) => {
                if (sectionState.getSectionObjects().find((item) => item.id === itemToUpdate)) {
                    let rule = $(`<object objectId="${itemToUpdate}" />`);
                    delete sectionState.executedRules[ Mechanics.getRuleSelector(rule[0]) ];
                    sectionState.removeObjectFromSection(itemToUpdate, -1);
                    refresh = true;
                }
            });
        }

        // Add the objects to the available objects on the section
        items.forEach((itemToUpdate) => {
            let rule = $(`<object objectId="${itemToUpdate}" />`);
            // Do not execute the rule twice:
            if (!sectionState.ruleHasBeenExecuted(rule[0])) {
                sectionState.addObjectToSection(itemToUpdate, itemPrice);
                sectionState.markRuleAsExecuted(rule[0]);
            }
        });
        
        // If there is a Special Item on the section, prevent pickup unless all the sale items are still there
        if (sectionState.objects && sectionState.objects.length 
            && sectionState.getCntSectionObjects("special") 
            && !(sectionState.objects.find((o) => o.id == "klorvapotion")
                && sectionState.objects.find((o) => o.id == "sabitoroot")
                && sectionState.objects.find((o) => o.id == "anduiflask"))) {
                    const itemToDisable = sectionState.getSectionObjects("special")[0].id;
                    $(`a[data-objectid='${itemToDisable}']`).attr('disabled', 'disabled');
            }

        if (refresh) {
            gameController.loadSection(state.sectionStates.currentSection, false,
                window.pageYOffset);
        }
    }
};
