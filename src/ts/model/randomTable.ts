import { state, template } from "..";

/**
 * Info about a current choose
 */
export interface RandomTableCurrentChoose {
    zeroAsTen: boolean;
    /**
     * The jQuery Deferred object for the promise
     */
    deferred: JQuery.Deferred<number>;

    value: number;
}

/**
 * The random number generator
 */
export class RandomTable {

    /**
     * If >= 0, next value to return from the random table, fixed.
     * It's for debug purposes.
     */
    public nextValueDebug: number = -1;

    /**
     * Promise for random number choosing with UI (manual random table).
     * Null if there is no active choose
     */
    private currentAsync: RandomTableCurrentChoose = null;

    /**
     * Returns an integer number between 0 and 9
     * @param ignoreZero true if the zero should not be returned
     * @param zeroAsTen true if the zero must to be returned as ten
     * @return The random number
     */
    public getRandomValue(ignoreZero: boolean = false, zeroAsTen: boolean = false): number {
        let value: number;
        do {
            if ( this.nextValueDebug >= 0 && this.nextValueDebug <= 9 ) {
                // Debug value
                value = this.nextValueDebug;
                this.nextValueDebug = -1;
            } else {
                // Get an index for the picked number
                const index = Math.floor( Math.random() * 100.0 );
                // Get the number for that index on the book random table
                value = state.book.bookRandomTable[index];
            }
        } while (ignoreZero && value === 0);

        if ( zeroAsTen && value === 0 ) {
            return 10;
        }

        return value;
    }

    public getRandomValueAsync(zeroAsTen: boolean = false): JQueryPromise<number> {
        if ( !state.actionChart.manualRandomTable ) {
            // Use computer generated random numbers:
            return jQuery.Deferred<number>().resolve( this.getRandomValue(zeroAsTen) ).promise();
        }

        // Store info about the current selection
        this.currentAsync = {
            zeroAsTen,
            deferred: jQuery.Deferred<number>(),
            value: null
        };

        template.showRandomTable(true);
        return this.currentAsync.deferred.promise();
    }

    public randomTableUIClicked(value: number) {
        if ( !this.currentAsync ) {
            return;
        }

        if ( this.currentAsync.zeroAsTen && value === 0 ) {
            value = 10;
        }

        this.currentAsync.value = value;

        template.showRandomTable(false);
    }

    public randomTableClosed() {
        if(this.currentAsync !== null) {
            this.currentAsync.deferred.resolve(this.currentAsync.value);
            this.currentAsync = null;
        }
    }

    public module10( value: number): number {
        value = value % 10;
        if ( value < 0 ) {
            value += 10;
        }
        return value;
    }
}

/**
 * The random numbers generator singleton
 */
export const randomTable = new RandomTable();
