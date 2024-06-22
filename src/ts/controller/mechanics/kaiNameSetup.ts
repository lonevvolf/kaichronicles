import { state, template, gameView, mechanicsEngine, BookSeriesId, randomMechanics, translations, BookSeries } from "../..";

/**
 * Kai name setup
 */
export class KaiNameSetup {

    /**
     * Weapons table for Weaponskill discipline in Kai books (IT DOES NOT CONTAIN BOW!!!)
     */
    public static readonly firstNames = ["Swift", "Sun", "True", "Bold", "Moon", "Sword",
            "Wise", "Storm", "Rune", "Brave"];

    /**
     * Weapons table for Weaponskill discipline in Kai books (IT DOES NOT CONTAIN BOW!!!)
     */
    public static readonly lastNames = ["Blade", "Fire", "Hawk", "Heart", "Friend", "Star",
        "Dancer", "Helm", "Strider", "Shield"];

    /**
     * Choose player skills UI
     */
    public static setKaiName() {
        // If the name is already set or not a New Order book, do nothing
        if (state.book.getBookSeries().id != BookSeriesId.NewOrder || state.actionChart.kaiName !== "") {
            return;
        }

        // Add HTML to do the choose
        gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-setKaiName"));

        // Disable next link
        gameView.enableNextLink(false);

        // Kai Name
        if (state.actionChart.kaiName !== "") {
            $("#mechanics-detFirstName").hide();
            $("#mechanics-detLastName").hide();
        } else {
            const $f = $("#mechanics-chooseFirstName");
            randomMechanics.bindTableRandomLink($f, (value) => {
                if (state.actionChart.kaiName !== "") {
                    state.actionChart.kaiName = this.firstNames[value] + " " + state.actionChart.kaiName;
                }
                else {
                    state.actionChart.kaiName = this.firstNames[value];
                }
                $f.parent().append("<b>" + translations.text("firstNameSet", [this.firstNames[value]]) + ".</b>");
                template.updateKaiName();
                if (state.actionChart.kaiName.includes(" ")) {
                    gameView.enableNextLink(true);
                }
            }, false);

            const $l = $("#mechanics-chooseLastName");
            randomMechanics.bindTableRandomLink($l, (value) => {
                if (state.actionChart.kaiName !== "") {
                    state.actionChart.kaiName = state.actionChart.kaiName + " " + this.lastNames[value];
                }
                else {
                    state.actionChart.kaiName = this.lastNames[value];
                }
                $l.parent().append("<b>" + translations.text("lastNameSet", [this.lastNames[value]]) + ".</b>");
                template.updateKaiName();
                if (state.actionChart.kaiName.includes(" ")) {
                    gameView.enableNextLink(true);
                }
            }, false);
        }
    }
}
