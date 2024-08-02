import { mechanicsEngine } from "..";

export enum CurrencyName {
    /** Gold crowns id (Sommerlund) */
    CROWN = "crown",
    /** Lunes id (Siyen) */
    LUNE = "lune",
    /** Kikas id (Darklands) */
    KIKA = "kika",
    /** Nobles id (Southeastern Magnamund) */
    NOBLE = "noble",
    /** Ren id (Chai) */
    REN = "ren",
    /** Sheasu Torq id (Isle of Sheasu) */
    SHEASUTORQ = "sheasutorq",
    /** Orla id (Nael and Aluvia) */
    ORLA = "orla",
    /** Ain id (Drodarin) */
    AIN = "ain"
}

/**
 * Currency exchange
 */
export class Currency {
    /**
     * Currencies exchange.
     * How many coins per 1 Gold Crown?
     */
    private static readonly EXCHANGES : { [currency: string]: number } = {
        "crown" : 1,
        "lune" : 4,
        "kika" : 10,
        "noble" : 1,
        "ren" : 10,
        "sheasutorq" : 4,
        "orla" : 2,
        "ain" : 1
    };

    /**
     * Make a currency exchange - one of the currencies should be Crowns
     * @param nCoins Number of coins
     * @param fromCurrencyId Currency to exchange from
     * @param toCurrencyId Currency to exchange to
     * @returns To currency number, floor rounded
     */
    public static toCurrency( nCoins: number, fromCurrencyId: string = CurrencyName.CROWN, toCurrencyId: string = CurrencyName.CROWN, roundDown: boolean = true) : number {
        if (fromCurrencyId !== CurrencyName.CROWN && toCurrencyId !== CurrencyName.CROWN) {
            mechanicsEngine.debugWarning( "One currency must be Crowns");
        }

        let exchange = 1;
        if (toCurrencyId === CurrencyName.CROWN) {
            exchange = Currency.EXCHANGES[ fromCurrencyId.toString() ];
            if ( !exchange ) {
                mechanicsEngine.debugWarning( "Wrong currency: " + fromCurrencyId.toString() );
                exchange = 1;
            }
        }
        else {
            exchange = (1 / Currency.EXCHANGES[ toCurrencyId.toString() ]);
            if ( !exchange ) {
                mechanicsEngine.debugWarning( "Wrong currency: " + toCurrencyId.toString() );
                exchange = 1;
            }
        }

        if (roundDown) {
            return Math.floor( nCoins / exchange );
        }
        else {
            return nCoins / exchange;
        }
    }

}
