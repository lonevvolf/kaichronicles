import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// /**
//  * The print action chart view API
//  */
export const printActionChartView = {
    async setup() {
      // PDF Modification
        const url = "/images/action-charts/newOrder.pdf";
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        firstPage.drawText('This text was added with JavaScript!', {
          x: 5,
          y: height / 2 + 300,
          size: 50,
          font: helveticaFont,
          color: rgb(0.95, 0.1, 0.1),
          rotate: degrees(-45),
        });

        const pdfDataUri = await firstPage.doc.saveAsBase64({ dataUri: true });
        const base64 = await firstPage.doc.saveAsBase64();
        const blob = printActionChartView.b64toBlob(base64, 'application/pdf');
        const blobUrl = URL.createObjectURL(blob);

        (<HTMLObjectElement>document.getElementById('pdf')).data = blobUrl;
    },

    b64toBlob (b64Data, contentType='', sliceSize=512) {
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
        
      const blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }
}