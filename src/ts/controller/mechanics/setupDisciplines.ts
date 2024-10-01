import { ActionChart, state, gameView, mechanicsEngine, BookSeriesId, App, BookSeries, translations, KaiDiscipline, template, randomTable, DebugMode } from "../..";

/**
 * Setup player disciplines
 */
export class SetupDisciplines {

    /** Prefix for disciplines checkboxes id */
    public static readonly DISCIPLINE_CHECKBOX_ID = "mechanics-discipline-chk-";

    /** Prefix for weapon checkboxes id */
    public static readonly WEAPON_CHECKBOX_ID = "mechanics-weapon-chk-";

    /**
     * Weapons table for Weaponskill discipline in Kai books (IT DOES NOT CONTAIN BOW!!!)
     */
    public static readonly kaiWeapons = ["dagger", "spear", "mace", "shortsword", "warhammer", "sword",
        "axe", "sword", "quarterstaff", "broadsword"];

    /**
     * Weapons table for Weaponmastery discipline in Magnakai books
     */
    public static readonly magnakaiWeapons = ["dagger", "spear", "mace", "shortsword", "warhammer", "bow",
        "axe", "sword", "quarterstaff", "broadsword"];

    /**
     * Weapons table for Weaponmastery discipline in Grand Master books
     */
    private static readonly grandMasterWeapons = ["spear", "bow", "dagger", "quarterstaff", "mace", "broadsword",
        "shortsword", "axe", "warhammer", "sword"];

    /**
     * Expected number of disciplines to choose
     */
    private readonly expectedNDisciplines: number;

    /**
     * The last book player action chart.
     * null if this is the first book the player play
     */
    private readonly previousActionChart: ActionChart = null;

    constructor() {

        // Get info about the last played book
        const previousBookNumber = state.book.bookNumber - 1;
        if (previousBookNumber >= 1 && state.book.bookNumber !== 21) {
            this.previousActionChart = state.getPreviousBookActionChart(previousBookNumber);

            // When a series start, by default, keep Weaponmastery with the same weapons from previous series
            // DO NOT: This is OK in Kai -> Magnakai transition, but not in Magnakai -> Grand Master
            // You can end Magnakai with weaponskill with, say, 5 weapons, but you start with less weapons. So, do not
            /*if (this.previousActionChart && this.previousBookSeries !== state.book.getBookSeries().id &&
                state.actionChart.getWeaponSkill().length === 0 ) {
                    state.actionChart.setWeaponSkill( this.previousActionChart.getWeaponSkill(this.previousBookSeries).clone() );
            }*/
        }

        this.expectedNDisciplines = this.getNExpectedDisciplines();
    }

    /**
     * Choose the kai disciplines UI
     */
    public setupDisciplinesChoose() {

        // Add the warning about the number of disciplines
        gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-setDisciplines-NDis"));
        $("#mechanics-nDisciplines").text(this.expectedNDisciplines);

        // Add the warning about the number of weapons for weaponmastery
        gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-setDisciplines-NWeapons"));
        $("#mechanics-setDisciplines-weaponsmax").text(this.getExpectedNWeaponsWeaponmastery());

        // Add checkbox for each discipline:
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        $('.subsection').not('#mksumary').not('#nodispln').append(mechanicsEngine.getMechanicsUI("mechanics-setDisciplines"))
            .each((index, disciplineSection) => {
                self.setupDisciplineCheckBox($(disciplineSection));
            })
            // Set events when checkboxes are clicked
            .find("input[type=checkbox]")
            .on("click", function(e) {
                self.onDisciplineCheckBoxClick(e, $(this));
            });

        // If we are on a magnakai book, add the weapons checkboxes
        this.populateMagnakaiWeapons();

        // Set the already chosen weapon for the Weaponskill
        this.setWeaponSkillWeaponNameOnUI();

        // Initialize UI state
        this.afterDisciplineSelection();
    }

    /**
     * Add checkboxes to select weapons for Weaponmastery.
     * Only for magnakai books
     */
    private populateMagnakaiWeapons() {
        // Only for series >= Magnakai
        const currentSeriesId = state.book.getBookSeries().id;
        if (currentSeriesId < BookSeriesId.Magnakai) {
            return;
        }

        const weaponsTable = (currentSeriesId === BookSeriesId.GrandMaster ? SetupDisciplines.grandMasterWeapons :
            SetupDisciplines.magnakaiWeapons);

        // Add checkboxes
        const $checkboxTemplate = mechanicsEngine.getMechanicsUI("mechanics-magnakaiWeapon");
        let html = "";
        for (let i = 0; i < weaponsTable.length; i++) {
            if (i % 2 === 0) {
                html += '<div class="row">';
            }

            // Prepare the weapon UI
            const weaponItem = state.mechanics.getObject(weaponsTable[i]);
            const $checkboxDiv = $checkboxTemplate.clone();
            $checkboxDiv.attr("id", weaponItem.id);
            $checkboxDiv.find(".mechanics-wName").text(weaponItem.name);

            // The weapon has been already selected?
            const selected: boolean = state.actionChart.getWeaponSkill().includes(weaponsTable[i]);
            const $chk = $checkboxDiv.find("input");
            $chk.attr("id", SetupDisciplines.WEAPON_CHECKBOX_ID + weaponItem.id);
            if(selected) {
                $chk.attr("checked", "checked");
            }

            html += $checkboxDiv[0].outerHTML;

            if (i % 2 === 1) {
                html += "</div>";
            }
        }
        const $well = $("#wpnmstry .card");
        $well.append(html);

        // Add event handlers
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        $well.find("input.weaponmastery-chk")
        .on("click", function(e: JQuery.TriggeredEvent) {
            self.onWeaponmasteryWeaponClick(e, $(this));
            });

        // Set the initial state
        this.enableMagnakaiWeapons();
    }

