import { state, settingsController, translations, setupController, routing, Color } from "..";

/**
 * Settings view
 */
export const settingsView = {

    setup() {

        // Color theme
        $("#settings-color-theme").val(Color[state.color]);
        $("#settings-color-theme").on("change", function() {
            settingsController.changeColorTheme(Color[<string> $(this).val()]);
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
        $("#settings-restart-label").text(translations.text("restartBook", [state.book.bookNumber]));
        $("#settings-restart").on("click", (e) => {
            e.preventDefault();
            if (confirm(translations.text("confirmRestart"))) {
                setupController.restartBook();
            }
        });

        // Restart book
        $("#settings-restart-sect1").toggle(state.actionChartSect1 !== null);
        if(state.actionChartSect1 !== null) {
            $("#settings-restart-sect1-label").text(translations.text("restartBookSection1", [state.book.bookNumber]));
            $("#settings-restart-sect1").on("click", (e) => {
                e.preventDefault();
                if (confirm(translations.text("confirmRestartSection1"))) {
                    state.loadSaveGameJson(state.actionChartSect1);
                    routing.redirect("setup");
                }
            });
        }

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
