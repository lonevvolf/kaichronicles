
import { views, GoogleAnalytics } from "..";

/**
 * Privacy controller page
 */
// tslint:disable-next-line: class-name
export class privacyController {

    /**
     * Render the page
     */
    public static index() {
        views.loadView( "privacy.html" )
        .then(() => {
            privacyController.setupWeb();
        });
    }

    /**
     * Setup the web page
     */
    private static setupWeb() {

        $("#privacy-app").hide();

        // Setup checkbox
        $("#privacy-send").prop( "checked" , GoogleAnalytics.isEnabled() );

        // Change send analytics event
        $("#privacy-send").click( function( e: Event ) {
            GoogleAnalytics.setEnabled( $(this).prop( "checked" ) );
            toastr.info( "OK" );
        });
    }

}
