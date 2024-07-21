import { state, Combat } from "../../..";

/**
 * Generate Wolf's Bane combat
 */
export const book19sect304 = {

    run() {
        // Get endurance/combat skill
        const combatSkill = state.actionChart.getCurrentCombatSkill(new Combat("fake", 1, 1)) + 4;
        let endurance = state.actionChart.currentEndurance;

        if(state.actionChart.hasObject('bronzedisc')) {
            endurance -= 4;
        }

        // Add combat section to the DOM
        $('#game-section > p.choice').before(`<div class="combat well"><b>Wolf's Bane</b><br><span class="attribute">COMBAT SKILL</span>: ${combatSkill} &nbsp;&nbsp; <span class="attribute">ENDURANCE</span>: <span class="enemy-current-endurance">${endurance}</span> / ${endurance}</div>`);

        // Add combat to the section
        state.sectionStates.getSectionState().combats.push(new Combat("Wolf's Bane", combatSkill, endurance));
    }
};
