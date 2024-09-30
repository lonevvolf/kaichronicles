import { SectionItem, Item, ObjectsTableType, state, translations, routing, kaimonasteryController, MoneyDialog, actionChartController, mechanicsEngine, template, CurrencyName, NewOrderDiscipline } from "../..";

/**
 * Item on a objects table to render
 */
export class ObjectsTableItem {

    /** The section/inventory context object information */
    private objectInfo: SectionItem;

    /** The object information */
    private item: Item;

    /** The table type */
    private type: ObjectsTableType;

    /** Item index in the ObjectsTable array. */
    private index: number;

    /**
     * Constructor
     * @param itemInfo Object info as a SectionItem on the section
     * @param type Table type
     */
    constructor(itemInfo: SectionItem, type: ObjectsTableType, index: number) {
        this.type = type;
        this.objectInfo = itemInfo;
        this.index = index;

        // Get the object info
        if ( this.objectInfo ) {
            this.item = state.mechanics.getObject( this.objectInfo.id );
        }
    }

    public renderItem(): string {
        const html = this.getItemDescription();
        if ( !html ) {
            // Item should not be rendered
            return html;
        }

        return this.getItemOperations() + html;
    }

    /**
     * Returns the object description HTML.
     * Empty string if the object should not be rendered
     */
    private getItemDescription(): string {

        if ( !this.item ) {
            return "";
        }

        // If it's a sell table, and we don't have the object, do not show it
        if ( this.type === ObjectsTableType.SELL  ) {
            if ( this.objectInfo.id !== Item.ARROW && !state.actionChart.hasObject( this.objectInfo.id ) ) {
                return "";
            }
            // We don't have enough arrows to sell, do not show
            if ( this.objectInfo.id === Item.ARROW && state.actionChart.arrows < this.objectInfo.count ) {
                return "";
            }
        }

        let html = "";

        // Name
        let name = this.item.name;

        // Number of arrows on the quiver
        if ( this.objectInfo.id === Item.QUIVER || this.objectInfo.id === Item.LARGE_QUIVER ) {
            // Be sure count is not null
            const count = ( this.objectInfo.count ? this.objectInfo.count : 0 );
            // In INVENTORY always show "0 arrows", but not in SELL or AVAILABLE (ugly)
            if ( count > 0 || this.type === ObjectsTableType.INVENTORY ) {
                name += " (" + count.toFixed() + " " + (count === 1 ? translations.text("arrow") : translations.text("arrows")) + ")";
            }
        }

        // Arrow amount
        if ( this.objectInfo.id === Item.ARROW && this.objectInfo.count ) {
            name = this.objectInfo.count.toFixed() + " " + (this.objectInfo.count === 1 ? translations.text("arrow") : name);
        }

        // Fireseed amount
        if ( this.objectInfo.id === Item.FIRESEED ) {
            name += " (" + this.objectInfo.count.toFixed() + ")";
        }
        
        // Money amount
        if ( this.objectInfo.id === Item.MONEY && this.objectInfo.count ) {
            name += " (" + this.objectInfo.count.toFixed() + " " + translations.text(this.objectInfo.currency) + ")";
        }

        // Buy / sell price
        if ( this.objectInfo.price ) {
            const currency = this.objectInfo.currency;
            const currencyText = translations.text(currency);
            name += " (" + this.objectInfo.price.toFixed() + " " + currencyText + ")";
        }

        // Buy X objects for a given price
        if ( this.objectInfo.id !== Item.MONEY && this.objectInfo.id !== Item.ARROW 
            && this.objectInfo.id !== Item.QUIVER && this.objectInfo.id !== Item.LARGE_QUIVER 
            && this.objectInfo.price > 0 && this.objectInfo.count > 1 ) {
            name = this.objectInfo.count.toFixed() + " x " + name;
        }

        // Object Image
        const imageUrl = this.item.getImageUrl();
        if ( imageUrl ) {
            html += '<span class="inventoryImgContainer"><img class="inventoryImg" src=' +
                imageUrl + " /></span>";
        }

        // Special
        if ( this.objectInfo.id === Item.MAP ) {
            // It's the map:
            name = '<a href="#map">' + name + "</a>";
        } else if ( imageUrl || this.item.extraDescription ) {
            // Add a link to view a larger version of the image / view object extra description
            name = '<a href="#" class="equipment-op" data-op="details" data-objectId="' +
            this.item.id + '">' + name + "</a>";
        }

        if( this.objectInfo.dessiStoneBonus ) {
            name += " (" + translations.text( "dessiStone" ) + ")";
        }

        html += "<span><b>" + name + "</b></span>";

        // Usage count
        if ( this.objectInfo.usageCount > 1 ) {
            html += " <span>" + translations.text( "usageCount" , [this.objectInfo.usageCount] ) + "</span>";
        }

        // Description
        if ( this.item.description ) {
            html += "<br/><i><small>" + this.item.description;
            if ( this.item.extraDescription ) {
                html += '<a href="#" class="equipment-op" data-op="details" data-objectId="' +
                this.item.id + '"> ' + translations.text( "more" ) + "...</a>";
            }
            html += "</small></i>";
        }

        return html;

    }

