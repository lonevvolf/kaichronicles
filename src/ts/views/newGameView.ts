import { projectAon, Language, state, translations, newGameController } from "..";

/**
 * The new game view API
 */
export const newGameView = {

    setup() {

        // Set current language
        // $("#newgame-language").val(state.language);

        // Add supported books
        let html = "";
        for ( let i = 1; i <= projectAon.supportedBooks.length; i++) {
            const title = projectAon.getBookTitle( i, state.language )
            html += '<option value="' + i + '" >' +
                i + ". " +
                title + "</option>";
        }
        $("#newgame-book").html(html);

        // Form submit
        $("#newgame-form").submit((e) => {
            e.preventDefault();
            if (!$("#newgame-license").prop("checked")) {
                alert(translations.text("youMustAgree"));
                return;
            }
            newGameController.startNewGame($("#newgame-book").val(),
            Language.ENGLISH); //$("#newgame-language").val());
        });

        // Book change
        $("#newgame-book").change(() => {
            newGameController.selectedBookChanged($("#newgame-book").val());
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
