import { state, mechanicsEngine, Combat, template, SpecialObjectsUse, CombatTurn, GndDiscipline, translations, BookSeriesId, NewOrderDiscipline, BookSeries } from "../..";
import striptags from 'striptags';

/**
 * Combats mechanics
 */
export class CombatMechanics {

    /** Selector for elude buttons */
    public static readonly ELUDE_BTN_SELECTOR = ".mechanics-elude";

    /** Selector for play turn buttons */
    public static readonly PLAY_TURN_BTN_SELECTOR = ".mechanics-playTurn";

    /** Selector for combat ratio text */
    public static readonly COMBAT_RATIO_SELECTOR = ".mechanics-combatRatio";

    /** Selector for XXX surge checkbox */
    public static readonly SURGE_CHECK_SELECTOR = ".psisurgecheck input";

    /** Selector for XXX Blast checkbox */
    public static readonly BLAST_CHECK_SELECTOR = ".kaiblastcheck input";

    /** Selector for XXX Ray checkbox */
    public static readonly RAY_CHECK_SELECTOR = ".kairaycheck input";

    /** Selector for XXX Power Strike checkbox */
    public static readonly POWER_STRIKE_CHECK_SELECTOR = ".powerstrikecheck input";

    /**
     * Render section combats
     */
    public static renderCombats() {

        // Get combats to render
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }

        // If the player is dead, do nothing
        if ( state.actionChart.currentEndurance <= 0 ) {
            return;
        }

        // Combat UI template:
        const $template = mechanicsEngine.getMechanicsUI("mechanics-combat");

        $template.attr("id", null);