    /**
     * Get HTML for a given object operation
     * @param operation The operation for the link
     * @param title The tooltip text for the operation. null to do not display
     * @param opDescription The operation description
     * @return The operation HTML
     */
    private getOperationTag(operation: string, title: string = null , opDescription: string ) {

        let link = `<a href="#" data-objectId="${this.item.id}" data-index="${this.index}" class="equipment-op btn btn-outline-secondary" `;

        if ( this.item.id === Item.QUIVER || this.item.id === Item.LARGE_QUIVER || this.item.id === Item.ARROW || this.item.id === Item.MONEY || this.item.id === Item.FIRESEED ||
            ( this.objectInfo.price > 0 && this.objectInfo.count > 0 ) ) {
            // Store the number of arrows on the quiver / gold crowns / number of items to buy by the given price
            link += 'data-count="' + this.objectInfo.count.toFixed() + '" ';
        }

        if ( this.objectInfo.price ) {
            link += 'data-price="' + this.objectInfo.price.toFixed() + '" ';
        }

        if ( this.objectInfo.currency) {
            link += 'data-currency="' + this.objectInfo.currency.toString() + '" ';
        }

        if ( this.objectInfo.unlimited ) {
            link += 'data-unlimited="true" ';
        }

        if ( this.objectInfo.useOnSection ) {
            link += 'data-useonsection="true" ';
        }

        if ( this.objectInfo.usageCount ) {
            link += `data-usagecount="${this.objectInfo.usageCount}" `;
        }

        if ( title ) {
            // Tooltip
            link += 'title="' + title + '" ';
        }

        link += 'data-op="' + operation + '">';

        link += opDescription + "</a> ";

        return link;
    }

    /** Get HTML for 'use' operation */
    private getUseOperation(): string {
        const title = translations.text("use");
        return this.getOperationTag( "use" , title , title );
    }

    /**
     * Render available objects operations
     * @return The HTML. Empty string if there are no avaliable operations
     */
    private getItemOperations(): string {

        if ( state.actionChart.currentEndurance <= 0 ) {
            // Player is death: No operations
            return "";
        }

        const objectDescription = this.getItemDescription();
        if ( !objectDescription ) {
            // Object should not be rendered
            return "";
        }

        let html = "";

        if ( this.type === ObjectsTableType.AVAILABLE ) {
            // Available object (free) / buy object:

            if ( this.objectInfo.price === 0 && this.objectInfo.useOnSection ) {
                // Allow to use the object from the section, without picking it
                html += this.getUseOperation();
            }

            // Get it / Buy it
            const title = translations.text( this.objectInfo.price ? "buyObject" : "pickObject" );
            html += this.getOperationTag( "get" , title , '<span class="fa fa-plus"></span>' );
        } else if ( this.type === ObjectsTableType.SELL ) {
            // Shell object operation link
            const title = translations.text( "sellObject" );
            html += this.getOperationTag( "sell" , title , '<span class="fa fa-share"></span>' );
        } else if ( this.type === ObjectsTableType.INVENTORY ) {
            const currentSection = state.sectionStates.getSectionState();
            if (this.item.usage && (this.item.usage.cls !== Item.ENDURANCE || !currentSection.someCombatActive() ||
                (this.item.usage.priorCombat && !currentSection.areCombatsStarted() && currentSection.areCombatsPotionsAllowed()))
                && (!this.item.usage.takenWithMeal || state.actionChart.meals > 0 || state.actionChart.hasDiscipline(NewOrderDiscipline.GrandHuntmastery))
                && (!this.item.usage.takenWithLaumspur || state.actionChart.hasObject("laumspurpotion4") || state.actionChart.hasDiscipline(NewOrderDiscipline.Herbmastery))) {
                // Use object operation
                html += this.getUseOperation();
            }

            if ( this.item.isHandToHandWeapon() && state.actionChart.getSelectedWeapon() !== this.item.id ) {
                // Op to set the weapon as current
                const title = translations.text("setCurrentWeapon");
                html += this.getOperationTag( "currentWeapon" , title , '<span class="fa fa-hand-left"></span>' );
            }

            // Prevent dropping the item if it gives bonus backpack slots and we would be over the limit after dropping
            if ( this.item.droppable 
                && (this.item.backpackSlotsBonusEffect === 0 || 
                ( state.actionChart.getNBackpackItems() <= state.actionChart.getMaxBackpackItems() - this.item.backpackSlotsBonusEffect + this.item.itemCount)) ) {
                // Object can be dropped:
                const title = translations.text("dropObject");
                html += this.getOperationTag( "drop" , title , '<span class="fa fa-remove"></span>' );
            }

        }

        if ( html ) {
            // Wrap the operations HTML
            html = '<div class="table-op">' + html + "</div>";
        }

        return html;

    }

