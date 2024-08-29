# Objects

This a brief of the objects descriptions. They are stored at objects.xml file. 
General struture:

```xml
<object-mechanics>
    <weapons>
        <!-- Here goes weapons descriptions -->
        <weapon>...</weapon>
        <weapon>...</weapon>
    </weapons>

    <specials>
        <!-- Here goes special items descriptions -->
        <special>...</special>
        <special>...</special>
    </specials>

    <objects>
        <!-- Here goes objects descriptions -->
        <object>...</object>
        <object>...</object>
    </objects>

</object-mechanics>
```

## Common tags and properties

There are tags / properties common to weapons, special items and objects:

### "id" property
```xml
<weapon id="axe">...</weapon>
```
Mandatory. The object identifier

### "name" tag 
```xml
<weapon id="axe">
    <name>Axe</name>
    ...
</weapon>
```
The object name.

### "description" tag
```xml
<special id="helmet">
    <description>This adds 2 ENDURANCE points to your total.</description>
    ...
</special>
```
Optional. A extended description for the object

### "extraDescription" tag
```xml
<special id="sommerswerd" weaponType="sword|broadsword|shortsword" >
    <name>Sommerswerd</name>
    <description>
        When used in combat, the Sommerswerd will add 8 points to your COMBAT SKILL 
        (+ Weaponskill with swords).
    </description>
    <extraDescription>
        It has the ability to absorb any magic that is used against its bearer, and it doubles 
        the total of all ENDURANCE points lost by undead enemies in combat
    </extraDescription>
    ...
</special>
```
Optional. A more extended description for the object

### "image" tag
```xml
<weapon id="broadsword">
    <image book="1|9" name="bsword.png" />
    ...
</weapon>
```
Optional. It references to some book image for the object. The image should be at /www/data/projectAon/[BOOKNUMBER]/ill_en/[IMAGENAME]. If object image was drawed by different illustrators (Chalk / Williams), different books versions should be separated by a "|" character

### "droppable" property
```xml
<special id="baknaroil" droppable="false">
    <name>Baknar Oil on your skin</name>
    ...
</special>
```
Optional. If it's false, the player cannot drop the object

### "effect" tag
```xml
<special id="helmet">
    <name>Helmet</name>
    <description>This adds 2 ENDURANCE points to your total.</description>
    <effect class="endurance" increment="2" />
    ...
</special>
```
Optional. If it's set, the object has some effect when it's carried:
* **"class" property**: It says what is the effect of the object:
    * "endurance": The endurance will be increased
    * "combatSkill": The combat skill will be increased
    * "backpackSlots": The number of backpack slots will be increased
* **"increment" property**: Amount to increment

### "incompatibleWith" property
```xml
<special id="chainmail" incompatibleWith="chainmail|broninvest">
    ...
</special>
```
Optional. If it's set, the player cannot pick the object if it already has some of the incompatible objects

## Weapons

There are standard weapons on books 1-5: axe, dagger, sword, etc. Also, there are weapons based on these standard weapons, but they must to be differentiated. In this case, set the property "weaponType" to set the class of standard weapon (used for Weapon Skill discipline). If it can be more than one, each class is separated with a "|" character:

```xml
<!-- This is a standard weapon -->
<weapon id="sword">
    <name>Sword</name>
    <image book="1" name="sword.png" />
</weapon>

<!-- This is a non-standard weapon, based on a standard weapon-->
<weapon id="bonesword" weaponType="sword">
    <name>Bone Sword</name>
    <image book="3" name="sword.png" />
</weapon>
```

### "weaponType" property
```xml
<special id="sommerswerd" weaponType="sword|broadsword|shortsword" >
    <name>Sommerswerd</name>
    ...
</special>
```
If it's set, the object can be used as a weapon. In the property value is set the class of weapon as it can be used. If it can be more than one, each class is separated with a "|" character.

## Objects and Special Items

They can have some optional tags / properties:

### "usage" tag
```xml
<object id="healingpotion">
    <name>Healing Potion</name>
    <description>
        This can restore 4 ENDURANCE points to your total, when swallowed after combat. 
        You only have enough for one dose.
    </description>
    ...
    <usage class="endurance" increment="4" />
</object>
```

If it's set, the player can "use" the object, and then it will be dropped from the inventory if necessary. 

* **"class" property**: It says what is the effect of the object:
    * "endurance": The endurance will be increased
    * "combatSkill": The combat skill will be increased. This will apply only for the 
      current section
    * "special": Objects with complex behavior. They are implemented on SpecialObjectsUse class, at specialObjectsUse.ts
* **"increment" property**: Amount to increment
* **"priorCombat" property**: If true and class is endurance, than can be used prior a combat (false by default)
* **"takenWithMeal" property**: If true, it can only be used if the player has a meal or Grand Huntmastery (meal will be consumed)
* **"takenWithLaumspur" property**: If true, it can only be used if the player has a Laumspur potion or Herbmastery (potion will be consumed)

### "isMeal" property
If true, the object can be eaten as a Meal.

### "usageCount" property
If it's set, specify how many times the item can be used (1 by default).

### "itemCount" property
If it's set, specify how many slots the item takes (1 by default, can be >= 0).

### "isArrow" property (Special item only)
If true, the object is an Arrow, and it occupies an slot on a Quiver as a normal Arrow.
