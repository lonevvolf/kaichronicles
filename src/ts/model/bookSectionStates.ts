import { SectionState, Section, Combat, CombatTurn } from "..";

/**
 * Class to store book sections states
 * TODO: Remove all members that call to this.getSectionState(). They should be
 * TODO: called directly from SectionState
 */
export class BookSectionStates {

    /** The current section id */
    public currentSection: string|null = null;

    /**
     * Visited section states. The key is the section id (string), and the value
     * is a SectionState instance
     */
    public sectionStates: { [ sectionId: string ]: SectionState|null } = {};

    /**
     * Hunting discipline enabled?
     */
    public huntEnabled: boolean = true;

    /**
     * Other states.
     * Enumerated properties are NOT the only ones, there can be others
     */
    public otherStates = {
        book6sect26TargetPoints: <number|null>null,
        book6sect284: <number[][]|null>null,
        book6sect340: [-1 , -1 , -1],
        book9sect91: <string|null>null,
    };

    /**
     * Global rules to run on each section
     */
    public globalRulesIds = <string[]>[];

    /**
     * Get a section state. If it does not exists, it will be created
     * @param sectionId The section state to return. If it's null, the current section state (this.currentSection)
     * will be returned.
     * @return The section state
     */
    public getSectionState( sectionId: string|null = null ): SectionState {

        if ( !sectionId ) {
            sectionId = this.currentSection;
        }

        if ( sectionId ) {
            let sectionState = this.sectionStates[ sectionId ];
            if ( !sectionState ) {
                sectionState = new SectionState();
                this.sectionStates[ sectionId ] = sectionState;
            }

            return sectionState;
        }

        return new SectionState();
    }

    /**
     * Clear some section state
     * @param {string} sectionId The section id to clear
     */
    public resetSectionState(sectionId: string) {
        this.sectionStates[ sectionId ] = null;
    }

    /**
     * Check if a rule has been executed on the current section
     * @param rule Rule to check
     * @return The object associated with the execution. true if there was no result stored
     */
    public ruleHasBeenExecuted(rule: Element): any {
        return this.getSectionState().ruleHasBeenExecuted(rule);
    }

    /**
     * Mark a rule as executed on the current section
     * @param rule The executed rule
     * @param executionState The state to associate with the execution. If it's null,
     * if will be set to true
     */
    public markRuleAsExecuted(rule: Element, executionState: any = true ) {
        this.getSectionState().markRuleAsExecuted( rule, executionState );
    }

    /**
     * Setup combat states on the current section
     * @param section The current section info
     */
    public setupCombats( section: Section ) {
        const sectionState = this.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            const combats = section.getCombats();
            if ( combats.length > 0 ) {
                sectionState.combats = combats;
            }
        }
    }

    public fromStateObject(stateObject: BookSectionStates) {

        this.currentSection = stateObject.currentSection;
        this.huntEnabled = stateObject.huntEnabled;

        // Replace generic objects by the needed objects
        this.sectionStates = {};
        $.each( stateObject.sectionStates , ( sectionId , s ) => {
            const sectionState = $.extend( new SectionState() , s );
            this.sectionStates[ <string> sectionId ] = sectionState;

            // Restore combats
            const combats = <Combat[]>[];
            $.each( sectionState.combats , ( index , combat ) => {
                const rightCombat = $.extend( new Combat( "" , 0 , 0 ) , combat );
                // Fix for spelling error in old saves
                // @ts-ignore
                if (rightCombat["dammageMultiplier"] !== undefined) {
                    // @ts-ignore
                    rightCombat.damageMultiplier = rightCombat["dammageMultiplier"];
                    // @ts-ignore
                    delete(rightCombat["dammageMultiplier"]);
                }
                // @ts-ignore
                if (rightCombat["permanentDammage"] !== undefined) {
                    // @ts-ignore
                    rightCombat.permanentDamage = rightCombat["permanentDammage"];
                    // @ts-ignore
                    delete(rightCombat["permanentDammage"]);
                }
                combats.push( rightCombat );

                // Restore combat turns
                const turns = <CombatTurn[]>[];
                $.each( rightCombat.turns , ( turnIndex , turn ) => {
                    // Fix for spelling error in old saves
                    // @ts-ignore
                    if (turn["dammageMultiplier"] !== undefined) {
                        // @ts-ignore
                        turn.damageMultiplier = turn["dammageMultiplier"];
                        // @ts-ignore
                        delete(turn["dammageMultiplier"]);
                    }
                    turns.push( $.extend( new CombatTurn(null, 0, false, false) , turn ) );
                });
                rightCombat.turns = turns;
            });
            sectionState.combats = combats;
        });

        // Other states initialization. Be sure it's not null (created on v1.3)
        if ( stateObject.otherStates ) {
            this.otherStates = stateObject.otherStates;
        }

        // Global rules. Be sure it's not null (created on v1.4)
        this.globalRulesIds = stateObject.globalRulesIds;
        if ( !this.globalRulesIds ) {
            this.globalRulesIds = [];
        }

    }

    public sectionIsVisited(sectionId: string): boolean {
        return this.sectionStates[sectionId] ? true : false;
    }

}
