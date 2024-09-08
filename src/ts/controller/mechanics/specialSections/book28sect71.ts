import { state, Combat, InventoryState, actionChartController } from "../../..";

/**
 * Generate combat against own Kai Weapon
 */
export const book28sect71 = {

    run() {
        // Get stored Kai Weapon
        const restorePoint = "lostKaiWeapon";
        const inventoryStateObject: any = state.sectionStates.otherStates[restorePoint];
        const inventoryState = InventoryState.fromObject(inventoryStateObject);
        const kaiWeaponItem = inventoryState.specialItems[0];

        const pageCombat = $(".combat");
        var defaultCS = pageCombat.contents().filter(function() {
            return this.nodeType == 3;
          }).first().text();
        var defaultEP = pageCombat.contents().filter(function() {
            return this.nodeType == 3;
          }).last().text();

        var extractedCS = defaultCS.replace(/[^0-9]/gi, ''); // Replace everything that is not a number with nothing
        var extractedEP = defaultEP.replace(/[^0-9]/gi, ''); // Replace everything that is not a number with nothing
        var enemyCS = parseInt(extractedCS, 10); 
        var enemyEP = parseInt(extractedEP, 10); 

        // Adjust enemy CS by 5 less any damage to the weapon
        enemyCS += 5 + kaiWeaponItem.damage;
        extractedCS += ` +${5 + kaiWeaponItem.damage} CS Kai Weapon Bonus`;

        // Adjust enemy CS for any bonuses
        if (kaiWeaponItem.id === "illuminatus") {
            enemyCS += 2;
            extractedCS += ` +2 CS Illuminatus`;
        } else if (kaiWeaponItem.id === "valiance" && 
            (state.actionChart.hasDiscipline("alchemy") || state.actionChart.hasDiscipline("magi"))) {
                enemyCS += 3;
                extractedCS += ` +3 CS Valiance`;
        } else if (kaiWeaponItem.id === "kaistar") {
            enemyCS += 2;
            extractedCS += ` +2 CS Kaistar`;
        }

        // Remove the existing combat from UI and state, to be replaced with a new one
        $(".combat").remove();
        state.sectionStates.getSectionState().combats[0].combatSkill = enemyCS;

        $('#game-section > p.choice').before(
            `<div class="combat well">
                <b>Tomb Robbers (with Kai Weapon)</b>
                <br>
                <span class="attribute">
                    COMBAT SKILL
                </span>
                : ${extractedCS} &nbsp;&nbsp; 
                <span class="attribute">
                    ENDURANCE
                </span>: 
                <span class="enemy-current-endurance">
                    ${enemyEP}
                </span>
                / ${enemyEP}
            </div>`);

        // Add combat to the section
        state.sectionStates.getSectionState().combats.push(new Combat("Tomb Robbers (with Kai Weapon)", enemyCS, enemyEP));
    }
};
