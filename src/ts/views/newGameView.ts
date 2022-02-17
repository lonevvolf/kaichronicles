import { projectAon, translations, newGameController, state } from "..";

/**
 * The new game view API
 */
export const newGameView = {

    setup() {

        // Add supported books
        let html = "";
        for ( let i = 1; i <= projectAon.supportedBooks.length; i++) {
            const title = projectAon.getBookTitle( i )
            html += '<option value="' + i + '" >' +
                i + ". " +
                title + "</option>";
        }
        $("#newgame-book").html(html);

        // Form submit
        $("#newgame-form").on("submit", (e) => {
            e.preventDefault();
            if (!$("#newgame-license").prop("checked")) {
                alert(translations.text("youMustAgree"));
                return;
            }
            newGameController.startNewGame(<number> $("#newgame-book").val());
        });

        // Book change
        $("#newgame-book").on("change", () => {
            newGameController.selectedBookChanged(<number> $("#newgame-book").val());
        });
        
        // Random table change
        $("#newgame-randomtable").val((state.manualRandomTable) ? "manual" : "computer");
        $("#newgame-randomtable").on("change", () => {
            state.manualRandomTable = ($("#newgame-randomtable").val() === "manual");
        });

        // Set the first book as selected:
        newGameController.selectedBookChanged(1);
    },

    /**
     * Change the current book cover
     * @param {string} url The cover URL
     */
    setCoverImage(url: string) {
        $("#newgame-cover").attr("src", "");
        $("#newgame-cover").attr("src", url);
    }
};