    /**
     * Enable or disable weapons selection for Weaponmastery
     */
    private enableMagnakaiWeapons() {

        const bookSeries = state.book.getBookSeries();

        // Only for Magnakai / Grand Master books
        if (bookSeries.id < BookSeriesId.Magnakai) {
            return;
        }

        // If Weaponmastery is not selected, disable all weapons
        if (!state.actionChart.hasDiscipline(bookSeries.weaponskillDiscipline)) {
            $("input.weaponmastery-chk").prop("disabled", true);
            return;
        }

        // By default, enable all weapons
        $("input.weaponmastery-chk").prop("disabled", false);

        // If Weaponmastery was selected on a previous book, disable the weapons already
        // selected on the previous book. This only applies if the book is not a series start
        if (App.debugMode !== DebugMode.DEBUG &&
            !BookSeries.isSeriesStart(state.book.bookNumber) &&
            this.previousActionChart &&
            this.previousActionChart.hasDiscipline(bookSeries.weaponskillDiscipline)
        ) {
            for (const weaponId of this.previousActionChart.getWeaponSkill()) {
                $("#" + weaponId + " input[type=checkbox]").prop("disabled", true);
            }
        }
    }

    /**
     * Returns the number of weapons to select for the Weaponmastery discipline.
     * Only for Magnakai / Grand Master books
     */
    private getExpectedNWeaponsWeaponmastery(): number {

        const bookSeries = state.book.getBookSeries();
        let nWeapons = bookSeries.initialWeaponskillNWeapons;

        if (BookSeries.isSeriesStart(state.book.bookNumber)) {
            // If first book of a serie, don't check previous book
            return nWeapons;
        }

        if (this.previousActionChart && this.previousActionChart.hasDiscipline(bookSeries.weaponskillDiscipline)) {
            // One more for this book
            nWeapons = this.previousActionChart.getWeaponSkill().length + 1;
        }
        return nWeapons;
    }

    /**
     * Click on a Weaponmastery weapon event handler
     * @param e The click event
     * @param  $checkBox The checkbox (jQuery)
     */
    private onWeaponmasteryWeaponClick(e: JQuery.TriggeredEvent, $checkBox: JQuery<HTMLElement>) {

        const selected: boolean = $checkBox.prop("checked");
        const weaponId: string = $checkBox.closest(".weaponmastery-weapon").attr("id");

        if (selected) {
            // Check the maximum weapons number
            const nExpectedWeapons = this.getExpectedNWeaponsWeaponmastery();
            if (App.debugMode !== DebugMode.DEBUG && state.actionChart.getWeaponSkill().length >= nExpectedWeapons) {
                e.preventDefault();
                if (nExpectedWeapons === 1) {
                    alert(translations.text("onlyNWeapon", [nExpectedWeapons]));
                } else {
                    alert(translations.text("onlyNWeapons", [nExpectedWeapons]));
                }
                return;
            }
            state.actionChart.getWeaponSkill().push(weaponId);
        } else {
            state.actionChart.getWeaponSkill().removeValue(weaponId);
        }

        // Update UI
        this.afterDisciplineSelection();
    }

    /**
     * Initialize a discliplne check box
     * @param $disciplineSection The checkbox to initialize (Jquery)
     */
    private setupDisciplineCheckBox($disciplineSection: JQuery<HTMLElement>) {

        // Set the discipline name on the checkbox
        const $title = $disciplineSection.find(".subsectionTitle");
        $disciplineSection.find(".mechanics-dName").text($title.text());

        // Set checkbox initial value
        const disciplineId: string = $disciplineSection.attr("id");
        const $check = $disciplineSection.find("input[type=checkbox]");
        $check.prop("checked", state.actionChart.hasDiscipline(disciplineId));
        $check.attr("id", SetupDisciplines.DISCIPLINE_CHECKBOX_ID + disciplineId);

        // If the player had this discipline on the previous book, disable the check
        // On debug mode, always enabled
        if (App.debugMode !== DebugMode.DEBUG &&
            !BookSeries.isSeriesStart(state.book.bookNumber) &&
            this.previousActionChart &&
            this.previousActionChart.hasDiscipline(disciplineId)
        ) {
            $check.prop("disabled", true);
        }
    }

