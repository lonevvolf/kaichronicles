
TODO
====

## Gameplay

- Replace list of items with available object list ??
- Get Magnakai bonuses as specified in the handbook (See Healing for example)
- Get Kai/Magnakai bonuses as specified in the handbook (See Healing for example)
  * https://github.com/tonib/kaichronicles/issues/5
  * https://www.projectaon.org/es/foro3/viewtopic.php?p=27752#p27752
- Book 9, sect189: We should keep the count of the different currencies (Lunes, Gold Crows,...). Also on:
  * book 12, sect43
  * book 12, sect61
- At new game, ask for the random table type
- An extension of the above, consider saving a snapshot of the action chart when starting a book in section 1. Then add that option to restart the book at section 1 if you die. That way, you don't have to go through and re-do Disciplines and equipment. Keep the option to completely restart the book, though, in case you want to pick different Disciplines or equipment options
- Add a "random discipline" button that will randomly select the proper number of initial disciplines, as well as your bonus discipline each book from the choices remaining
- Add a Seventh-Sense-like achievement system
- "Restart book" (at Settings / book death): Add the book number you will restart (ex. "Restart book 9"). On confirmation, explain
  you will restart with your previous book Action Chart status
- Book 15, sect25: Find a way to save if book 10, sect148 was read
- Allow to put/restore money at kai monestry when amount > 50 on equipmnt screen
- Allow to add desc text in random number table (eg. for kai-blast)

## Bugs

- Bugs reported on Google Play:
  * Finally, finally there's a proper LW game book app. The only problem I've noticed is that it only gives Silver Bow's bonus in the sections of book 6 that specifically mention it, and not at all 'rolls' as it is supposed to.
