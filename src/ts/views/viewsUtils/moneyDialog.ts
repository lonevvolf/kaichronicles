import { state, translations, mechanicsEngine, actionChartController, Item, Currency, CurrencyName } from "../..";

/**
 * Modal dialog to pick / drop money.
 */
export class MoneyDialog {

    public static show(drop: boolean, currencyId: string = CurrencyName.CROWN) {

        MoneyDialog.setupDialog(currencyId);

        // Update bounds and initial value
        if (drop) {
            $("#mechanics-moneyamount")
            .attr("max", state.actionChart.beltPouch[currencyId])
            .val("1");                   

            $("#mechanics-moneyamount").attr("data-ismoneypicker", "true");
            $("#mechanics-moneyamount").attr("data-moneypickercurrency", currencyId);
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

    private static setupDialog(currencyId : string = CurrencyName.CROWN) {

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

    private static onDialogConfirmed(currencyId : string = CurrencyName.CROWN) {

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
            sectionState.removeObjectFromSection(Item.MONEY, 0, countPicked, -1, currencyId);
            // Re-render section
            mechanicsEngine.showAvailableObjects();
        }
        $("#mechanics-moneydialog").modal("hide");
    }
}
