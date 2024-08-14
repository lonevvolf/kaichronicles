import { mechanicsEngine, state, gameView, translations } from "../..";

/**
 * Tool to select a discipline from the active disciplines
 */
export const disciplinePickerMechanics = {

    /**
     * disciplinePicker rule execution
     */
    disciplinePicker(rule: Element) {
        if ($(rule).attr("enabled") === "false") {
            // Disable the discipline picker
            disciplinePickerMechanics.disable();
            return;
        }

        // The discipline picker UI
        const $ui = mechanicsEngine.getMechanicsUI("mechanics-disciplinepicker");
        const disciplines = state.actionChart.getDisciplines();
        const bookDisciplines = state.book.getDisciplinesTable();

        for(const discipline of disciplines) {
            $ui.find("#mechanics-dpTitle").text($(rule).attr("title") ?? "");
            const option = $ui.find("#mechanics-dpOption").clone();
            
            option.attr("id", "mechanics-dpOption-" + discipline);
            const radioButton = option.find("#mechanics-dpRadioButton");
            radioButton.attr("value", disciplines.indexOf(discipline));
            radioButton.attr("id", "mechanics-dpRadioButton-" + discipline);
            if (!state.actionChart.hasDiscipline(discipline)) {
                radioButton.attr("disabled", "disabled");
            }
            const radioButtonLabel = option.find("#mechanics-dpRadioLabel");
            radioButtonLabel.text(bookDisciplines[discipline].name);
            radioButtonLabel.attr("id", "mechanics-dpRadioLabel-" + discipline)

            $ui.append(option);
        }

        $ui.find("#mechanics-dpOption").hide();               

        // Check if it has an action button
        const actionButtonTitle = mechanicsEngine.getRuleText(rule, "actionButton");
        if (actionButtonTitle) {
            const $pickDisciplineButton = $ui.find("#mechanics-pickdiscipline");
            $pickDisciplineButton.show().text(actionButtonTitle);
            disciplinePickerMechanics.bindButtonActionEvent($pickDisciplineButton, () => {
                const selectedDisciplineIndex = parseInt($("#mechanics-disciplinepicker").find("input[type='radio'][checked='checked']").val().toString());
                const selectedDiscipline = state.actionChart.getDisciplines()[selectedDisciplineIndex];
                if (!confirm(translations.text(mechanicsEngine.getRuleText(rule, "confirmText"), [translations.text(selectedDiscipline)]))) {
                    return;
                }
                if (mechanicsEngine.fireDisciplinePickerChoosed()) {
                    // Store that the picker action has been fired
                    const sectionState = state.sectionStates.getSectionState();
                    sectionState.disciplinePickersState.actionFired = true;
                }
            });
            $ui.append($pickDisciplineButton);
        }

        // Add HTML to do the choose
        gameView.appendToSection($ui);

        const firstRadio = $ui.find("input:visible[type='radio'][disabled!='disabled']").first();
        firstRadio.attr("checked", "checked");

        // Set the title
        $("#mechanics-dpTitle").text(mechanicsEngine.getRuleText(rule));

        // Initialize (or restore) the value
        $("#mechanics-dpAmount").initializeValue();

    },

    /** Return true if the action button has been already clicked  */
    actionButtonWasClicked(): boolean {
        const sectionState = state.sectionStates.getSectionState();
        return sectionState.disciplinePickersState.actionFired === true;
    },

    bindButtonActionEvent($pickDisciplineButton: JQuery<HTMLElement>, callback: () => void) {

        if (!$pickDisciplineButton) {
            $pickDisciplineButton = $("#mechanics-pickdiscipline");
        }

        $pickDisciplineButton.on("click", (e:JQuery.Event) => {
            e.preventDefault();
            callback();
        });

    },

    hideButtonActionEvent() {
        $("#mechanics-pickdiscipline").hide();
    },

    /**
     * Return true if the picker value is valid
     */
    isValid(): boolean {
        const $picker = $("#mechanics-dpAmount");

        // If the money picker has been disabled, dont check it
        if (!$picker.isEnabled()) {
            return true;
        }

        if ($picker.length > 0) {
            return $picker.isValid();
        } else {
            return true;
        }
    },

    /**
     * Get the discipline picker value
     */
    getrDisciplinePickerValue(): number {
        try {
            const $picker = $("#mechanics-dpAmount");
            if ($picker.length > 0) {
                return $picker.getNumber();
            } else {
                return 0;
            }
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            return 0;
        }
    },

    /**
     * Get the discipline picker value
     */
    getDisciplinePickerValue(): number {
        try {
            return parseInt($('input[name="mechanics-disciplineGroup"]:checked').val().toString());
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            return -1;
        }
    },

    /**
     * Disable the discipline picker
     */
    disable() {
        const buttons = $("#mechanics-disciplinepicker").find("input[type='radio']");
        for( const button of buttons.get() ) {
            $(button).attr("disabled", "disabled");
        }
        $("#mechanics-pickdiscipline").prop("disabled", true);
    }

};
