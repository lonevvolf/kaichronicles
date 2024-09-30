import { randomMechanics, state, Item, numberPickerMechanics, disciplinePickerMechanics, mechanicsEngine, CurrencyName } from "..";

/**
 * Evaluation of mechanics expressions
 */
export class ExpressionEvaluator {
    /**
     * Expression to find texts to replace
     * Matches anything between "[" and "]", both included
     */
    private static replacementsRegex: RegExp = /\[[^\[\]]*?\]/g;

    /**
     * Dictionary of functions to do the replacements.
     * Key is the keyword to replace, and the value is the function that returns the replacement
     */
    private static replacementFunctions: { [ keyword: string ]: () => number } = {

        // Last random value
        "[RANDOM]"() {
            // TODO Find a way to load previous value if lastValue is null
            return randomMechanics.lastValue ?? -1;
        },

        // Last combat random value
        "[COMBATRANDOM]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getLastRandomCombatTurn();
        },

        // Total money on the belt pouches (in Crowns)
        "[MONEY]"() {
            return state.actionChart.getBeltPouchUsedAmount(false);
        },

        "[CROWNS]"() {
            return state.actionChart.beltPouch[CurrencyName.CROWN];
        },

        "[KIKA]"() {
            return state.actionChart.beltPouch[CurrencyName.KIKA];
        },

        "[LUNE]"() {
            return state.actionChart.beltPouch[CurrencyName.LUNE];
        },

        "[REN]"() {
            return state.actionChart.beltPouch[CurrencyName.REN];
        },

        "[SHEASUTORQS]"() {
            return state.actionChart.beltPouch[CurrencyName.SHEASUTORQ];
        },

