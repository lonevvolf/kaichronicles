import { Section, state, Item } from "..";

export const mapView = {

    /**
     * Show the map section
     * @param section The map Section
     */
    setSectionContent( section: Section ) {

        /*const titleText = section.getTitleText();
        document.title = titleText;
        $('#map-title').text( titleText );
        // Render the map, with the illustrations text. On book 5, it's the
        // map description
        $('#map-section').html( section.getHtml(true) );*/
        mapView.setContent( section.getTitleText() , section.getHtml(true) );
    },

    /**
     * Set map for book 11 (special case)
     */
    setMapBook11() {
        const map = state.mechanics.getObject( Item.MAP );
        // On book 11, map is on section 233
        const mapSection = new Section( state.book , "sect233" , state.mechanics );
        mapView.setContent( map.name , mapSection.getFirstIllustrationHtml() );
    },

    /**
     * Set the view content
     * @param titleText Page title
     * @param mapSectionHtml The map HTML
     */
    setContent( titleText: string , mapSectionHtml: string ) {
        document.title = titleText;
        $("#map-title").text( titleText );
        // Render the map, with the illustrations text. On book 5, there is a textual
        // map description
        $("#map-section").html( mapSectionHtml );
    },

    /**
     * Bind map events
     */
    bindEvents() {
        // Bind clicks on image to resize it
        $("#map-increasezoom").on("click", (e: JQuery.TriggeredEvent) => {
            mapView.changeZoom(true, e);
        });
        $("#map-decreasezoom").on("click", (e: JQuery.TriggeredEvent) => {
            mapView.changeZoom(false, e);
        });
        $("#map-resetzoom").on("click", () => {           
            const $image = $("#map-section img");
            $image.removeAttr("width");
            $image.removeAttr("height");
            $image.removeClass("originalsize");
        });
    },

    /**
     * Unbind map events
     */
    unbindEvents() {
        // Nothing here
    },

    /**
     * Increase / decrease the map zoom
     * @param increase True to increase the zoom. False to decrease
     * @param e The click event on the zoom links
     */
    changeZoom(increase: boolean, e: JQuery.TriggeredEvent) {
        e.preventDefault();

        const $image = $("#map-section img");
        const factor = ( increase ? 1.1 : 0.9 );
        
        $image.attr("width", $image.width() * factor);
        $image.attr("height", $image.height() * factor);

        // If originalsize class is not set, the width is fixed to 100%, and the image appears distorted
        $image.addClass("originalsize");
    }

};
