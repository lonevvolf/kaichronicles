import { state, KaiDiscipline, projectAon, Section, MgnDiscipline, GndDiscipline, BookSeriesId, SectionRenderer, BookSeries, mechanicsEngine } from "..";

/** Book disciplines table */
export interface DisciplinesTable {

    /** Discipline id */
    [disciplineId: string]: {

        /** Discipline id */
        id: string,

        /** Discipline name */
        name: string,

        /** Discipline description */
        description: string,

        /** Discipline image HTML. Only for series >= Grand Master, empty string otherwise */
        imageHtml: string
    };

}

/**
 * Class to handle the Project Aon books XML
 */
export class Book {

    /** Initial books section */
    public static readonly INITIAL_SECTION = "tssf";

    /** Special unexistent section where to store objects on the Kai monastery */
    public static readonly KAIMONASTERY_SECTION = "kaimonastery";

    /** Books equipment section */
    public static readonly EQUIPMENT_SECTION = "equipmnt";

    /** Game rules section */
    public static readonly GAMERULZ_SECTION = "gamerulz";

    public static readonly COMBATRULESSUMMARY_SECTION = "crsumary";

    public static readonly KAILEVELS_SECTION = "levels";

    public static readonly HOWTOCARRY_SECTION = "howcarry";

    public static readonly HOWTOUSE_SECTION = "howuse";

    public static readonly LORECIRCLES_SECTION = "lorecrcl";

    public static readonly IMPROVEDDISCIPLINES_SECTION = "imprvdsc";

    public static readonly DISCIPLINES_SECTION = "discplnz";

    public static readonly MAP_SECTION = "map";

    /** Book index number (1 = first book) */
    public bookNumber: number;

    /** The book XML document */
    public bookXml: XMLDocument;

    /**
     * Array of 100 positions with the random table numbers as they appear on the book
     */
    public bookRandomTable: number[];

    /** The book title cache, plain text */
    private bookTitle: string = null;

    /** The book copyright text cache, HTML formatted */
    private bookCopyrightHtml: string = null;

    /** The book disciplines cache */
    private disciplines: DisciplinesTable = null;

    /**
     * Constructor
     * @param number The book index number to create (1 = first)
     */
    public constructor(num: number) {
        this.bookNumber = num;
        this.bookXml = null;
        this.bookRandomTable = [];
    }

    /**
     * Get the root URL to download book contents
     * @return The base URL
     */
    public static getBaseUrl(): string {
        return "data/projectAon/";
    }

