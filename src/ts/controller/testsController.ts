import { views, BookValidator, setupController, state, Section, SectionRenderer, randomTable, projectAon, mechanicsEngine } from "..";
import striptags from 'striptags';

/**
 * Application tests
 */
// tslint:disable-next-line: class-name
export class testsController {

    public static index() {

        return views.loadView("tests.html")
            .then(() => {
                // Load XSD for XML validation
                return BookValidator.downloadXsd();
            })
            .then(() => {
                // View setup
                testsController.setup();
            });
    }

    /**
     * Setup view
     */
    private static setup() {
        $("#tests-random").on("click", (e: JQuery.Event) => {
            e.preventDefault();
            testsController.testRandomTable();
        });
        $("#tests-rendering").on("click", (e: JQuery.Event) => {
            e.preventDefault();
            testsController.testRendering();
        });
        $("#tests-bookmechanics").on("click", (e: JQuery.Event) => {
            e.preventDefault();
            testsController.testCurrentBookMechanics();
        });
        $("#tests-allbooks").on("click", (e: JQuery.Event) => {
            e.preventDefault();
            testsController.testAllBooks();
        });

    }

    /**
     * Test new tags with no render function
     */
    private static testRendering() {

        testsController.clearLog();

        if (!setupController.checkBook()) {
            testsController.addError("No book loaded yet (Finished");
            return;
        }

        const count = state.mechanics.getSectionsCount();
        testsController.addLog(`Testing sections render (${count})`);
        for (let i = 1; i < count; i++) {
            try {
                const section = new Section(state.book, `sect${i}`, state.mechanics);
                const renderer = new SectionRenderer(section);
                renderer.renderSection();
            } catch (e) {
                testsController.addError("Section " + i.toFixed() + " error: " + e, e);
            }
        }
        testsController.addLog("Finished (errors are displayed here, see Dev. Tools console for warnings)");
    }

    /**
     * Test random table ramdomness
     */
    private static testRandomTable() {

        testsController.clearLog();

        if (!setupController.checkBook()) {
            testsController.addError("No book loaded yet (Finished)");
            return;
        }

        // Test implemented random table
        let count: number[] = [];
        for (let i = 0; i < 10; i++) {
            count[i] = 0;
        }
        const total = 1000000;
        for (let i = 0; i < total; i++) {
            count[randomTable.getRandomValue()]++;
        }
        console.log(`Randomness test (${total} random table hits)`);
        for (let i = 0; i < 10; i++) {
            testsController.addLog(`${i}: ${count[i]} hits (${(count[i] / total) * 100.0} %)`);
        }

        // Test randomness of the book random table:
        count = [];
        for (let i = 0; i < 10; i++) {
            count[i] = 0;
        }
        const bookRandomTable = state.book.getRandomTable();
        for (const num of bookRandomTable) {
            count[num]++;
        }

        console.log("Book random table:");
        for (let i = 0; i < 10; i++) {
            testsController.addLog(`${i}: ${count[i]} (${(count[i] / bookRandomTable.length) * 100.0} %)`);
        }
    }

    private static testCurrentBookMechanics() {
        testsController.clearLog();
        const validator = new BookValidator(state.mechanics, state.book);
        testsController.testBook(validator);
        testsController.addLog("Finished");
    }

    private static testBook( validator: BookValidator ) {
        validator.validateBook();
        const title = `Book ${validator.book.bookNumber}`;
        if (validator.errors.length === 0) {
            testsController.addLog(title + " OK!");
        } else {
            testsController.addLog(title + " with errors:");
        }
        for (const error of validator.errors) {
            testsController.addError(error);
        }

        // Separator
        testsController.addLog("");
    }

    private static downloadAndTestBook( bookNumber: number ) {

        BookValidator.downloadBookAndGetValidator(bookNumber)
            .then((validator: BookValidator) => {

                testsController.testBook(validator);

                // Move to the next book:
                const nextBookNumber = validator.book.bookNumber + 1;
                if (nextBookNumber > projectAon.supportedBooks.length) {
                    testsController.addLog("Finished");
                    return;
                }

                testsController.downloadAndTestBook(nextBookNumber);
            }, null);
    }

    private static testAllBooks() {
        testsController.clearLog();
        testsController.downloadAndTestBook(1);
    }

    private static clearLog() {
        $("#tests-log").empty();
    }

    private static addLog( textLine: string ) {
        $("#tests-log").append(striptags(textLine) + "</br>");
    }

    private static addError( textLine: string , exception: any = null ) {
        testsController.addLog("ERROR: " + textLine);
        if (exception) {
            mechanicsEngine.debugWarning(exception);
        }
    }

    /** Return page */
    public static getBackController(): string { return "game"; }

}
