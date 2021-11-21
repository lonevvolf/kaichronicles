import { loadGameController, mechanicsEngine } from "..";

/**
 * The load game view interface functions
 */
export const loadGameView = {

    /**
     * Hide the web file uploader
     */
    hideFileUpload() { $("#loadGame-file").hide(); },

    /**
     * Bind web file uploader events
     */
    bindFileUploaderEvents() {
        $("#loadGame-file").change(function() {
            if (!this.files || !this.files[0]) {
                return;
            }
            loadGameController.fileUploaderChanged(this.files[0]);
        });
    },

    /**
     * Show an error
     * @param errorMsg Message to show
     */
    showError(errorMsg: string) {
        $("#loadGame-errors").text(errorMsg);
        mechanicsEngine.debugWarning(errorMsg);
    }
};
