import { template, translations, views, loadGameView, state, routing, mechanicsEngine } from "..";

/**
 * Load stored game controller
 */

// tslint:disable-next-line: class-name
export class loadGameController {

    /**
     * The load game page
     */
    public static index() {
        template.setNavTitle( translations.text("kaiChronicles"), "#mainMenu", true);
        template.showStatistics(false);
        template.showKaiName(false);
        views.loadView("loadGame.html").then(() => {
            // Web page environment:
            loadGameView.bindFileUploaderEvents();
        }, null);
    }

    /**
     * Called when the selected file changes (only web)
     * @param fileToUpload The selected file
     */
    public static fileUploaderChanged(fileToUpload: Blob) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                loadGameController.loadGame( <string>e.target.result );
            };
            reader.readAsText(fileToUpload);
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            loadGameView.showError( e.toString() );
        }
    }

    /**
     * Load saved game and start to play it
     * @param jsonState The saved game file content
     */
    private static loadGame(jsonState: string) {
        try {
            state.loadSaveGameJson( jsonState );
            routing.redirect("setup");
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            loadGameView.showError( e.toString() );
        }
    }

    /** Return page */
    public static getBackController() { return "mainMenu"; }

}
