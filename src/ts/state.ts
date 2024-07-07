import { Book, Mechanics, BookSectionStates, ActionChart, projectAon, mechanicsEngine } from ".";

// Variabe "state" is declared at bottom of this file

interface CurrentState {
    actionChart: ActionChart,
    actionChartSect1: string;
    bookNumber: number,
    sectionStates: BookSectionStates
}

interface SaveGameObject {
    currentState: CurrentState,
    previousBooksState: string[]
}

export enum Color {
    Light,
    Dark
}

export enum TextSize {
    Normal,
    Large
}

/**
 * The application state.
 */
export class State {

    /**
     * The current book
     */
    public book = null as Book;

    /**
     * The current book mechanics
     */
    public mechanics = null as Mechanics;

    /**
     * The current book section states
     */
    public sectionStates = null as BookSectionStates;

    /**
     * The current action chart
     */
    public actionChart = null as ActionChart;

    /**
     * The action chart at the first section
     */
    public actionChartSect1 = null as string;

    /**
     * Color Theme ( 'light' or 'dark' ).
     * This is stored at localStorage['color'], not with the game state
     */
    public color = Color.Light;

    /**
     * Random table type for new game.
     */
    public manualRandomTable = false;

    /**
     * Text Size ( 'normal' or 'large' ).
     * This is stored at localStorage['textSize'], not with the game state
     */
    public textSize = TextSize.Normal;

    /**
     * Setup the default color or persist from local storage
     */
    public setupDefaultColorTheme() {
        try {
            this.color = Color[localStorage.getItem("color")];
            if (!this.color) {
                this.color = Color.Light;
            }
        } catch (e) {
            this.color = Color.Light;
            mechanicsEngine.debugWarning(e);
        }
    }

    /**
     * Setup the default text size or persist from local storage
     */
    public setupDefaultTextSize() {
        try {
            this.textSize = TextSize[localStorage.getItem("textSize")];
            if (!this.textSize) {
                this.textSize = TextSize.Normal;
            }
        } catch (e) {
            this.textSize = TextSize.Normal;
            mechanicsEngine.debugWarning(e);
        }
    }

    /**
     * Setup the state for a book number
     */
    public setup(bookNumber: number, keepActionChart: boolean) {

        if (!bookNumber) {
            bookNumber = 1;
        }

        this.sectionStates = new BookSectionStates();
        this.book = new Book(bookNumber);

        // Action chart
        this.actionChart = null;
        this.actionChartSect1 = null;
        if (keepActionChart) {
            // Try to get the previous book action chart, and set it as the current
            this.actionChart = this.getPreviousBookActionChart(bookNumber - 1);

            // Restore Kai monastery objects
            this.restoreKaiMonasterySectionObjects();
        }

        this.mechanics = new Mechanics(this.book);

        if (!this.actionChart) {
            this.actionChart = new ActionChart();
            this.actionChart.manualRandomTable = this.manualRandomTable;
        }
    }

    public removeCachedState() {
        this.book = null;
        this.mechanics = null;
        this.sectionStates = null;
        this.actionChart = null;
        this.actionChartSect1 = null;
    }

    /**
     * Reset the current state
     */
    public reset(deleteBooksHistory: boolean) {

        this.removeCachedState();

        // Remove current game state
        localStorage.removeItem("state");

        if (deleteBooksHistory) {
            // Remove action charts from previous books
            for (let i = 1; i <= projectAon.getLastSupportedBook(); i++) {
                localStorage.removeItem("state-book-" + i.toString());
            }
        }
    }

    /**
     * Returns the current state object
     */
    private getCurrentState(): CurrentState {
        return {
            actionChart: this.actionChart,
            actionChartSect1: this.actionChartSect1,
            bookNumber: this.book ? this.book.bookNumber : 0,
            sectionStates: this.sectionStates
        };
    }

    /**
     * Store the current state at the browser local storage
     */
    public persistState() {
        try {
            const json = JSON.stringify(this.getCurrentState());
            localStorage.setItem("state", json);
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            // throw new Error(e);
        }
    }

    /**
     * Return true if there is an stored persisted state
     */
    public existsPersistedState() {
        return localStorage.getItem("state");
    }

