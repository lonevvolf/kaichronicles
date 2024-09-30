import { projectAon } from "..";

/**
 * Class to handle the download state of a Project Aon book.
 * Only for Cordova app
 */
export class BookDownloadState {

    /** The book number, 1-index based */
    public bookNumber: number;

    /** Book has been downloaded? */
    public downloaded = false;

    /** Book zip size, in MB, to show on UI */
    public size: string|null = null;

    /**
     * Constructor
     * @param bookNumber 1-based index of the book
     */
    public constructor( bookNumber: number ) {
        this.bookNumber = bookNumber;
    }

    /**
     * Get the book title
     * @return The book title
     */
    public getTitle(): string {
        return projectAon.getBookTitle( this.bookNumber );
    }
}
