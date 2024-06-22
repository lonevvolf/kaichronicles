import { state, template, gameView, mechanicsEngine, BookSeriesId, randomMechanics, translations, BookSeries } from "../..";

/**
 * Kai name setup
 */
export class KaiNameSetup {

    /**
     * First names
     */
    public static readonly firstNames = ["Swift", "Sun", "True", "Bold", "Moon", "Sword",
            "Wise", "Storm", "Rune", "Brave"];

    /**
     * Last names
     */
    public static readonly lastNames = ["Blade", "Fire", "Hawk", "Heart", "Friend", "Star",
        "Dancer", "Helm", "Strider", "Shield"];

    /**
     * Choose Kai name UI
     */
    public static setKaiName() {
        // Add HTML to do the choice
        gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-setKaiName"));

        // Prefill the text area with the existing name
        $("#mechanics-customKaiName").val(state.actionChart.kaiName);
        
        // If the name is already set show the name
        if (state.actionChart.kaiName !== "") {
            $("#kaiName").append("<b>" + state.actionChart.kaiName + "</b>");
            $("#mechanics-setNames").hide();
            return;
        }
        else {
            $("#mechanics-existingKaiName").hide();
        }

        // Disable next link
        gameView.enableNextLink(false);

        // Kai Name
        if (state.actionChart.kaiName === "") {
            $("#mechanics-customKaiName").on("input", (e) => {
                state.actionChart.kaiName = $("#mechanics-customKaiName").val().toString();
                gameView.enableNextLink($("#mechanics-customKaiName").val() !== "");
                template.updateKaiName();
            });

            const $f = $("#mechanics-chooseFirstName");
            randomMechanics.bindTableRandomLink($f, (value) => {
                if ($("#mechanics-customKaiName").prop('readonly')) {
                    $("#mechanics-customKaiName").val(this.firstNames[value] + " " + $("#mechanics-customKaiName").val());
                }
                else {
                    $("#mechanics-customKaiName").val(this.firstNames[value]);
                    $("#mechanics-customKaiName").prop('readonly', true);
                }

                $("#mechanics-customKaiName").trigger("input");
            }, false);

            const $l = $("#mechanics-chooseLastName");
            randomMechanics.bindTableRandomLink($l, (value) => {
                if ($("#mechanics-customKaiName").prop('readonly')) {
                    $("#mechanics-customKaiName").val($("#mechanics-customKaiName").val() + " " + this.lastNames[value]);
                }
                else {
                    $("#mechanics-customKaiName").val(this.lastNames[value]);
                    $("#mechanics-customKaiName").prop('readonly', true);
                }

                $("#mechanics-customKaiName").trigger("input");
            }, false);
        }
    }
}
