import { Collapse } from "bootstrap";
import { routing, state, Item, translations, randomTable, mechanicsEngine, App, DebugMode, Color, TextSize } from ".";

/**
 * The HTML template API
 */
export const template = {

    /**
     * Set the navbar title and target URL
     * @param title The title to put on the navigation bar
     * @param url The target URL for the title on the nav. bar
     * @param showTitleOnSmallDevs True if the main title should be shown on
     * small devices.
     */
    setNavTitle(title: string, url: string, showTitleOnSmallDevs: boolean ) {
        // Update the title
        const $title = $("#template-title");
        
        $title.text(title);
        $title.attr("href", url);
        $("#template-img-logo").attr("href", url);

        if ( showTitleOnSmallDevs ) {
            $title.removeClass("d-none d-md-inline");
        } else {
            $title.addClass("d-none d-md-inline");
        }

    },

    /**
     * Hightlight the active navigation bar link
     */
    highlightActiveLink() {
        $("#template-header a, #template-header li").removeClass("active");
        const $actives = $('#template-header a[href="#' +
            routing.normalizeHash(location.hash) + '"]');
        $actives.each((index, link) => {
            const $link = $(link);
            // Bootstrap puts the class 'active' on the parent of the link
            // But I want to remark the "brand" link too, so put it on both
            $link.parent().filter("li").addClass("active");
            $link.addClass("active");
        });
    },

    /**
     * Setup navigation bar
     */
    setup() {

        // Hide the bootstrap menu when some menu option is clicked, or when
        // the content is clicked
        $("#template-header a, #template-container").on("click", () => {
            template.collapseMenu();
        });
        $("#template-statistics").on("click", () => {
            routing.redirect("actionChart");
        });
        template.updateStatistics(true);
        template.translateMainMenu();
        template.changeColorTheme(state.color);
        template.changeTextSize(state.textSize);
    },

    /**
     * Show / hide statistics on navigation bar
     */
    showStatistics(show: boolean) {
        if ( show ) {
            $("#navbar-content").show();
            $("#template-menubutton").removeClass( "hideImportant" );
            template.updateStatistics();
        } else {
            $("#navbar-content").hide();
            $("#template-statistics").hide();
            $("#template-menubutton").addClass( "hideImportant" );
        }
    },

    /**
     * Show / hide Kai Name on navigation bar
     */
    showKaiName(show: boolean) {
        if ( show ) {
            template.updateKaiName();
        } else {
            $("#template-kaiName").hide();
        }
    },

    /**
     * Update player statistics
     */
    updateStatistics(doNotAnimate: boolean = false) {

        // Update statistics
        if ( !state.actionChart ||
            ( state.actionChart.combatSkill === 0 && state.actionChart.endurance === 0 ) ) {
            $("#template-statistics").hide();
            $("#template-map").hide();
        } else {
            $("#template-statistics").show();
            $("#template-combatSkill").text( state.actionChart.getCurrentCombatSkill() );
            template.animateValueChange( $("#template-endurance") ,
            state.actionChart.currentEndurance , doNotAnimate ,
            state.actionChart.currentEndurance > 0 ? null : "red" );

            // Update map link
            if ( state.actionChart.hasObject("map") ) {
                $("#template-map").show();
            } else {
                $("#template-map").hide();
            }
        }
    },

    /**
     * Update Kai Name
     */
    updateKaiName(doNotAnimate: boolean = false) {
        // Update Kai name
        if ( !state.actionChart ||
            ( state.actionChart.kaiName === "" ) ) {
            $("#template-kaiName").hide();
        } else {
            $("#template-kaiName").show();
            $("#template-kaiName").text( state.actionChart.kaiName );
        }
    },

    /**
     * Return true if the template menu is expanded
     */
    isMenuExpanded(): boolean {
        return $("#template-menubutton").attr("aria-expanded") === "true";
    },

    /**
     * Collapse the template menu
     */
    collapseMenu() {
        let element = document.querySelector('#navbar');
        Collapse.getOrCreateInstance(element, {toggle: false}).hide();
    },

    /**
     * Show an HTML view
     * @param {DOM} viewContent The view to show
     */
    setViewContent(viewContent: any) {
        $("#body").html(viewContent);
        // Scroll to top
        window.scrollTo(0, 0);
        template.highlightActiveLink();
    },

    /**
     * Display an error
     */
    setErrorMessage(msg: string) {
        mechanicsEngine.debugWarning(msg);

        const p = document.createElement('p');
        $(p).prop("style", "color: red");
        p.innerText = msg;

        template.setViewContent(p.outerHTML);
    },

    /**
     * Show dialog with object details
     * @param o The object to show
     */
    showObjectDetails(o: Item) {
        if ( !o ) {
            return;
        }

        // Translate the dialog
        translations.translateTags( $("#template-objectDetails") );

        $("#template-objectTitle").text( o.name );

        // Show / hide object image
        const imageUrl = o.getImageUrl();
        if ( !imageUrl ) {
            $("#template-objectImage").hide();
        } else {
            $("#template-objectImage").show();
            $("#template-objectImage img").attr("src" , imageUrl);
        }

        $("#template-objectDescription").text(o.description);
        $("#template-objectDescriptionExtra").text(o.extraDescription ?? "");

        $("#template-objectDetails").modal("show");
    },

    /**
     * Change a number value by other, with an animation.
     * @param {jQuery} $element Element selector to change
     * @param newValue The new value to set
     * @param doNotAnimate True if we should do not perform the animation
     * @param newColor The final HTML color of the element. If it's null, the default
     * color for the DOM element will be used
     */
    animateValueChange( $element: JQuery<HTMLElement> , newValue: number , doNotAnimate: boolean , newColor: string|null = null ) {

        // Clear previous animations
        $element.stop(true, true);

        // If the value is not going to change, do nothing
        const txtNewValue = newValue.toString();
        if ( $element.text() === txtNewValue ) {
            return;
        }

        if ( doNotAnimate ) {
            $element.text( txtNewValue );
            $element.css("color", newColor ? newColor : "" );
        } else {
            const miliseconds = 500;
            const currentValue = Number( $element.text() );
            $element.css("color", newValue < currentValue ? "red" : "green" );
            $element.fadeOut(miliseconds, function() {
                $(this).css("color", newColor ? newColor : "");
                $(this).text( txtNewValue ).fadeIn(miliseconds);
            });
        }
    },

    translateMainMenu() {
        translations.translateTags( $("#template-header") );
    },

    /**
     * Show the dialog with the combat tables
     */
    showCombatTables() {
        // Translate the dialog
        translations.translateTags( $("#template-combatTables") );

        // Hide toasts
        toastr.clear();

        // Set the translated images
        const combatTablesUrls = state.book.getCombatTablesImagesUrls();
        $("#template-ctimage0").attr("src", combatTablesUrls[0]);
        $("#template-ctimage1").attr("src", combatTablesUrls[1]);
        $("#template-combatTables").modal("show");
    },

    /**
     * Show / hide the random table dialog
     * @param show Show/hide the dialog
     * @param subtitle Specify a subtitle shown in the dialog header
     */
    showRandomTable(show: boolean, subtitle = "") {
        const $randomModal = $("#template-randomtable");
        if ( show ) {
            // Hide toasts
            toastr.clear();
            // Translate the dialog
            translations.translateTags( $randomModal );
        }
        $randomModal.modal( show ? "show" : "hide" );
        $randomModal.find("#template-randomsubtitle").text(subtitle);
    },

    /**
     * Populate the random table values with the current book random table
     */
    fillRandomTableModal(numbers: number[]) {

        // Fill table
        let html = "";
        for (let row = 0; row < 10; row++) {
            html += "<tr>";
            for (let column = 0; column < 10; column++) {
                const num = numbers[ row * 10 + column ];
                html += '<td data-number="' + num.toFixed() + '">' + num.toFixed() + "</td>";
            }
            html += "</tr>";
        }
        $("#template-randomcontent").html( html );

        // Add click event handlers:
        $("#template-randomcontent td").on("mousedown", function(e) {
            e.preventDefault();
            randomTable.randomTableUIClicked( Number( $(this).attr("data-number") ) );
        });

        $("#template-randomtable").on('hidden.bs.modal', (e) => {
            e.preventDefault();
            randomTable.randomTableClosed();
        });
    },

    /**
     * Change the color theme of the templates
     * @param theme 'light' or 'dark'
     */
    changeColorTheme(theme: Color) {
        state.updateColorTheme( theme );

        switch (theme) {
            case Color.Dark:
                $("body").addClass("dark");
                break;
            default:
                // we will default to "light" theme, or no class
                $("body").removeClass("dark");
                break;
        }
    },

    /**
     * Change the text size of the templates
     * @param textSize 'normal' or 'large'
     */
    changeTextSize(textSize: TextSize) {
        state.updateTextSize( textSize );

        switch (textSize) {
            case TextSize.Large:
                $("body").addClass("largeText");
                break;
            default:
                // we will default to "normal" text size, or no class
                $("body").removeClass("largeText");
                break;
        }
    },

    /**
     * Fixes the navbar to page top.
     * Needed for testing with Selenium (sometimes the navbar blocks clicks of some elements)
     */
    fixedNavbarTop() {
        $("#template-header").removeClass("fixed-top");
    },

    addSectionReadyMarker() {
        if (App.debugMode === DebugMode.TEST) {
            // Append a "mark" to let the tests controller know the section is completly loaded
            if ($("#section-ready").length === 0) {
                $("body").append('<p id="section-ready">SECTION READY</p>');
            }
        }
    },

    removeSectionReadymarker() {
        if (App.debugMode === DebugMode.TEST) {
            $("#section-ready").remove();
        }
    }
};
