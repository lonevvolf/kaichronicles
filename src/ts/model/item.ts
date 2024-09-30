import { Book, translations, mechanicsEngine, Section, state } from "..";

/**
 * Item effect / usage description
 */
export interface ItemEffect {

    /** Combat.COMBATSKILL for combat skill increment. Item.ENDURANCE for endurance points increment. */
    cls: string|undefined;

    /** Attribute increment */
    increment: number;

    /** Endurance only. True if can be used prior a combat. */
    priorCombat: boolean;

    /** Usage requires and consumes meal */
    takenWithMeal: boolean;
 
    /** Usage requires and consumes meal */
    takenWithLaumspur: boolean;
}

/**
 * Game object information
 */
export class Item {

    // Item effect classes (see ItemEffect interface)
    public static readonly COMBATSKILL = "combatSkill";
    public static readonly ENDURANCE = "endurance";
    public static readonly BACKPACKSLOTS = "backpackSlots";
    public static readonly ENEMYCOMBATSKILL = "enemyCombatSkill";

    // Object types
    /** Special item type */
    public static readonly SPECIAL = "special";
    /** Backpack item type */
    public static readonly OBJECT = "object";
    /** Weapon item type */
    public static readonly WEAPON = "weapon";

    // Object ids
    public static readonly MONEY = "money";
    public static readonly QUIVER = "quiver";
    public static readonly LARGE_QUIVER = "quiver29";
    public static readonly ARROW = "arrow";
    public static readonly FIRESEED = "fireseed";
    public static readonly MAP = "map";
    public static readonly BOW = "bow";
    public static readonly MEAL = "meal";
    public static readonly BACKPACK = "backpack";
    public static readonly HELSHEZAG = "helshezag";
    public static readonly ANSENGS_KIRUSAMI = "ansengskirusami";
    public static readonly ANSENGS_KIRUSAMI_ENHANCED = "ansengskirusamienhanced";

    /** Allowed Special Items to carry to Grand Master from previous series */
    public static readonly ALLOWED_GRAND_MASTER = ["crystalstar", "sommerswerd", "silverhelm", "daggerofvashna", "silverbracers", "jewelledmace",
        "silverbowduadon", "helshezag", "kagonitechainmail", "korliniumscabbard"];

    /** The object type (Item.SPECIAL, Item.OBJECT or Item.WEAPON) */
    public type: string;

    /** The object id */
    public id: string;

    /** The translated object name */
    public name: string;

    /** True if the object is a meal */
    public isMeal: boolean;

    /** True if the object is an Arrow */
    public isArrow: boolean;

    /** True if the object can be dropped */
    public droppable: boolean;

    /**
     * Number of items the object it occupies on the backpack.
     * It can be zero. It can be decimal (ex. 0.5)
     * It's used too for the Special Items max. limit
     */
    public itemCount: number;

    /** The translated object description */
    public description: string;

    /**
     * Translated extra description.
     * It's optional (can be null)
     */
    public extraDescription: string|null = null;

    /**
     * The weapon type. Only for special and object types. It is the kind of weapon.
     * If it can be handled as more than one weapon type, separate the with a '|'.
     * Ex. 'sword|shortsword'
     */
    public weaponType: string|undefined;

    /** Object image URL, untranslated. null if the object has no image. */
    private imageUrl: string;

    /**
     * The book number that contains the image (1-index based).
     */
    private imageBookNumber: number;

    /**
     * Combat skill increment.
     * If it's a weapon, only when it's the current weapon. Otherwise, when the player carry the object
     */
    public combatSkillEffect: number = 0;

    /** Endurance increment when the player carry the object */
    public enduranceEffect: number = 0;

    /** Number of extra backpack slots */
    public backpackSlotsBonusEffect: number = 0;

    /** Combat Skill increment TO ENEMY */
    public enemyCombatSkillEffect?: number;
    
    /** Usage effect */
    public usage: ItemEffect;

    /**
     * Number of allowed uses of the item.
     * After this number of uses, it will be dropped. Only applies if usage is not null.
     */
    public usageCount: number;

    /** Object ids that cannot be carried at same time with this object.
     * Empty array if there are no incompatibilities
     */
    public incompatibleWith: string[] = [];

    /**
     * True if the weapon is affected by Sun Lord Grand Weaponmastery bonus
     */
    public grdWpnmstryBonus: boolean|null = true;

