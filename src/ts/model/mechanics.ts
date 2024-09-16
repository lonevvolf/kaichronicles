import { Book, Item, App, mechanicsEngine, DebugMode } from "..";

/**
 * Game mechanics and objects handling for a given book
 */
export class Mechanics {

    /**
     * The book
     */
    public book: Book|null = null;

    /**
     * The book mechanics XML document (XmlDocument)
     */
    public mechanicsXml: XMLDocument|null = null;

    /**
     * The original XML text. It will be saved only if we are on debug mode. Otherwise it will be null
     */
    public mechanicsXmlText: string;

    /**
     * The game objects XML document
     */
    public objectsXml: any = null;

    /** Cache of book objects.
     * Key is the object id. Value is the object Item
     */
    public objectsCache: { [objectId: string]: Item } = {};

    /**
     * The game mechanics
     * @param book The Book where to apply the mechanics
     */
    public constructor(book: Book)  {
        this.book = book;
    }

    /**
     * Start the download of the mechanics XML
     * @return Promise with the download
     */
    public downloadXml(): JQueryXHR {
        return $.get({
            url: this.getXmlURL(),
            dataType: "text",
            context: this
        })
        .done((xml: string) => {
            this.mechanicsXml = $.parseXML(xml);
            if (App.debugMode === DebugMode.DEBUG) {
                // Debug mode: Store the original XML. This can be needed to do tests (BookValidator.ts)
                this.mechanicsXmlText = xml;
            }
        });
    }

    /**
     * Returns the book XML URL
     */
    public getXmlURL(): string {
        return `data/mechanics-${this.book.bookNumber}.xml`;
    }

    /** Set mechanics XML */
    public setXml(xml: string) {
        this.mechanicsXml = $.parseXML(xml);
    }

    /**
     * Start the download of the objects XML
     * @return Promise with the download
     */
    public downloadObjectsXml(): JQueryXHR {

        return $.get({
            url: this.getObjectsXmlURL(),
            dataType: "xml",
        })
        .done((xml) => {
            this.objectsXml = xml;
        });
    }

    /** Set objects XML */
    public setObjectsXml(xml: string) {
        this.objectsXml = $.parseXML(xml);
    }

    /**
     * Returns the objects XML URL
     */
    public getObjectsXmlURL(): string {
        return "data/objects.xml";
    }

    /**
     * Returns an jquery object with the section mechanics XML. null if there are no mechanics
     */
    public getSection(sectionId: string|null|undefined): JQuery<HTMLElement>|null {
        const $section = $(this.mechanicsXml)
            .find("mechanics > sections > section[id=" + sectionId + "]");
        return $section.length === 0 ? null : $section;
    }

    /**
     * Returns a JS object with the object properties. null if it was not found
     */
    public getObject(objectId: string|undefined): Item|null {

        if (!objectId) {
            return null;
        }

        // Try to get the object from the cache:
        let o = this.objectsCache[objectId];
        if ( o ) {
            return o;
        }

        const $o = $(this.objectsXml).find("*[id=" + objectId + "]");
        if ( $o.length === 0 ) {
            mechanicsEngine.debugWarning("Object " + objectId + " not found");
            return null;
        }

        // Parse the object info, and store it on the cache
        o = new Item(this.book, $o, objectId);
        this.objectsCache[objectId] = o;

        return o;
    }

    /**
     * Get a jquery selector for a given rule, relative to the "section" parent
     * @return {string} The jquery selector for the rule inside the section
     */
    public static getRuleSelector(rule: Element): string {

        // Get nodes from the section rule to the given rule
        // var $path = $( $(rule).parentsUntil( 'section' ).andSelf().get().reverse() );
        const $path = $(rule).parentsUntil( "section" ).addBack();

        // Build the jquery selector:
        return $path
            .map(( index , node ) => {
                let txt = node.nodeName;
                $.each( node.attributes , ( attrIndex , attribute ) => {
                    txt += "[" + attribute.name + "='" + attribute.value + "']";
                } );
                return txt;
            })
            .get()
            .join( " > " );
    }

    /**
     * Check if a image is translated
     * @param fileName The image file name
     * @return true if the image is translated
     */
    public imageIsTranslated(fileName: string): boolean {

        if ( fileName === "crtneg.png" || fileName === "crtpos.png" ) {
            // Combat tables
            return true;
        }

        return $(this.mechanicsXml)
            .find('translated-images > image:contains("' + fileName + '")')
            .length > 0;
    }

    /**
     * Search a "registerGlobalRule" tag by its id
     * @param id The global rule container id to return
     * @return The XML tag found
     */
    public getGlobalRule(id: string): JQuery<Element> {
        return $(this.mechanicsXml).find("registerGlobalRule[id=" + id + "]").first();
    }

    /**
     * Return the number of numbered sections on the book
     */
    public getSectionsCount(): number {
        const $sections = $(this.mechanicsXml).find("mechanics > sections");
        let count = $sections.attr("count");
        if (!count) {
            // Default is 350
            count = "350";
        }
        return parseInt(count, 10);
    }

    /**
     * Return the id of the book last section
     */
    public getLastSectionId(): string {
        return `sect${this.getSectionsCount()}`;
    }

}
