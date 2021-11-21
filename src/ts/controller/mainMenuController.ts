import { template, translations, views, mainMenuView, state, settingsController } from "..";

/**
 * The application menu controller
 */
export const mainMenuController = {

    /**
     * The game menu
     */
    index() {
        template.setNavTitle( translations.text("kaiChronicles") , "#mainMenu", true);
        template.showStatistics(false);
        views.loadView("mainMenu.html").then(() => {
            mainMenuView.setup();

            // Check if there is a current game
            if ( !state.existsPersistedState() ) {
                mainMenuView.hideContinueGame();
            }

        });
    },

    /**
     * Change the current color theme
     */
    changeColor() {
        settingsController.changeColorTheme(state.color === "light" ? "dark" : "light");
        mainMenuController.index();
    },

    /** Return page */
    getBackController() { return "exitApp"; }

};
