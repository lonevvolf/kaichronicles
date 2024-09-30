import { template, App, mechanicsEngine } from ".";

/**
 * The routes handler.
 * As this is a single page app, routes are implemented with the URL hash
 */
export const routing = {

    /**
     * The list of allowed controllers
     */
    controllers: [],

    /**
     * The current controller name
     */
    lastControllerName: null,

    /**
     * Redirect to some controller / action route
     * @param {string} route The route to redirect. It has a format "controller".
     * @param {object} parameters Hash with parameters for the route. It can be null
     * @returns True if the redirection can be done. False otherwise
     */
    redirect(route: string, parameters: object = null): boolean {
        try {

            // Remove hash
            route = routing.normalizeHash(route);

            // Add parameters
            if ( parameters ) {
                const txtParms = routing.objectToUrlParms(parameters );
                if ( txtParms ) {
                    route += "?" + txtParms;
                }
            }

            template.collapseMenu();

            // This will fire the onHashChange callback:
            window.location.hash = route;

        } catch (e) {
            mechanicsEngine.debugWarning(e);
            return false;
        }
    },

    /** Setup the routing events and redirect to the initial action */
    setup() {
        // tslint:disable-next-line: no-eval
        this.controllers = Object.keys(eval(App.PACKAGE_NAME)).filter((c) => c.endsWith('Controller'));

        // Hash change events
        $(window).on("hashchange", routing.onHashChange );

        // Call the initial controller
        const initialHash = routing.normalizeHash(location.hash);
        if ( initialHash === "" ) {
            routing.redirect("mainMenu");
        }
        else {
            routing.redirect(initialHash);
            // Force the initial load if the hashChange event will not fire automatically
            if (routing.normalizeHash(location.hash) === initialHash) {
                routing.onHashChange();
            }
        }
    },

    /**
     * Get the controller name from the current URL hash
     */
    getControllerName(): string {
        try {
            let route = routing.normalizeHash( location.hash );
            const idxParms = route.indexOf("?");
            if ( idxParms >= 0 ) {
                route = route.substring( 0 , idxParms );
            }

            return route + "Controller";
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            return null;
        }
    },

    /**
     * Sanitize the controller name for safety
     */
    sanitizeControllerName(controllerName: string) {
        if (routing.controllers.indexOf(controllerName) === -1) {
            return "mainMenu";
        } else {
            return controllerName;
        }
    },

    /** Get the the controller object by its name */
    getController(controllerName: string) {
        try {
            if ( !controllerName ) {
                return null;
            }

            const sanitizedControllerName = routing.sanitizeControllerName(controllerName);

            // tslint:disable-next-line: no-eval
            return eval( App.PACKAGE_NAME + "." + sanitizedControllerName );
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            return null;
        }
    },

    /** Get the current controller object */
    getCurrentController() {
        return routing.getController( routing.getControllerName() );
    },

    /**
     * Get a normalized version of a URL hash
     * @param hash The hash to normalized
     * @returns The hash, without '#' and trimmed
     */
    normalizeHash(hash: string) {
        hash = hash.trim();
        if ( hash.startsWith("#") ) {
            hash = hash.substring(1);
        }
        return hash;
    },

    /**
     * Hash change event handler
     */
    onHashChange() {

        let controller;

        // Notify the previous controller that we leave
        try {
            if ( routing.lastControllerName ) {
                controller = routing.getController(routing.lastControllerName);
                if ( controller && controller.onLeave ) {
                    // console.log('Leaving ' + routing.lastControllerName);
                    controller.onLeave();
                }
            }
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            // throw new Error(e);
        }

        // Move to the new controller
        try {
            controller = routing.getCurrentController();
            if ( !controller ) {
                mechanicsEngine.debugWarning("Undefined controller: " + routing.getControllerName() );
                // throw new Error("Undefined controller: " + routing.getControllerName());
            } else {
                // Store the new hash
                routing.lastControllerName = routing.getControllerName();
                // console.log( routing.lastControllerName + '.index()' );
                controller.index();
            }
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            // throw new Error(e);
        }
    },

    /**
     * Convert an object to URL parameters
     * @param {object} o Object to convert
     * @returns {string} URL equivalent params
     */
    objectToUrlParms(o) {
        let str = "";
        for (const key in o) {
            if (Object.prototype.hasOwnProperty.call(o, key)) {
                if (str !== "") {
                    str += "&";
                }
                str += key + "=" + encodeURIComponent(o[key]);
            }
        }
        return str;
    },

    
    /**
     * Get a hash parameter value
     * @param {string} paramName The hash parameter name
     * @returns {string} The parameter value. null it was not defined
     */
    getHashParameter(paramName: string): string {

        let hash = routing.normalizeHash(location.hash);
        const idx = hash.indexOf( "?" );
        if ( idx >= 0 ) {
            hash = hash.substring( idx + 1 );
        }
        return hash.getUrlParameter(paramName);
    },

};
