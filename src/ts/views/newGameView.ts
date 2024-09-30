import { projectAon, translations, newGameController, state, pwa, Book, BookSeriesId } from "..";
import { BookData } from "../scripts/bookData";

/**
 * The new game view API
 */
export const newGameView = {

    setup() {

        // Add supported books
        let html = "";
        let series: BookSeriesId|null = null;
        for ( let i = 1; i <= projectAon.supportedBooks.length; i++) {
            let seriesId = new Book(i).getBookSeries().id;
            if (seriesId !== series) {
                html += `<optgroup label="${translations.text(BookSeriesId[seriesId])}"></optgroup>`;
                series = seriesId;
            }
            const title = projectAon.getBookTitle( i )
            html += '<option value="' + i.toFixed() + '" >' + i.toFixed() + ". " + title + "</option>";
        }
        $("#newgame-book").html(html);

        // Form submit
        $("#newgame-form").on("submit", (e) => {
            e.preventDefault();
            if (!$("#newgame-license").prop("checked")) {
                alert(translations.text("youMustAgree"));
                return;
            }
            newGameController.startNewGame(parseInt(<string>$("#newgame-book").val()));
        });

        // Book change
        $("#newgame-book").on("change", () => {
            newGameController.selectedBookChanged(parseInt(<string>$("#newgame-book").val()));
        });
        
        // Random table change
        $("#newgame-randomtable").val((state.manualRandomTable) ? "manual" : "computer");
        $("#newgame-randomtable").on("change", () => {
            state.manualRandomTable = ($("#newgame-randomtable").val() === "manual");
        });

        if (pwa.isOnline) {
            $("#newgame-offline-warning").hide();
        } else {
            $("#newgame-offline-warning").show();
        }

        window.addEventListener("online", () => {
            $("#newgame-offline-warning").hide();
        });
        
        window.addEventListener("offline", () => {
            $("#newgame-offline-warning").show();
        });

        // Set the first book as selected:
        newGameController.selectedBookChanged(1);
    },

    /**
     * Change the current book cover
     * @param {string} url The cover URL
     */
    setCoverImage(url: string|null) {
        if (url === null) {
            $("#newgame-cover").hide();
        } else {
            $("#newgame-cover").show();
            $("#newgame-cover").attr("src", "");
            $("#newgame-cover").attr("src", url);
        }
        
    }
};
