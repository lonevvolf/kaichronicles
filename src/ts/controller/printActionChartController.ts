import { setupController, views, printActionChartView, translations } from "..";

/**
 * The print action chart controller
 */
export class printActionChartController {
    
    public static pdfDoc = null;
    public static pageNum = 1;
    public static pageRendering = false;
    public static pageNumPending = null;

    public static index() {

        if ( !setupController.checkBook() ) {
            return;
        }

        document.title = translations.text("printActionChart");

        views.loadView("printActionChart.html")
        .then(async () => {
            await printActionChartView.setup();
        }, null);

    }
}