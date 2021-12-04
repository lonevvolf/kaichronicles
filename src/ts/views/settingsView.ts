import { state, settingsController, translations, setupController, routing } from "..";

/**
 * Settings view
 */
export const settingsView = {

    setup() {

        // Color theme
        $("#settings-color-theme").val(state.color);
        $("#settings-color-theme").on("change", function() {
            settingsController.changeColorTheme(<string> $(this).val());
        });

        // Random table type
        $("#settings-randomtable").val(state.actionChart.manualRandomTable ? "manual" : "computer");
        $("#settings-randomtable").on("change", function() {
            state.actionChart.manualRandomTable = ($(this).val() === "manual");
        });

        // Extended CRT
        $("#settings-extendedcrt").val(state.actionChart.extendedCRT ? "yes" : "no");
        $("#settings-extendedcrt").on("change", function() {
            state.actionChart.extendedCRT = ($(this).val() === "yes");
        });

        // Restart book
        $("#settings-restart").on("click", (e) => {
            e.preventDefault();
            if (confirm(translations.text("confirmRestart"))) {
                setupController.restartBook();
            }
        });

        // Start new game
        $("#settings-new").on("click", (e) => {
            e.preventDefault();
            routing.redirect("newGame");
        });

        // Game rules
        $("#settings-gamerules").on("click", () => {
            routing.redirect("gameRules");
        });

        // About the book
        $("#settings-about").on("click", () => {
            routing.redirect("about");
        });

        // Game save button
        $("#settings-save").on("click", (e) => {
            e.preventDefault();
            $("#settings-saveName").val(settingsController.defaultSaveGameName());
            $("#settings-saveDialog").modal("show");
        });

        // Save game dialog - save button
        $("#settings-saveBtn").on("click", (e) => {
            e.preventDefault();
            if (settingsController.saveGame(<string> $("#settings-saveName").val())) {
                $("#settings-saveDialog").modal("hide");
            }
        });

        // Remove the current file name
        $("#settings-saveRemove").on("click", (e) => {
            e.preventDefault();
            $("#settings-saveName").val("").focus();
        });
    },

};
