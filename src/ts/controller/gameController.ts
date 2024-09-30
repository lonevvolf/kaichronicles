import { Section, setupController, state, Book, routing, views, gameView, template, mechanicsEngine, App, BookValidator, DebugMode } from "..";

/**
 * The game controller
 */
export const gameController = {

    /**
     * The current book section
     */
    currentSection: null as Section,

    /**
     * Setup the game view
     */
    index() {

        if (!setupController.checkBook()) {
            return;
        }

        if (state.sectionStates.currentSection === Book.KAIMONASTERY_SECTION) {
            gameController.gameTemplateSetup();
            // Special case: Move to the inexistent section for the Kai monastery
            routing.redirect("kaimonastery");
            return;
        }

        views.loadView("game.html")
            .then(() => {
                gameController.gameTemplateSetup();
                gameView.setup();
                // Go to the current section (or the initial)
                let sec = state.sectionStates.currentSection;
                if (!sec) {
                    sec = Book.INITIAL_SECTION;
                }
                gameController.loadSection(sec, false, state.actionChart.yScrollPosition);
            }, null);

    },

    /** Setup the HTML main page template for the game view */
    gameTemplateSetup() {
        template.showStatistics(true);
        template.showKaiName(state.actionChart.kaiName !== "");
        template.setNavTitle(state.book.getBookTitle(), "#game", false);
    },

    /**
     * Load and display a section
     * @param sectionId The section id to display
     * @param choiceLinkClicked True if the section is load due to a choice link click
     * @param yScroll y coord. where to scroll initially
     */
    loadSection(sectionId: string, choiceLinkClicked: boolean = false, yScroll: number = 0) {
        
        // Load and display the section
        const newSection = new Section(state.book, sectionId, state.mechanics);
        if (!newSection.exists()) {
            mechanicsEngine.debugWarning("Section " + sectionId + " does not exists");
            return;
        }
        gameController.currentSection = newSection;

        // Clear previous section toasts:
        toastr.clear();

        // Fire choice events:
        if (choiceLinkClicked) {
            mechanicsEngine.fireChoiceSelected(sectionId);
        }

        // Store the current section id (must to be done BEFORE execute mechanicsEngine.run,
        // there are references to this there)
        state.sectionStates.currentSection = sectionId;

        // Show the section
        gameView.setSectionContent(gameController.currentSection);

        // Update previous / next navigation links
        gameView.updateNavigation(gameController.currentSection);

        // Run section mechanics
        mechanicsEngine.run(gameController.currentSection);

        // Bind choice links
        gameView.bindChoiceLinks();

        // Scroll to top (or to the indicated place)
        if (!yScroll) {
            yScroll = 0;
        }
        window.scrollTo(0, yScroll);

        if(sectionId === "sect1" && state.actionChartSect1 == null) {
            state.actionChartSect1 = state.getSaveGameJson();
        }

        // Persist state
        state.persistState();

        if (App.debugMode === DebugMode.DEBUG) {
            // Show section that can come to here
            gameView.showOriginSections();
        }

        if (App.debugMode === DebugMode.DEBUG || App.debugMode === DebugMode.TEST) {
            // Validate this section
            const validator = new BookValidator(state.mechanics, state.book);
            validator.validateSection(gameController.currentSection.sectionId);
            for (const error of validator.errors) {
                mechanicsEngine.debugWarning(error);
            }

            template.addSectionReadyMarker();
        }
    },

    /**
     * Navigate to the previous or next section
     * @param increment -1 to go the previous. +1 to the next
     */
    onNavigatePrevNext(increment: number) {
        const s = gameController.currentSection;
        const newId = (increment < 0 ? s.getPreviousSectionId() : s.getNextSectionId());
        if (newId) {
            gameController.loadSection(newId);
        } else {
            mechanicsEngine.debugWarning("No previous/next section found");
        }
    },

    /** Return page */
    getBackController() {
        return "mainMenu";
    },

    /**
     * On leave controller
     */
    onLeave() {

        if (!state || !state.actionChart) {
            return;
        }

        // Store the scroll position.
        // Special case: Do not store if we are going redirected from 'game' controller, at the index function to 'kaimonastery'
        if (!(routing.getControllerName() === "kaimonasteryController" && window.scrollY === 0)) {
            state.actionChart.yScrollPosition = window.scrollY;
        }

        state.persistState();
    }

};
