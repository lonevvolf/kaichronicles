import { Combat, CombatTable, COMBATTABLE_DEATH, state, translations } from "..";
import { BookSeriesId } from "./bookSeries";

export class CombatTurn {

    /** True if the player is eluding the combat */
    public elude: boolean;

    /** Number of the turn (1 is the first) */
    public turnNumber: number;

    /** The random table result  */
    public randomValue: number;

    /** Lone wolf damage multiplier (can have decimals) */
    public damageMultiplier: number;

    /** Enemy damage multiplier (can have decimals) */
    public enemyMultiplier: number;

    /** Enemy EP base loss.
     * It can be a number or COMBATTABLE_DEATH
     */
    public enemyBase: typeof COMBATTABLE_DEATH | number;

    /** Enemy extra loss */
    public enemyExtra: number;

    /** The enemy total loss.
     * It can be a number or COMBATTABLE_DEATH
     */
    public enemy: typeof COMBATTABLE_DEATH | number;

    /** The player base loss.
     * It can be a number or COMBATTABLE_DEATH
     */
    public loneWolfBase: typeof COMBATTABLE_DEATH | number;

    /** Player extra loss */
    public loneWolfExtra: typeof COMBATTABLE_DEATH | number;

    /** Player prevented damage */
    public loneWolfPrevented: number;

    /** Player total loss.
     * It can be a number or COMBATTABLE_DEATH
     */
    public loneWolf: typeof COMBATTABLE_DEATH | number;

    /** Text with the player loss */
    public playerLossText: string;

    /** Helshezag used on this turn? */
    public helshezagUsed: boolean = false;

    /** Anseng's Kirusami used on this turn? */
    public ansengsKirusamiLoss: number = 0;

    /**
     * Create a combat turn
     * TODO: Do not pass all those parameters. Pass only Combat, and read the properties
     * @param combat The combat owner of this turn
     * @param randomValue The random table value for this turn
     * @param elude True if the player is eluding the combat
     * @param helshezagUsed Helshezag used on this turn?
     */
    public constructor( combat: Combat|null , randomValue: number , elude: boolean , helshezagUsed: boolean , ansengsKirusamiLoss?: number ) {

        if ( !combat ) {
            // Default constructor (called on BookSectionStates.prototype.fromStateObject)
            return;
        }

        this.helshezagUsed = helshezagUsed;
        this.ansengsKirusamiLoss = ansengsKirusamiLoss ?? 0;

        /** True if the player is eluding the combat */
        this.elude = elude;

        /** Number of the turn (1 is the first) */
        this.turnNumber = combat.turns.length + 1;

        /** The random table result  */
        this.randomValue = randomValue;
        /** Lone wolf damage multiplier */
        this.damageMultiplier = combat.damageMultiplier;
        /** Enemy damage multiplier */
        this.enemyMultiplier = combat.enemyMultiplier;

        const tableResult = CombatTable.getCombatTableResult(combat.getCombatRatio(), this.randomValue);

        /** Enemy base loss  */
        this.enemyBase = ( ( elude || combat.enemyImmuneTurns >= this.turnNumber ) ? 0 : tableResult[0] );
        /** The enemy loss */
        this.enemy = CombatTurn.applyMultiplier( this.enemyBase , this.damageMultiplier );
        /** Enemy extra loss (combat.enemyTurnLoss is negative) */
        this.enemyExtra = combat.enemyTurnLoss;
        if ( this.enemy !== COMBATTABLE_DEATH) {
            this.enemy -= combat.enemyTurnLoss;
        }
        /** Enemy loss due to Kai-blast */
        this.enemyExtra += combat.enemyKaiBlastLoss;
        if ( this.enemy !== COMBATTABLE_DEATH) {
            this.enemy -= combat.enemyKaiBlastLoss;
        }
        /** Enemy loss due to Kai-ray */
        if(combat.kaiRayUse === 1) {
            this.enemyExtra += -15 * combat.mindblastMultiplier;
            if ( this.enemy !== COMBATTABLE_DEATH ) {
                this.enemy -= -15 * combat.mindblastMultiplier;
            }
        }

        // Remove 1 Endurance if GrandMaster + Weaponmastery + Non-magical metal edged weapon
        if (state.book.bookNumber >= 16 && state.actionChart.isWeaponskillActive(combat.bowCombat, BookSeriesId.GrandMaster)
            && state.actionChart.getSelectedWeaponItem().grdWpnmstryBonus) { 
            this.enemyExtra += -1;
            if ( this.enemy !== COMBATTABLE_DEATH) {
                this.enemy -= -1;
            }
        }

        /** The player base loss */
        this.loneWolfBase = ( ( combat.immuneTurns >= this.turnNumber ) ? 0 : tableResult[1] );

        /** Player loss */
        this.loneWolf = CombatTurn.applyMultiplier( this.loneWolfBase , this.enemyMultiplier );

        // Player extra loss
        this.loneWolfExtra = 0;
        if ( this.loneWolf !== COMBATTABLE_DEATH && combat.mindforceEP < 0 && !state.actionChart.hasMindShield() ) {
            // Enemy mind force attack (combat.mindforceEP is negative):
            this.loneWolf -= combat.mindforceEP;
            this.loneWolfExtra = combat.mindforceEP;
        }
        if ( this.loneWolf !== COMBATTABLE_DEATH) {
            // Extra loss per turn
            this.loneWolf -= combat.turnLoss;
            // Extra loss if wounded on this turn
            if ( this.loneWolfBase !== 0 ) {
                this.loneWolf -= combat.turnLossIfWounded;
            }
        }
        this.loneWolfExtra += combat.turnLoss;
        if ( this.loneWolfBase !== 0 ) {
            this.loneWolfExtra += combat.turnLossIfWounded;
        }

        // Surge loss
        if ( combat.psiSurge ) {
            const psiSurgeLoss = Combat.surgeTurnLoss(combat.getSurgeDiscipline(), combat);
            if ( this.loneWolf !== COMBATTABLE_DEATH ) {
                this.loneWolf += psiSurgeLoss;
            }
            this.loneWolfExtra -= psiSurgeLoss;
        }

        // Kai-blast loss
        if ( combat.kaiBlast ) {
            if ( this.loneWolf !== COMBATTABLE_DEATH ) {
                this.loneWolf += 4;
            }
            this.loneWolfExtra -= 4;
        }

        // Kai-ray loss
        if ( combat.kaiRayUse === 1 ) {
            if ( this.loneWolf !== COMBATTABLE_DEATH ) {
                this.loneWolf += 4;
            }
            this.loneWolfExtra -= 4;
            combat.kaiRayUse = 2;
        }

        // Prevented damage
        if (this.loneWolf !== COMBATTABLE_DEATH) {
            this.loneWolfPrevented = Math.min(this.loneWolf, combat.immuneDamage);
            combat.immuneDamage -= this.loneWolfPrevented;
            this.loneWolf -= this.loneWolfPrevented;
        }

        if (this.ansengsKirusamiLoss && this.loneWolf !== COMBATTABLE_DEATH) {
            var firstTurnUsed = true;
            for(let i = this.turnNumber - 2; i >= 0; i--) {
                if (combat.turns[i].ansengsKirusamiLoss) {
                    firstTurnUsed = false;
                    break;
                }
            }

            if (firstTurnUsed) {
                this.loneWolf += this.ansengsKirusamiLoss;
                this.loneWolfExtra -= this.ansengsKirusamiLoss;
            }
        }

        /** Text with the player loss */
        this.playerLossText = this.calculatePlayerLossText();
    }