    /** Do replacements on original XML to have a valid standalone XML.
     * It removes inclusions and replaces
     * @param xmlText The original XML
     * @return The fixed XML
     */
    public static fixXml(xmlText: string): string {

        // Code taken from Lone Wolf Adventures, by Liquid State Limited.

        // remove general directives
        xmlText = xmlText.replace(/(?:%general|%xhtml|&inclusion)[a-z.]*;/g, "");

        // Link to readers handbook (Book 13)
        xmlText = xmlText.replaceAll("&link.rh;", "https://www.projectaon.org/en/ReadersHandbook/Home");

        /*xmlText = xmlText.replaceAll('&link.project.website;', '')
        xmlText = xmlText.replaceAll('&link.staff.contact;', '')
        xmlText = xmlText.replaceAll('&link.01hdlo;', '');*/
        // Replace links
        // 12-21 12:37:11.655: E/browser(1884): Console: Uncaught TypeError: Cannot supply flags when constructing one RegExp from another http://10.0.2.2/ls/statskeeper3/model/book.js:51
        // xmlText = xmlText.replace( new RegExp( /\&link\..+?\;/ , 'g' ) , '' );
        let exp = /&link\..+?;/g;
        xmlText = xmlText.replace( exp , "" );

        xmlText = xmlText.replaceAll("&copy;", "&amp;copy;" );
        xmlText = xmlText.replaceAll("&endash;", "-" );
        xmlText = xmlText.replaceAll("&lellips;", "&amp;hellip;" );

        // replace non-valid special characters with html special characters
        xmlText = xmlText.replaceAll("<ch.ellips/>", "&amp;hellip;");
        xmlText = xmlText.replaceAll("<ch.lellips/>", "&amp;hellip;");
        xmlText = xmlText.replaceAll("<ch.emdash/>", "&amp;mdash;");
        xmlText = xmlText.replaceAll("<ch.endash/>", "&amp;ndash;");
        xmlText = xmlText.replaceAll("<ch.apos/>", "&amp;rsquo;");
        xmlText = xmlText.replaceAll("<ch.blankline/>", "<br />");
        xmlText = xmlText.replaceAll("<ch.minus/>", "-");
        xmlText = xmlText.replaceAll("<ch.minus></ch.minus>", "-");
        xmlText = xmlText.replaceAll("<ch.ampersand/>", "&amp;amp;");
        xmlText = xmlText.replaceAll("<ch.thinspace/>", " ");
        xmlText = xmlText.replaceAll("<ch.percent/>", "&amp;percnt;");
        xmlText = xmlText.replaceAll("<ch.lte/>", "&amp;le;");
        xmlText = xmlText.replaceAll("<ch.gte/>", "&amp;ge;");

        // replace html special characters
        // 12-21 12:42:19.090: E/browser(1884): Console: Uncaught TypeError: Cannot supply flags when constructing one RegExp from another http://10.0.2.2/ls/statskeeper3/model/book.js:68
        // xmlText = xmlText.replace( new RegExp( /<ch\.(.+?)\/>/ , 'g' ) , "&amp;$1;");
        exp = /<ch\.(.+?)\/>/g;
        xmlText = xmlText.replace( exp , "&amp;$1;");

        // This code was previously at SectionRenderer.illustration:
        // Fix single quote markup
        xmlText = xmlText.replaceAll("&amp;rsquot;", "&amp;rsquo;");
        xmlText = xmlText.replaceAll("&amp;lsquot;", "&amp;lsquo;");
        // Fix double quote markup
        xmlText = xmlText.replaceAll("&amp;rdquot;", "&amp;rdquo;");
        xmlText = xmlText.replaceAll("&amp;ldquot;", "&amp;ldquo;");

        // On book 4, English version, the discipline id "mndblst" has been changed to "mndblast"
        // This will break the game mechanics, so keep it as "mndblst":
        xmlText = xmlText.replaceAll('"mndblast"', `"${KaiDiscipline.Mindblast}"`);

        return xmlText;
    }

    /**
     * Start the download and fix a game book
     * @return Promise with the download / fix task
     */
    public downloadBookXml(): JQueryXHR {

        const bookXmlUrl = this.getBookXmlURL();
        // console.log( 'Downloading book XML URL: ' + bookXmlUrl);

        return $.ajax({
            url: bookXmlUrl,
            dataType: "text"
        })
        .done((xml) => {
            this.setXml(xml);
        });
    }

    public setXml(xml: string) {
        try {
            xml = Book.fixXml(xml);
            this.bookXml = $.parseXML(xml);
            this.bookRandomTable = this.getRandomTable();
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            throw e;
        }
    }

    /**
     * Start promises to download authors info
     * Added on v 1.8
     * @returns The download promises. The promises text is the author XML bio, fixed
     */
    public downloadAuthorsBio(): Array<JQueryXHR> {

        try {
            const promises: Array<JQueryXHR> = [];
            for ( const authorId of projectAon.supportedBooks[this.bookNumber - 1].biographies ) {
                promises.push( this.downloadAuthorInfo( authorId ) );
            }

            return promises;
        } catch (ex) {
            mechanicsEngine.debugWarning(ex);
            return null;
        }
    }

