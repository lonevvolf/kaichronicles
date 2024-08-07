import { App, EnvironmentType, template, translations, ajaxErrorMsg } from ".";

export const views = {

    /**
     * Cache with views already loaded.
     * Key is the view relative path, and value is the view HTML root element.
     */
    viewCache: {} as { string: HTMLElement },

    /**
     * Views setup
     */
    setup() {
        if ( App.environment === EnvironmentType.Development ) {
            // Nothing to do. Return a resolved promise
            return jQuery.Deferred().resolve().promise();
        }

        // Production. Preload all views, for better UX:
        return $.ajax({
            dataType: "html",
            url: "views.html"
        })
        .done( (data: string) => {
            // views.html contains a div for each view, the div id is the html file name
            $(data).find(".htmlpage").each((index: number, div: HTMLElement) => {
                const viewName = $(div).attr("id");
                views.viewCache[viewName] = div;
            });
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            // Format a error message as a reason
            const msg = "Error loading views.html, error: " +
                ajaxErrorMsg(this, jqXHR, textStatus, errorThrown);
            return jQuery.Deferred().reject(msg);
        });
    },

    /**
     * Load a view asynchronously
     * @param viewPath The view path, relative to the "views" folder
     * @returns a jQuery deferred object with the load view action
     */
    loadView(viewPath: string) {

        if ( views.viewCache[viewPath] ) {
            // View was already loaded:
            template.setViewContent( translations.translateView(views.viewCache[viewPath]) );
            // Return a resolved promise:
            const dfd = jQuery.Deferred();
            void dfd.resolve();
            return dfd.promise();
        }

        // This should be executed only on development environment:

        // Download the view
        template.setViewContent('<img src="images/ajax-loader.gif" alt="Loading image" /> Loading view...');

        return $.ajax({
            dataType: "html",
            url: "views/" + viewPath
        })
        .done( (data: HTMLElement) => {
            // Save view on cache:
            views.viewCache[viewPath] = data;
            // Display the view
            template.setViewContent( translations.translateView(data) );
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            const msg = "Error loading view " + viewPath + ", error: " +
                ajaxErrorMsg(this, jqXHR, textStatus, errorThrown);
            template.setErrorMessage( msg );
            alert( msg );
        });
    },

    /**
     * Returns a cached view. null if the view was not already loaded
     */
    getCachedView(viewPath: string): HTMLElement {
        return views.viewCache[viewPath];
    }

};