    /**
     * Return a text with the player loss
     */
    public getPlayerLossText(): string { return this.playerLossText; }

    /**
     * Calculate the text with the player loss
     */
    public calculatePlayerLossText(): string {
        return CombatTurn.lossText( this.loneWolfBase , this.enemyMultiplier , this.loneWolfExtra , this.loneWolfPrevented ,
            this.loneWolf );
    }

    /**
     * Return a text with the enemy loss
     */
    public getEnemyLossText(): string {
        return CombatTurn.lossText( this.enemyBase , this.damageMultiplier , this.enemyExtra , 0 ,
            this.enemy );
    }

    /**
     * Translate the loss
     * @param {typeof COMBATTABLE_DEATH | number} loss It can be a number with the loss, or COMBATTABLE_DEATH
     */
    public static translateLoss(loss: typeof COMBATTABLE_DEATH | number): string {
        return loss === COMBATTABLE_DEATH ? translations.text( "deathLetter" ) : loss.toString();
    }

    /**
     * Get a text for a turn result
     */
    public static lossText( base: typeof COMBATTABLE_DEATH | number, multiplier: number, extra: typeof COMBATTABLE_DEATH | number, prevented: number, finalLoss: typeof COMBATTABLE_DEATH | number ): string {
        let loss = CombatTurn.translateLoss( base );
        if ( multiplier !== 1 ) {
            loss = `${loss} x ${multiplier}`;
        }
        if ( extra !== 0 ) {
            loss += ` + ${( - extra )}`;
        }
        if ( prevented ) {
            loss += ` - ${prevented}`;
        }
        if ( multiplier !== 1 || extra !== 0 || prevented ) {
            loss += " = " + CombatTurn.translateLoss( finalLoss );
        }

        return loss;
    }

    /**
     * Apply a multiplier to a combat endurance loss
     * @param {number|string} enduranceLoss The original endurance loss
     * @param multiplier The multiplier (can have decimals)
     * @return {number|string} The final endurance loss
     */
    public static applyMultiplier( enduranceLoss: typeof COMBATTABLE_DEATH | number , multiplier: number ): typeof COMBATTABLE_DEATH | number {

        if ( multiplier === 0 ) {
            // Ensure no death
            return 0;
        }

        if ( enduranceLoss !== COMBATTABLE_DEATH ) {
            // Apply the damage multiplier
            enduranceLoss = Math.floor( enduranceLoss * multiplier );
        }

        return enduranceLoss;
    }

}
