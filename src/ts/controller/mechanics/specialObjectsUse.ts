import { Item, randomTable, translations, state, actionChartController, mechanicsEngine, randomMechanics } from "../..";

/**
 * Special objects use
 */
export class SpecialObjectsUse {

    /** Use special object */
    public static use( item: Item ) {
        if ( item.id === "pouchadgana" ) {
            SpecialObjectsUse.useAdgana();
        } else if ( item.id === "karmo" ) {
            SpecialObjectsUse.useKarmo();
        } else if ( item.id === "malavanpotion" ) {
            SpecialObjectsUse.useMalavan();
        } else {
            mechanicsEngine.debugWarning("SpecialObjectsUse - Unknown object: " + item.id );
        }
    }

    /** Effects of Adgana after combats ( object id "pouchadgana") */
    public static postAdganaUse() {
        const r = randomTable.getRandomValue();
        toastr.info( translations.text( "adganaUse" , [r] ) );

        // If you have ever used Adgana in a previous Lone Wolf adventure, the risks of addiction are doubled should you decide to
        // use this dose (you will become addicted if you pick a 0, 1, 2, or 3 on the Random Number Table
        let addicted = false;
        if ( state.actionChart.adganaUsed ) {
            addicted = ( r >= 0 && r <= 3 );
        } else {
            addicted = ( r === 0 || r === 1 );
        }

        if ( addicted ) {
            actionChartController.increaseEndurance( -4 , false , true );
        }

        // Remember adgana use
        state.actionChart.adganaUsed = true;
    }

    /** Effects of Karmo after combats ( object id "karmo") */
    public static postKarmoUse() {
        // Halve the player's EP after combats
        actionChartController.increaseEndurance(-(Math.floor(state.actionChart.currentEndurance/2)));
    }

    /** Use Adgana ( object id "pouchadgana") */
    private static useAdgana() {

        // There are pending combats on the current section?
        const sectionState = state.sectionStates.getSectionState();

        // Set flag for combats
        for ( const c of sectionState.combats ) {
            c.adganaUsed = true;
        }

        // Apply adgana effects:
        const effectCS = state.actionChart.adganaUsed ? +3 : +6;
        sectionState.combatSkillUsageModifier( effectCS );

        const combatsState = sectionState.areAllCombatsFinished(state.actionChart);
        if ( combatsState === "finished" || combatsState === "eluded"  ) {
            // No pending combats. Fire the adgana post-combat effects right now
            SpecialObjectsUse.postAdganaUse();
        }
    }

    /** Use Karmo ( object id "karmo") */
    private static useKarmo() {
        // There are pending combats on the current section?
        const sectionState = state.sectionStates.getSectionState();

        // Determine random EP loss
        const r = randomTable.getRandomValue();
        state.actionChart.increaseEndurance(-r);
        toastr.info( translations.text( "karmoUse" , [r] ) );

        // Double the player's EP for the duration of the combat
        // Note that according to the Game Rules: ...your number of ENDURANCE points cannot rise above the number you have when you start an adventure.
        actionChartController.increaseEndurance(state.actionChart.currentEndurance);

        // Set flag for combats
        for ( const c of sectionState.combats ) {
            c.karmoUsed = true;
        }

        const combatsState = sectionState.areAllCombatsFinished(state.actionChart);
        if ( combatsState === "finished" || combatsState === "eluded"  ) {
            // No pending combats. Fire the adgana post-combat effects right now
            SpecialObjectsUse.postKarmoUse();
        }
    }

    /** Use Malavan ( object id "malavanpotion") */
    private static useMalavan() {
        // There are pending combats on the current section?
        const sectionState = state.sectionStates.getSectionState();

        // Increase stats for combats
        for ( const c of sectionState.combats ) {
            c.mindblastBonus += 2;
            c.kaiSurgeBonus += 2;
        }
        
    }
}
