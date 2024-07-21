import * as fs from "fs-extra";
import { BookMetadata, projectAon } from "../model/projectAon";

/** Tool to download book data from the Project Aon SVN */
export class BookData {

    /** URL for the PAON trunk (current version) */
    private static readonly SVN_TRUNK_URL = "https://www.projectaon.org/data/trunk";

    /**
     * The target directory root
     */
    public static readonly TARGET_ROOT = "www/data/projectAon";

    /** The book number 1-based index */
    private bookNumber: number;

    /** Metadata about the book */
    private bookMetadata: BookMetadata;

    /** The english book code */
    private code: string;

    /** Array with illustrations authors directories names */
    private illAuthors: string[];

    /**
     * Constructor
     * @param bookNumber The book number (1-based index)
     */
    constructor(bookNumber: number) {
        this.bookNumber = bookNumber;
        this.bookMetadata = projectAon.supportedBooks[ bookNumber - 1 ];
        this.code = this.bookMetadata.code;
        this.illAuthors = this.bookMetadata.illustrators;
    }

    /**
     * Get the local relative path for the book data
     */
    private getBookDir(): string {
        return BookData.TARGET_ROOT + "/" + this.bookNumber.toFixed();
    }

    /**
     * Get the the book XML file book name
     * @returns The book XML file name
     */
    private getBookXmlName() {
        return this.code + ".xml";
    }

    /**
     * Get the SVN source path for the book XML, as it is configured on projectAon.ts
     * @param root Optional. The SVN root to use. If null, the current published version will be used
     * @returns The currently used book XML URL at the PAON web site
     */
    private getXmlSvnSourcePath(): string {
        return "project-aon/en/xml/" + this.getBookXmlName();
    }

    /**
     * Download the book XML
     */
    private downloadXml() {
        // Download the book XML
        const sourcePath = this.getXmlSvnSourcePath();
        const targetPath = this.getBookDir() + "/" + this.getBookXmlName();        
        fs.copyFileSync(sourcePath, targetPath);
    }

    /**
     * Download an author biography file
     */
    private downloadAuthorBio(bioFileName: string) {
        const sourcePath = "project-aon/en/xml/" + bioFileName + ".inc";
        const targetPath = this.getBookDir() + "/" + bioFileName + ".inc";
        fs.copyFileSync(sourcePath, targetPath);
    }

    /**
     * Get the svn absolute URL for illustrations directory of a given author
     */
    private getSvnIllustrationsDir(author: string): string {
        return "project-aon/en/png/lw/" + this.code + "/ill/" +
            author;
    }

    /**
     * Download illustrations
     */
    private downloadIllustrations(author: string) {

        const sourceDir = this.getSvnIllustrationsDir(author);
        const targetDir = this.getBookDir() + "/ill";
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }
        fs.copySync(sourceDir, targetDir);

        if ( this.bookNumber === 9) {
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

        const targetDir = this.getBookDir() + "/ill";

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
        const coverPath = "project-aon/en/jpeg/lw/" + this.code +
            "/skins/ebook/cover.jpg";
        const targetPath = this.getBookDir() + "/cover.jpg";
        fs.copyFileSync(coverPath, targetPath);
    }

    public downloadBookData() {
        const bookDir = BookData.TARGET_ROOT + "/" + this.bookNumber.toFixed();

        console.log("Re-creating directory " + bookDir);
        fs.removeSync( bookDir );
        fs.mkdirSync( bookDir );

        this.downloadCover();

        // Download authors biographies
        this.bookMetadata.biographies.forEach( (authorBio) => {
            this.downloadAuthorBio(authorBio);
        });

        this.downloadXml();

        this.illAuthors.forEach( (author) => {
            this.downloadIllustrations(author);
        });

        this.downloadCombatTablesImages();
    }

    private downloadCombatTablesImages() {
        const sourceSvnDir = this.getSvnIllustrationsDir("blake");
        const targetDir = this.getBookDir() + "/ill";
        
        fs.copyFileSync(sourceSvnDir + "/crtneg.png", targetDir + "/crtneg.png");        
        fs.copyFileSync(sourceSvnDir + "/crtpos.png", targetDir + "/crtpos.png");
    }
}
