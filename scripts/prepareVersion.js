"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Build a production to upload to Project Aon
 * Run this as "npm run prepareversion [ -- [--debug] [KEYSTOREPASSWORD] ]
 */
var fs = require("fs-extra");
var klawSync = require("klaw-sync");
var preprocess = require("preprocess");
var path = require("path");

/**
 * Recreate the dist directory
 */
function recreateDist() {
    console.log("Deleting dist dir");
    fs.removeSync('dist');

    console.log("Creating dist dir");
    fs.mkdirSync('dist');

    console.log("Copying src to dist");
    fs.copySync('www', 'dist');

    fs.removeSync('dist/js/kai.js.map');
    fs.removeSync('dist/lib/xmllint.js');
}

/**
 * Preprocess the index.html file
 */
function preprocessIndexPage() {
    var context = { PRODUCTION: 'true' };
    preprocess.preprocessFileSync('dist/index.html', 'dist/index.html', context);
}

/**
 * Prepare the dist directory, and remove unused stuff
 */
function prepareDistDirectory() {
    // Update HTML to use the minified js WITHOUT cordova.js
    console.log('Updating index.html for www');
    preprocessIndexPage();
}

/**
 * Join views on a single file
 */
function joinViews() {
    console.log("Join HTML views on a single file");

    // Get all .html files on views dir
    var viewFiles = klawSync('dist/views', { nodir: true });
    var joinedFileContent = '';
    viewFiles.forEach(function (f) {
        console.log(f.path);
        var fileText = fs.readFileSync(f.path, 'utf8');
        joinedFileContent += '\n<div class="htmlpage" id="' +
            path.basename(f.path) + '">\n' + fileText + "\n</div>\n";
    });
    joinedFileContent = "<div>\n" + joinedFileContent + "\n</div>\n";

    // Write joined file
    fs.writeFileSync('dist/views.html', joinedFileContent);

    // Delete views directory
    fs.removeSync('dist/views');
}

recreateDist();
joinViews();
prepareDistDirectory();