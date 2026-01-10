"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const pdf_lib_1 = require("pdf-lib");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
class PDFService {
    /**
     * Generate PLN application form PDF that replicates the official PLN2-NA(2)(2007/05) form
     */
    async generatePLNFormPDF(application) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
                doc.on('error', reject);
                // Page dimensions
                const pageWidth = 595.28; // A4 width in points
                const pageHeight = 841.89; // A4 height in points
                const margin = 50;
                const contentWidth = pageWidth - 2 * margin;
                let yPosition = margin;
                // Helper function to draw grid boxes for text
                const drawGridBoxes = (x, y, count, boxWidth = 12, boxHeight = 15, spacing = 2) => {
                    for (let i = 0; i < count; i++) {
                        doc.rect(x + i * (boxWidth + spacing), y, boxWidth, boxHeight).stroke();
                    }
                };
                // Helper function to fill grid boxes with text
                const fillGridBoxes = (text, x, y, boxWidth = 12, boxHeight = 15, spacing = 2, fontSize = 8) => {
                    const chars = text.toUpperCase().split('');
                    doc.fontSize(fontSize);
                    for (let i = 0; i < Math.min(chars.length, 50); i++) {
                        doc.text(chars[i], x + i * (boxWidth + spacing) + 2, y + 3, {
                            width: boxWidth - 4,
                            height: boxHeight - 4,
                            align: 'center',
                        });
                    }
                };
                // Header
                doc.fontSize(8).text('PLN2-NA(2)(2007/05)', margin, yPosition, { align: 'left' });
                doc.text('PLN2', pageWidth - margin - 20, yPosition, { align: 'right' });
                yPosition += 15;
                doc.fontSize(12).font('Helvetica-Bold').text('REPUBLIC OF NAMIBIA', margin, yPosition, {
                    align: 'center',
                });
                yPosition += 15;
                doc.fontSize(11).text('MINISTRY OF WORKS AND TRANSPORT', margin, yPosition, {
                    align: 'center',
                });
                yPosition += 12;
                doc.text('DEPARTMENT OF TRANSPORT', margin, yPosition, { align: 'center' });
                yPosition += 12;
                doc.fontSize(9).text('(Road Traffic and Transport Act, 1999)', margin, yPosition, {
                    align: 'center',
                });
                yPosition += 15;
                doc.fontSize(14).font('Helvetica-Bold').text('APPLICATION FOR PERSONALISED LICENCE NUMBER AND ORDERING OF PLATES', margin, yPosition, { align: 'center' });
                yPosition += 20;
                doc.fontSize(8).font('Helvetica').text('Acceptable identification is essential (including that of the proxy and/or representative).', margin, yPosition);
                yPosition += 20;
                // LIST OF POSSIBLE TRANSACTIONS
                doc.fontSize(10).font('Helvetica-Bold').text('LIST OF POSSIBLE TRANSACTIONS:', margin, yPosition);
                yPosition += 15;
                const transactions = [
                    { name: 'New Personalised Licence Number', parts: 'A, B, C, E' },
                    { name: 'Allocate a personalised licence number to another vehicle', parts: 'A, B, C, D, E' },
                    {
                        name: 'Order alternative personalised number plate format(s) due to re-allocation to another vehicle of same owner',
                        parts: 'A, B, C, E',
                    },
                    { name: 'Replacement of lost or stolen personalised number plate', parts: 'A, B, C, E' },
                    { name: 'Duplicate certificate of entitlement', parts: 'A, B, C, E' },
                ];
                doc.fontSize(8).font('Helvetica');
                transactions.forEach((transaction, index) => {
                    if (index === 0) {
                        // Mark first transaction (New PLN) with X
                        doc.text('X', margin + 5, yPosition + 2);
                    }
                    doc.text(transaction.name, margin + 20, yPosition);
                    doc.text(transaction.parts, pageWidth - margin - 30, yPosition, { align: 'right' });
                    yPosition += 12;
                });
                yPosition += 10;
                // Section A: PARTICULARS OF OWNER/TRANSFEROR
                doc.fontSize(10).font('Helvetica-Bold').text('A. PARTICULARS OF OWNER/TRANSFEROR:', margin, yPosition);
                yPosition += 15;
                doc.fontSize(8).font('Helvetica').text('Type of identification (mark with X):', margin, yPosition);
                yPosition += 12;
                const idTypes = ['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'];
                idTypes.forEach((idType, index) => {
                    if (application.idType === idType) {
                        doc.text('X', margin + 5 + index * 100, yPosition + 2);
                    }
                    doc.text(idType, margin + 20 + index * 100, yPosition);
                });
                yPosition += 15;
                // Identification number
                doc.text('Identification number/Business Reg. Number:', margin, yPosition);
                yPosition += 12;
                let idNumber = '';
                if (application.idType === 'Traffic Register Number' || application.idType === 'Namibia ID-doc') {
                    idNumber = application.trafficRegisterNumber || application.idNumber || '';
                }
                else if (application.idType === 'Business Reg. No') {
                    idNumber = application.businessRegNumber || application.idNumber || '';
                }
                drawGridBoxes(margin, yPosition, 20, 12, 15, 2);
                fillGridBoxes(idNumber, margin, yPosition, 12, 15, 2, 8);
                yPosition += 20;
                // Surname and initials
                doc.text('Surname and initials/Business Name:', margin, yPosition);
                yPosition += 12;
                const surname = application.surname || '';
                const initials = application.initials || '';
                const businessName = application.businessName || '';
                if (application.idType === 'Business Reg. No' && businessName) {
                    drawGridBoxes(margin, yPosition, 30, 12, 15, 2);
                    fillGridBoxes(businessName, margin, yPosition, 12, 15, 2, 8);
                }
                else {
                    drawGridBoxes(margin, yPosition, 25, 12, 15, 2);
                    fillGridBoxes(surname, margin, yPosition, 12, 15, 2, 8);
                    doc.text('and', margin + 25 * 14, yPosition + 4);
                    drawGridBoxes(margin + 25 * 14 + 20, yPosition, 3, 12, 15, 2);
                    fillGridBoxes(initials, margin + 25 * 14 + 20, yPosition, 12, 15, 2, 8);
                }
                yPosition += 20;
                // Postal address
                doc.text('Postal address:', margin, yPosition);
                yPosition += 12;
                const postalLines = [
                    application.postalAddress?.line1 || '',
                    application.postalAddress?.line2 || '',
                    application.postalAddress?.line3 || '',
                ];
                postalLines.forEach((line) => {
                    drawGridBoxes(margin, yPosition, 40, 12, 15, 2);
                    fillGridBoxes(line, margin, yPosition, 12, 15, 2, 8);
                    yPosition += 18;
                });
                yPosition += 5;
                // Street address
                doc.text('Street address:', margin, yPosition);
                yPosition += 12;
                const streetLines = [
                    application.streetAddress?.line1 || '',
                    application.streetAddress?.line2 || '',
                    application.streetAddress?.line3 || '',
                ];
                streetLines.forEach((line) => {
                    drawGridBoxes(margin, yPosition, 40, 12, 15, 2);
                    fillGridBoxes(line, margin, yPosition, 12, 15, 2, 8);
                    yPosition += 18;
                });
                yPosition += 5;
                // Telephone numbers
                doc.text('Telephone number at home:', margin, yPosition);
                if (application.telephoneHome) {
                    doc.text(`(code) ${application.telephoneHome.code}`, margin + 150, yPosition);
                    doc.text(`(number) ${application.telephoneHome.number}`, margin + 220, yPosition);
                }
                yPosition += 12;
                doc.text('Telephone number during day:', margin, yPosition);
                if (application.telephoneDay) {
                    doc.text(`(code) ${application.telephoneDay.code}`, margin + 150, yPosition);
                    doc.text(`(number) ${application.telephoneDay.number}`, margin + 220, yPosition);
                }
                yPosition += 12;
                doc.text('Cell number:', margin, yPosition);
                if (application.cellNumber) {
                    doc.text(`(code) ${application.cellNumber.code}`, margin + 150, yPosition);
                    doc.text(`(number) ${application.cellNumber.number}`, margin + 220, yPosition);
                }
                yPosition += 12;
                doc.text('E-mail:', margin, yPosition);
                if (application.email) {
                    doc.text(application.email, margin + 150, yPosition);
                }
                yPosition += 20;
                // Check if we need a new page
                if (yPosition > pageHeight - 200) {
                    doc.addPage();
                    yPosition = margin;
                }
                // Section B: PERSONALISED NUMBER PLATE
                doc.fontSize(10).font('Helvetica-Bold').text('B. PERSONALISED NUMBER PLATE:', margin, yPosition);
                yPosition += 15;
                // Plate format table header
                doc.fontSize(8).font('Helvetica-Bold');
                doc.text('Number plate format', margin, yPosition);
                doc.text('Quantity (1 or 2)', margin + 180, yPosition);
                doc.text('1st Number Choice', margin + 260, yPosition);
                doc.text('2nd Alternative', margin + 360, yPosition);
                doc.text('3rd Alternative', margin + 440, yPosition);
                yPosition += 15;
                const plateFormats = [
                    'Long/German format (520 mm x 110mm)',
                    'Normal format (440 mm x 120mm)',
                    'American format (305 mm x 165mm)',
                    'Square format (250 mm x 205mm)',
                    'Small motorcycle format (250 mm x 165mm)',
                ];
                doc.font('Helvetica');
                plateFormats.forEach((format, index) => {
                    const isSelected = format.includes(application.plateFormat);
                    if (isSelected) {
                        doc.text('X', margin + 5, yPosition + 2);
                        doc.text(application.quantity.toString(), margin + 185, yPosition);
                    }
                    doc.text(format, margin + 20, yPosition, { width: 160 });
                    yPosition += 12;
                });
                // Plate choices
                yPosition += 5;
                application.plateChoices.forEach((choice, index) => {
                    const xPos = index === 0 ? margin + 260 : index === 1 ? margin + 360 : margin + 440;
                    const label = index === 0 ? '1st' : index === 1 ? '2nd' : '3rd';
                    doc.fontSize(7).text(`${label} Choice:`, xPos, yPosition - 60);
                    drawGridBoxes(xPos, yPosition - 45, 7, 10, 12, 1);
                    fillGridBoxes(choice.text, xPos, yPosition - 45, 10, 12, 1, 7);
                    doc.text('NA', xPos + 7 * 11 + 5, yPosition - 45 + 2);
                });
                yPosition += 20;
                // Check if we need a new page
                if (yPosition > pageHeight - 300) {
                    doc.addPage();
                    yPosition = margin;
                }
                // Section C: APPLICANT'S REPRESENTATIVE / PROXY (If applicable)
                if (application.hasRepresentative) {
                    doc.fontSize(10).font('Helvetica-Bold').text('C. APPLICANT\'S REPRESENTATIVE / PROXY (If applicable):', margin, yPosition);
                    yPosition += 15;
                    doc.fontSize(8).font('Helvetica').text('Type of identification (mark with X):', margin, yPosition);
                    yPosition += 12;
                    if (application.representativeIdType) {
                        const repIdTypes = ['Traffic Register Number', 'Namibia ID-doc'];
                        repIdTypes.forEach((idType, index) => {
                            if (application.representativeIdType === idType) {
                                doc.text('X', margin + 5 + index * 150, yPosition + 2);
                            }
                            doc.text(idType, margin + 20 + index * 150, yPosition);
                        });
                    }
                    yPosition += 15;
                    doc.text('Identification number:', margin, yPosition);
                    yPosition += 12;
                    if (application.representativeIdNumber) {
                        drawGridBoxes(margin, yPosition, 13, 12, 15, 2);
                        fillGridBoxes(application.representativeIdNumber, margin, yPosition, 12, 15, 2, 8);
                    }
                    yPosition += 20;
                    doc.text('Surname and initials:', margin, yPosition);
                    yPosition += 12;
                    if (application.representativeSurname) {
                        drawGridBoxes(margin, yPosition, 13, 12, 15, 2);
                        fillGridBoxes(application.representativeSurname, margin, yPosition, 12, 15, 2, 8);
                        doc.text('and', margin + 13 * 14, yPosition + 4);
                        drawGridBoxes(margin + 13 * 14 + 20, yPosition, 3, 12, 15, 2);
                        if (application.representativeInitials) {
                            fillGridBoxes(application.representativeInitials, margin + 13 * 14 + 20, yPosition, 12, 15, 2, 8);
                        }
                    }
                    yPosition += 25;
                }
                // Section D: PARTICULARS OF VEHICLE (If available)
                if (application.currentLicenceNumber ||
                    application.vehicleRegisterNumber ||
                    application.chassisNumber ||
                    application.vehicleMake ||
                    application.seriesName) {
                    doc.fontSize(10).font('Helvetica-Bold').text('D. PARTICULARS OF VEHICLE (If available):', margin, yPosition);
                    yPosition += 15;
                    doc.fontSize(8).font('Helvetica');
                    if (application.currentLicenceNumber) {
                        doc.text('Current licence number:', margin, yPosition);
                        drawGridBoxes(margin + 150, yPosition, 7, 12, 15, 2);
                        fillGridBoxes(application.currentLicenceNumber, margin + 150, yPosition, 12, 15, 2, 8);
                        yPosition += 18;
                    }
                    if (application.vehicleRegisterNumber) {
                        doc.text('Vehicle register number:', margin, yPosition);
                        drawGridBoxes(margin + 150, yPosition, 10, 12, 15, 2);
                        fillGridBoxes(application.vehicleRegisterNumber, margin + 150, yPosition, 12, 15, 2, 8);
                        yPosition += 18;
                    }
                    if (application.chassisNumber) {
                        doc.text('Chassis number/VIN:', margin, yPosition);
                        drawGridBoxes(margin + 150, yPosition, 17, 12, 15, 2);
                        fillGridBoxes(application.chassisNumber, margin + 150, yPosition, 12, 15, 2, 8);
                        yPosition += 18;
                    }
                    if (application.vehicleMake) {
                        doc.text('Vehicle make:', margin, yPosition);
                        doc.rect(margin + 150, yPosition, 200, 15).stroke();
                        doc.text(application.vehicleMake, margin + 152, yPosition + 3, { width: 196 });
                        yPosition += 18;
                    }
                    if (application.seriesName) {
                        doc.text('Series name:', margin, yPosition);
                        doc.rect(margin + 150, yPosition, 200, 15).stroke();
                        doc.text(application.seriesName, margin + 152, yPosition + 3, { width: 196 });
                        yPosition += 18;
                    }
                    yPosition += 10;
                }
                // Check if we need a new page
                if (yPosition > pageHeight - 200) {
                    doc.addPage();
                    yPosition = margin;
                }
                // Section E: DECLARATION
                doc.fontSize(10).font('Helvetica-Bold').text('E. DECLARATION', margin, yPosition);
                yPosition += 15;
                doc.fontSize(8).font('Helvetica');
                doc.text('I the', margin, yPosition);
                const roles = ['applicant / holder of a personalised licence number', "applicant / holder's proxy", "applicant / holder's representative"];
                roles.forEach((role, index) => {
                    const xPos = margin + 30 + index * 120;
                    doc.rect(xPos, yPosition, 110, 12).stroke();
                    if (application.declarationRole === (index === 0 ? 'applicant' : index === 1 ? 'proxy' : 'representative')) {
                        doc.text('X', xPos + 2, yPosition + 2);
                    }
                    doc.fontSize(6).text(role, xPos + 2, yPosition + 15, { width: 106 });
                });
                yPosition += 30;
                const declarationPoints = [
                    '(a) I am aware that a personalised licence number or the right to use it may be subject to copyright or other intellectual property rights.',
                    '(b) In the event of surrender of a personalised licence number, I declare that the personalised licence plates have been destroyed.',
                    '(c) I declare that all the particulars furnished by me are true and correct.',
                    '(d) I am aware that a false declaration is punishable by law.',
                ];
                declarationPoints.forEach((point) => {
                    doc.fontSize(8).text(point, margin, yPosition, { width: contentWidth - 100 });
                    yPosition += 15;
                });
                // Signature, Place, Date
                const signatureX = pageWidth - margin - 150;
                doc.text('Signature:', signatureX, yPosition);
                doc.moveTo(signatureX + 50, yPosition + 10).lineTo(signatureX + 200, yPosition + 10).stroke();
                yPosition += 20;
                doc.text('Place:', signatureX, yPosition);
                doc.rect(signatureX + 50, yPosition, 150, 12).stroke();
                if (application.declarationPlace) {
                    doc.text(application.declarationPlace, signatureX + 52, yPosition + 2, { width: 146 });
                }
                yPosition += 18;
                doc.text('Date: 20', signatureX, yPosition);
                const date = application.declarationDate ? new Date(application.declarationDate) : new Date();
                const year = date.getFullYear().toString().slice(2);
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                drawGridBoxes(signatureX + 50, yPosition, 2, 10, 12, 1);
                fillGridBoxes(year, signatureX + 50, yPosition, 10, 12, 1, 7);
                doc.text(':', signatureX + 72, yPosition + 2);
                drawGridBoxes(signatureX + 75, yPosition, 2, 10, 12, 1);
                fillGridBoxes(month, signatureX + 75, yPosition, 10, 12, 1, 7);
                doc.text(':', signatureX + 97, yPosition + 2);
                drawGridBoxes(signatureX + 100, yPosition, 2, 10, 12, 1);
                fillGridBoxes(day, signatureX + 100, yPosition, 10, 12, 1, 7);
                yPosition += 25;
                // Section F: FOR OFFICE USE (left blank)
                doc.fontSize(10).font('Helvetica-Bold').text('F. FOR OFFICE USE', margin, yPosition);
                yPosition += 15;
                doc.fontSize(8).font('Helvetica');
                doc.text('Fees paid and serial number of receipt: N$', margin, yPosition);
                doc.rect(margin + 200, yPosition, 80, 12).stroke();
                doc.text('and', margin + 285, yPosition);
                drawGridBoxes(margin + 310, yPosition, 10, 12, 15, 2);
                yPosition += 18;
                doc.text('Control number of Certificate of Entitlement:', margin, yPosition);
                drawGridBoxes(margin + 250, yPosition, 10, 12, 15, 2);
                yPosition += 18;
                doc.text('Date of transaction: 20', margin, yPosition);
                drawGridBoxes(margin + 150, yPosition, 2, 10, 12, 1);
                doc.text(':', margin + 172, yPosition + 2);
                drawGridBoxes(margin + 175, yPosition, 2, 10, 12, 1);
                doc.text(':', margin + 197, yPosition + 2);
                drawGridBoxes(margin + 200, yPosition, 2, 10, 12, 1);
                yPosition += 18;
                doc.text('Signature of official(s):', margin, yPosition);
                doc.moveTo(margin + 150, yPosition + 10).lineTo(margin + 350, yPosition + 10).stroke();
                yPosition += 20;
                doc.text('Licensing of officer', margin, yPosition);
                doc.text('Data Capturing', margin + 200, yPosition);
                doc.moveTo(margin, yPosition + 12).lineTo(margin + 120, yPosition + 12).stroke();
                doc.moveTo(margin + 200, yPosition + 12).lineTo(margin + 320, yPosition + 12).stroke();
                // Finalize PDF
                doc.end();
            }
            catch (error) {
                logger_1.logger.error('PDF generation error:', error);
                reject(error);
            }
        });
    }
    /**
     * Helper method to get all form field names from a PDF template (for debugging)
     */
    async getPDFFormFields(templatePath) {
        try {
            const templateBytes = await fs.readFile(templatePath);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templateBytes);
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            return fields.map((field) => field.getName());
        }
        catch (error) {
            logger_1.logger.error('Error reading PDF form fields:', error);
            throw error;
        }
    }
    /**
     * Overlay text on the static PDF template (when PDF has no fillable fields)
     * Loads field positions from field-positions.json configuration file
     * @param application - The PLN application data
     * @param pdfDoc - The loaded PDF document
     * @returns Buffer containing the filled PDF
     */
    async overlayTextOnPDF(application, pdfDoc) {
        try {
            logger_1.logger.info('Starting PDF overlay process', {
                hasApplication: !!application,
                referenceId: application?.referenceId,
                surname: application?.surname,
                initials: application?.initials,
                idType: application?.idType,
                idNumber: application?.idNumber,
                trafficRegisterNumber: application?.trafficRegisterNumber,
                hasPlateChoices: !!application?.plateChoices?.length,
                plateChoices: application?.plateChoices?.map(c => c.text),
                declarationPlace: application?.declarationPlace,
                declarationDate: application?.declarationDate,
                email: application?.email,
            });
            const pages = pdfDoc.getPages();
            if (pages.length === 0) {
                throw new Error('PDF has no pages');
            }
            const firstPage = pages[0];
            // CRITICAL: Ensure page rotation is 0 to prevent vertical text rendering
            try {
                firstPage.setRotation((0, pdf_lib_1.degrees)(0));
                logger_1.logger.info('Set page rotation to 0 degrees');
            }
            catch (error) {
                logger_1.logger.warn('Could not set page rotation', { error: error.message });
            }
            // Get page dimensions
            const { width, height } = firstPage.getSize();
            logger_1.logger.info(`PDF page dimensions: ${width} x ${height}`);
            // Embed fonts to ensure text renders correctly
            let helveticaFont;
            let helveticaBoldFont;
            try {
                helveticaFont = await pdfDoc.embedFont('Helvetica');
                helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
                logger_1.logger.info('Fonts embedded successfully');
            }
            catch (fontError) {
                logger_1.logger.warn('Could not embed fonts, using default', { error: fontError.message });
                helveticaFont = undefined;
                helveticaBoldFont = undefined;
            }
            // Load field positions from configuration file (support multiple possible locations)
            let fieldPositions = null;
            const candidatePaths = [
                path.resolve(__dirname, '..', '..', 'data', 'forms', 'field-positions.json'), // dist/services -> backend/data/forms
                path.resolve(__dirname, '../../../', 'data', 'forms', 'field-positions.json'), // project-level data/forms (legacy)
                path.resolve(process.cwd(), 'data', 'forms', 'field-positions.json'), // cwd/data/forms
                path.resolve(process.cwd(), 'backend', 'data', 'forms', 'field-positions.json'), // cwd/backend/data/forms
            ];
            let loadedPath = null;
            for (const candidate of candidatePaths) {
                try {
                    const positionsData = await fs.readFile(candidate, 'utf-8');
                    fieldPositions = JSON.parse(positionsData);
                    loadedPath = candidate;
                    break;
                }
                catch (_) {
                    // Try next path
                }
            }
            if (fieldPositions) {
                logger_1.logger.info('Loaded field positions from configuration file', {
                    path: loadedPath,
                    fieldCount: Object.keys(fieldPositions?.fields || {}).length,
                });
            }
            else {
                logger_1.logger.warn('Could not load field-positions.json from any known location, using default coordinates', {
                    triedPaths: candidatePaths,
                });
            }
            // Helper to get field position from config or use default
            const getFieldPos = (fieldKey, defaultX, defaultY) => {
                if (fieldPositions?.fields?.[fieldKey]) {
                    return {
                        x: fieldPositions.fields[fieldKey].x,
                        y: fieldPositions.fields[fieldKey].y,
                        fontSize: fieldPositions.fields[fieldKey].fontSize || 9,
                    };
                }
                return { x: defaultX, y: defaultY, fontSize: 9 };
            };
            // Helper function to draw text at coordinates (PDF coordinates are from bottom-left)
            // Renders text as a SINGLE HORIZONTAL LINE - no character-by-character loops, no line breaks
            const drawText = (text, x, y, options) => {
                if (text === null || text === undefined) {
                    return;
                }
                try {
                    // Ensure a single-line string with no newlines
                    let textValue = String(text).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                    if (textValue.length === 0) {
                        return;
                    }
                    // PDF coordinate system: y from bottom
                    const pdfY = height - y;
                    const fontSize = options?.size || 10;
                    // Bounds check
                    if (x < 0 || x > width || pdfY < 0 || pdfY > height) {
                        logger_1.logger.warn(`Text coordinates out of bounds: (${x}, ${y}) -> PDF(${x}, ${pdfY}), page size: ${width}x${height}`);
                        return;
                    }
                    // Optional light background to improve visibility on scanned PDFs
                    const approxTextWidth = Math.max(textValue.length * (fontSize * 0.5), 40);
                    firstPage.drawRectangle({
                        x: x - 1,
                        y: pdfY - fontSize - 1,
                        width: approxTextWidth + 2,
                        height: fontSize + 2,
                        color: (0, pdf_lib_1.rgb)(1, 1, 1),
                        opacity: 0.85,
                    });
                    // Single draw call: no character loops, no per-character y-offsets
                    const fontToUse = options?.font || helveticaFont;
                    firstPage.drawText(textValue, {
                        x,
                        y: pdfY,
                        size: fontSize,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        font: fontToUse,
                        rotate: (0, pdf_lib_1.degrees)(0),
                        opacity: 1.0,
                    });
                    logger_1.logger.info(`✓ Drew text "${textValue.substring(0, 30)}" at (${x}, ${y}) -> PDF(${x}, ${pdfY}), size: ${fontSize}`);
                }
                catch (error) {
                    logger_1.logger.error(`Error drawing text at (${x}, ${y}): ${error.message}`, {
                        text: text?.toString().substring(0, 20),
                        stack: error.stack,
                    });
                }
            };
            // Helper function to draw checkbox (X mark)
            const drawCheckbox = (x, y) => {
                try {
                    // Convert Y coordinate: our y is from top, PDF y is from bottom
                    const pdfY = height - y;
                    // Validate coordinates are within page bounds
                    if (x < 0 || x > width || pdfY < 0 || pdfY > height) {
                        logger_1.logger.warn(`Checkbox coordinates out of bounds: (${x}, ${y}) -> PDF(${x}, ${pdfY}), page size: ${width}x${height}`);
                        return;
                    }
                    firstPage.drawText('X', {
                        x,
                        y: pdfY,
                        size: 12,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0), // Black X
                        font: helveticaBoldFont,
                        rotate: (0, pdf_lib_1.degrees)(0),
                        opacity: 1.0, // Ensure full opacity
                    });
                    logger_1.logger.info(`✓ Drew checkbox X at (${x}, ${y}) -> PDF(${x}, ${pdfY})`);
                }
                catch (error) {
                    logger_1.logger.error(`Error drawing checkbox at (${x}, ${y}): ${error.message}`, {
                        stack: error.stack,
                    });
                }
            };
            // Use field positions from configuration file (with defaults as fallback)
            const pos = getFieldPos;
            // Transaction type: Mark "New Personalised Licence Number" with X
            const transPos = pos('transactionNewPLN', 60, 140);
            drawCheckbox(transPos.x, transPos.y);
            logger_1.logger.info(`Drew transaction checkbox at (${transPos.x}, ${transPos.y})`);
            // Section A: PARTICULARS OF OWNER/TRANSFEROR
            // ID Type checkboxes
            if (application.idType === 'Traffic Register Number') {
                const idPos = pos('idTypeTrafficRegister', 60, 195);
                drawCheckbox(idPos.x, idPos.y);
            }
            else if (application.idType === 'Namibia ID-doc') {
                const idPos = pos('idTypeNamibiaID', 180, 195);
                drawCheckbox(idPos.x, idPos.y);
            }
            else if (application.idType === 'Business Reg. No') {
                const idPos = pos('idTypeBusinessReg', 320, 195);
                drawCheckbox(idPos.x, idPos.y);
            }
            // Identification number
            let idNumber = '';
            if (application.idType === 'Traffic Register Number' || application.idType === 'Namibia ID-doc') {
                idNumber = application.trafficRegisterNumber || application.idNumber || '';
            }
            else if (application.idType === 'Business Reg. No') {
                idNumber = application.businessRegNumber || application.idNumber || '';
            }
            const idNumPos = pos('idNumber', 80, 228);
            if (!idNumber) {
                logger_1.logger.warn('⚠️  ID number is empty or missing!', {
                    idType: application.idType,
                    trafficRegisterNumber: application.trafficRegisterNumber,
                    businessRegNumber: application.businessRegNumber,
                    idNumber: application.idNumber,
                });
            }
            drawText(idNumber, idNumPos.x, idNumPos.y, { size: idNumPos.fontSize });
            // Surname and initials / Business Name
            if (application.idType === 'Business Reg. No' && application.businessName) {
                const bizPos = pos('businessName', 80, 258);
                drawText(application.businessName, bizPos.x, bizPos.y, { size: bizPos.fontSize });
                logger_1.logger.info(`Attempted to draw business name: "${application.businessName}" at (${bizPos.x}, ${bizPos.y})`);
            }
            else {
                const surnamePos = pos('surname', 80, 258);
                const initialsPos = pos('initials', 330, 258);
                if (!application.surname) {
                    logger_1.logger.warn('⚠️  Surname is missing!');
                }
                if (!application.initials) {
                    logger_1.logger.warn('⚠️  Initials are missing!');
                }
                drawText(application.surname, surnamePos.x, surnamePos.y, { size: surnamePos.fontSize });
                drawText('and', 300, surnamePos.y, { size: 9 }); // Use same Y as surname
                drawText(application.initials, initialsPos.x, initialsPos.y, { size: initialsPos.fontSize });
            }
            // Postal address (3 lines)
            const postal1Pos = pos('postalAddressLine1', 80, 293);
            const postal2Pos = pos('postalAddressLine2', 80, 311);
            const postal3Pos = pos('postalAddressLine3', 80, 329);
            drawText(application.postalAddress?.line1, postal1Pos.x, postal1Pos.y, { size: postal1Pos.fontSize });
            drawText(application.postalAddress?.line2, postal2Pos.x, postal2Pos.y, { size: postal2Pos.fontSize });
            drawText(application.postalAddress?.line3, postal3Pos.x, postal3Pos.y, { size: postal3Pos.fontSize });
            // Street address (3 lines)
            const street1Pos = pos('streetAddressLine1', 80, 363);
            const street2Pos = pos('streetAddressLine2', 80, 381);
            const street3Pos = pos('streetAddressLine3', 80, 399);
            drawText(application.streetAddress?.line1, street1Pos.x, street1Pos.y, { size: street1Pos.fontSize });
            drawText(application.streetAddress?.line2, street2Pos.x, street2Pos.y, { size: street2Pos.fontSize });
            drawText(application.streetAddress?.line3, street3Pos.x, street3Pos.y, { size: street3Pos.fontSize });
            // Phone numbers
            if (application.telephoneHome) {
                const phoneHomeCodePos = pos('telephoneHomeCode', 200, 433);
                const phoneHomeNumPos = pos('telephoneHomeNumber', 280, 433);
                drawText(application.telephoneHome.code, phoneHomeCodePos.x, phoneHomeCodePos.y, { size: phoneHomeCodePos.fontSize });
                drawText(application.telephoneHome.number, phoneHomeNumPos.x, phoneHomeNumPos.y, { size: phoneHomeNumPos.fontSize });
            }
            if (application.telephoneDay) {
                const phoneDayCodePos = pos('telephoneDayCode', 200, 451);
                const phoneDayNumPos = pos('telephoneDayNumber', 280, 451);
                drawText(application.telephoneDay.code, phoneDayCodePos.x, phoneDayCodePos.y, { size: phoneDayCodePos.fontSize });
                drawText(application.telephoneDay.number, phoneDayNumPos.x, phoneDayNumPos.y, { size: phoneDayNumPos.fontSize });
            }
            if (application.cellNumber) {
                const cellCodePos = pos('cellNumberCode', 200, 469);
                const cellNumPos = pos('cellNumberNumber', 280, 469);
                drawText(application.cellNumber.code, cellCodePos.x, cellCodePos.y, { size: cellCodePos.fontSize });
                drawText(application.cellNumber.number, cellNumPos.x, cellNumPos.y, { size: cellNumPos.fontSize });
            }
            const emailPos = pos('email', 200, 487);
            drawText(application.email, emailPos.x, emailPos.y, { size: emailPos.fontSize });
            // Section B: PERSONALISED NUMBER PLATE
            // Plate format checkboxes and quantity
            const plateFormatMap = {
                'Long/German': 'plateFormatLongGerman',
                'Normal': 'plateFormatNormal',
                'American': 'plateFormatAmerican',
                'Square': 'plateFormatSquare',
                'Small motorcycle': 'plateFormatMotorcycle',
            };
            if (application.plateFormat && plateFormatMap[application.plateFormat]) {
                const formatPos = pos(plateFormatMap[application.plateFormat], 60, 575);
                const quantityPos = pos('plateQuantity', 230, formatPos.y);
                drawCheckbox(formatPos.x, formatPos.y);
                drawText(application.quantity?.toString(), quantityPos.x, quantityPos.y, { size: quantityPos.fontSize });
                // Plate choices use the same Y position as the selected format
                const plate1Pos = pos('plateChoice1', 300, formatPos.y);
                const plate2Pos = pos('plateChoice2', 380, formatPos.y);
                const plate3Pos = pos('plateChoice3', 460, formatPos.y);
                application.plateChoices?.forEach((choice, index) => {
                    const positions = [plate1Pos, plate2Pos, plate3Pos];
                    if (positions[index]) {
                        drawText(choice.text, positions[index].x, positions[index].y, { size: positions[index].fontSize });
                    }
                });
            }
            // Section C: REPRESENTATIVE/PROXY
            if (application.hasRepresentative) {
                if (application.representativeIdType === 'Traffic Register Number') {
                    const repIdPos = pos('representativeIdTypeTraffic', 60, 673);
                    drawCheckbox(repIdPos.x, repIdPos.y);
                }
                else if (application.representativeIdType === 'Namibia ID-doc') {
                    const repIdPos = pos('representativeIdTypeIDDoc', 180, 673);
                    drawCheckbox(repIdPos.x, repIdPos.y);
                }
                const repIdNumPos = pos('representativeIdNumber', 80, 698);
                const repSurnamePos = pos('representativeSurname', 80, 723);
                const repInitialsPos = pos('representativeInitials', 330, 723);
                drawText(application.representativeIdNumber, repIdNumPos.x, repIdNumPos.y, { size: repIdNumPos.fontSize });
                drawText(application.representativeSurname, repSurnamePos.x, repSurnamePos.y, { size: repSurnamePos.fontSize });
                drawText('and', 300, repSurnamePos.y, { size: 9 }); // Use same Y as representative surname
                drawText(application.representativeInitials, repInitialsPos.x, repInitialsPos.y, { size: repInitialsPos.fontSize });
            }
            // Section D: VEHICLE PARTICULARS
            if (application.currentLicenceNumber) {
                const vehLicPos = pos('vehicleCurrentLicence', 250, 763);
                drawText(application.currentLicenceNumber, vehLicPos.x, vehLicPos.y, { size: vehLicPos.fontSize });
            }
            if (application.vehicleRegisterNumber) {
                const vehRegPos = pos('vehicleRegisterNumber', 250, 781);
                drawText(application.vehicleRegisterNumber, vehRegPos.x, vehRegPos.y, { size: vehRegPos.fontSize });
            }
            if (application.chassisNumber) {
                const vehChassisPos = pos('vehicleChassisNumber', 250, 799);
                drawText(application.chassisNumber, vehChassisPos.x, vehChassisPos.y, { size: vehChassisPos.fontSize });
            }
            if (application.vehicleMake) {
                const vehMakePos = pos('vehicleMake', 250, 817);
                drawText(application.vehicleMake, vehMakePos.x, vehMakePos.y, { size: vehMakePos.fontSize });
            }
            if (application.seriesName) {
                const vehSeriesPos = pos('vehicleSeries', 250, 835);
                drawText(application.seriesName, vehSeriesPos.x, vehSeriesPos.y, { size: vehSeriesPos.fontSize });
            }
            // Section E: DECLARATION
            // Declaration role checkbox
            if (application.declarationRole === 'applicant') {
                const rolePos = pos('declarationRoleApplicant', 60, 493);
                drawCheckbox(rolePos.x, rolePos.y);
            }
            else if (application.declarationRole === 'proxy') {
                const rolePos = pos('declarationRoleProxy', 180, 493);
                drawCheckbox(rolePos.x, rolePos.y);
            }
            else if (application.declarationRole === 'representative') {
                const rolePos = pos('declarationRoleRepresentative', 320, 493);
                drawCheckbox(rolePos.x, rolePos.y);
            }
            // Declaration place
            const declPlacePos = pos('declarationPlace', 450, 813);
            drawText(application.declarationPlace, declPlacePos.x, declPlacePos.y, { size: declPlacePos.fontSize });
            // Declaration date
            const date = application.declarationDate ? new Date(application.declarationDate) : new Date();
            const year = date.getFullYear().toString().slice(2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const yearPos = pos('declarationYear', 490, 831);
            const monthPos = pos('declarationMonth', 510, 831);
            const dayPos = pos('declarationDay', 530, 831);
            drawText(year, yearPos.x, yearPos.y, { size: yearPos.fontSize });
            drawText(month, monthPos.x, monthPos.y, { size: monthPos.fontSize });
            drawText(day, dayPos.x, dayPos.y, { size: dayPos.fontSize });
            // Log summary of what was drawn
            logger_1.logger.info('PDF overlay completed', {
                fieldsDrawn: {
                    hasIdNumber: !!idNumber,
                    hasSurname: !!application.surname,
                    hasPlateChoices: !!application.plateChoices?.length,
                    hasDeclarationPlace: !!application.declarationPlace,
                },
            });
            // Save and return the PDF
            logger_1.logger.info('Saving filled PDF');
            const pdfBytes = await pdfDoc.save();
            logger_1.logger.info(`PDF saved successfully, size: ${pdfBytes.length} bytes`);
            return Buffer.from(pdfBytes);
        }
        catch (error) {
            logger_1.logger.error('Error in overlayTextOnPDF:', {
                error: error.message,
                stack: error.stack,
                applicationData: {
                    hasSurname: !!application?.surname,
                    hasIdType: !!application?.idType,
                    hasPlateChoices: !!application?.plateChoices,
                },
            });
            throw error;
        }
    }
    /**
     * Fill the static PLN form PDF template with application data
     * @param application - The PLN application data
     * @param templatePath - Path to the PDF template file
     * @returns Buffer containing the filled PDF
     */
    async fillPLNFormPDF(application, templatePath) {
        try {
            // Read the template PDF file
            const templateBytes = await fs.readFile(templatePath);
            // Load the PDF document
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templateBytes);
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            // Check if PDF has fillable form fields
            if (fields.length === 0) {
                // PDF doesn't have fillable fields - try overlay text on the PDF
                logger_1.logger.info('PDF template has no fillable fields, attempting text overlay method');
                try {
                    const overlayResult = await this.overlayTextOnPDF(application, pdfDoc);
                    logger_1.logger.info('Text overlay method completed successfully');
                    return overlayResult;
                }
                catch (overlayError) {
                    logger_1.logger.warn('Text overlay failed, falling back to PDF generation from scratch', {
                        error: overlayError.message,
                    });
                    // Fallback to generating PDF from scratch (which matches the form layout)
                    return this.generatePLNFormPDF(application);
                }
            }
            // PDF has fillable fields - use form field filling method
            logger_1.logger.info(`PDF template has ${fields.length} fillable fields, using form field method`);
            // Helper function to safely set a text field
            const setTextField = (fieldName, value) => {
                try {
                    if (value) {
                        const field = form.getTextField(fieldName);
                        field.setText(value.toString());
                    }
                }
                catch (error) {
                    // Field might not exist or might not be a text field - log and continue
                    logger_1.logger.debug(`Could not set field "${fieldName}": ${error}`);
                }
            };
            // Helper function to safely set a checkbox
            const setCheckbox = (fieldName, checked) => {
                try {
                    const field = form.getCheckBox(fieldName);
                    if (checked) {
                        field.check();
                    }
                    else {
                        field.uncheck();
                    }
                }
                catch (error) {
                    logger_1.logger.debug(`Could not set checkbox "${fieldName}": ${error}`);
                }
            };
            // Helper function to format phone number
            const formatPhoneNumber = (phone) => {
                if (!phone)
                    return '';
                return `${phone.code}${phone.number}`;
            };
            // Helper function to format address
            const formatAddress = (address) => {
                if (!address)
                    return '';
                const lines = [address.line1, address.line2, address.line3].filter(Boolean);
                return lines.join(', ');
            };
            // Map application data to PDF form fields
            // Note: Field names may need to be adjusted based on actual PDF template field names
            // Section A: PARTICULARS OF OWNER/TRANSFEROR
            // ID Type checkboxes (mark the selected one)
            if (application.idType === 'Traffic Register Number') {
                setCheckbox('idType_TrafficRegister', true);
                setTextField('trafficRegisterNumber', application.trafficRegisterNumber || application.idNumber);
            }
            else if (application.idType === 'Namibia ID-doc') {
                setCheckbox('idType_IDDoc', true);
                setTextField('idNumber', application.trafficRegisterNumber || application.idNumber);
            }
            else if (application.idType === 'Business Reg. No') {
                setCheckbox('idType_BusinessReg', true);
                setTextField('businessRegNumber', application.businessRegNumber || application.idNumber);
            }
            // Name fields
            setTextField('surname', application.surname);
            setTextField('initials', application.initials);
            setTextField('businessName', application.businessName);
            setTextField('fullName', application.fullName || `${application.surname} ${application.initials}`.trim());
            // Addresses
            setTextField('postalAddress', formatAddress(application.postalAddress));
            setTextField('postalAddressLine1', application.postalAddress?.line1);
            setTextField('postalAddressLine2', application.postalAddress?.line2);
            setTextField('postalAddressLine3', application.postalAddress?.line3);
            setTextField('streetAddress', formatAddress(application.streetAddress));
            setTextField('streetAddressLine1', application.streetAddress?.line1);
            setTextField('streetAddressLine2', application.streetAddress?.line2);
            setTextField('streetAddressLine3', application.streetAddress?.line3);
            // Phone numbers
            setTextField('telephoneHome', formatPhoneNumber(application.telephoneHome));
            setTextField('telephoneHomeCode', application.telephoneHome?.code);
            setTextField('telephoneHomeNumber', application.telephoneHome?.number);
            setTextField('telephoneDay', formatPhoneNumber(application.telephoneDay));
            setTextField('telephoneDayCode', application.telephoneDay?.code);
            setTextField('telephoneDayNumber', application.telephoneDay?.number);
            setTextField('cellNumber', formatPhoneNumber(application.cellNumber));
            setTextField('cellNumberCode', application.cellNumber?.code);
            setTextField('cellNumberNumber', application.cellNumber?.number);
            setTextField('email', application.email);
            setTextField('phoneNumber', application.phoneNumber || formatPhoneNumber(application.cellNumber));
            // Section B: PERSONALISED NUMBER PLATE
            // Plate format checkboxes
            const plateFormatMap = {
                'Long/German': 'plateFormat_LongGerman',
                'Normal': 'plateFormat_Normal',
                'American': 'plateFormat_American',
                'Square': 'plateFormat_Square',
                'Small motorcycle': 'plateFormat_SmallMotorcycle',
            };
            Object.entries(plateFormatMap).forEach(([format, fieldName]) => {
                setCheckbox(fieldName, application.plateFormat === format);
            });
            setTextField('plateQuantity', application.quantity?.toString());
            // Plate choices
            application.plateChoices?.forEach((choice, index) => {
                setTextField(`plateChoice${index + 1}`, choice.text);
                setTextField(`plateChoice${index + 1}_Text`, choice.text);
                setTextField(`plateChoice${index + 1}_Meaning`, choice.meaning);
            });
            // Alternative field name patterns
            setTextField('plateChoice1', application.plateChoices?.[0]?.text);
            setTextField('plateChoice2', application.plateChoices?.[1]?.text);
            setTextField('plateChoice3', application.plateChoices?.[2]?.text);
            // Section C: REPRESENTATIVE/PROXY
            if (application.hasRepresentative) {
                setCheckbox('hasRepresentative', true);
                if (application.representativeIdType === 'Traffic Register Number') {
                    setCheckbox('repIdType_TrafficRegister', true);
                }
                else if (application.representativeIdType === 'Namibia ID-doc') {
                    setCheckbox('repIdType_IDDoc', true);
                }
                setTextField('representativeIdNumber', application.representativeIdNumber);
                setTextField('representativeSurname', application.representativeSurname);
                setTextField('representativeInitials', application.representativeInitials);
            }
            else {
                setCheckbox('hasRepresentative', false);
            }
            // Section D: VEHICLE PARTICULARS
            setTextField('currentLicenceNumber', application.currentLicenceNumber);
            setTextField('vehicleRegisterNumber', application.vehicleRegisterNumber);
            setTextField('chassisNumber', application.chassisNumber);
            setTextField('vehicleMake', application.vehicleMake);
            setTextField('seriesName', application.seriesName);
            // Section E: DECLARATION
            if (application.declarationAccepted) {
                setCheckbox('declarationAccepted', true);
            }
            setTextField('declarationPlace', application.declarationPlace);
            // Format declaration date
            if (application.declarationDate) {
                const date = new Date(application.declarationDate);
                setTextField('declarationDate', date.toLocaleDateString('en-GB')); // DD/MM/YYYY format
                setTextField('declarationYear', date.getFullYear().toString().slice(2));
                setTextField('declarationMonth', (date.getMonth() + 1).toString().padStart(2, '0'));
                setTextField('declarationDay', date.getDate().toString().padStart(2, '0'));
            }
            // Declaration role checkboxes
            if (application.declarationRole === 'applicant') {
                setCheckbox('declarationRole_Applicant', true);
            }
            else if (application.declarationRole === 'proxy') {
                setCheckbox('declarationRole_Proxy', true);
            }
            else if (application.declarationRole === 'representative') {
                setCheckbox('declarationRole_Representative', true);
            }
            // Reference ID and other metadata
            setTextField('referenceId', application.referenceId);
            setTextField('transactionType', application.transactionType || 'New Personalised Licence Number');
            // Save the filled PDF
            const pdfBytes = await pdfDoc.save();
            return Buffer.from(pdfBytes);
        }
        catch (error) {
            logger_1.logger.error('Error filling PLN form PDF:', error);
            throw new Error(`Failed to fill PDF form: ${error.message}`);
        }
    }
}
exports.pdfService = new PDFService();
//# sourceMappingURL=pdf.service.js.map