    public static restoreFromLink( $link: JQuery<HTMLElement> , tableType: ObjectsTableType ): ObjectsTableItem|null {

        const objectInfo: SectionItem = {
            id : null,
            price : 0,
            currency: CurrencyName.CROWN,
            unlimited : false,
            count : 0,
            useOnSection : false,
            usageCount: 1,
            dessiStoneBonus: false
        };

        objectInfo.id = $link.attr("data-objectId");
        if ( !objectInfo.id ) {
            return null;
        }

        const txtPrice: string|undefined = $link.attr("data-price");
        if ( txtPrice ) {
            objectInfo.price = parseInt( txtPrice, 10 );
        }

        const txtCurrency: string|undefined = $link.attr("data-currency");
        if ( txtCurrency ) {
            objectInfo.currency = txtCurrency;
        }

        if ( $link.attr( "data-unlimited" ) === "true" ) {
            objectInfo.unlimited = true;
        }

        const txtCount: string|undefined = $link.attr("data-count");
        if ( txtCount ) {
            objectInfo.count = parseInt( txtCount, 10 );
        }

        if ( $link.attr( "data-useonsection" ) === "true" ) {
            objectInfo.useOnSection = true;
        }

        const txtUsageCount = $link.attr("data-usagecount");
        if (txtUsageCount) {
            objectInfo.usageCount = parseInt(txtUsageCount, 10);
        }

        let index = -1;
        const txtIndex = $link.attr("data-index");
        if (txtIndex) {
            index = parseInt(txtIndex, 10);
        }

        return new ObjectsTableItem( objectInfo , tableType, index);
    }

    ///////////////////////////////////////////////////////////////////////
    // OPERATIONS
    ///////////////////////////////////////////////////////////////////////

    public runOperation( op: string ) {
        if ( !this[op] ) {
            throw "Unknown operation: " + op ;
        } else {
            this[op]();
        }
    }