    /**
     * Start a promise to download an author info
     * @param authorId The author id (ex. "jdbiolw")
     * @returns The download promise. The promise text is the author XML bio, fixed
     */
    private downloadAuthorInfo( authorId: string ): JQueryXHR {
        const authorFileUrl = Book.getBaseUrl() + this.bookNumber.toFixed() + "/" + authorId + ".inc";
        return $.ajax({
            url: authorFileUrl,
            dataType: "text"
        });
    }

    /**
     * Get the code name given to the book by the Project Aon
     * @returns The book code name. null if it was not found
     */
    public getProjectAonBookCode(): string {
        const bookMetadata = projectAon.supportedBooks[ this.bookNumber - 1 ];
        if ( !bookMetadata ) {
            return null;
        }

        const bookCode = bookMetadata[ "code" ];

        if ( !bookCode ) {
            return null;
        }
        return bookCode;
    }

    /**
     * Returns the book XML source URL
     */
    public getBookXmlURL() {
        return Book.getBaseUrl() + this.bookNumber.toFixed() + "/" + this.getProjectAonBookCode() +
            ".xml";
    }

    /**
     * Returns an illustration URL
     * @param fileName The illustration file name
     * @param {Mechanics} mechanics The book mechanics. It can be null. In this case,
     * no translated images will be searched
     * @returns The image URL, relative to application root
     */
    public getIllustrationURL(fileName: string): string {
        const illUrl = Book.getBaseUrl() + this.bookNumber.toFixed() + "/ill/" +
            fileName;
        // console.log('Image URL: ' + illUrl);
        return illUrl;
    }

    /**
     * Returns the book HTML directory on the Project Aon web site
     */
    public getBookProjectAonHtmlDir(): string {
        return "https://projectaon.org/en/xhtml/lw/" +
            this.getProjectAonBookCode() + "/";
    }

    /**
     * Returns the book title
     * @returns The book title, plain text
     */
    public getBookTitle(): string {
        if ( !this.bookTitle ) {
            this.bookTitle = $( this.bookXml ).find( "gamebook > meta > title").first().text();
        }

        // Trick for book 19/23 title
        if(this.bookNumber === 19 || this.bookNumber === 23) {
            const txt = document.createElement("textarea");
            txt.innerHTML = this.bookTitle;
            this.bookTitle = txt.value;
        }

        return this.bookTitle;
    }

    /**
     * Returns a dictionary with the disciplines info
     */
    public getDisciplinesTable(): DisciplinesTable {

        if ( !this.disciplines ) {

            const bookSeries = this.getBookSeries();
            const disciplinesSection = new Section(this, Book.DISCIPLINES_SECTION, state.mechanics);

            this.disciplines = {};
            // Parse the disciplines section
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            $(this.bookXml).find('section[id=discplnz] > data section').not('#mksumary').not('#nodispln')
            .each( function() {

                const $node = $(this);

                const disciplineId = $node.attr("id");

                let description: string;
                if ( disciplineId === MgnDiscipline.PsiSurge) {
                    // Magnakai: Special case, with useful info on second paragraph. Exclude last paragraph
                    description = $node.find("p:not(:last)").text();
                } else if (disciplineId === GndDiscipline.KaiSurge) {
                    // Grand Master: Other special case (different). Include both (all) paragraphs
                    description = $node.find("p").text();
                } else {
                    description = $node.find("p").first().text();
                }

                let imageHtml: string = "";
                if (bookSeries.id >= BookSeriesId.GrandMaster) {
                    const $disciplineIll = $node.find("> data > illustration").first();
                    imageHtml = SectionRenderer.renderIllustration(disciplinesSection, $disciplineIll);
                }

                self.disciplines[disciplineId] = {
                    id: disciplineId,
                    name: $node.find("> meta > title").text(),
                    description,
                    imageHtml
                };
            });
        }

        return this.disciplines;
    }

    /**
     * Get the book section with the given id.
     * @param sectionId The section id to get
     * @return The related section. An empty selection if the section id was not found
     */
    public getSectionXml(sectionId: string): JQuery<HTMLElement> {
        return $(this.bookXml).find("section[id=" + sectionId + "]");
    }

