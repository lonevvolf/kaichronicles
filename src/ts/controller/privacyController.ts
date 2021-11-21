
import { views  } from "..";

/**
 * Privacy controller page
 */
// tslint:disable-next-line: class-name
export class privacyController {

    /**
     * Render the page
     */
    public static index() {
        views.loadView( "privacy.html" );
    }

}