- Save games is not working on Safari
- You are erroneously allowed to apply multiple Alether effects per combat. You are always limited to one (the berries you can purchase in book 6 even explicitly say so).
- You are erroneously allowed to use healing items (Laumspur, etc.) in combat sections before combat has started. Healing items are only to be used in combat sections after combat is over (and if you're still alive and not evading combat).
- Action chart buttons don't work on iPad Safari

- ERROR: Book 8, sect139: 
  ```actionChartController.pick('quiver'); actionChartController.pick('quiver'); actionChartController.increaseArrows(10);```
  Sell Quiver: OBJECTS TABLE TO SELL IS NOT UPDATED !!!!

## Development / refactorings (TO DO NOW)
- Check older savegames with usageCount = undefined in section states, action chart and InventoryState
  Check also savegames from v1.6 (changes for this in ActionChart.fromObject())
- Test load previous savegame / state versions to v1.12 !!!
- In Grand Master books, if you have Psi-surge, check the bonus for Mindblast
- IMPROVE TESTING
- Book 13, sect4, dark mode, sword object: Add margin to right of object images
- Change documentation about save games file format (changes in 1.12)
- Check if the "edit-config" tag in config.xml can be configured for debug build only
- Loyalty bonus for hunting should be applied to Grand Master too?

## Books erratas to report
- All book 13: Bow bonus should be +5 ???
## Other
- Allow to zoom illustrations?
- Add images to disciplines in Action Chart
- Add option to jump from one book to other (debugging, loyalty bonuses)
- FAQ: Add info about change the Random Table
- Add help for "LW club newsletter 29" setting
- Warn about permanent losses (toastr)
- Object images on book 9+: Use the current book image, if available
- When you cancel a saved games import, it say "error", and it is not
- Performance
- "Okay okay. Didn't know about the lone wolf series and went through the 10 programmed books in 2 days. Turns out the rest are online !!! 
   So it won't be as fast to play but I'm definitely continuing. One remark. I'd like to be able to know what was in the Kai monastery at 
   the end so I can continue with that too !"
- Suggestions and bugs on http://projectaon.proboards.com/post/43740
- Keep version number of current downloaded books, and check for book errata fixes
- On "About the book", display the book number
- Allow to select the current bow
- Toasts with images: align text when the text is multiline
- Combats should be sequential: First finish the first one, then the second, etc
- If the hunting is disabled on the current section, show it on some place (Action Chart?)
- Document all rules
- Common performance (web):
  * Rendering performance on book 2 / sect equimpnt
- Test all books / all sections rendering. It should be valid HTML5
  (https://validator.w3.org/docs/api.html)
- Test tags <ch.* /> replacements
- Dialogs with text input: Allow to confirm with the screen keyboard ("go" button)
- Remove the "Alert" text from the message dialog (same for confirms)
- Allow to change the font size / family
  * See http://www.lalit.org/lab/javascript-css-font-detect/
- Remove links to Lone Wolf Adventures
- Add erratas section?
- Add illustrations index?
- Mechanics: Allow to declare a set of rules that can be runned on multiple sections. See book 12, references to sect208 
  ("Sommerswerd stuff", repeated rules)
- Allow to add a concept description for combat skill modifiers rules on combat ratio explanation
- Display concepts for objects usages (Adgana, etc) on combat ratio explanation
- Display book 11 map ("Northern magnamund") somewhere?
- Add music?


Reminders
=========

* DON'T BE RESTRICTIVE WITH CHOICES !!!!

* JsDoc docs: http://usejsdoc.org/

* Set action chart for Kai series completed
state.actionChart.kaiDisciplines.disciplines = [ KaiDiscipline.Camouflage, KaiDiscipline.Hunting , KaiDiscipline.SixthSense , 
KaiDiscipline.Tracking , KaiDiscipline.Healing , KaiDiscipline.Weaponskill , KaiDiscipline.Mindshield , KaiDiscipline.Mindblast , KaiDiscipline.AnimalKinship ];
state.actionChart.kaiDisciplines.weaponSkill = [ "axe" ];

* Set action chart for Magnakai series completed
state.actionChart.magnakaiDisciplines.disciplines = [ MgnDiscipline.Weaponmastery, MgnDiscipline.AnimalControl, MgnDiscipline.Curing, MgnDiscipline.Invisibility, MgnDiscipline.Huntmastery, MgnDiscipline.Pathsmanship, MgnDiscipline.PsiSurge, MgnDiscipline.PsiScreen, MgnDiscipline.Nexus ];
state.actionChart.kaiDisciplines.weaponSkill = [ "dagger", "spear", "mace", "shortsword", "warhammer", "bow",
        "axe", "sword", "quarterstaff" ];

* Create a default inventory (Magnakai books)
```
kai.actionChartController.drop('all')
kai.actionChartController.pick('backpack')

kai.actionChartController.pick('sword')
kai.actionChartController.pick('bow')

kai.actionChartController.increaseMoney(15)

kai.actionChartController.pick('meal')
kai.actionChartController.pick('meal')

kai.actionChartController.pick('rope')
kai.actionChartController.pick('comb')
kai.actionChartController.pick('brasskey')
kai.actionChartController.pick('whip')
kai.actionChartController.pick('laumspurmeal')
kai.actionChartController.pick('larnumaliqueur2')

kai.actionChartController.pick('sommerswerd')
kai.actionChartController.pick('quiver')
kai.actionChartController.pick('shield')
kai.actionChartController.pick('map')
kai.actionChartController.pick('helmet')
kai.actionChartController.pick('chainmail')
kai.actionChartController.pick('leatherwaistcoat')
kai.actionChartController.pick('daggerofvashna')

kai.actionChartController.increaseArrows(5)
```

* Test book images:
```
state.sectionStates.getSectionState().addObjectToSection('axe')
state.sectionStates.getSectionState().addObjectToSection('dagger')
state.sectionStates.getSectionState().addObjectToSection('sword')
state.sectionStates.getSectionState().addObjectToSection('spear')
state.sectionStates.getSectionState().addObjectToSection('mace')
state.sectionStates.getSectionState().addObjectToSection('shortsword')
state.sectionStates.getSectionState().addObjectToSection('quarterstaff')
state.sectionStates.getSectionState().addObjectToSection('warhammer')
state.sectionStates.getSectionState().addObjectToSection('broadsword')
state.sectionStates.getSectionState().addObjectToSection('bow')
state.sectionStates.getSectionState().addObjectToSection('quiver')
state.sectionStates.getSectionState().addObjectToSection('rope')
state.sectionStates.getSectionState().addObjectToSection('largerope')
state.sectionStates.getSectionState().addObjectToSection('taunorwater')
state.sectionStates.getSectionState().addObjectToSection('meal')
state.sectionStates.getSectionState().addObjectToSection('arrow')
```

* Save tests results to file
No format:
npm run test -- --no-color 2> tests_log.txt

JSON:
npm run test -- --json --outputFile=output.json

* Debug Jest
node --inspect-brk node_modules/.bin/jest --runInBand [any other arguments here]
add "debugger" command to the test to debug
open chrome://inspect/ > Open dedicated DevTools for Node
F8 (resume execution)

