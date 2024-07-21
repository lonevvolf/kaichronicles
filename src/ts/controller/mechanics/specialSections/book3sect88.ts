import { state, CombatTurn, COMBATTABLE_DEATH, randomTable, Combat } from "../../..";

/**
 * Javek venom test
 */
export const book3sect88 = {

    run() {
        // Replace the combat turns generation:
        const sectionState = state.sectionStates.getSectionState();

        const nextTurnAsyncFunction = function(): JQueryPromise<CombatTurn> {
            return void Combat.prototype.nextTurnAsync.call(this)
            .then((turn: CombatTurn) => {
                // Check the bite:
                if (turn.loneWolf !== COMBATTABLE_DEATH && turn.loneWolf > 0) {
                    const biteRandomValue = randomTable.getRandomValue();
                    turn.playerLossText = "(" + turn.playerLossText + ")";
                    turn.playerLossText += `Random: ${biteRandomValue}`;
                    if ( biteRandomValue === 9 ) {
                        turn.loneWolf = COMBATTABLE_DEATH;
                    } else {
                        turn.loneWolf = 0;
                    }
                }

                return jQuery.Deferred().resolve(turn).promise();
            });
        };

        for (const combat of sectionState.combats) {
            combat.nextTurnAsync = nextTurnAsyncFunction;
        }
    },
};
