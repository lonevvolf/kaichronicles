import { template, translations, views } from "..";

/**
 * FAQ controller
 */

// tslint:disable-next-line: class-name
export class faqController {

    public static index() {
        template.setNavTitle( translations.text("kaiChronicles"), "#mainMenu", true);
        views.loadView("faq.html");
    }

    /** Return page */
    public static getBackController() { return "mainMenu"; }

}