    /**
     * Restore the state from the local storage
     */
    public restoreState() {
        try {
            const json = localStorage.getItem("state");
            if (!json) {
                throw new Error("No state to restore found");
            }
            const stateKeys = JSON.parse(json);
            if (!stateKeys) {
                throw new Error("Wrong JSON format");
            }
            this.restoreStateFromObject(stateKeys);
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            this.setup(1, false);
        }
    }

    /**
     * Restore the state from an object
     */
    private restoreStateFromObject(stateKeys: any) {
        this.book = new Book(stateKeys.bookNumber);
        this.mechanics = new Mechanics(this.book);
        this.actionChart = ActionChart.fromObject(stateKeys.actionChart, stateKeys.bookNumber);
        this.actionChartSect1 = stateKeys.actionChartSect1;
        this.sectionStates = new BookSectionStates();
        this.sectionStates.fromStateObject(stateKeys.sectionStates);
    }

    /**
     * Update state to change the site color
     * @param color 'light' or 'dark'
     */
    public updateColorTheme(color: Color) {
        this.color = color;
        localStorage.setItem("color", Color[this.color]);
    }

    /**
     * Update state to change the text size
     * @param textSize 'normal' or 'large'
     */
    public updateTextSize(textSize: TextSize) {
        this.textSize = textSize;
        localStorage.setItem("textSize", TextSize[this.textSize]);
    }

    /**
     * Restore objects on the Kai Monastery section from the Action Chart
     */
    private restoreKaiMonasterySectionObjects() {
        const kaiMonasterySection = this.sectionStates.getSectionState(Book.KAIMONASTERY_SECTION);
        kaiMonasterySection.objects = this.actionChart ? this.actionChart.kaiMonasterySafekeeping : [];
    }

    /**
     * Update state to start the next book
     */
    public nextBook() {

        // Save the action chart state on the current book ending
        const key = `state-book-${this.book.bookNumber}`;
        localStorage.setItem(key, JSON.stringify(this.actionChart));

        // Move to the next book
        this.book = new Book(this.book.bookNumber + 1);
        this.mechanics = new Mechanics(this.book);
        this.sectionStates = new BookSectionStates();
        this.actionChartSect1 = null;

        if (this.book.bookNumber !== 21) {
            // Restore Kai monastery objects
            this.restoreKaiMonasterySectionObjects();

            this.persistState();
        } else {
            // Start a new character for the New Order series
            this.setup(this.book.bookNumber, false);
        }
    }

    /**
     * Get the action chart on the ending of the previous book
     * @param bookNumber Book which get the action chart
     * @returns The action chart. null if it was not found or it cannot be loaded.
     */
    public getPreviousBookActionChart(bookNumber: number): ActionChart {
        try {
            const key = `state-book-${bookNumber}`;
            const json = localStorage.getItem(key);
            if (!json) {
                return null;
            }
            return ActionChart.fromObject(JSON.parse(json), bookNumber);
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            return null;
        }
    }

    /**
     * Returns the object to save the game state
     */
    public getSaveGameJson(): string {

        // Get the current state
        const saveGameObject: SaveGameObject = {
            currentState: this.getCurrentState(),
            previousBooksState: []
        };

        // Get the action charts at the end of each book
        for (let i = 1; i <= 30; i++) {
            const key = `state-book-${i}`;
            const previousBookState = localStorage.getItem(key);
            if (previousBookState) {
                saveGameObject.previousBooksState[i] = previousBookState;
            }
        }
        return JSON.stringify(saveGameObject);
    }

    /**
     * Restore the game from a save game file
     */
    public loadSaveGameJson(json: string) {

        // replace BOM Character (https://en.wikipedia.org/wiki/Byte_order_mark). Otherwise call to JSON.parse will fail
        json = json.replace(/\ufeff/g, "");

        // alert( json );
        // console.log( json );
        const saveGameObject: SaveGameObject = <SaveGameObject>JSON.parse(json);

        // Check errors
        if (!saveGameObject || !saveGameObject.currentState) {
            throw new Error("Wrong format");
        }

        // Restore previous books action chart
        for (let i = 1; i <= 30; i++) {
            const key = `state-book-${i}`;
            if (saveGameObject.previousBooksState[i]) {
                localStorage.setItem(key, saveGameObject.previousBooksState[i]);
            } else {
                localStorage.removeItem(key);
            }
        }

        // Restore current state
        this.restoreStateFromObject(saveGameObject.currentState);

        this.persistState();
    }
}

/** Application model state */
export const state = new State();
