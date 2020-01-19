// External declarations
interface JQuery {
    getNumber(): number;
    setNumber(value: number): void;
    getTitle(): string;
    bindNumberEvents(): void;
    fireValueChanged(): void;
    getMinValue(): number;
    getMaxValue(): number;
    isValid(): boolean;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    initializeValue(): void;
}

interface Navigator {
    connection: any;
    app: any;
}

// index.html:
declare const ENVIRONMENT: string;

// toastr.js
declare var toastr: Toastr;

// FileSaver.js
declare var saveAs: any;

// node.js
declare var exports;

// Google analytics
declare var ga;

// xmllint.js
declare function validateXML(parms: any): string;

// Cordova
declare const Connection: any;
declare const LocalFileSystem;
declare const FileTransfer;

// cordova-plugin-zip (Cordova plugin)
declare const zip;

// cordova-plugin-zeep (Cordova plugin)
declare const Zeep;

// cordova-plugin-copytodownload (Cordova plugin)
declare const CopyToDownload;

// com.megster.cordova.FileChooser (Cordova plugin)
declare const fileChooser;

// commons.js:
interface Array<T> {
    removeValue( value: T ): boolean;
    contains( value: T ): boolean;
    clone(): T[];
}
interface String {
    replaceAll(find: string, replace: string): string;
    padLeft(padLength: number, padChar: string): string;
    endsWith(suffix: string);
    isValidFileName(): boolean;
    startsWith( text: string ): boolean;
    escapeRegExp(): string;
    unescapeHtml(): string;
    getUrlParameter(sParam: string): string;
}

// Mixed:
interface Window {

    // Cordova:
    requestFileSystem;

    // Cordova:
    resolveLocalFileSystemURI;

    // cordova-plugin-document-contract (Cordova plugin)
    plugins: {
        DocumentContract;
    };
    // commons.js:
    getUrlParameter( parmName: string ): string

}