        // Populate combats
        $.each(sectionState.combats, (index: number, combat: Combat) => {
            const $combatUI = $template.clone();
            // Set the combat index
            $combatUI.attr("data-combatIdx", index);

            // Add combats UI
            const $combatOriginal = $(`.combat:eq(${index})`);

            $combatOriginal.append( $combatUI )
            .find(CombatMechanics.PLAY_TURN_BTN_SELECTOR).on("click", function(e) {
                // Play turn button click
                e.preventDefault();
                CombatMechanics.runCombatTurn( $(this).parents(".mechanics-combatUI").first(), false );
            });

            // Move the show combat tables as the first child (needed because it's a float)
            const $btnCombatTables = $combatUI.find(".mechanics-combatTables");
            $btnCombatTables.remove();
            $combatOriginal.prepend( $btnCombatTables );

            // Bind the show combat tables button click
            $btnCombatTables.on("click", (e) => {
                e.preventDefault();
                template.showCombatTables();
            });

            // Elude combat button click
            $combatOriginal.find(CombatMechanics.ELUDE_BTN_SELECTOR).on("click", function(e) {
                e.preventDefault();
                CombatMechanics.runCombatTurn( $(this).parents(".mechanics-combatUI").first() ,
                    true );
            });

            // Bind combat ratio link click
            $combatUI.find(".crlink").on("click", function( e: Event ) {
                e.preventDefault();
                CombatMechanics.showCombatRatioDetails( $(this).parents(".mechanics-combatUI").first() );
            });

            // Set player name if not Lone Wolf
            if (state.book.getBookSeries().id === BookSeriesId.NewOrder) {
                $combatUI.find(".mechanics-playerName").html( state.actionChart.kaiName );
            }

            // Set enemy name on table
            $combatUI.find(".mechanics-enemyName").html( combat.enemy );
            // Set combat ratio:
            CombatMechanics.updateCombatRatio( $combatUI, combat );

            // Add already played turns
            if ( combat.turns.length > 0 ) {
                // Add already played turns
                const $turnsTable = $combatUI.find( "table" );
                $turnsTable.show();
                const $turnsTableBody = $turnsTable.find( "> tbody" );
                $.each( combat.turns, (idxTurn, turn) => {
                    CombatMechanics.renderCombatTurn( $turnsTableBody , turn );
                });
            }

            // Update enemy current endurance/CS
            CombatMechanics.updateEnemyEndurance( $combatUI , combat , true );
            CombatMechanics.updateEnemyCombatSkill( $combatUI, combat );

            if ( sectionState.combatEluded || combat.isFinished() || combat.disabled ) {
                // Hide button to run more turns
                CombatMechanics.hideCombatButtons( $combatUI );
            } else {
                // Check if the combat can be eluded
                CombatMechanics.showHideEludeButton( combat , $combatUI );
            }

            // Setup XXX-Surge checkbox
            CombatMechanics.setupSurgeUI($combatUI, combat);
            CombatMechanics.setupBlastUI($combatUI, combat);
            CombatMechanics.setupRayUI($combatUI, combat);
            CombatMechanics.setupPowerStrikeUI($combatUI, combat);
        });
    }

    private static updateEnemyCombatSkill($combatUI: JQuery<HTMLElement>, combat: Combat) {
        // Update enemy combat skill with any bonuses
        const cs = $combatUI.parent().find( ".enemy-combatskill" );
        const bonuses = combat.getCSBonuses();
        let csEnemy: string = combat.combatSkill.toString();
        let finalCSEnemy = combat.getCurrentEnemyCombatSkill();

        for ( const bonus of bonuses.filter((b) => b.enemy) ) {
            csEnemy += " ";
            if ( bonus.increment >= 0 ) {
                csEnemy += "+";
            }
            csEnemy += bonus.increment.toString() + " (" + bonus.concept + ")";
        }
        if ( bonuses.filter((b) => b.enemy).length > 0 ) {
            csEnemy += " = " + finalCSEnemy.toString();
        }

        cs.text( csEnemy );
    }

    private static updateEnemyEndurance( $combatUI: JQuery<HTMLElement> , combat: Combat , doNotAnimate: boolean ) {
        template.animateValueChange( $combatUI.parent().find( ".enemy-current-endurance" ) ,
            combat.endurance , doNotAnimate , combat.endurance > 0 ? null : "red" );
    }

    private static updateCombatRatio( $combatUI: JQuery<HTMLElement> , combat: Combat ) {
        // Set combat ratio:
        $combatUI.find(CombatMechanics.COMBAT_RATIO_SELECTOR).text( combat.getCombatRatio() );
    }

    /**
     * Update all combats ratio on UI
     */
    public static updateCombats() {
        // Get combats to render
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }
        $.each(sectionState.combats, (index, combat) => {
            const $combatUI = $(`.mechanics-combatUI:eq(${index})`);
            CombatMechanics.updateCombatRatio( $combatUI , combat);
            CombatMechanics.updateEnemyCombatSkill( $combatUI, combat);
        });
    }

    public static increaseEndurance(amount: number) {
        // Get combat to update
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }
        $.each(sectionState.combats, (index, combat) => {
            combat.increaseEndurance(amount);
            CombatMechanics.updateEnemyEndurance($("#mechanics-combat"), combat, false);
        });
    }

    /**
     * Hide combat UI buttons
     * @param {jquery} $combatUI The combat UI where disable buttons. If it's null, all
     * combats buttons on the section will be hidden
     */
    public static hideCombatButtons( $combatUI: JQuery<HTMLElement>|null ) {
        if ( !$combatUI ) {
            // Disable all combats
            $combatUI = $(".mechanics-combatUI");
        }

        $combatUI.find(CombatMechanics.PLAY_TURN_BTN_SELECTOR).hide();
        $combatUI.find(CombatMechanics.ELUDE_BTN_SELECTOR).hide();
    }

    /**
     * Show combat UI buttons
     * @param {jquery} $combatUI The combat UI where enable buttons. If it's null, all
     * combats buttons on the section will be hidden
     */
    public static showCombatButtons( $combatUI: JQuery<HTMLElement>|null ) {
        if ( !$combatUI ) {
            // Disable all combats
            $combatUI = $(".mechanics-combatUI");
        }

        if ( $combatUI.length === 0 ) {
            return;
        }

        // Get combat data
        const sectionState = state.sectionStates.getSectionState();
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const combat = sectionState.combats[ combatIndex ];

        if ( !(sectionState.combatEluded || combat.isFinished() || combat.disabled) ) {
            $combatUI.find(CombatMechanics.PLAY_TURN_BTN_SELECTOR).show();
            CombatMechanics.showHideEludeButton( combat , $combatUI );
        }
    }

    /**
     * Run a combat turn
     * @param {jquery} $combatUI The combat UI
     * @param elude True if the player is eluding the combat
     */
    private static runCombatTurn( $combatUI: JQuery<HTMLElement>, elude: boolean ) {
        // Get the combat info:
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        combat.checkKaiBlast().then(() => combat.nextTurnAsync(elude))
        .then((turn) => {

            // Apply turn combat losses
            combat.applyTurn(turn);

            // Combat has been eluded?
            sectionState.combatEluded = elude;

            // Update player statistics:
            template.updateStatistics();

            // Render new turn
            const $turnsTable = $combatUI.find( "table" ).first();
            $turnsTable.show();
            CombatMechanics.renderCombatTurn( $turnsTable.find( "> tbody" ), turn );

            // Update enemy current endurance
            CombatMechanics.updateEnemyEndurance( $combatUI , combat , false );

            if ( sectionState.combatEluded || combat.isFinished() ) {
                // Combat finished

                // Hide button to run more turns
                CombatMechanics.hideCombatButtons( $combatUI );

                // Test player death
                mechanicsEngine.testDeath();

                // Fire turn events:
                mechanicsEngine.fireAfterCombatTurn(combat);

                // Post combat rules execution:
                const combatsResult = sectionState.areAllCombatsFinished(state.actionChart);
                if ( combatsResult === "finished" && mechanicsEngine.onAfterCombatsRule ) {
                    // Fire "afterCombats" rule
                    mechanicsEngine.runChildRules( $(mechanicsEngine.onAfterCombatsRule) );
                }
                if ( combatsResult === "eluded" && mechanicsEngine.onEludeCombatsRule ) {
                    // Fire "afterElude" rule
                    mechanicsEngine.runChildRules( $(mechanicsEngine.onEludeCombatsRule) );
                }

                if ( ( combatsResult === "finished" || combatsResult === "eluded" ) && combat.adganaUsed ) {
                    // Fire post-combat adgana effects
                    SpecialObjectsUse.postAdganaUse();
                }

                if ( ( combatsResult === "finished" || combatsResult === "eluded" ) && combat.karmoUsed ) {
                    // Fire post-combat karmo effects
                    SpecialObjectsUse.postKarmoUse();
                }
            } else {
                // Combat continues

                // Check if the combat can be eluded
                CombatMechanics.showHideEludeButton( combat , $combatUI );

                // Fire turn events:
                mechanicsEngine.fireAfterCombatTurn(combat);

                // Update combat ratio (it can be changed by combat turn rules):
                CombatMechanics.updateCombatRatio( $combatUI , combat );
            }

            // Combat has been eluded?
            if ( elude ) {
                // Disable other combats
                CombatMechanics.hideCombatButtons( null );
            }

            // Check if the XXX-surge should be disabled after this turn
            CombatMechanics.checkSurgeEnabled();
            // Check if Power Strike checkbox should be locked in
            CombatMechanics.disablePowerStrikeCheck();

            // For testing, add marker to notify to the test we are ready
            template.addSectionReadyMarker();
        }, null);

    }

    /**
     * Update visibility of the elude combat button
     * @param combat The combat to update
     * @param {jQuery} $combatUI The combat UI
     */
    private static showHideEludeButton( combat: Combat , $combatUI: JQuery<HTMLElement> ) {
        if ( combat.canBeEluded() ) {
            // The combat can be eluded after this turn
            $combatUI.find(CombatMechanics.ELUDE_BTN_SELECTOR).show();
        } else {
            $combatUI.find(CombatMechanics.ELUDE_BTN_SELECTOR).hide();
        }
    }

    /**
     * Render a combat turn
     * @param $combatTableBody Table where to append the turn
     * @param turn The turn to render
     */
    private static renderCombatTurn( $combatTableBody: JQuery<HTMLElement> , turn: CombatTurn ) {
        $combatTableBody.append(`<tr><td class="d-none d-sm-table-cell">${striptags(turn.turnNumber.toFixed())}</td><td>${striptags(turn.randomValue.toFixed())}</td><td>${striptags(turn.getPlayerLossText())}</td><td>${striptags(turn.getEnemyLossText())}</td></tr>`);
    }

    /**
     * Setup the Kai-ray checkbox for a given combat
     * @param $combatUI Combat UI main tag
     * @param combat Related combat info
     */
    private static setupRayUI($combatUI: JQuery<HTMLElement>, combat: Combat) {

        // Check if player can use Kai-ray
        const hasKaiSurge = state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge);
        if (!hasKaiSurge || state.actionChart.getDisciplines().length < 11 || state.actionChart.currentEndurance < 11 || combat.noKaiRay) {
            // Hide Kai-ray check
            $combatUI.find(".kairaycheck").hide();
            return;
        }

        const $kaiRayCheck = $combatUI.find(CombatMechanics.RAY_CHECK_SELECTOR);
        
        // Check if the Kai-ray cannot be used (already used or EP <= 10)
        if ( combat.kaiRayUse === 2 || state.actionChart.currentEndurance <= 10 ) {
            CombatMechanics.disableRay( $combatUI , combat );
        }
        // Kai-ray selection
        const rayText = translations.text("mechanics-combat-kairay" , [ 15 * combat.mindblastMultiplier ] );
        $combatUI.find(".mechanics-combat-kairay").text( rayText );
        $kaiRayCheck.on("click", (e: JQuery.Event) => CombatMechanics.onRayClick(e, $kaiRayCheck));
    }

    /**
     * Kai-ray checkbox event handler
     */
    private static onRayClick(e: JQuery.Event, $kaiRayCheck: JQuery<HTMLElement>) {

        const $combatUI = $kaiRayCheck.parents(".mechanics-combatUI").first();
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const selected: boolean = $kaiRayCheck.prop( "checked" ) ? true : false;
        combat.kaiRayUse = selected ? 1 : 0;

        const $psiSurgeCheck = $combatUI.find(CombatMechanics.SURGE_CHECK_SELECTOR);
        $psiSurgeCheck.prop("checked", false);
        combat.psiSurge = false;

        const $kaiBlastCheck = $combatUI.find(CombatMechanics.BLAST_CHECK_SELECTOR);
        $kaiBlastCheck.prop("checked", false);
        combat.kaiBlast = false;

        if ( !selected && state.actionChart.currentEndurance <= 10 ) {
            CombatMechanics.disableRay( $combatUI , combat );
        }

        CombatMechanics.updateCombatRatio( $combatUI , combat);

        template.addSectionReadyMarker();
    }

    /**
     * Setup the Power Strike checkbox for a given combat
     * @param $combatUI Combat UI main tag
     * @param combat Related combat info
     */
    private static setupPowerStrikeUI($combatUI: JQuery<HTMLElement>, combat: Combat) {

        // Check if player can use Power Strike
        const hasPowerStrike = state.actionChart.hasNewOrderDiscipline(NewOrderDiscipline.MagiMagic);
        if (state.book.getBookSeries().id !== BookSeriesId.NewOrder ||
            !hasPowerStrike || state.actionChart.getDisciplines().length < 13 || combat.mentalOnly || combat.noObjectBonuses) {
            // Hide Power Strike check
            $combatUI.find(".powerstrikecheck").hide();
            return;
        }

        const $powerStrikeCheck = $combatUI.find(CombatMechanics.POWER_STRIKE_CHECK_SELECTOR);
        const currentSection = state.sectionStates.getSectionState();
        $powerStrikeCheck.prop("disabled", currentSection.areCombatsStarted());
        $powerStrikeCheck.prop("checked", combat.powerStrike);

        // Power Strike selection
        const powerStrikeText = translations.text("mechanics-combat-powerstrike" );
        $combatUI.find(".mechanics-combat-powerstrike").text( powerStrikeText );
        $powerStrikeCheck.on("click", (e: JQuery.Event) => CombatMechanics.onPowerStrikeClick(e, $powerStrikeCheck));
    }

    /**
     * Power Strike checkbox event handler
     */
    private static onPowerStrikeClick(e: JQuery.Event, $powerStrikeCheck: JQuery<HTMLElement>) {
        const $combatUI = $powerStrikeCheck.parents(".mechanics-combatUI").first();
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const selected: boolean = $powerStrikeCheck.prop( "checked" ) ? true : false;
        combat.powerStrike = selected;

        CombatMechanics.updateCombatRatio( $combatUI , combat);

        template.addSectionReadyMarker();
    }

    /**
     * Setup the Kai-blast checkbox for a given combat
     * @param $combatUI Combat UI main tag
     * @param combat Related combat info
     */
    private static setupBlastUI($combatUI: JQuery<HTMLElement>, combat: Combat) {

        // Check if player can use Kai-blast
        const hasKaiSurge = state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge) 
                            || state.actionChart.hasNewOrderDiscipline(NewOrderDiscipline.KaiSurge);
        const kaiSurgeLevelCheck = 
            (state.actionChart.getDisciplines().length < 7 && state.book.getBookSeries().id === BookSeriesId.GrandMaster)
            || (state.actionChart.getDisciplines().length < 11 && state.book.getBookSeries().id === BookSeriesId.NewOrder);
        if (!hasKaiSurge || kaiSurgeLevelCheck || combat.noKaiBlast) {
            // Hide Kai-blast check
            $combatUI.find(".kaiblastcheck").hide();
            return;
        }

        const $kaiBlastCheck = $combatUI.find(CombatMechanics.BLAST_CHECK_SELECTOR);

        // Initialize Kai-blast :
        if (combat.kaiBlast) {
            $kaiBlastCheck.attr( "checked" , "true" );
        }
        // Check if the Kai-blast cannot be used (EP <= Limit)
        if ( state.actionChart.currentEndurance <= Combat.minimumEPForSurge(GndDiscipline.KaiSurge) ) {
            CombatMechanics.disableSurge( $combatUI , combat );
        }

        const rayText = translations.text("mechanics-combat-kaiblast" , [ combat.mindblastMultiplier > 1 ? ` (x${combat.mindblastMultiplier})` : "" , combat.kaiBlastRolls] );
        $combatUI.find(".mechanics-combat-kaiblast").text( rayText );

        // Kai-blast selection
        $kaiBlastCheck.on("click", (e: JQuery.Event) => CombatMechanics.onBlastClick(e, $kaiBlastCheck));
    }

    /**
     * Kai-blast checkbox event handler
     */
    private static onBlastClick(e: JQuery.Event, $kaiBlastCheck: JQuery<HTMLElement>) {

        const $combatUI = $kaiBlastCheck.parents(".mechanics-combatUI").first();
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const selected: boolean = $kaiBlastCheck.prop( "checked" ) ? true : false;
        combat.kaiBlast = selected;

        const $psiSurgeCheck = $combatUI.find(CombatMechanics.SURGE_CHECK_SELECTOR);
        $psiSurgeCheck.prop("checked", false);
        combat.psiSurge = false;

        const $kaiRayCheck = $combatUI.find(CombatMechanics.RAY_CHECK_SELECTOR);
        $kaiRayCheck.prop("checked", false);
        combat.kaiRayUse = combat.kaiRayUse === 2 ? 2 : 0;

        const surgeDisciplineId = combat.getSurgeDiscipline();
        if ( !selected && state.actionChart.currentEndurance <= Combat.minimumEPForSurge(surgeDisciplineId) ) {
            CombatMechanics.disableSurge( $combatUI , combat );
        }

        CombatMechanics.updateCombatRatio( $combatUI , combat);

        template.addSectionReadyMarker();
    }

    /**
     * Setup the Surge checkbox for a given combat
     * @param $combatUI Combat UI main tag
     * @param combat Related combat info
     */
    private static setupSurgeUI($combatUI: JQuery<HTMLElement>, combat: Combat) {

        // Check what Surge discipline can player use
        const surgeDisciplineId = combat.getSurgeDiscipline();
        if (!surgeDisciplineId || !combat.getFinalSurgeBonus(surgeDisciplineId)) {
            // Hide surge check
            $combatUI.find(".psisurgecheck").hide();
            return;
        }

        const $psiSurgeCheck = $combatUI.find(CombatMechanics.SURGE_CHECK_SELECTOR);
        // Initialize surge:
        if (combat.psiSurge) {
            $psiSurgeCheck.attr( "checked" , "true" );
        }
        // Check if the surge cannot be used (EP <= Limit)
        if ( state.actionChart.currentEndurance <= Combat.minimumEPForSurge(surgeDisciplineId) ) {
            CombatMechanics.disableSurge( $combatUI , combat );
        }
        // surge selection
        $psiSurgeCheck.on("click", (e: JQuery.Event) => {
            CombatMechanics.onSurgeClick(e , $psiSurgeCheck );
        });

        // UI Surge texts
        const surgeTextId = surgeDisciplineId === GndDiscipline.KaiSurge ? "mechanics-combat-kaisurge" : "mechanics-combat-psisurge";
        const surgeText = translations.text(surgeTextId , [ combat.getFinalSurgeBonus(surgeDisciplineId) ,
            Combat.surgeTurnLoss(surgeDisciplineId, combat) ] );
        $combatUI.find(".mechanics-combat-psisurge").text( surgeText );
    }

    /**
     * XXX-Surge checkbox event handler
     */
    private static onSurgeClick(e: JQuery.Event, $psiSurgeCheck: JQuery<HTMLElement>) {

        const $combatUI = $psiSurgeCheck.parents(".mechanics-combatUI").first();
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const selected: boolean = $psiSurgeCheck.prop( "checked" ) ? true : false;
        combat.psiSurge = selected;

        const $kaiBlastCheck = $combatUI.find(CombatMechanics.BLAST_CHECK_SELECTOR);
        $kaiBlastCheck.prop("checked", false);
        combat.kaiBlast = false;

        const $kaiRayCheck = $combatUI.find(CombatMechanics.RAY_CHECK_SELECTOR);
        $kaiRayCheck.prop("checked", false);
        combat.kaiRayUse = combat.kaiRayUse === 2 ? 2 : 0;

        const surgeDisciplineId = combat.getSurgeDiscipline();
        if ( !selected && state.actionChart.currentEndurance <= Combat.minimumEPForSurge(surgeDisciplineId) ) {
            CombatMechanics.disableSurge( $combatUI , combat );
        }

        CombatMechanics.updateCombatRatio( $combatUI , combat);

        template.addSectionReadyMarker();
    }

    /**
     * Check if the XXX-Surge can be enabled on current section combats
     * It cannot be used if the EP <= (minimum for XXX-Surge discipline)
     */
    public static checkSurgeEnabled() {
        const sectionState = state.sectionStates.getSectionState();
        for ( let i = 0; i < sectionState.combats.length; i++ ) {
            const $combatUI = $(`.mechanics-combatUI:eq(${i})`);
            CombatMechanics.checkSurgeEnabledInCombat( $combatUI , sectionState.combats[i]);
        }
    }

    /**
     * Disable the Power Strike checkbox if combats have started
     */
    public static disablePowerStrikeCheck() {
        const sectionState = state.sectionStates.getSectionState();
        for ( let i = 0; i < sectionState.combats.length; i++ ) {
            const $combatUI = $(`.mechanics-combatUI:eq(${i})`);
            const $powerStrikeCheck = $combatUI.find(CombatMechanics.POWER_STRIKE_CHECK_SELECTOR);
            const currentSection = state.sectionStates.getSectionState();
            $powerStrikeCheck.prop("disabled", currentSection.areCombatsStarted());
            $powerStrikeCheck.prop("checked", sectionState.combats[i].powerStrike);
        }
    }

    /**
     * Check if the XXX-Surge can be enabled on a given combat
     * @param $combatUI Combat UI main tag
     * @param combat Related combat info
     */
    private static checkSurgeEnabledInCombat($combatUI: JQuery<HTMLElement>, combat: Combat) {
        const surgeDisciplineId = combat.getSurgeDiscipline();
        if (!surgeDisciplineId) {
            return;
        }

        if ( state.actionChart.currentEndurance <= Combat.minimumEPForSurge(surgeDisciplineId) ) {
            CombatMechanics.disableSurge($combatUI , combat);
        }

        if ( combat.kaiRayUse === 2 || state.actionChart.currentEndurance <= 10 ) {
            CombatMechanics.disableRay($combatUI , combat);
        }
    }

    /**
     * Disable XXX-surge on a combat
     */
    private static disableSurge( $combatUI: JQuery<HTMLElement> , combat: Combat ) {
        combat.psiSurge = false;
        combat.kaiBlast = false;
        
        const $psiSurgeCheck = $combatUI.find(CombatMechanics.SURGE_CHECK_SELECTOR);
        $psiSurgeCheck.prop("checked", false);
        $psiSurgeCheck.prop("disabled", true);
        
        const $kaiBlastCheck = $combatUI.find(CombatMechanics.BLAST_CHECK_SELECTOR);
        $kaiBlastCheck.prop("checked", false);
        $kaiBlastCheck.prop("disabled", true);

        CombatMechanics.updateCombatRatio( $combatUI , combat );
    }

    /**
     * Disable Kai-Ray on a combat
     */
    private static disableRay( $combatUI: JQuery<HTMLElement> , combat: Combat ) {        
        const $kaiSurgeCheck = $combatUI.find(CombatMechanics.RAY_CHECK_SELECTOR);
        $kaiSurgeCheck.prop("checked", false);
        $kaiSurgeCheck.prop("disabled", true);

        CombatMechanics.updateCombatRatio( $combatUI , combat );
    }

    /**
     * Show dialog with combat ratio details
     * @param $combatUI The combat UI
     */
    private static showCombatRatioDetails( $combatUI: JQuery<HTMLElement> ) {
        // Get the combat info:
        const combatIndex = Number( $combatUI.attr( "data-combatIdx" ) );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const finalCSPlayer = combat.getCurrentCombatSkill();
        let finalCSEnemy = combat.getCurrentEnemyCombatSkill();

        // Player CS for this combat:
        let csPlayer: string = state.actionChart.combatSkill.toString();
        let csEnemy: string = combat.combatSkill.toString();
        const bonuses = combat.getCSBonuses();
        for ( const bonus of bonuses.filter((b) => !b.enemy) ) {
            csPlayer += " ";
            if ( bonus.increment >= 0 ) {
                csPlayer += "+";
            }
            csPlayer += bonus.increment.toString() + " (" + bonus.concept + ")";
        }
        if ( bonuses.filter((b) => !b.enemy).length > 0 ) {
            csPlayer += " = " + finalCSPlayer.toString();
        }
        $("#game-ratioplayer").text( csPlayer );
        if (state.book.getBookSeries().id === BookSeriesId.NewOrder) {
            $("#game-ratioplayername").html( state.actionChart.kaiName );
        }

        // Enemy info:
        for ( const bonus of bonuses.filter((b) => b.enemy) ) {
            csEnemy += " ";
            if ( bonus.increment >= 0 ) {
                csEnemy += "+";
            }
            csEnemy += bonus.increment.toString() + " (" + bonus.concept + ")";
        }
        if ( bonuses.filter((b) => b.enemy).length > 0 ) {
            csEnemy += " = " + finalCSEnemy.toString();
        }
        $("#game-ratioenemyname").html( combat.enemy );
        $("#game-ratioenemy").text( csEnemy );

        // Combat ratio result:
        $("#game-ratioresult").text( `${finalCSPlayer} - ${finalCSEnemy} =  ${( finalCSPlayer - finalCSEnemy )}` );

        // Show dialog
        $("#game-ratiodetails").modal();
    }

}
