import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IPLN } from '../modules/pln/pln.model';
import { logger } from '../utils/logger';

class PDFService {
  /**
   * Generate PLN application form PDF that replicates the official PLN2-NA(2)(2007/05) form
   */
  async generatePLNFormPDF(application: IPLN): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const buffers: Buffer[] = [];
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
        const drawGridBoxes = (
          x: number,
          y: number,
          count: number,
          boxWidth: number = 12,
          boxHeight: number = 15,
          spacing: number = 2
        ) => {
          for (let i = 0; i < count; i++) {
            doc.rect(x + i * (boxWidth + spacing), y, boxWidth, boxHeight).stroke();
          }
        };

        // Helper function to fill grid boxes with text
        const fillGridBoxes = (
          text: string,
          x: number,
          y: number,
          boxWidth: number = 12,
          boxHeight: number = 15,
          spacing: number = 2,
          fontSize: number = 8
        ) => {
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

        doc.fontSize(14).font('Helvetica-Bold').text(
          'APPLICATION FOR PERSONALISED LICENCE NUMBER AND ORDERING OF PLATES',
          margin,
          yPosition,
          { align: 'center' }
        );
        yPosition += 20;

        doc.fontSize(8).font('Helvetica').text(
          'Acceptable identification is essential (including that of the proxy and/or representative).',
          margin,
          yPosition
        );
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
        } else if (application.idType === 'Business Reg. No') {
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
        } else {
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
          doc.fontSize(10).font('Helvetica-Bold').text(
            'C. APPLICANT\'S REPRESENTATIVE / PROXY (If applicable):',
            margin,
            yPosition
          );
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
        if (
          application.currentLicenceNumber ||
          application.vehicleRegisterNumber ||
          application.chassisNumber ||
          application.vehicleMake ||
          application.seriesName
        ) {
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
      } catch (error) {
        logger.error('PDF generation error:', error);
        reject(error);
      }
    });
  }

  /**
   * Helper method to get all form field names from a PDF template (for debugging)
   */
  async getPDFFormFields(templatePath: string): Promise<string[]> {
    try {
      const templateBytes = await fs.readFile(templatePath);
      const pdfDoc = await PDFLibDocument.load(templateBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      return fields.map((field) => field.getName());
    } catch (error) {
      logger.error('Error reading PDF form fields:', error);
      throw error;
    }
  }

  /**
   * Fill the static PLN form PDF template with application data
   * @param application - The PLN application data
   * @param templatePath - Path to the PDF template file
   * @returns Buffer containing the filled PDF
   */
  async fillPLNFormPDF(application: IPLN, templatePath: string): Promise<Buffer> {
    try {
      // Read the template PDF file
      const templateBytes = await fs.readFile(templatePath);
      
      // Load the PDF document
      const pdfDoc = await PDFLibDocument.load(templateBytes);
      const form = pdfDoc.getForm();

      // Helper function to safely set a text field
      const setTextField = (fieldName: string, value: string | undefined | null) => {
        try {
          if (value) {
            const field = form.getTextField(fieldName);
            field.setText(value.toString());
          }
        } catch (error) {
          // Field might not exist or might not be a text field - log and continue
          logger.debug(`Could not set field "${fieldName}": ${error}`);
        }
      };

      // Helper function to safely set a checkbox
      const setCheckbox = (fieldName: string, checked: boolean) => {
        try {
          const field = form.getCheckBox(fieldName);
          if (checked) {
            field.check();
          } else {
            field.uncheck();
          }
        } catch (error) {
          logger.debug(`Could not set checkbox "${fieldName}": ${error}`);
        }
      };

      // Helper function to format phone number
      const formatPhoneNumber = (phone: { code: string; number: string } | undefined): string => {
        if (!phone) return '';
        return `${phone.code}${phone.number}`;
      };

      // Helper function to format address
      const formatAddress = (address: { line1: string; line2?: string; line3?: string } | undefined): string => {
        if (!address) return '';
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
      } else if (application.idType === 'Namibia ID-doc') {
        setCheckbox('idType_IDDoc', true);
        setTextField('idNumber', application.trafficRegisterNumber || application.idNumber);
      } else if (application.idType === 'Business Reg. No') {
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
      const plateFormatMap: Record<string, string> = {
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
        } else if (application.representativeIdType === 'Namibia ID-doc') {
          setCheckbox('repIdType_IDDoc', true);
        }
        
        setTextField('representativeIdNumber', application.representativeIdNumber);
        setTextField('representativeSurname', application.representativeSurname);
        setTextField('representativeInitials', application.representativeInitials);
      } else {
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
      } else if (application.declarationRole === 'proxy') {
        setCheckbox('declarationRole_Proxy', true);
      } else if (application.declarationRole === 'representative') {
        setCheckbox('declarationRole_Representative', true);
      }

      // Reference ID and other metadata
      setTextField('referenceId', application.referenceId);
      setTextField('transactionType', application.transactionType || 'New Personalised Licence Number');

      // Save the filled PDF
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error: any) {
      logger.error('Error filling PLN form PDF:', error);
      throw new Error(`Failed to fill PDF form: ${error.message}`);
    }
  }
}

export const pdfService = new PDFService();


