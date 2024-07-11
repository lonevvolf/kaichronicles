import { state, translations, mechanicsEngine, actionChartController, Item, Currency } from "../..";

/**
 * Modal dialog to pick / drop money.
 */
export class MoneyDialog {

    public static show(drop: boolean, currencyId: Currency = Currency.CROWN) {

        MoneyDialog.setupDialog(drop, currencyId);

        // Update bounds and initial value
        if (drop) {
            if (currencyId === Currency.NOBLE) {
                $("#mechanics-moneyamount")
                .attr("max", state.actionChart.beltPouchNobles)
                .val("1");                
            } else {
                $("#mechanics-moneyamount")
                .attr("max", state.actionChart.beltPouch)
                .val("1");                   
            }

            $("#mechanics-moneyamount").attr("data-ismoneypicker", "true");
        } else {
            const sectionMoney = state.sectionStates.getSectionState().getAvailableMoney(currencyId);
            $("#mechanics-moneyamount")
                .attr("max", sectionMoney)
                .val(sectionMoney);
            $("#mechanics-moneyamount").attr("data-ismoneypicker", "false");
        }

        const $dlg = $("#mechanics-moneydialog");

        // Update translations
        const title = (drop ? "dropMoney" : "pickMoney");
        $("#mechanics-moneytitle").attr("data-translation", title);
        $("#mechanics-moneyapply").attr("data-translation", title);
        translations.translateTags($dlg);

        // Show
        $dlg
            .prop("data-isdrop", drop)
            .modal("show");
    }

    private static setupDialog(drop: boolean, currencyId : Currency = Currency.CROWN) {

        // If the dialog HTML do not exists, add it:
        if ($("#mechanics-moneydialog").length === 0) {
            const $moneyDlg = mechanicsEngine.getMechanicsUI("mechanics-moneydialog");
            $("body").append($moneyDlg);

            // Bind money picker events
            $("#mechanics-moneyamount").bindNumberEvents();
        }

        // Bind drop money confirmation button
        $("#mechanics-moneyapply").one("click", (e: JQuery.TriggeredEvent) => {
            e.preventDefault();
            MoneyDialog.onDialogConfirmed(currencyId);
        });

    }

    private static onDialogConfirmed(currencyId : Currency = Currency.CROWN) {

        const $moneyAmount = $("#mechanics-moneyamount");
        if (!$moneyAmount.isValid()) {
            return;
        }

        const moneyAmount = $moneyAmount.getNumber();
        if ($("#mechanics-moneydialog").prop("data-isdrop")) {
            // Drop
            actionChartController.increaseMoney(-moneyAmount, true, false, currencyId);
        } else {
            // Pick
            const countPicked = actionChartController.increaseMoney(moneyAmount, false, false, currencyId);
            const sectionState = state.sectionStates.getSectionState();
            if (currencyId === Currency.NOBLE) {
                sectionState.removeObjectFromSection(Item.NOBLE, 0, countPicked);
            } else {
                sectionState.removeObjectFromSection(Item.MONEY, 0, countPicked);
            }
            // Re-render section
            mechanicsEngine.showAvailableObjects();
        }
        $("#mechanics-moneydialog").modal("hide");
    }
}
