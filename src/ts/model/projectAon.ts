/**
 * Project AON book metadata
 */
export interface BookMetadata {

    /** English title */
    title: string;

    /** English book code */
    code: string;

    /** Illustrators folders to download */
    illustrators: string[];

    /** Authors biographies (.inc files in [LANGUAGECODE]/xml ) */
    biographies: string[];
}

/**
 * Metadata about books and Project Aon web structure
 */
export const projectAon = {

    /**
     * Books metadata
     */
    supportedBooks: [

        // Book 1:
        {
            title: "Flight from the Dark",
            code: "01fftd",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 2:
        {
            title: "Fire on the Water",
            code: "02fotw",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 3:
        {
            title: "The Caverns of Kalte",
            code: "03tcok",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 4:
        {
            title: "The Chasm of Doom",
            code: "04tcod",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 5:
        {
            title: "Shadow on the Sand",
            code: "05sots",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 6:
        {
            title: "The Kingdoms of Terror",
            code: "06tkot",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 7:
        {
            title: "Castle Death",
            code: "07cd",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 8:
        {
            title: "The Jungle of Horrors",
            code: "08tjoh",
            illustrators: [ "chalk" ],
            biographies: [ "jdbiolw" , "gcbiolw" ]
        },

        // Book 9:
        {
            title: "The Cauldron of Fear",
            code: "09tcof",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ]
        },

        // Book 10:
        {
            title: "The Dungeons of Torgar",
            code: "10tdot",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ]
        },

        ///////////////////////////////////////

        // Book 11:
        {
            title: "The Prisoners of Time",
            code: "11tpot",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ]
        },

        // Book 12 (Finished, pending of some game tests):
        {
            title: "The Masters of Darkness",
            code: "12tmod",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ]
        },

        // Book 13:
        {
            title: "The Plague Lords of Ruel",
            code: "13tplor",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ],
        },

        // Book 14:
        {
            title: "The Captives of Kaag",
            code: "14tcok",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ]
        },

        // Book 15:
        {
            title: "The Darke Crusade",
            code: "15tdc",
            illustrators: [ "williams" ],
            biographies: [ "jdbiolw" , "bwbiolw" ]
        },

    ] as BookMetadata[],

    /**
     * Returns the title of a book
     * @param bookNumber Book number, 1-index based
     */
    getBookTitle( bookNumber: number ): string {
        return projectAon.supportedBooks[bookNumber - 1][ "title" ];
    },

    /**
     * Returns the number of the last supported book (1-based index)
     */
    getLastSupportedBook() {
        return projectAon.supportedBooks.length;
    }

};

// Do not use Typescript modules here, plain node.js modules for browser JS compatiblity (oh javascript...)
try {
    if (typeof exports !== "undefined") {
        exports.projectAon = projectAon;
    }
} catch (e) {
    console.log(e);
}
