import { IPLN } from '../modules/pln/pln.model';
declare class PDFService {
    /**
     * Generate PLN application form PDF that replicates the official PLN2-NA(2)(2007/05) form
     */
    generatePLNFormPDF(application: IPLN): Promise<Buffer>;
    /**
     * Helper method to get all form field names from a PDF template (for debugging)
     */
    getPDFFormFields(templatePath: string): Promise<string[]>;
    /**
     * Overlay text on the static PDF template (when PDF has no fillable fields)
     * Loads field positions from field-positions.json configuration file
     * @param application - The PLN application data
     * @param pdfDoc - The loaded PDF document
     * @returns Buffer containing the filled PDF
     */
    private overlayTextOnPDF;
    /**
     * Fill the static PLN form PDF template with application data
     * @param application - The PLN application data
     * @param templatePath - Path to the PDF template file
     * @returns Buffer containing the filled PDF
     */
    fillPLNFormPDF(application: IPLN, templatePath: string): Promise<Buffer>;
}
export declare const pdfService: PDFService;
export {};
//# sourceMappingURL=pdf.service.d.ts.map