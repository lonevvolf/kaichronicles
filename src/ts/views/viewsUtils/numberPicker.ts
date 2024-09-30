
import { state, translations, mechanicsEngine, CurrencyName } from "../..";

/**
 * Declare jQuery functions for number fields
 */
export function declareJqueryNumberFunctions() {
    // tslint:disable-next-line: only-arrow-functions
    (function( $ ) {

        /**
         * Returns the number value, or NaN
         */
        $.fn.getNumber = function() {
            const txtVal = this.val();
            if ( !txtVal ) {
                return 0;
            }
            return parseInt( txtVal, 10 );
        };

        /**
         * Set the number value
         */
        $.fn.setNumber = function(value) {
            this.val(value);
            this.fireValueChanged();
        };

        /**
         * Get the title for this field
         */
        $.fn.getTitle = function() {
            return $("label[for='" + this.attr("id") + "']").text();
        };

        /**
         * Bind number events
         */
        $.fn.bindNumberEvents = function() {
            this.parent().find("button.add-number").on("click", (e) => {
                e.preventDefault();
                let n = this.getNumber();
                if ( isNaN(n) ) {
                    return;
                }
                n++;
                if ( n <= this.getMaxValue() ) {
                    this.setNumber(n);
                }
            });
            this.parent().find("button.sub-number").on("click", (e) => {
                e.preventDefault();
                let n = this.getNumber();
                if ( isNaN(n) ) {
                    return;
                }
                n--;
                if ( n >= this.getMinValue() ) {
                    this.setNumber(n);
                }
            });
            this.on("change", () => {
                this.fireValueChanged();
            });
        };

        /**
         * Event called when the number picker has changed
         */
        $.fn.fireValueChanged = function() {
            // console.log('fireValueChanged');
            try {
                const sectionState = state.sectionStates.getSectionState();
                sectionState.numberPickersState[ this.attr("id") ] = this.val();
            } catch (e) {
                mechanicsEngine.debugWarning(e);
            }
        };

        /**
         * Returns the minimum value for this field
         */
        $.fn.getMinValue = function() {
            const min = parseInt( this.attr("min"), 10 );
            if ( isNaN(min) ) {
                return -99999999;
            }
            return min;
        };

        /**
         * Returns the maximum value for this field
         */
        $.fn.getMaxValue = function() {
            const max = parseInt( this.attr("max"), 10 );
            if ( isNaN(max) ) {
                return 99999999;
            }
            return max;
        };

        /**
         * Return true if the number is valid
         */
        $.fn.isValid = function() {
            const num: number = this.getNumber();

            if ( isNaN(num) ) {
                alert( translations.text("npWrongValue" , [this.getTitle()] ) );
                return false;
            }

            const min = this.getMinValue();
            if ( num < min ) {
                alert( translations.text( "npMinValue" , [ this.getTitle() , min ] ) );
                return false;
            }

            const max = this.getMaxValue();
            if ( num > max ) {
                alert( translations.text( "npMaxValue" , [ this.getTitle() , max ] ) );
                return false;
            }

            if ( this.attr("data-ismoneypicker") === "true" ) {
                // Check if you have enough money
                let currency = this.attr("data-moneypickercurrency");
                if (!currency) {
                    if ( state.actionChart.getBeltPouchUsedAmount() < num) {
                        alert( translations.text( "noEnoughMoney" ) );
                        return false;
                    }
                } else if ( state.actionChart.beltPouch[currency] < num) {
                    alert( translations.text( "noEnoughMoney" ) );
                    return false;
                }
            }

            return true;
        };

        /**
         * Enable / disable the number picker
         * @param {boolean} enabled True to enable, false to disable
         */
        $.fn.setEnabled = function(enabled) {
            this.prop("disabled", !enabled);
            this.parent().find("button.add-number").prop("disabled", !enabled);
            this.parent().find("button.sub-number").prop("disabled", !enabled);
        };

        /**
         * Return true if the number picker is enabled
         */
        $.fn.isEnabled = function() {
            return !this.prop("disabled");
        };

        /**
         * Set the initial value of the picker
         */
        $.fn.initializeValue = function() {
            // Check if there is a number recorded on the section
            const sectionState = state.sectionStates.getSectionState();
            const lastValue = sectionState.numberPickersState[ this.attr("id") ];
            if ( lastValue ) {
                this.val( lastValue );
            } else {
                // Try to set the minimum value
                const min = this.attr( "min" );
                if ( min ) {
                    this.val( min );
                }
            }
        };

    }( jQuery ));
}