    /**
     * Game object information
     * @param book The owner book
     * @param $o The XML tag with the object info
     * @param objectId The object identifier
     */
    constructor(book: Book|null, $o: JQuery<Element>, objectId: string) {

        /** The object type ('special', 'object' or 'weapon' ) */
        this.type = $o.prop("tagName");
        /** The object id */
        this.id = objectId;

        // The translated object name
        this.name = $o.find("name").text()

        // True if the object is a meal
        this.isMeal = $o.attr("isMeal") === "true";

        // True if the object is an Arrow
        this.isArrow = $o.attr("isArrow") === "true";

        /** True if the object can be dropped */
        this.droppable = $o.attr("droppable") !== "false";

        /** Number of items the object it occupies on the backpack */
        const txtItemCount: string|undefined = $o.attr("itemCount");
        this.itemCount = txtItemCount ? parseFloat(txtItemCount) : 1;
        if(this.itemCount < 0) {
            // Cannot be negative
            this.itemCount = 0;
        }

        /** Number of usage of the object */
        const txtUsageCount: string|undefined = $o.attr("usageCount");
        this.usageCount = txtUsageCount ? parseInt(txtUsageCount, 10) : 1;
        if(this.usageCount <= 0) {
            // Cannot be negative or zero
            this.usageCount = 1;
        }

        // The translated object description
        this.description = $o.find("description").text()

        // If it's the map, add description from the book:
        if (objectId === Item.MAP) {
            this.assignMapDescription(book);
        }

        if (this.itemCount !== 1) {
            // Add description of the size used
            if (this.description) {
                this.description += " ";
            }
            this.description += translations.text("countAsObjects", [this.itemCount]);
        }

        // Extra description
        this.extraDescription = $o.find("extraDescription").text();

        /**
         * The weapon type. Only for special and object types. It is the kind of weapon.
         * If it can be handled as more than one weapon type, separate the with a '|'.
         * Ex. 'sword|shortsword'
         */
        this.weaponType = $o.attr("weaponType");

        // Object image
        this.loadImageInfo($o);

        // Usage (only one use, and then the object is dropped)
        const $usage = $o.find("usage");
        if ($usage.length > 0) {
            this.usage = {
                cls: $usage.attr("class"),
                increment: Number($usage.attr("increment")),
                priorCombat: $usage.attr("priorCombat") === "true",
                takenWithMeal: $usage.attr("takenWithMeal") === "true",
                takenWithLaumspur: $usage.attr("takenWithLaumspur") === "true",
            };
        }

        // Effects (when the player carry the object)
        const $effects = $o.find("effect");
        for (const effect of $effects.toArray()) {
            const $effect = $(effect);
            const increment = Number($effect.attr("increment"));
            const cls: string|undefined = $effect.attr("class");
            if (cls === Item.COMBATSKILL) {
                this.combatSkillEffect = increment;
            } else if (cls === Item.ENDURANCE) {
                this.enduranceEffect = increment;
            } else if (cls === Item.BACKPACKSLOTS) {
                this.backpackSlotsBonusEffect = increment;
            } else if (cls == Item.ENEMYCOMBATSKILL) {
                this.enemyCombatSkillEffect = increment;
            } else {
                mechanicsEngine.debugWarning("Object " + this.id + ", wrong class effect: " + cls);
            }
        }

        // Incompatibilities
        this.incompatibleWith = mechanicsEngine.getArrayProperty($o, "incompatibleWith");

        // Grand Weaponmastery Bonus
        this.grdWpnmstryBonus = mechanicsEngine.getBooleanProperty($o, "grdWpnmstryBonus", true);
    }

    private assignMapDescription(book: Book|null) {
        // Exception with book 11: The "map" section refers to "Northern Magnamund", no the real map at sect233
        if (book.bookNumber === 11) {
            return;
        }

        const mapSection = new Section(book, Book.MAP_SECTION, null);
        if (mapSection.exists()) {
            this.description = mapSection.getTitleText();
        }
    }

    /** Returns true if the object is a weapon */
    public isWeapon(): boolean {
        if (this.weaponType) {
            return true;
        }
        return this.type === "weapon";
    }

    /**
     * Returns true if the object is a weapon of a given type
     * @param  weaponType The weapon type to check
     * @return True if the object is a weapon of the given type
     */
    public isWeaponType(weaponType: string): boolean {
        return this.id === weaponType || (this.weaponType && this.weaponType.split("|").includes(weaponType));
    }

    /** Returns true if this is a hand-to-hand weapon (not a bow) */
    public isHandToHandWeapon(): boolean {
        return this.isWeapon() && !this.isWeaponType("bow");
    }

    /**
     * Get the object image URL.
     * @return The object image URL. null if the object has no image or we are
     * running the Cordova app and the book for the image is not downloaded
     */
    public getImageUrl(): string|null {

        if (!this.imageUrl) {
            return null;
        }

        return this.imageUrl;
    }

    /**
     * Get information about the image
     * @param {jQuery} $o XML node for object
     */
    private loadImageInfo($o: JQuery<Element>) {
        const $image = $o.find("image");
        if ($image.length === 0) {
            return;
        }

        // Get the book number:
        const candidateBookNumbers: number[] = [];
        const txtBook: string|undefined = $image.attr("book");
        for (const txtBookNumber of txtBook.split("|")) {
            candidateBookNumbers.push(parseInt(txtBookNumber, 10));
        }
        if (candidateBookNumbers.length === 0) {
            return;
        }
        candidateBookNumbers.sort();

        // Default to the first one
        this.imageBookNumber = candidateBookNumbers[0];

        if (candidateBookNumbers.length > 1) {
            // Choose the last played (or playing) book.
            for (let i = candidateBookNumbers.length - 1; i >= 0; i--) {
                if (state.book.bookNumber >= candidateBookNumbers[i]) {
                    this.imageBookNumber = candidateBookNumbers[i];
                    break;
                }
            }
        }

        const imageBook = new Book(this.imageBookNumber);
        this.imageUrl = imageBook.getIllustrationURL($image.attr("name"));
    }
}
