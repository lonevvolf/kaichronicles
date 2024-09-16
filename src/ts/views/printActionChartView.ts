import { state, BookSeriesId, translations, gameController } from "..";
const actionChartMap = require('../../data/actionChartMap.json');
import pdfLib from "pdf-lib";

/**
 * The print action chart view API
 */
export const printActionChartView = {
  async setup() {
    const pdfLib = (await import ('pdf-lib'));
    const rgb = pdfLib.rgb;

    const bookSeries = state.book.getBookSeries();

    const url = `/images/action-charts/${BookSeriesId[bookSeries.id]}.pdf`;
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    const pdfDoc = await pdfLib.PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    const actionChart = state.actionChart;

    // Load position mappings
    const bookMappings = actionChartMap[BookSeriesId[bookSeries.id]];

    // Print Disciplines
    const bookDisciplines = state.book.getDisciplinesTable();
    const disciplines = actionChart.getDisciplines();
    let mappingsField = bookMappings.discipline;

    if (mappingsField) {
      for (let i = 0; i < disciplines.length; i++) {
        let discipline = disciplines[i];
        let name = bookDisciplines[discipline].name;

        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          name,
          mappingsField.x,
          mappingsField.y - (i * mappingsField.height),
          mappingsField.fontSize ?? 10,
          helveticaFont);
      }
    }

    // Print Backpack Items
    const backpackItems = actionChart.backpackItems;
    mappingsField = bookMappings.backpackItem;

    if (mappingsField) {
      for (let i = 0; i < Math.min(backpackItems.length, 10); i++) {
        let item = backpackItems[i];
        let name = item.getItem().name + " - " + item.getItem().description.trim().substring(0, 20);

        // Meals are counted in their own section
        if (item.id !== 'meal') {
          pages[mappingsField.page - 1].drawText(name, {
            x: mappingsField.x,
            y: mappingsField.y - (i * mappingsField.height),
            size: mappingsField.fontSize ?? 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
      }
    }

    // Print meals
    let mealsCount = actionChart.meals;
    mappingsField = bookMappings.meals;
    if (mappingsField) {
      pages[mappingsField.page - 1].drawText(mealsCount.toFixed(), {
        x: mappingsField.x,
        y: mappingsField.y,
        size: 30,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }

    // Print Combat Skill
    let combatSkill = actionChart.combatSkill.toFixed();
    mappingsField = bookMappings.combatSkill;

    if (mappingsField) {
      pages[mappingsField.page - 1].drawText(combatSkill, {
        x: mappingsField.x,
        y: mappingsField.y,
        size: 30,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }


    // Print Endurance
    let currentEndurance = actionChart.currentEndurance.toFixed();
    let maxEndurance = actionChart.getMaxEndurance().toFixed();
    mappingsField = bookMappings.endurance;

    if (mappingsField) {
      pages[mappingsField.page - 1].drawText(currentEndurance + " / " + maxEndurance, {
        x: mappingsField.x,
        y: mappingsField.y,
        size: 30,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }

    // Print Belt Pouch
    mappingsField = bookMappings.beltPouch;
    if (mappingsField) {
      const beltPouch = actionChart.beltPouch;
      let currenciesCount = 0;
      for (const currency in beltPouch) {
        if (beltPouch[currency] > 0 || currency === "crown") {
          currenciesCount++;
        }
      }

      let height = Math.min(50 / currenciesCount, 10);
      let itemToPrint = 0;
      for (const currency in beltPouch) {
        if (beltPouch[currency] > 0 || currency === "crown") {
          pages[mappingsField.page - 1].drawText(`${translations.text(currency)}: ${beltPouch[currency]}`, {
            x: mappingsField.x,
            y: mappingsField.y - (height * itemToPrint),
            size: 8,
            //lineHeight: height,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });

          itemToPrint++;
        }
      }
    }

    // Print Special Items
    const specialItems = actionChart.specialItems;
    mappingsField = bookMappings.specialItem;

    if (mappingsField) {
      for (let i = 0; i < specialItems.length; i++) {
        let item = specialItems[i];
        let name = item.getItem().name;

        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          name,
          mappingsField.x,
          mappingsField.y - (i * mappingsField.height),
          8,
          helveticaFont
        );

        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          item.getItem().combatSkillEffect
            ? `+${item.getItem().combatSkillEffect} CS`
            : item.getItem().enduranceEffect
              ? `+${item.getItem().enduranceEffect} EP`
              : item.getItem().description.trim().substring(0, 40),
          mappingsField.x + 160,
          mappingsField.y - (i * mappingsField.height),
          8,
          helveticaFont
        );
      }
    }

    // Print Weaponmastery
    mappingsField = bookMappings.weaponmastery;

    if (mappingsField) {
      if (actionChart.hasWeaponskillWith("dagger")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x,
          mappingsField.y,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("spear")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x + 173,
          mappingsField.y,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("mace")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x,
          mappingsField.y - 25,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("shortsword")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x + 173,
          mappingsField.y - 25,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("warhammer")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x,
          mappingsField.y - 50,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("bow")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x + 173,
          mappingsField.y - 50,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("axe")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x,
          mappingsField.y - 75,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("sword")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x + 173,
          mappingsField.y - 75,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("quarterstaff")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x,
          mappingsField.y - 100,
          20,
          helveticaFont
        );
      }
      if (actionChart.hasWeaponskillWith("broadsword")) {
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          "X",
          mappingsField.x + 173,
          mappingsField.y - 100,
          20,
          helveticaFont
        );
      }
    }

    // Print Weapons
    const weapons = actionChart.weapons;
    mappingsField = bookMappings.weapon;

    if (mappingsField) {
      for (let i = 0; i < weapons.length; i++) {
        let item = weapons[i];
        let name = item.getItem().name;

        pages[mappingsField.page - 1].drawText(name, {
          x: mappingsField.x,
          y: mappingsField.y - (i * mappingsField.height),
          size: 15,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    // Print Book Name
    mappingsField = bookMappings.bookName;
    const title = state.book.getBookTitle();

    if (mappingsField) {
      pages[mappingsField.page - 1].drawText(title, {
        x: mappingsField.x,
        y: mappingsField.y,
        size: 30,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }

    // Print Kai Level
    mappingsField = bookMappings.kaiLevel;
    if (mappingsField) {
      const kaiTitle = state.book.getKaiTitle(actionChart.getDisciplines().length);

      pages[mappingsField.page - 1].drawText(kaiTitle, {
        x: mappingsField.x,
        y: mappingsField.y,
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }

    // Print current section
    mappingsField = bookMappings.currentSection;

    if (mappingsField) {
      const sectionNumber = gameController.currentSection.getSectionNumber();
      if (sectionNumber) {
        const currentSection = gameController.currentSection.getSectionNumber().toFixed();
        pages[mappingsField.page - 1].drawText(currentSection, {
          x: mappingsField.x,
          y: mappingsField.y,
          size: 20,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    // Print Kai Weapon
    mappingsField = bookMappings.kaiWeaponName;
    if (mappingsField) {
      if (actionChart.getKaiWeapon()) {
        const kaiWeapon = state.mechanics.getObject(actionChart.getKaiWeapon());
        const kaiWeaponAC = actionChart.getActionChartItem(actionChart.getKaiWeapon());

        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          kaiWeapon.name,
          mappingsField.x,
          mappingsField.y,
          15,
          helveticaFont
        );

        mappingsField = bookMappings.kaiWeaponType;
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          state.mechanics.getObject(kaiWeapon.weaponType).name,
          mappingsField.x,
          mappingsField.y,
          15,
          helveticaFont
        );

        mappingsField = bookMappings.kaiWeaponBonus;
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          `+${kaiWeapon.combatSkillEffect + kaiWeaponAC.damage} CS`,
          mappingsField.x,
          mappingsField.y,
          15,
          helveticaFont
        )

        mappingsField = bookMappings.kaiWeaponProperties;
        printActionChartView.printField(
          pages,
          mappingsField.page - 1,
          kaiWeapon.description,
          mappingsField.x,
          mappingsField.y,
          10,
          helveticaFont
        );
      }
    }

    // Print Arrows
    mappingsField = bookMappings.arrows;
    if (mappingsField) {
      printActionChartView.printField(
        pages,
        mappingsField.page - 1,
        actionChart.arrows.toFixed(),
        mappingsField.x,
        mappingsField.y,
        15,
        helveticaFont
      );
    }

    // Print Quiver
    mappingsField = bookMappings.quiver;
    if (mappingsField) {
      printActionChartView.printField(
        pages,
        mappingsField.page - 1,
        (actionChart.getMaxArrowCount() / 6).toFixed(),
        mappingsField.x,
        mappingsField.y,
        15,
        helveticaFont
      );
    }

    const base64 = await pdfDoc.saveAsBase64();
    const blob = printActionChartView.b64toBlob(base64, 'application/pdf');
    const blobUrl = URL.createObjectURL(blob);

    (<HTMLObjectElement>document.getElementById('pdf')).data = blobUrl;
  },

  /**
   * Prints a field on the PDF
   * @param pages The PDF document pages array
   * @param pageNumber The page number of the element
   * @param text The text to display
   * @param x The x position of the element
   * @param y The y position of the element
   * @param size The font size
   * @param font The font
   */
  printField(pages: pdfLib.PDFPage[], pageNumber: number, text: string, x: number, y: number, size: number, font: pdfLib.PDFFont) {
    import("pdf-lib").then((pdfLib) => {
      pages[pageNumber].drawText(text, {
        x: x,
        y: y,
        size: size,
        font: font,
        color: pdfLib.rgb(0, 0, 0),
      });
    });
  },

  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}