        // Money available on the section
        "[MONEY-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getAvailableMoney();
        },

        // Backpack items on section (includes meals)
        "[BACKPACK-ITEMS-CNT-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getCntSectionObjects("object");
        },

        // Meal items on section
        "[MEALS-CNT-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getSectionObjects("object").filter((item) => item.id === "meal").length;
        },

        // Backpack items on section (includes meals)
        "[BACKPACK-ITEMS-CNT-ON-ACTIONCHART]"() {
            return state.actionChart.getNBackpackItems();
        },

        // Backpack items on section (includes meals)
        "[BACKPACK-ITEMS-ON-ACTIONCHART]"() {
            return state.actionChart.getNBackpackItems(true, false);
        },

        // This does NOT include special items:
        "[WEAPON-ITEMS-CNT-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getCntSectionObjects("weapon");
        },

        // This does NOT include special items:
        "[WEAPON-ITEMS-CNT-ON-ACTIONCHART]"() {
            return state.actionChart.weapons.length;
        },

        // This includes special items
        "[WEAPONLIKE-CNT-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getWeaponObjects().length;
        },

        // This includes special items
        "[WEAPONLIKE-CNT-ON-ACTIONCHART]"() {
            return state.actionChart.getWeaponObjects().length;
        },

        // This includes special items
        "[BOW-CNT-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            let count = 0;
            for (const weapon of sectionState.getWeaponObjects()) {
                if (weapon.isWeaponType(Item.BOW)) {
                    count++;
                }
            }
            return count;
        },

        // This includes special items
        "[BOW-CNT-ON-ACTIONCHART]"() {
            let count = 0;
            for (const weapon of state.actionChart.getWeaponObjects()) {
                if (weapon.isWeaponType(Item.BOW)) {
                    count++;
                }
            }
            return count;
        },

        // Count of special items on section
        "[SPECIAL-ITEMS-ON-SECTION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getCntSectionObjects("special");
        },

        // Count of special items on on action chart
        "[SPECIAL-ITEMS-ON-ACTIONCHART]"() {
            return state.actionChart.specialItems.length;
        },

        // Current endurance
        "[ENDURANCE]"() {
            return state.actionChart.currentEndurance;
        },

        "[MAXENDURANCE]"() {
            return state.actionChart.getMaxEndurance();
        },

        "[ORIGINALCOMBATSKILL]"() {
            return state.actionChart.combatSkill;
        },

        "[COMBATSENDURANCELOST]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.combatsEnduranceLost("player");
        },

        "[COMBATSENEMYLOST]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.combatsEnduranceLost("enemy");
        },

        "[ENEMYENDURANCE]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getEnemyEndurance();
        },

        // Number of meals on the backpack
        "[MEALS]"() {
            return state.actionChart.meals;
        },

        // Player current number of disciplines
        "[KAILEVEL]"() {
            return state.actionChart.getDisciplines().length;
        },

        "[NUMBERPICKER]"() {
            return numberPickerMechanics.getNumberPickerValue();
        },

        "[NUMBERPICKER1]"() {
            return numberPickerMechanics.getNumberPickerValue(1);
        },

        "[DISCIPLINEPICKER]"() {
            return disciplinePickerMechanics.getDisciplinePickerValue();
        },

        "[COMBATSDURATION]"() {
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.combatsDuration();
        },

        "[BOWBONUS]"() {
            return state.actionChart.getBowBonus();
        },

        // Current number of arrows
        "[ARROWS]"() {
            return state.actionChart.arrows;
        },

        // Extra randoms
        "[RANDOM0]"() { return randomMechanics.getRandomValueChoosed(0); },
        "[RANDOM1]"() { return randomMechanics.getRandomValueChoosed(1); },
        "[RANDOM2]"() { return randomMechanics.getRandomValueChoosed(2); }

    };

    /**
     * Get keywords contained on an expression
     * @param expression Expression where to find keywords
     * @returns Keywords found
     */
    public static getKeywords( expression: string ): string[] {

        const repeatedKeywords = expression.match( ExpressionEvaluator.replacementsRegex );
        if ( !repeatedKeywords ) {
            return [];
        }

        const keywords: string[] = [];
        for ( const keyword of repeatedKeywords ) {
            if ( !keywords.includes(keyword) ) {
                keywords.push( keyword );
            }
        }
        return keywords;
    }

    /**
     * Replace keywords by its values
     * @param expression Expression where to replace keywords
     * @returns The expression with the replaced values
     */
    private static doReplacements( expression: string|undefined ): string|undefined {
        for ( const keyword of ExpressionEvaluator.getKeywords(expression) ) {
            let replacement: string;
            const functionReplacer = ExpressionEvaluator.replacementFunctions[ keyword ];
            if ( !functionReplacer ) {
                mechanicsEngine.debugWarning( "Unknown keyword on expression: " + keyword );
                replacement = "0";
            } else {
                replacement = functionReplacer().toString();
            }
            expression = expression.replaceAll( keyword , replacement );
        }
        return expression;
    }

    /**
     * Replaces keywords and evaluates an expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    private static eval( expression: string|undefined ): any {
        try {
            expression = ExpressionEvaluator.doReplacements( expression );
            // tslint:disable-next-line: no-eval
            return eval( expression );
        } catch (e) {
            mechanicsEngine.debugWarning("Error evaluating expression " + expression + ": " + e);
            return null;
        }
    }

    /**
     * Check if a keyword is valid
     * @param keyword Keyword to check
     * @returns True if it's valid
     */
    public static isValidKeyword( keyword: string ): boolean {
        if ( ExpressionEvaluator.replacementFunctions[ keyword ] ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Evaluates a boolean expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    public static evalBoolean( expression: string ): boolean {
        return ExpressionEvaluator.eval( expression );
    }

    /**
     * Evaluates an integer expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    public static evalInteger( expression: string|undefined ): number {
        return Math.floor( ExpressionEvaluator.eval( expression ) );
    }

    /**
     * Evaluates an integer expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    public static evalFloat( expression: string|undefined ): number {
        return <number>(ExpressionEvaluator.eval( expression ));
    }

}
