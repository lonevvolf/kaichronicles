import { state } from "..";

/**
 * Combat result for death
 */
export const COMBATTABLE_DEATH = "D";

/**
 * The combat table
 */


/**
 * Combat table results when the combat ratio is <= 0
 */
const tableBelowOrEqualToEnemy:(typeof COMBATTABLE_DEATH | number)[][][] = [
    // Random table result = 0
    [
        [12 , 0],
        [11 , 0],
        [10 , 0],
        [9  , 0],
        [8  , 0],
        [7  , 0],
        [6  , 0]
    ],
    
    // Random table result = 1
    [
        [ 3 , 5 ], // Combat ratio 0 => E: 3 / LW: 5
        [ 2 , 5 ], // Combat ratio -1 / -2 => E: 2 / LW: 5
        [ 1 , 6 ], // Combat ratio -3 / -4, => E: 1 / LW: 6
        [ 0 , 6 ], // ...
        [ 0 , 8 ],
        [ 0 , COMBATTABLE_DEATH],
        [ 0 , COMBATTABLE_DEATH ]
    ],

    // Random table result = 2
    [
        [ 4 , 4 ],
        [ 3 , 5 ],
        [ 2 , 5 ],
        [ 1 , 6 ],
        [ 0 , 7 ],
        [ 0 , 8 ],
        [ 0 , COMBATTABLE_DEATH ]
    ],

    // Random table result = 3
    [
        [ 5 , 4 ],
        [ 4 , 4 ],
        [ 3 , 5 ],
        [ 2 , 5 ],
        [ 1 , 6 ],
        [ 0 , 7 ],
        [ 0 , 8 ]
    ],

    // Random table result = 4
    [
        [6 , 3],
        [5 , 4],
        [4 , 4],
        [3 , 5],
        [2 , 6],
        [1 , 7],
        [0 , 8]
    ],

    // Random table result = 5
    [
        [7 , 2],
        [6 , 3],
        [5 , 4],
        [4 , 4],
        [3 , 5],
        [2 , 6],
        [1 , 7]
    ],

    // Random table result = 6
    [
        [8 , 2],
        [7 , 2],
        [6 , 3],
        [5 , 4],
        [4 , 5],
        [3 , 6],
        [2 , 6]
    ],

    // Random table result = 7
    [
        [9 , 1],
        [8 , 2],
        [7 , 2],
        [6 , 3],
        [5 , 4],
        [4 , 5],
        [3 , 5]
    ],

    // Random table result = 8
    [
        [10 , 0],
        [9  , 1],
        [8  , 1],
        [7  , 2],
        [6  , 3],
        [5  , 4],
        [4  , 4]
    ],

    // Random table result = 9
    [
        [11 , 0],
        [10 , 0],
        [9  , 0],
        [8  , 0],
        [7  , 2],
        [6  , 3],
        [5  , 3]
    ],
];

/**
 * Combat table results when the combat ratio is > 0
 */
const tableAboveEnemy:(typeof COMBATTABLE_DEATH | number)[][][] = [
    // Random table result = 0
    [
        [14, 0],
        [16, 0],
        [18, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 1
    [
        [4 , 5], // Combat ratio +1 / +2 => E: 4 , LW: 5
        [5 , 4], // Combat ratio +3 / +4 => E: 5 , LW: 4
        [6 , 4], // ...
        [7 , 4],
        [8 , 3],
        [9 , 3], // Combat ratio +11 or more if NO extended table (+11 / +12 if extended table)
        [10, 2], // EXTENDED TABLE STARTS HERE (Combat ratio +13 / +14)
        [11, 2],
        [12, 1],
        [14, 1],
        [16, 1],
        [18, 0],
        [20, 0],
        [22, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 2
    [
        [5  , 4],
        [6  , 3],
        [7  , 3],
        [8  , 3],
        [9  , 3],
        [10 , 2],
        [11, 2],
        [12, 1],
        [14, 1],
        [16, 1],
        [18, 0],
        [20, 0],
        [22, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 3
    [
        [6  , 3],
        [7  , 3],
        [8  , 3],
        [9  , 2],
        [10 , 2],
        [11 , 2],
        [12, 1],
        [14, 1],
        [16, 1],
        [18, 0],
        [20, 0],
        [22, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 4
    [
        [7 , 3],
        [8 , 2],
        [9 , 2],
        [10 , 2],
        [11 , 2],
        [12 , 2],
        [14, 1],
        [16, 1],
        [18, 0],
        [20, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 5
    [
        [8 , 2],
        [9 , 2],
        [10 , 2],
        [11 , 2],
        [12 , 2],
        [14 , 1],
        [16, 1],
        [18, 0],
        [20, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 6
    [
        [9, 2],
        [10, 2],
        [11, 1],
        [12, 1],
        [14, 1],
        [16, 1],
        [18, 0],
        [20, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 7
    [
        [10, 1],
        [11, 1],
        [12, 0],
        [14, 0],
        [16, 0],
        [18, 0],
        [20, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 8
    [
        [11, 0],
        [12, 0],
        [14, 0],
        [16, 0],
        [18, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ],

    // Random table result = 9
    [
        [12, 0],
        [14, 0],
        [16, 0],
        [18, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0],
        [COMBATTABLE_DEATH, 0]
    ]
];

export class CombatTable {
    /**
     * Get a combat table result
     * @param combatRatio The combat ratio
     * @param randomTableValue The random table value
     * @returns Array with endurance points loses, or COMBATTABLE_DEATH. Index 0 is the
     * EP enemy loss. Index 1 is the Lone Wolf loss
     */
    static getCombatTableResult(combatRatio: number, randomTableValue: number): (typeof COMBATTABLE_DEATH | number)[] {
        let ponderatedIndex = combatRatio / 2.0;
        let table : (typeof COMBATTABLE_DEATH | number)[][][];
        if ( combatRatio <= 0 ) {
            table = tableBelowOrEqualToEnemy;
            ponderatedIndex = - ponderatedIndex;
        } else {
           table = tableAboveEnemy;
        }

        // round 4.5 to 5
        ponderatedIndex = Math.ceil(ponderatedIndex);

        // check if we're using the extended CRT or not and set max column
        const maxPonderatedIndex = state.actionChart.extendedCRT && combatRatio > 0 ? 15 : 6;
        if ( ponderatedIndex > maxPonderatedIndex ) {
            ponderatedIndex = maxPonderatedIndex;
        }

        return table[randomTableValue][ponderatedIndex];
    }
}
