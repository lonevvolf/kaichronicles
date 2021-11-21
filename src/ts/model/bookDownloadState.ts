import { projectAon, state } from "..";

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
    public size: string;

    /**
     * Constructor
     * @param bookNumber 1-based index of the book
     */
    public constructor( bookNumber: number ) {
        this.bookNumber = bookNumber;

        const sizeMB: number = ( projectAon.supportedBooks[bookNumber - 1].zipSize / 1024.0 ) / 1024.0;
        this.size = sizeMB.toFixed(1);
    }

    /**
     * Get the book title
     * @return The book title
     */
    public getTitle(): string {
        return projectAon.getBookTitle( this.bookNumber );
    }
}
