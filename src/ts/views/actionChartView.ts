import { ActionChart, translations, ObjectsTable, ObjectsTableType, actionChartController, state, GndDiscipline, MoneyDialog, BookSeriesId, Item, Currency } from "..";

/**
 * The action chart view API
 */
export const actionChartView = {

    /**
     * Fill the action chart with the player state
     * @param actionChart The ActionChart
     */
    fill(actionChart: ActionChart) {

        document.title = translations.text( "actionChart" );

        // Show endurance / combat skills.
        actionChartView.updateStatistics();

        // Show money
        actionChartView.updateMoney();

        // Bind drop money events
        actionChartView.bindDropMoneyEvents();

        // Disciplines.
        actionChartView.fillDisciplines(actionChart);

        // Fill the chart objects lists
        actionChartView.updateObjectsLists();

        // Full the Kai Weapon area
        actionChartView.fillKaiWeapon(actionChart);

        // Bind event for drop meals
        ObjectsTable.bindTableEquipmentEvents( $("#achart-dropmeal") , ObjectsTableType.INVENTORY );

        // Bind restore 20 EP (Curing)
        actionChartView.bindRestore20EP();

        // Bind "Fight unarmed"
        $("#achart-fightUnarmed").on("click", function() {
            actionChartController.setFightUnarmed( $(this).prop("checked") ? true : false );
        });

        // Annotations
        $("#achart-annotations").val( actionChart.annotations );
        $("#achart-annotations").off();
        $("#achart-annotations").on("input", function() {
            state.actionChart.annotations = <string> $(this).val();
        });
    },

    /**
     * Hide / disable the restore 20 EP button if needed
     */
    updateRestore20EPState() {
        const $restoreButton = $("#achart-restore20Ep");
        const restoreDiscipline = state.actionChart.get20EPRestoreDiscipline();
        if (!restoreDiscipline) {
            $restoreButton.hide();
        } else if ( restoreDiscipline === GndDiscipline.Deliverance ) {
            $restoreButton.html( translations.text("restore20EPGrdMasterButton") );
        } else {
            $restoreButton.html( translations.text("restore20EPMagnakaiButton") );
        }

        if ( !state.actionChart.canUse20EPRestoreNow() ) {
            $restoreButton.prop( "disabled", true );
        }
    },

    /**
     * Bind events to restore 20 EP (Curing)
     */
    bindRestore20EP() {
        const $restoreButton = $("#achart-restore20Ep");
        actionChartView.updateRestore20EPState();
        $restoreButton.on("click", (e: JQuery.TriggeredEvent) => {
            e.preventDefault();
            const restoreDiscipline = state.actionChart.get20EPRestoreDiscipline();
            if ( !confirm( translations.text(restoreDiscipline === GndDiscipline.Deliverance ? "confirm20EPGrdMaster" : "confirm20EP") ) ) {
                return;
            }
            actionChartController.use20EPRestore();
            actionChartView.updateRestore20EPState();
        });
    },

    /**
     * Bind events for drop money UI
     */
    bindDropMoneyEvents() {
        // Bind drop money button event
        $("#achart-dropmoneybutton").on("click", (e: JQuery.TriggeredEvent) => {
            e.preventDefault();
            MoneyDialog.show( true );
        });
        $("#achart-dropnoblesbutton").on("click", (e: JQuery.TriggeredEvent) => {
            e.preventDefault();
            MoneyDialog.show( true, Currency.NOBLE );
        });
    },

    /**
     * Render the disciplines table
     * @param {ActionChart} actionChart The action chart
     */
    fillDisciplines(actionChart: ActionChart) {

        // Kai title:
        $("#achart-kaititle")
            .text( state.book.getKaiTitle( actionChart.getDisciplines().length ) );

        // Lore circles:
        if (state.book.getBookSeries().id !== BookSeriesId.NewOrder 
        && (state.book.getBookSeries().id === BookSeriesId.Magnakai || state.actionChart.getDisciplines(BookSeriesId.Magnakai).length > 0)) {
            // Only for Magnakai books, or if player has played some Magnakai books
            const circles = actionChart.getLoreCircles();
            if ( circles.length === 0 ) {
                $("#achart-currentCircles").html( "<i>" + translations.text("noneMasculine") + "</i>" );
            } else {
                const circlesNames: string[] = [];
                for ( const c of actionChart.getLoreCircles() ) {
                    circlesNames.push( c.getDescription() );
                }
                $("#achart-currentCircles").html( circlesNames.join( ", ") );
            }
        } else {
            $("#achart-circles").hide();
        }

        if (state.book.getBookSeries().id !== BookSeriesId.NewOrder) {
            $("#kaiWeapon").hide();
        }

        // TODO: Display the discipline "quote" tag instead the name
        const $displines = $("#achart-disciplines > tbody");
        if ( actionChart.getDisciplines().length === 0 ) {
            $displines.append( "<tr><td>(" + translations.text("noneFemenine") + ")</td></tr>" );
        } else {
            const bookDisciplines = state.book.getDisciplinesTable();
            const bookSeries = state.book.getBookSeries();
            // Enumerate disciplines
            for (const disciplineId of actionChart.getDisciplines()) {
                const dInfo = bookDisciplines[disciplineId];
                let name = dInfo.name;

                if (disciplineId === bookSeries.weaponskillDiscipline) {
                    // Show selected weapons description
                    const weapons: string[] = [];
                    for (const weaponSkill of actionChart.getWeaponSkill()) {
                        weapons.push( state.mechanics.getObject( weaponSkill ).name );
                    }
                    if ( weapons.length > 0 ) {
                        name += " (" + weapons.join(", ") + ")";
                    }
                }

                // Unescape the HTML description:
                const descriptionHtml = $("<div />").html(dInfo.description).text();
                $displines.append( "<tr><td>" +
                    '<button class="btn btn-default table-op" title="' +
                    translations.text("disciplineDescription") +
                    '">' +
                        '<span class="glyphicon glyphicon-question-sign"></span>' +
                    "</button>" +
                    "<b>" + name + `</b><br/>${dInfo.imageHtml}<i style="display:none"><small>` +
                    descriptionHtml +
                    "</small></i></td></tr>" );
            }
            // Bind help button events
            $displines.find("button").on("click", function(e) {
                $(this).parent().find("i").toggle();
            });
        }
    },

    /**
     * Render the Kai Weapon table
     * @param {ActionChart} actionChart The action chart
     */
    fillKaiWeapon(actionChart: ActionChart) {
        if (state.book.getBookSeries().id === BookSeriesId.NewOrder) {
            const kaiWeapon = actionChart.getKaiWeapon();
            if (kaiWeapon) {
                const item = state.mechanics.getObject(kaiWeapon);
                $("#kaiWeaponName").text(item.name.charAt(0).toUpperCase() + item.name.slice(1));
                $("#kaiWeaponProperties").text(item.description);
                $("#kaiWeaponType").text(item.weaponType.charAt(0).toUpperCase() + item.weaponType.slice(1));
                $("#kaiWeaponBonus").text(`+ ${item.combatSkillEffect} CS`);
            } else {
                $("#kaiWeaponName").text("");
                $("#kaiWeaponProperties").text("");
                $("#kaiWeaponType").text("");
                $("#kaiWeaponBonus").text("");
            }
        }
    },

    updateMoney() {
        $("#achart-beltPouch").val( `${state.actionChart.beltPouch} ${translations.text("goldCrowns")}` );
        // Disable if the player has no money or it's death
        $("#achart-dropmoneybutton").prop( "disabled", state.actionChart.beltPouch <= 0 || state.actionChart.currentEndurance <= 0 );
    
        if (state.actionChart.beltPouchNobles === 0) {
            $("#achart-noblesInput").hide();
        } else {
            $("#achart-noblesInput").show();
            $("#achart-beltPouchNobles").val( `${state.actionChart.beltPouchNobles} ${translations.text("nobles")}` );
            // Disable if the player has no money or it's death
            $("#achart-dropnoblesbutton").prop( "disabled", state.actionChart.beltPouchNobles <= 0 || state.actionChart.currentEndurance <= 0 );
        }
    },

    /**
     * Update meals count
     */
    updateMeals() {
        $("#achart-meals").val( state.actionChart.meals );
        // Disable if the player has no meals or it's death
        $("#achart-dropmeal").prop( "disabled", state.actionChart.meals <= 0 || state.actionChart.currentEndurance <= 0 );
    },

    /**
     * Update the player statistics
     */
    updateStatistics() {

        const txtCurrent = translations.text("current") + ": ";
        // Combat skill
        $("#achart-combatSkills").val(`${txtCurrent}${state.actionChart.getCurrentCombatSkill()} / Original: ${state.actionChart.combatSkill}`);
        $("#achart-cs-bonuses").text(actionChartController.getBonusesText( state.actionChart.getCurrentCombatSkillBonuses()));

        // Endurance
        let txtEndurance = txtCurrent + state.actionChart.currentEndurance;
        const max = state.actionChart.getMaxEndurance();
        if ( max !== state.actionChart.endurance ) {
            txtEndurance += " / Max.: " + max;
        }
        txtEndurance += " / Original: " + state.actionChart.endurance;

        $("#achart-endurance").val(txtEndurance);
        $("#achart-endurance-bonuses").text(actionChartController.getBonusesText( state.actionChart.getEnduranceBonuses()));
    },

    /**
     * Update weapons
     */
    updateWeapons() {

        // Weapons list
        new ObjectsTable( state.actionChart.weapons , $("#achart-weapons > tbody") , ObjectsTableType.INVENTORY )
            .renderTable();

        // Current weapon:
        const current: Item = state.actionChart.getSelectedWeaponItem();
        $("#achart-currentWeapon").html( current ? current.name : "<i>" + translations.text("noneFemenine") + "</i>" );

        // Fight unarmed?
        const $fightUnarmed = $("#achart-fightUnarmed");
        $fightUnarmed.prop( "checked" , state.actionChart.fightUnarmed );

        // If the player has no weapons, or has died, disable the option "Fight unarmed"
        let noWeapon = ( !state.actionChart.fightUnarmed && !state.actionChart.getSelectedWeapon() );
        if ( state.actionChart.currentEndurance <= 0 ) {
            noWeapon = true;
        }
        $fightUnarmed.prop( "disabled" , noWeapon );
    },

    /**
     * Update the chart objects lists
     */
    updateObjectsLists() {

        // Weapons
        actionChartView.updateWeapons();

        // Backpack items
        if ( state.actionChart.hasBackpack ) {
            new ObjectsTable( state.actionChart.backpackItems, $("#achart-backpack > tbody") , ObjectsTableType.INVENTORY )
                .renderTable();
        } else {
            $("#achart-backpack-content").html("<i>" + translations.text("backpackLost") + "</i>");
        }

        // Special items
        new ObjectsTable( state.actionChart.specialItems, $("#achart-special > tbody") , ObjectsTableType.INVENTORY )
            .renderTable();

        // Meals
        actionChartView.updateMeals();

        // Total number of backpack / special objects
        $("#achart-backpacktotal").text(`(${state.actionChart.getNBackpackItems()})`);
        $("#achart-specialtotal").text(`(${state.actionChart.getNSpecialItems()})`);
    },

    showInventoryMsg(action: string, object: Item, msg: string) {
        const toastType = ( action === "pick" ? "success" : "warning" );
        let html = "";

        // Check if the object has an image
        if ( object) {
            const imageUrl = object.getImageUrl();
            if ( imageUrl ) {
                html += '<img class="inventoryImg" src="' + imageUrl + '" /> ';
            }
        }

        html += msg;
        html = "<div>" + html + "</div>";

        toastr[toastType]( html );
    }
};
