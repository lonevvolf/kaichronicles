import { translations, routing, mainMenuController } from "..";

export const mainMenuView = {

    /**
     * Main menu view
     */
    setup( ) {
        document.title = translations.text("kaiChronicles");

        $("#menu-continue").click((e) => {
            e.preventDefault();
            routing.redirect("setup");
        });
        $("#menu-new").click((e) => {
            e.preventDefault();
            routing.redirect("newGame");
        });
        $("#menu-load").click((e) => {
            e.preventDefault();
            routing.redirect("loadGame");
        });
        $("#menu-color-theme").click((e) => {
            e.preventDefault();
            mainMenuController.changeColor();
        });
        $("#menu-faq").click((e) => {
            e.preventDefault();
            routing.redirect("faq");
        });
        $("#menu-privacy").click((e) => {
            e.preventDefault();
            routing.redirect("privacy");
        });
    },

    /**
     * Hide web text info
     */
    hideWebInfo() {
        $("#menu-webinfo").hide();
    },

    /**
     * Hide the continue game button
     */
    hideContinueGame() {
        $("#menu-continue").hide();
    }

};
