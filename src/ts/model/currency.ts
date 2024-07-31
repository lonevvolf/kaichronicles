import { mechanicsEngine } from "..";

/**
 * Currency exchange
 */
export class Currency {

    /** Gold crowns id (Sommerlund) */
    public static readonly CROWN = "crown";

    /** Lunes id (Siyen) */
    public static readonly LUNE = "lune";

    /** Kikas id (Darklands) */
    public static readonly KIKA = "kika";

    /** Nobles id (Southeastern Magnamund) */
    public static readonly NOBLE = "noble";

    /** Ren id (Chai) */
    public static readonly REN = "ren";

    /** Sheasu Torq id */
    public static readonly SHEASU_TORQ = "sheasutorq";

    /** Orla id */
    public static readonly ORLA = "orla";

    /** Ain id */
    public static readonly AIN = "ain";

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
     * Make a currency exchange - currently one of the currencies should be Crowns
     * @param nCoins Number of coins
     * @param fromCurrencyId Currency to exchange from
     * @param toCurrencyId Currency to exchange to
     * @returns To currency number, floor rounded
     */
    public static toCurrency( nCoins: number, fromCurrencyId: Currency = Currency.CROWN, toCurrencyId: Currency = Currency.CROWN) : number {
        if (fromCurrencyId !== Currency.CROWN && toCurrencyId !== Currency.CROWN) {
            mechanicsEngine.debugWarning( "One currency must be Crowns");
        }

        let exchange = 1;
        if (toCurrencyId === Currency.CROWN) {
            exchange = Currency.EXCHANGES[ fromCurrencyId.toString() ];
            if ( !exchange ) {
                mechanicsEngine.debugWarning( "Wrong currency: " + fromCurrencyId.toString() );
                exchange = 1;
            }
        }
        else {
            exchange = (1 / Currency.EXCHANGES[ toCurrencyId.toString() ]);
            if ( !exchange ) {
                mechanicsEngine.debugWarning( "Wrong currency: " + fromCurrencyId.toString() );
                exchange = 1;
            }
        }

        return Math.floor( nCoins / exchange );
    }

}
