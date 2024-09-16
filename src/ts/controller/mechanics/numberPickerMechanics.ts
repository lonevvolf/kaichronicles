import { mechanicsEngine, state, gameView, CurrencyName } from "../..";

/**
 * Tool to select a number (or an amount of money)
 */
export const numberPickerMechanics = {

    /**
     * numberPicker rule execution
     */
    numberPicker(rule: Element) {

        if ($(rule).attr("enabled") === "false") {
            // Disable the money picker
            numberPickerMechanics.disable();
            return;
        }

        // The number picker UI
        const $ui = mechanicsEngine.getMechanicsUI("mechanics-numberpicker");
        const index = $(rule).attr("index");

        // Check if it's a money picker
        if ($(rule).attr("money") === "true") {
            $ui.find("#mechanics-mpAmount").attr("data-ismoneypicker", "true");
            let currency = $(rule).attr("currency");
            if (!currency) {
                currency = CurrencyName.CROWN;
            }
            $ui.find("#mechanics-mpAmount").attr("data-moneypickercurrency", currency);
        }

        // Check if it has an action button
        const actionButtonTitle = mechanicsEngine.getRuleText(rule, "actionButton");
        if (actionButtonTitle) {
            const $pickNumberButton = $ui.find("#mechanics-picknumber");
            $pickNumberButton.show().text(actionButtonTitle);
            numberPickerMechanics.bindButtonActionEvent($pickNumberButton, () => {
                if (mechanicsEngine.fireNumberPickerChoosed()) {
                    // Store that the picker action has been fired
                    const sectionState = state.sectionStates.getSectionState();
                    sectionState.numberPickersState.actionFired = true;
                }
            });

            if(index) {
                $ui.find("#mechanics-picknumber").prop("id", "mechanics-picknumber" + index)
            }
        }

        // Set the title
        $ui.find("#mechanics-mpTitle").text(mechanicsEngine.getRuleText(rule));
    
        // Bind number picker events
        $ui.find("#mechanics-mpAmount").bindNumberEvents();

        // Set the minimum value
        const min = $(rule).attr("min");
        if (min) {
            $ui.find("#mechanics-mpAmount").attr("min", min);
        }

        // Set the maximum value
        const max = $(rule).attr("max");
        if (max) {
            $ui.find("#mechanics-mpAmount").attr("max", max);
        }

        // Initialize (or restore) the value
        $ui.find("#mechanics-mpAmount").initializeValue();

        if (index) {
            $ui.find("#mechanics-mpAmount").prop("id", "mechanics-mpAmount" + index)
            $ui.prop("id", "mechanics-numberpicker" + index );
        }

        // Add HTML to do the choose
        gameView.appendToSection($ui);
    },

    /** Return true if the action button has been already clicked  */
    actionButtonWasClicked(): boolean {
        const sectionState = state.sectionStates.getSectionState();
        return sectionState.numberPickersState.actionFired === true;
    },

    bindButtonActionEvent($pickNumberButton: JQuery<HTMLElement>, callback: () => void) {

        if (!$pickNumberButton) {
            $pickNumberButton = $("#mechanics-picknumber");
        }

        $pickNumberButton.on("click", (e:JQuery.Event) => {
            e.preventDefault();
            callback();
        });

    },

    hideButtonActionEvent() {
        $("#mechanics-picknumber").hide();
    },

    /**
     * Return true if the money picker value is valid
     */
    isValid(): boolean {
        const $picker = $("#mechanics-mpAmount");

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
     * Get the number picker value
     * @param pickerIndex The index number of the picker on the section (if there are multiple)
     */
    getNumberPickerValue(pickerIndex?: number): number {
        try {
            const selector = "#mechanics-mpAmount" + (pickerIndex ? pickerIndex.toFixed() : "");
            const $picker = $(selector);
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
     * Disable the money picker
     */
    disable() {
        $("#mechanics-mpAmount").setEnabled(false);
        $("#mechanics-picknumber").prop("disabled", true);
    }

};