    /**
     * Check if the book contains a section id
     * @param sectionId The section id to search
     * @return True if the book contains the given section
     */
    public hasSection(sectionId: string): boolean {
        return this.getSectionXml(sectionId).length > 0;
    }

    /**
     * Get the book copyright HTML
     * @returns The book copyright text, HTML formatted
     */
    public getCopyrightHtml(): string {

        if ( !this.bookCopyrightHtml ) {
            const fakeSection = new Section(this, "fakeSection", null);
            const renderer = new SectionRenderer(fakeSection);
            const selector = 'rights[class="copyrights"]';
            this.bookCopyrightHtml = renderer.renderNodeChildren( $(this.bookXml).find(selector) , 0 );
        }

        return this.bookCopyrightHtml;
    }

    /**
     * Get the Kai title for a given number of disciplines
     * @param nDisciplines Number of disciplines
     * @return The kai title
     */
    public getKaiTitle(nDisciplines: number): string {

        // Normalize
        if ( nDisciplines < 1 ) {
            nDisciplines = 1;
        } else if ( nDisciplines > 10 ) {
            nDisciplines = 10;
        }

        // Get the title
        const countOffset = $(this.bookXml).find('section[id="levels"] > data > ol').attr("start");
        let title = $(this.bookXml)
            .find('section[id="levels"] > data > ol > li:eq(' + (nDisciplines - 1 - (countOffset ? parseInt(countOffset) : 0)).toFixed() + ")")
            .text();
        if ( !title ) {
            title = "Unknown";
        }

        // For the level 5, there is an extra explanation to remove:
        // &mdash;You begin the Lone Wolf adventures with this level of Kai training
        let idx = title.indexOf( "&mdash;");
        if ( idx >= 0 ) {
            title = title.substring(0, idx).trim();
        }
        // On book 6 (spanish), there is a parenthesis: Maestro Superior del Kai (con este...
        idx = title.indexOf( "(");
        if ( idx >= 0 ) {
            title = title.substring(0, idx).trim();
        }

        return title;
    }

    /**
     * Get sections that have a choice to go to some section
     * @param sectionId The destination section
     * @return Section ids that can go to the given section
     */
    public getOriginSections(sectionId: string): string[] {
        const sourceSectionIds = <string[]>[];
        $(this.bookXml)
            .find('section[class="numbered"]' )
            .has( 'data > choice[idref="' + sectionId + '"]')
            .each( (index, section) => {
                sourceSectionIds.push( $(section).attr("id") );
            }) ;
        return sourceSectionIds;
    }

    /**
     * Get the book cover image URL
     */
    public getCoverURL(): string {
        return Book.getBaseUrl() + this.bookNumber.toFixed() + "/cover.jpg";
    }

    /**
     * Return an array of 2 positions with the combat tables images
     */
    public getCombatTablesImagesUrls(): string[] {
        const images = <string[]>[];
        images.push( this.getIllustrationURL( "crtpos.png" ) );
        images.push( this.getIllustrationURL( "crtneg.png" ) );
        return images;
    }

    /**
     * Get the book random table number
     * @return Array with the 100 numbers of the random table
     */
    public getRandomTable(): number[] {
        const $randomCells = $(this.bookXml)
            .find("section[id=random] > data > illustration > instance[class=text]")
            .find("td");
        const numbers = <number[]>[];
        for (const cell of $randomCells.toArray()) {
            numbers.push( parseInt( $(cell).text(), 10 ) );
        }
        return numbers;
    }

    public getBookSeries(): BookSeries {
        return BookSeries.getBookNumberSeries(this.bookNumber);
    }

    public getSectionsIds(): string[] {
        const sectionIds: string[] = [];
        let sectionId = Book.INITIAL_SECTION;
        while (sectionId != null) {
            sectionIds.push(sectionId);

            const section = new Section(this, sectionId, state.mechanics);
            sectionId = section.getNextSectionId();
        }
        return sectionIds;
    }
}
