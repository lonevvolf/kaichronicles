import { mechanicsEngine, gameView, template, state, translations, actionChartController, randomTable, CurrencyName } from "../../..";

interface GameResult {
    dice1: number,
    dice2: number,
    total: number,
    status: string
}

/**
 * Portholes game
 */
export const book2sect308 = {

    run() {
        // Portholes game UI:
        const $gameUI = mechanicsEngine.getMechanicsUI("mechanics-book2Sect308");
        gameView.appendToSection( $gameUI );

        book2sect308.updateUI(true);

        $("#mechanics-play").on("click", (e) => {
            e.preventDefault();
            book2sect308.click();
        });
    },

    updateUI(doNotAnimate: boolean) {
        template.animateValueChange( $("#mechanics-currentMoney") ,
                state.actionChart.getBeltPouchUsedAmount() , doNotAnimate);
    },

    click() {
        if ( state.actionChart.getBeltPouchUsedAmount() < 3 ) {
            alert( translations.text("noEnoughMoney") );
            return;
        }

        const player1 = book2sect308.playerResult( translations.text("playerNumber" , [1]) );
        const player2 = book2sect308.playerResult( translations.text("playerNumber" , [2]) );
        const lw = book2sect308.playerResult( translations.text("loneWolf") );
        let status = `${player1.status}<br/>${player2.status}<br/>${lw.status}<br/>`;
        if ( lw.total > player1.total && lw.total > player2.total ) {
            if (state.book.bookNumber === 10) { // Book 10 winnings are in Lune
                status += translations.text("msgGetMoney" , [24, translations.text(CurrencyName.LUNE)]);
                actionChartController.increaseMoney(24, false, false, CurrencyName.LUNE);
            } else {
                status += translations.text("msgGetMoney" , [6, translations.text(CurrencyName.CROWN)]);
                actionChartController.increaseMoney(6);
            }
        } else {
            status += translations.text("msgDropMoney" , [3, translations.text(CurrencyName.CROWN)]);
            actionChartController.increaseMoney(-3);
        }

        $("#mechanics-gameStatus").html( status );
        book2sect308.updateUI(false);
    },

    playerResult(playerName): GameResult {
        const result:GameResult = {
            dice1: randomTable.getRandomValue(),
            dice2: randomTable.getRandomValue(),
            status: null,
            total: null,
        };
        result.status = `${translations.text( "playerDices" , [playerName] )}: ${result.dice1} + ${result.dice2} = `;
        if ( result.dice1 === 0 && result.dice2 === 0 ) {
            result.total = 100;
            if (state.book.bookNumber === 10) { // Book 10 game is called Bullseyes
                result.status += " Bullseyes!";
            }
            else {
                result.status += " Portholes!";
            }
        } else {
            result.total = result.dice1 + result.dice2;
            result.status += result.total;
        }
        return result;
    },
};
