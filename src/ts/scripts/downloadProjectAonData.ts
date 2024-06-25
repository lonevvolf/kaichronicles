import * as fs from "fs-extra";
import * as fsn from "fs";
import { projectAon } from "../model/projectAon";
import { BookData } from "./bookData";
import simpleGit, {SimpleGit, SimpleGitProgressEvent} from 'simple-git';

/*
    Dowload Project Aon book data
    Command line parameters:
    1) Book index (1-based). If it does not exists, the "www/data/projectAon" will be re-created and all books will be downloaded
*/

// Check if we should download only a single book
let bookNumber = 0;
if ( process.argv.length >= 3 ) {
    // The book number (1-index based) number
    bookNumber = parseInt( process.argv[2], 10);
}

// Recreate the books root directory, if we are downloading all books
if ( !bookNumber ) {
    fs.removeSync( BookData.TARGET_ROOT );
}
if ( !fs.existsSync(BookData.TARGET_ROOT) ) {
    fs.mkdirSync( BookData.TARGET_ROOT );
}

// Download books data
let from: number;
let to: number;
if ( bookNumber ) {
    // Download single book
    from = to = bookNumber;
} else {
    // Download all books
    from = 1;
    to = projectAon.supportedBooks.length;
}

const progress = ({method, stage, progress}: SimpleGitProgressEvent) => {
    console.log(`git.${method} ${stage} stage ${progress}% complete`);
 }

let gitPromise;
if(fsn.existsSync("project-aon")) {
    console.log("Updating Project Aon local repository");
    const git: SimpleGit = simpleGit('./project-aon', {progress});
    gitPromise = git.pull();
} else {
    console.log("Cloning Project Aon git repository. Could take time (~500MB to download).");
    const git: SimpleGit = simpleGit({progress});
    gitPromise = git.clone("https://git.projectaon.org/project-aon.git");
}

gitPromise.then(result => {
    for (let i = from; i <= to; i++) {
        new BookData(i).downloadBookData();
    }
});
