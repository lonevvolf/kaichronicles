import { mechanicsEngine, state, gameView, translations, actionChartController, randomMechanics, EquipmentSectionMechanics } from "../..";

/**
 * Tool to select a Kai Weapon
 */
export const kaiWeaponPickerMechanics = {

    /**
     * kaiWeaponPicker rule execution
     */
    kaiWeaponPicker(rule: Element) {
        if ($(rule).attr("enabled") === "false") {
            // Disable the Kai Weapon picker
            kaiWeaponPickerMechanics.disable();
            return;
        }

        // The Kai Weapon picker UI
        const $ui = mechanicsEngine.getMechanicsUI("mechanics-kaiweaponpicker");
        const weapons = ["spawnsmite", "alema", "magnara", "sunstrike", "kaistar", "valiance", "ulnarias", "raumas", "illuminatus", "firefall"];
        //const bookDisciplines = state.book.getDisciplinesTable();

        for(const weapon of weapons) {
            $ui.find("#mechanics-kwpTitle").text($(rule).attr("title") ?? "");
            const option = $ui.find("#mechanics-kwpOption").clone();
            
            option.attr("id", "mechanics-kwpOption-" + weapon);
            const radioButton = option.find("#mechanics-kwpRadioButton");
            radioButton.attr("value", weapon);
            radioButton.attr("id", "mechanics-kwpRadioButton-" + weapon);
            
            const radioButtonLabel = option.find("#mechanics-kwpRadioLabel");
            const weaponObject = state.mechanics.getObject(weapon);
            radioButtonLabel.text(`${weaponObject.name} (${weaponObject.description})`);
            radioButtonLabel.attr("id", "mechanics-kwpRadioLabel-" + weapon)

            $ui.append(option);
        }

        $ui.find("#mechanics-kwpOption").hide();

        // Check if it has an action button
        const actionButtonTitle = mechanicsEngine.getRuleText(rule, "actionButton");
        if (actionButtonTitle) {
            const $pickKaiWeaponButton = $ui.find("#mechanics-pickkaiweapon");
            $pickKaiWeaponButton.show().text(actionButtonTitle);
            kaiWeaponPickerMechanics.bindButtonActionEvent($pickKaiWeaponButton, () => {
                const selectedKaiWeaponName = $("#mechanics-kaiweaponpicker").find("input[type='radio']:checked").val().toString();
                const weaponObject = state.mechanics.getObject(selectedKaiWeaponName);

                const confirmed = confirm(translations.text(mechanicsEngine.getRuleText(rule, "confirmText"), [weaponObject.name]));
                if (confirmed) {
                    actionChartController.pick(selectedKaiWeaponName);
                    // Disable the random choice button (hardcoded index for now)
                    randomMechanics.disableRandomTableByIndex(1);
                    this.disable();
                    // Ugly hack: If we are on the 'equipment' section, check if all link has been clicked
                    if (state.sectionStates.currentSection === "equipmnt") {
                        EquipmentSectionMechanics.checkExitEquipmentSection();
                    }
                }
                else {
                    return true;
                }
            });
            $ui.append($pickKaiWeaponButton);
        }

        // Add HTML to do the choose
        gameView.appendToSection($ui);

        const firstRadio = $ui.find("input:visible[type='radio'][disabled!='disabled']").first();
        firstRadio.attr("checked", "checked");

        // Set the title
        $("#mechanics-kwpTitle").text(mechanicsEngine.getRuleText(rule));

        // Initialize (or restore) the value
        const existingKaiWeapon = state.actionChart.getKaiWeapon();
        if(existingKaiWeapon) {
            this.disable();
        }
    },

    /** Return true if the action button has been already clicked  */
    actionButtonWasClicked(): boolean {
        const sectionState = state.sectionStates.getSectionState();
        return sectionState.kaiWeaponPickersState.actionFired === true;
    },

    bindButtonActionEvent($pickKaiWeaponButton: JQuery<HTMLElement>, callback: () => void) {
        if (!$pickKaiWeaponButton) {
            $pickKaiWeaponButton = $("#mechanics-pickkaiweapon");
        }

        $pickKaiWeaponButton.on("click", (e:JQuery.Event) => {
            e.preventDefault();
            callback();
        });

    },

    hideButtonActionEvent() {
        $("#mechanics-pickkaiweapon").hide();
    },

    /**
     * Disable the Kai Weapon picker
     */
    disable() {

        // Initialize (or restore) the value
        const existingKaiWeapon = state.actionChart.getKaiWeapon();
        if(existingKaiWeapon) {
            $(`input[value=${existingKaiWeapon}]`).prop("checked",true);
        }

        $('input[name=mechanics-kaiWeaponGroup]:not(:checked)').prop("disabled",true);
        $("#mechanics-pickkaiweapon").setEnabled(false);
    }

};