    /** Pick / buy object operation */
    private get() {

        // Special case. On kai monastery, ask the money amount to pick
        if ( (this.objectInfo.id === Item.MONEY ) && routing.getControllerName() === kaimonasteryController.NAME ) {
            MoneyDialog.show(false, this.objectInfo.currency);
            return;
        }

        // Check if it's a buy
        if ( this.objectInfo.price ) {
            // If the currency is not in Crowns, we assume the seller only accepts the specific currency
            if (this.objectInfo.currency !== CurrencyName.CROWN) {
                if ( state.actionChart.beltPouch[this.objectInfo.currency] < this.objectInfo.price ) {
                    alert( translations.text("noEnoughMoney") );
                    return;
                }
            } else if ( state.actionChart.getBeltPouchUsedAmount() < this.objectInfo.price ) {
                alert( translations.text("noEnoughMoney") );
                return;
            }

            if ( this.item.id === Item.ARROW && state.actionChart.arrows >= state.actionChart.getMaxArrowCount() ) {
                // Don't let spend money on arrows you can't carry
                alert( translations.text("noQuiversEnough") );
                return;
            }

            if ( !confirm( translations.text("confirmBuy", [this.objectInfo.price, translations.text(this.objectInfo.currency)] ) ) ) {
                return;
            }
        }

        let objectPicked: boolean = false;
        if ( this.item.id === Item.MONEY || this.item.id === Item.ARROW ) {
            // Not really an object
            objectPicked = true;
        } else {
            // A count === 0 means one object
            // "Count" for quivers means "count of arrows", not "count of quivers"
            let nItems = this.objectInfo.count;
            if ( !nItems || this.item.id === Item.QUIVER || this.item.id === Item.LARGE_QUIVER ) {
                nItems = 1;
            }

            for (let i = 0; i < nItems; i++) {
                 if ( actionChartController.pickFromUi( this.objectInfo ) ) {
                    objectPicked = true;
                 }
            }
        }

        if ( objectPicked ) {
            let countPicked = this.objectInfo.count;

            if ( this.item.id === Item.QUIVER || this.item.id === Item.LARGE_QUIVER || this.item.id === Item.ARROW ) {
                // Allow refilling of arrows if unlimited supply
                if (this.objectInfo.unlimited && this.objectInfo.price === 0) {
                    countPicked = 100;
                }
                // Increase the number of arrows on the action chart
                const realIncrement = actionChartController.increaseArrows( countPicked );
                if ( this.item.id === Item.ARROW ) {
                    // Track real number of arrows picked
                    countPicked = realIncrement;
                }
            }

            if ( this.item.id === Item.MONEY ) {
                // Pick the money
                countPicked = actionChartController.increaseMoney( this.objectInfo.count, false, false, this.objectInfo.currency );
            }

            if ( !this.objectInfo.unlimited ) {
                // Remove it from the available objects on the section
                const sectionState = state.sectionStates.getSectionState();
                sectionState.removeObjectFromSection(this.item.id, this.objectInfo.price, countPicked, this.index);
            }

            if ( this.objectInfo.price ) {
                if (this.objectInfo.currency) {
                    actionChartController.increaseMoney( -this.objectInfo.price, false, false, this.objectInfo.currency );
                } else {
                    // Pay the price
                    actionChartController.increaseMoney( -this.objectInfo.price );
                }
            }

            // Refresh the table of available objects
            mechanicsEngine.fireInventoryEvents(true, this.item);
        }

        template.addSectionReadyMarker();
    }

    /** Sell object operation */
    private sell() {
        const sellString = translations.text( "confirmSell" , [ this.objectInfo.price, translations.text(this.objectInfo.currency) ] );

        if ( !confirm( sellString ) ) {
            return;
        }

        if ( this.item.id === Item.ARROW && this.objectInfo.count > 0 ) {
            // Drop arrows
            actionChartController.increaseArrows( -this.objectInfo.count );
        } else {
            actionChartController.drop( this.item.id , false , true );
        }
        actionChartController.increaseMoney( this.objectInfo.price, false, false, this.objectInfo.currency );

        const sectionState = state.sectionStates.getSectionState();
        sectionState.soldObject = true;

        mechanicsEngine.fireInventoryEvents(true, this.item);
    }

    /** Use object operation */
    private use() {

        if ( !confirm( translations.text( "confirmUse" , [this.item?.name] ) ) ) {
            return;
        }

        // Use the object
        const dropObject = ( this.type === ObjectsTableType.INVENTORY );
        actionChartController.use(this.item.id, dropObject, this.index);

        // If the object was used from the section, decrease its usageCount in section
        if ( this.type === ObjectsTableType.AVAILABLE && !this.objectInfo.unlimited ) {
            const sectionState = state.sectionStates.getSectionState();
            const sectionObject = sectionState.objects[this.index];
            // Be sure is not null
            if (!sectionObject.usageCount) {
                sectionObject.usageCount = 0;
            }
            sectionObject.usageCount--;
            if (sectionObject.usageCount <= 0) {
                sectionState.removeObjectFromSection(this.item.id , this.objectInfo.price);
            }
            // Refresh the table of available objects
            mechanicsEngine.fireInventoryEvents(true, this.item);
        }
    }

    private drop() {
        if ( confirm( translations.text( "confirmDrop" , [this.item.name] ) ) ) {
            actionChartController.drop( this.item.id , true , true , this.objectInfo.count , this.index );
        }
    }

    private currentWeapon() {
        // Set the active weapon
        actionChartController.setSelectedWeapon( this.item.id );
    }

    private details() {
        // Show details
        template.showObjectDetails( this.item );
    }

}
