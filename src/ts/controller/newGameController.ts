import { state, translations, routing, template, views, newGameView, Book, Language } from "..";

/**
 * New game controller
 */
export const newGameController = {

    /**
     * New game page
     */
    index() {

        // Get available books
        template.setNavTitle( translations.text("kaiChronicles") , "#mainMenu", true);
        template.showStatistics(false);

        views.loadView("newGame.html")
        .then(() => {
            newGameView.setup();
        });

    },

    /**
     * Start new game event
     * @param {string} bookNumber The book number
     * @param {string} language The book language
     */
    startNewGame( bookNumber: number, language: string ) {

        state.reset(true);
        routing.redirect( "setup" , {
            bookNumber,
            language
        });

    },

    selectedBookChanged(newBookNumber: number) {
        const book = new Book(newBookNumber, Language.ENGLISH);
        newGameView.setCoverImage( book.getCoverURL() );
    },

    /** Return page */
    getBackController() { return "mainMenu"; }

};
