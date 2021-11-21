import * as fs from "fs-extra";
import { BookMetadata, projectAon, Language } from "..";

/** Tool to download book data from the Project Aon SVN */
export class BookData {

    /** URL for the PAON trunk (current version) */
    private static readonly SVN_TRUNK_URL = "https://www.projectaon.org/data/trunk";

    /**
     * The target directory root
     */
    public static readonly TARGET_ROOT = "www/data/projectAon";

    // BookData.LANGUAGES = ['en','es'];

    /** The book number 1-based index */
    private bookNumber: number;

    /** Metadata about the book */
    private bookMetadata: BookMetadata;

    /** The english book code */
    private enCode: string;

    /** The spanish book code */
    private esCode: string;

    /** Array with illustrations authors directories names */
    private illAuthors: string[];

    /**
     * Constructor
     * @param bookNumber The book number (1-based index)
     */
    constructor(bookNumber: number) {
        this.bookNumber = bookNumber;
        this.bookMetadata = projectAon.supportedBooks[ bookNumber - 1 ];
        this.enCode = this.bookMetadata.code_en;
        this.esCode = this.bookMetadata.code_es;
        this.illAuthors = this.bookMetadata.illustrators;
    }

    /**
     * Get the book code for a given language
     */
    private getBookCode(language: Language): string {
        return language === Language.ENGLISH ? this.enCode : this.esCode;
    }

    /**
     * Get the local relative path for the book data
     */
    private getBookDir(): string {
        return BookData.TARGET_ROOT + "/" + this.bookNumber;
    }

    /**
     * Get the the book XML file book name
     * @param language The language code (en/es)
     * @returns The book XML file name
     */
    private getBookXmlName(language: Language) {
        return this.getBookCode( language )  + ".xml";
    }

    /**
     * Get the SVN source path for the book XML, as it is configured on projectAon.ts
     * @param language The language code (en/es)
     * @param root Optional. The SVN root to use. If null, the current published version will be used
     * @returns The currently used book XML URL at the PAON web site
     */
    private getXmlSvnSourcePath(language: Language): string {
        return "project-aon/" + language + "/xml/" + this.getBookXmlName( language );
    }

    /**
     * Download the book XML for a given language
     * @param language The language code (en/es)
     */
    private downloadXml(language: Language) {
        // Download the book XML
        const sourcePath = this.getXmlSvnSourcePath(language);
        const targetPath = this.getBookDir() + "/" + this.getBookXmlName( language );        
        fs.copyFileSync(sourcePath, targetPath);
    }

    /**
     * Download an author biography file
     */
    private downloadAuthorBio(language: Language, bioFileName: string) {
        const sourcePath = "project-aon/" + language + "/xml/" + bioFileName + ".inc";
        const targetPath = this.getBookDir() + "/" + bioFileName + "-" + language + ".inc";
        fs.copyFileSync(sourcePath, targetPath);
    }

    /**
     * Get the svn absolute URL for illustrations directory of a given author / language
     */
    private getSvnIllustrationsDir( language: Language, author: string): string {
        const booksSet = language === Language.ENGLISH ? "lw" : "ls";
        return "project-aon/" + language + "/png/" +
            booksSet + "/" + this.getBookCode(language) + "/ill/" +
            author;
    }

    /**
     * Download illustrations
     */
    private downloadIllustrations(language: Language, author: string) {

        const sourceDir = this.getSvnIllustrationsDir(language, author);
        const targetDir = this.getBookDir() + "/ill_" + language;
        fs.mkdirSync( targetDir );
        fs.copySync(sourceDir, targetDir);

        if ( this.bookNumber === 9 && language === Language.ENGLISH ) {
            this.book9ObjectIllustrations();
        }
    }

    /**
     * Download extra book 9 object illustrations.
     * On book 9, there is a illustrator change (Brian Williams). He did illustrations for objects that
     * exists on previous books. So, include on this book all existing objects illustrations
     */
    private book9ObjectIllustrations() {

        // Already included on book 9: dagger.png, sword.png, mace.png, bow.png, food.png, potion.png, quiver.png, rope.png

        const targetDir = this.getBookDir() + "/ill_en";

        // Not included on book 9, but in later books:
        const williamsIllustrations = {
            "axe.png" : "12tmod/ill/williams/axe.png",
            "spear.png" : "13tplor/ill/williams/spear.png",
            "bsword.png" : "17tdoi/ill/williams/bsword.png",
            "qstaff.png" : "12tmod/ill/williams/qurtstff.png",  // NAME CHANGED!!!,
            "ssword.png" : "08tjoh/ill/chalk/ssword.png",
            "warhammr.png" : "08tjoh/ill/chalk/warhammr.png"
        };
        for (const illName of Object.keys(williamsIllustrations) ) {
            const sourcePath = "project-aon/en/png/lw/" + williamsIllustrations[illName];
            const targetPath = targetDir + "/" + illName;
            fs.copySync(sourcePath, targetPath);
        }
    }

    /**
     * Download the book cover
     */
    private downloadCover() {
        const coverPath = "project-aon/en/jpeg/lw/" + this.getBookCode(Language.ENGLISH) +
            "/skins/ebook/cover.jpg";
        const targetPath = this.getBookDir() + "/cover.jpg";
        fs.copyFileSync(coverPath, targetPath);
    }

    public async downloadBookData() {
        const bookDir = BookData.TARGET_ROOT + "/" + this.bookNumber;
        console.log("Re-creating directory " + bookDir);
        fs.removeSync( bookDir );
        fs.mkdirSync( bookDir );

        this.downloadCover();

        for (const langKey of Object.keys(Language)) {
            const language = Language[langKey];
            if (!this.getBookCode( language )) {
                // Skip books without given language
                continue;
            }

            // Download authors biographies
            this.bookMetadata.biographies.forEach( (authorBio) => {
                this.downloadAuthorBio(language, authorBio);
            });

            this.downloadXml(language);

            this.illAuthors.forEach( (author) => {
                this.downloadIllustrations(language , author);
            });

            this.downloadCombatTablesImages(language);
        }
    }

    private downloadCombatTablesImages(language: Language) {
        const sourceSvnDir = this.getSvnIllustrationsDir(language, "blake");
        const targetDir = this.getBookDir() + "/ill_" + language;
        
        fs.copyFileSync(sourceSvnDir + "/crtneg.png", targetDir + "/crtneg.png");        
        fs.copyFileSync(sourceSvnDir + "/crtpos.png", targetDir + "/crtpos.png");
    }
}
