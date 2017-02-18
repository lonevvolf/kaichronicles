
/**
 * Translations table
 */
var translations = {

    /**
     * Spanish translations
     */
    es: {

        //////////////////////////////////////
        // Action chart / object tables
        //////////////////////////////////////
        
        'actionChart' : 'Carta de Acción',
        'combatSkill' : 'Destreza en el Combate',
        'endurancePoints' : 'Puntos de Resistencia',
        'beltPouch' : 'Bolsa (Máx. 50)',
        'kaiDisciplines' : 'Diciplinas del Kai',
        'weapons' : 'Armas',
        'currentWeapon' : 'Arma actual:',
        'backpackItems' : 'Objetos de Mochila',
        'meals' : 'Comidas',
        'specialItems' : 'Objetos Especiales',
        'msgDropCoin' : '¿Seguro que quieres dejar 1 Corona de Oro?',
        'noneFemenine' : 'Ninguna',
        'noneMasculine' : 'Ninguno',
        'disciplineDescription' : 'Descripción de la disciplina',
        'goldCrowns' : 'Coronas de Oro',
        'current' : 'Actual',
        'backpackLost' : 'Has perdido tu mochila',
        'buyObject' : 'Comprar objeto',
        'pickObject' : 'Coger objeto',
        'sellObject' : 'Vender objeto',
        'use': 'Usar',
        'setCurrentWeapon' : 'Establecer como arma actual',
        'dropObject' : 'Dejar objeto',
        'confirmSell' : '¿Seguro que quieres vender el objeto por {0} Coronas de Oro?',
        'confirmUse' : '¿Estás seguro que quieres usar "{0}"?',
        'confirmDrop' : '¿Seguro que quieres dejar "{0}"?',
        'noEnoughMoney' : 'No tienes suficiente dinero',
        'confirmBuy' : '¿Seguro que quieres comprar el objeto por {0} Coronas de Oro?',
        'msgGetObject' : 'Has cogido "{0}"',
        'msgDropObject' : 'Has dejado "{0}"',
        'msgGetMeal' : 'Has cogido {0} comidas',
        'msgDropMeal' : 'Has dejado {0} comidas',
        'msgGetMoney' : 'Has cogido {0} Coronas de Oro',
        'msgDropMoney' : 'Has perdido {0} Coronas de Oro',
        'msgEndurance' : '{0} Puntos de Resistencia',
        'msgCombatSkill' : '{0} Destreza en el Combate (permanente)',
        'msgCurrentWeapon' : 'Tu arma actual es ahora "{0}"'
    },

    /**
     * English translations
     */
    en: {

        //////////////////////////////////////
        // Action chart / object tables
        //////////////////////////////////////

        'msgDropCoin' : 'Are you sure you want to drop 1 Gold Crown?',
        'noneFemenine' : 'None',
        'noneMasculine' : 'None',
        'disciplineDescription' : 'Discipline description',
        'goldCrowns' : 'Gold Crowns',
        'current' : 'Current',
        'backpackLost' : 'You have lost your backpack',
        'buyObject' : 'Buy object',
        'pickObject' : 'Get object',
        'sellObject' : 'Sell object',
        'use': 'Use',
        'setCurrentWeapon' : 'Set as current weapon',
        'dropObject' : 'Drop object',
        'confirmSell' : 'Are you sure you want to sell the object for {0} Gold Crowns?',
        'confirmUse' : 'Are you sure you want to use "{0}"?',
        'confirmDrop' : 'Are you sure you want to drop "{0}"?',
        'noEnoughMoney' : 'You don\'t have enough money',
        'confirmBuy' : 'Are you sure you want to buy the object for {0} Gold Crowns?',
        'msgGetObject' : 'You get "{0}"',
        'msgDropObject' : 'You drop "{0}"',
        'msgGetMeal' : 'You get {0} meals',
        'msgDropMeal' : 'You drop {0} meals',
        'msgGetMoney' : 'You get {0} Gold Crowns',
        'msgDropMoney' : 'You lost {0} Gold Crowns',
        'msgEndurance' : '{0} Endurance Points',
        'msgCombatSkill' : '{0} Combat Skill (permanent)',
        'msgCurrentWeapon' : 'Your current weapon is now "{0}"'
    },

    /**
     * Returns a DOM view translated to the current language
     * @param {DOM} view The view to translate
     */
    translateView: function( view ) {

        var table = translations[state.language];
        if( !translations[state.language] )
            // Translation not available
            return view;
 
        var $clonedView = $(view).clone();

        // Translate the view
        var translatedTags = $clonedView
            .find('[data-translation]')
            .addBack('[data-translation]');
        for(var i=0; i<translatedTags.length; i++ ) {
            var translationId = $(translatedTags[i]).attr('data-translation');
            var html = table[ translationId ];
            if( html )
                $(translatedTags[i]).html( html );
        }

        return $clonedView;
    },

    /**
     * Get a translated message
     * @param {string} textId The text it to get
     * @param {Array<object>} replacements Replacements to do on the message. It can be null
     * @returns {string} The text
     */
    text: function( textId , replacements ) {
        try {
            var table = translations[state.language];
            if( !table )
                // Use english as default
                table = translations['en'];
                
            var text = table[textId];
            if( !text ) {
                console.log('Text code not found: ' + textId);
                text = textId;
            }

            if( replacements ) {
                for(var i=0; i<replacements.length; i++)
                    text = text.replaceAll( '{' + i + '}' , replacements[i].toString() );
            }
            return text;
        }
        catch(e) {
            console.log(e);
            return textId;
        }
    }

};
