import { views, state, template, routing, declareCommonHelpers, mechanicsEngine, pwa } from ".";

/** Execution enviroment type */
export enum EnvironmentType {
    Development = "DEVELOPMENT",
    Production = "PRODUCTION"
}

/** Debug execution mode */
export enum DebugMode {
    NO_DEBUG = 0,
    DEBUG = 1,
    TEST = 2
}

/**
 * The web application
 */
export class App {

    /** The webpack library name */
    public static readonly PACKAGE_NAME = "kai";

    /** Execution environment type */
    public static environment: EnvironmentType;

    /** Debug functions are enabled? */
    public static debugMode: DebugMode;

    /** Web application setup  */
    public static run(environment: string) {

        // PWA app setup (ServiceWorker)
        // Service worker is disabled in webpack-dev-server: https://github.com/GoogleChrome/workbox/issues/1790
        if (environment !== EnvironmentType.Development) 
        {
            pwa.registerServiceWorker();
        }

        // Declare helper functions in common.ts
        declareCommonHelpers();

        App.environment =  environment as EnvironmentType;

        // Are we in debug / test mode?
        if (window.getUrlParameter("test") === "true") {
            App.debugMode = DebugMode.TEST;
            // To avoid Selenium clicks blocked by navbar
            template.fixedNavbarTop();
        } else if (window.getUrlParameter("debug") === "true") {
            App.debugMode = DebugMode.DEBUG;
        } else {
            App.debugMode = DebugMode.NO_DEBUG;
        }

        if (App.debugMode !== DebugMode.NO_DEBUG) {
            // On debug mode, disable the cache (to always reload the books xml)
            console.log("Debug mode: cache disabled");
            $.ajaxSetup({ cache: false });
        }

        // Configure toast messages
        toastr.options.positionClass = "toast-position-lw";
        toastr.options.onclick = () => {
            // Remove all toasts on click one
            toastr.clear();
        };

        // First, load the views
        void views.setup()
            .then( () => {
                try {
                    console.log("Real setup started");

                    // Then do the real application setup
                    state.setupDefaultColorTheme();
                    state.setupDefaultTextSize();
                    template.setup();
                    routing.setup();

                    if ( App.debugMode === DebugMode.DEBUG && state.existsPersistedState() ) {
                        // If we are developing a book, avoid to press the "Continue game"
                        routing.redirect( "setup" );
                    }

                } catch (e) {
                    // d'oh!
                    mechanicsEngine.debugWarning(e);
                    return jQuery.Deferred().reject(e).promise();
                }
            })
            .fail((reason) => {
                if ( !reason ) {
                  reason = "Unknown error";
                }
                template.setErrorMessage(reason.toString());
            });
    }
}
