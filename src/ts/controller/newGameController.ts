import { state, translations, routing, template, views, newGameView, Book } from "..";

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
        template.showKaiName(false);
        
        state.manualRandomTable = state.actionChart && state.actionChart.manualRandomTable;

        views.loadView("newGame.html")
        .then(() => {
            newGameView.setup();
        });

    },

    /**
     * Start new game event
     * @param {string} bookNumber The book number
     */
    startNewGame( bookNumber: number) {

        state.reset(true);
        routing.redirect( "setup" , {
            bookNumber
        });

    },

    selectedBookChanged(newBookNumber: number) {
        const book = new Book(newBookNumber);
        newGameView.setCoverImage( book.getCoverURL() );
    },

    /** Return page */
    getBackController() { return "mainMenu"; }

};
