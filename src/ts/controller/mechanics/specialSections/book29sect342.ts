import { state, mechanicsEngine, CombatTurn, Combat } from "../../..";

/** Bow tournament final */
export const book29sect342 = {

    run() {
        // Replace the combat turns generation:
        const sectionState = state.sectionStates.getSectionState();
        for (const combat of sectionState.combats) {
            combat.nextTurnAsync = book29sect342.nextTurnAsync;
        }
    },

    /** Replacement for combat turns generation */
    nextTurnAsync(): JQueryPromise<CombatTurn> {
        return Combat.prototype.nextTurnAsync.call(this)
        .then((turn: CombatTurn) => {
            if (turn.enemy !== "D" && turn.enemy as number > 3) {
                turn.enemyExtra += -1;
                turn.enemy -= -1;
            } 
            return jQuery.Deferred().resolve(turn).promise();
        });
    },
};
