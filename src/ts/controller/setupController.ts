import { state, template, routing, views, mechanicsEngine, setupView, ajaxErrorMsg } from "..";

/**
 * The book loader controller
 * TODO: Change the name of this controller. It's a "book setup" controller
 */
export const setupController = {

    /** Set up the application
     * This will load the XML book and then redirect to the game
     */
    index() {

        // If the book is already loaded, redirect to the game
        if (state.book && state.book.bookXml) {
            console.log("Book already loaded");
            template.setNavTitle(state.book.getBookTitle(), "#game", false);
            routing.redirect("game");
            return;
        }

        // Check if there is a persisted state
        if (state.existsPersistedState()) {
            // At this moment the mechanics/object XML is unknown, and this log errors on the console:
            // template.updateStatistics(true);
            state.restoreState();            
        } else {
            // New game. Get hash URL parameters
            const bookNumber = Number(routing.getHashParameter("bookNumber"));
            const keepActionChart = routing.getHashParameter("keepActionChart") === "true";
            state.setup(bookNumber, keepActionChart);
        }
        template.translateMainMenu();

        return views.loadView("setup.html")
            .then(() => { setupController.runDownloads(); });

    },

    runDownloads() {

        const downloads = [];
        // The book xml
        downloads.push({
            url: state.book.getBookXmlURL(),
            promise: state.book.downloadBookXml()
        });

        // Game mechanics XML
        downloads.push({
            url: state.mechanics.getXmlURL(),
            promise: state.mechanics.downloadXml()
        });

        // Objects mechanics XML
        downloads.push({
            url: state.mechanics.getObjectsXmlURL(),
            promise: state.mechanics.downloadObjectsXml()
        });

        // Load game mechanics UI
        downloads.push({
            url: mechanicsEngine.mechanicsUIURL,
            promise: mechanicsEngine.downloadMechanicsUI()
        });

        // Stuff to handle each download
        const promises = [];
        for (const download of downloads) {
            setupView.log(download.url + " download started...");
            download.promise.url = download.url;
            download.promise
                .fail(function(jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                    setupView.log(ajaxErrorMsg(download, jqXHR, textStatus, errorThrown), "error");
                })
                .done(function() { setupView.log(download.url + " OK!", "ok"); });
            promises.push(download.promise);
        }

        // Wait for all downloads
        $.when(...promises)
            .done(() => {
                setupView.log("Done!");
                setupView.done();

                // Fill the random table UI
                template.fillRandomTableModal(state.book.bookRandomTable);
                template.setNavTitle(state.book.getBookTitle(), "#game", false);
                template.updateStatistics(true);
                routing.redirect("game");
            })
            .fail(() => { setupView.done(); });

    },

    restartBook() {
        const bookNumber = state.book.bookNumber;
        state.reset(false);
        template.updateStatistics(true);
        routing.redirect("setup", {
            bookNumber,
            keepActionChart: true
        });
    },

    /**
     * Check if the book is already loaded.
     * If is not, it redirects to the main menu
     * @return false if the book is not loaded
     */
    checkBook() {
        if (!state.book) {
            // The book was not loaded
            console.log("Book not loaded yet");
            routing.redirect("mainMenu");
            return false;
        }
        return true;
    },

    /** Return page */
    getBackController() { return "mainMenu"; }

};
