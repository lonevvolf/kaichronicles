import { setupController, translations, views, settingsView, state, template, mechanicsEngine, Color, TextSize } from "..";

/**
 * Game settings controller
 */
export const settingsController = {

    index() {

        if ( !setupController.checkBook() ) {
            return;
        }

        document.title = translations.text("settings");

        views.loadView("settings.html")
        .then(() => {
            settingsView.setup();
        });

    },

    /**
     * Change the current color theme
     * @param color 'light' or 'dark'
     */
    changeColorTheme(color: Color): void {
        template.changeColorTheme( color );
        state.updateColorTheme( color );
    },

    /**
     * Change the current color theme
     * @param color 'light' or 'dark'
     */
    changeTextSize(textSize: TextSize): void {
        template.changeTextSize( textSize );
        state.updateTextSize( textSize );
    },

    /**
     * Show the save game dialog
     */
    saveGameDialog() {
        $("#settings-saveDialog").modal("show");
    },

    /** Return a string to put on saved games files */
    getDateForFileNames(): string {
        const now = new Date();
        return now.getFullYear() + "_" +
            ( now.getMonth() + 1 ).toString().padStart( 2 , "0" ) + "_" +
            now.getDate().toString().padStart( 2 , "0" ) + "_" +
            now.getHours().toString().padStart( 2 , "0" ) + "_" +
            now.getMinutes().toString().padStart( 2 , "0" ) + "_" +
            now.getSeconds().toString().padStart( 2 , "0" );
    },

    /**
     * Return a default save game file name
     */
    defaultSaveGameName() {
        return settingsController.getDateForFileNames() + "-book-" + state.book.bookNumber + "-savegame.json";
    },

    /**
     * Save the current game
     * @param fileName File name to save
     */
    saveGame(fileName: string) {
        try {
            const stateJson = state.getSaveGameJson();
            const blob = new Blob( [ stateJson ], {type: "application/json;charset=utf-8"});

            // Check file name
            fileName = fileName.trim();
            if ( !fileName ) {
                fileName = settingsController.defaultSaveGameName();
            }
            if ( !fileName.toLowerCase().endsWith(".json") ) {
                fileName += ".json";
            }

            // Check for invalid character names
            if ( !fileName.isValidFileName() ) {
                alert("The file name contains invalid characters");
                return false;
            }

            saveAs(blob, fileName);
            return true;
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            alert("Your browser version does not support save file with javascript. " +
                "Try a newer browser version. Error: " + e);
            return false;
        }
    },

    /** Return page */
    getBackController() { return "game"; }

};