    /**
     * Handle click on discipline checkbox
     * @param e The click event
     * @param $checkBox The clicked checkbox (JQuery)
     */
    private onDisciplineCheckBoxClick(e: JQuery.TriggeredEvent, $checkBox: JQuery<HTMLElement>) {

        // Limit the number of disciplines. Unlimited on debug mode
        const selected: boolean = $checkBox.prop("checked");
        if (selected && this.getAllDisciplinesSelected() && App.debugMode !== DebugMode.DEBUG) {
            e.preventDefault();
            alert(translations.text("maxDisciplines", [this.expectedNDisciplines]));
            return;
        }

        // Add / remove the discipline
        const disciplineId: string = $checkBox.closest(".subsection").attr("id");
        if (selected) {
            this.onDisciplineSelected(e, disciplineId);
        } else {
            state.actionChart.getDisciplines().removeValue(disciplineId);
        }

        this.afterDisciplineSelection();
    }

    /**
     * Discipline selected event handler
     * @param e The discipline check box click event
     * @param disciplineId The selected discipline
     */
    private onDisciplineSelected(e: JQuery.TriggeredEvent, disciplineId: string) {

        if (disciplineId === KaiDiscipline.Weaponskill) {
            // Special case for kai series: Choose on the random table the weapon
            this.chooseWeaponskillWeapon(e);
            return;
        }

        state.actionChart.getDisciplines().push(disciplineId);
    }

    /**
     * Code to call after a discipline is selected / deselected
     */
    private afterDisciplineSelection() {

        let enableNextPage = true;

        // Check all disciplines selected
        if (this.getAllDisciplinesSelected()) {
            $("#mechanics-setDisciplines-NDis").removeClass("d-block").hide();
        } else {
            $("#mechanics-setDisciplines-NDis").addClass("d-block").show();
            enableNextPage = false;
        }

        // Check weapons selected for Magnakai / Grand Master books
        const bookSeries = state.book.getBookSeries();
        if (bookSeries.id >= BookSeriesId.Magnakai &&
            state.actionChart.hasDiscipline(bookSeries.weaponskillDiscipline) &&
            state.actionChart.getWeaponSkill().length < this.getExpectedNWeaponsWeaponmastery()
        ) {
            enableNextPage = false;
            $("#mechanics-setDisciplines-NWeapons").addClass("d-block").show();
        } else {
            $("#mechanics-setDisciplines-NWeapons").removeClass("d-block").hide();
        }

        gameView.enableNextLink(enableNextPage);

        this.enableMagnakaiWeapons();
        template.updateStatistics();
    }

    /**
     * Do the random choice for Weaponskill weapon.
     * Only applies to Kai series
     */
    private chooseWeaponskillWeapon(e: JQuery.TriggeredEvent) {

        if (state.actionChart.getWeaponSkill().length > 0) {
            // Weapon already chosen
            state.actionChart.getDisciplines().push(KaiDiscipline.Weaponskill);
            return;
        }

        // Do not mark the check yet. The "if" is REQUIRED, otherwise the check is not marked with computer generated random table
        if (state.actionChart.manualRandomTable) {
            e.preventDefault();
        }

        // Pick a  random number
        randomTable.getRandomValueAsync()
            .then((value: number) => {

                // Store the discipline
                state.actionChart.getDisciplines().push(KaiDiscipline.Weaponskill);
                state.actionChart.getWeaponSkill().push(SetupDisciplines.kaiWeapons[value]);

                // Show on UI the selected weapon
                this.setWeaponSkillWeaponNameOnUI();
                const $well = $("#wepnskll .card");
                $well.append(`<div><i><small>${translations.text("randomTable")}: ${value}</small></i></div>`);

                // Mark the checkbox
                $well.find("input[type=checkbox]").prop("checked", true);

                this.afterDisciplineSelection();
            }, null);
    }

    /**
     * Set the weapon name on UI.
     * Only applies to Kai serie
     */
    private setWeaponSkillWeaponNameOnUI() {

        if (state.actionChart.getWeaponSkill().length === 0) {
            // No weapon selected yet
            return;
        }
        if (state.book.getBookSeries().id > BookSeriesId.Kai) {
            // Only for kai books
            return;
        }

        const o = state.mechanics.getObject(state.actionChart.getWeaponSkill()[0]);
        $("#wepnskll .mechanics-wName").text("(" + o.name + ")");
    }

    /**
     * Get the number of expected disciplines on the current book
     * @returns Number of expected disciplines
     */
    private getNExpectedDisciplines(): number {
        let expectedNDisciplines = state.book.getBookSeries().initialNDisciplines;

        // If first book of a series, don't check previous book
        if (BookSeries.isSeriesStart(state.book.bookNumber)) {
            return expectedNDisciplines;
        }

        // Number of disciplines to choose (previous book disciplines + 1):
        if (this.previousActionChart) {
            expectedNDisciplines = this.previousActionChart.getDisciplines().length + 1;
        }

        return expectedNDisciplines;
    }

    /**
     * Are all disciplines selected?
     * @returns True if all disciplines are selected
     */
    private getAllDisciplinesSelected(): boolean {
        return state.actionChart.getDisciplines().length >= this.expectedNDisciplines;
    }

}
