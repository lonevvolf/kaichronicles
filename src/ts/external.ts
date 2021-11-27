// External declarations
// numberPicker.ts
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

// index.html:
declare const ENVIRONMENT: string;

// FileSaver.js
declare const saveAs: any;

// xmllint.js
declare function validateXML(parms: any): string;

// commons.ts:
interface Array<T> {
    removeValue( value: T ): boolean;

    /**
     * Returns a shallow clone of this array
     */
    clone(): T[];

    /**
     * Returns a deep clone of this array.
     * This will call to clone() / deepClone() of each array element, if it has. Otherwise the element will be directly copied.
     */
    deepClone(): T[];
}

// commons.ts:
interface String {
    replaceAll(find: string, replace: string): string;
    isValidFileName(): boolean;
    escapeRegExp(): string;
    unescapeHtml(): string;
    getUrlParameter(sParam: string): string;
}

// Mixed:
interface Window {
    
    // commons.ts:
    getUrlParameter( parmName: string ): string;

}
