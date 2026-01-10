/**
 * This test uses the EXACT same logic as the overlayTextOnPDF method
 * to ensure we can see what's happening
 */

const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testExactOverlay() {
  try {
    console.log('\n🔍 Testing EXACT Overlay Logic...\n');
    
    // Mock application matching IPLN structure
    const application = {
      referenceId: 'PLN-TEST-001',
      transactionType: 'New Personalised Licence Number',
      idType: 'Traffic Register Number',
      trafficRegisterNumber: 'TR1234567890',
      surname: 'MUKAMANA',
      initials: 'J',
      postalAddress: {
        line1: 'PO BOX 1234',
        line2: 'KIGALI',
        line3: 'RWANDA'
      },
      streetAddress: {
        line1: '123 MAIN STREET',
        line2: 'KIGALI CITY',
        line3: ''
      },
      cellNumber: {
        code: '078',
        number: '1234567'
      },
      email: 'test@example.com',
      plateFormat: 'Normal',
      quantity: 1,
      plateChoices: [
        { text: 'ABC123', meaning: 'My first choice' },
        { text: 'XYZ789', meaning: 'My second choice' },
        { text: 'DEF456', meaning: 'My third choice' }
      ],
      declarationPlace: 'KIGALI',
      declarationDate: new Date('2024-01-15'),
      declarationRole: 'applicant',
      declarationAccepted: true
    };
    
    console.log('📋 Application Data:', JSON.stringify(application, null, 2), '\n');
    
    // Load template
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page: ${width} x ${height} points\n`);
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
    
    // Load positions
    let fieldPositions = null;
    try {
      const positionsPath = path.join(__dirname, 'data/forms/field-positions.json');
      const positionsData = await fs.readFile(positionsPath, 'utf-8');
      fieldPositions = JSON.parse(positionsData);
      console.log('✅ Loaded field positions\n');
    } catch (error) {
      console.log('⚠️  Using default positions\n');
    }
    
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
    
    const pos = getFieldPos;
    
    // Draw functions
    const drawText = (text, x, y, options = {}) => {
      if (!text || text.trim() === '') {
        console.log(`⚠️  Skipped empty text at (${x}, ${y})`);
        return;
      }
      const textValue = text.toString().trim();
      const pdfY = height - y;
      const fontSize = options.size || 9;
      const font = options.font || helveticaFont;
      
      // Draw white background for visibility
      const textWidth = textValue.length * (fontSize * 0.5);
      firstPage.drawRectangle({
        x: x - 1,
        y: pdfY - fontSize - 1,
        width: Math.max(textWidth + 2, 50),
        height: fontSize + 2,
        color: rgb(1, 1, 1),
        opacity: 0.9,
      });
      
      firstPage.drawText(textValue.toUpperCase(), {
        x,
        y: pdfY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
        opacity: 1.0,
      });
      
      console.log(`✅ "${textValue.substring(0, 20)}" at (${x}, ${y}), PDF(${x}, ${pdfY}), size: ${fontSize}`);
    };
    
    const drawCheckbox = (x, y) => {
      const pdfY = height - y;
      firstPage.drawRectangle({
        x: x - 3,
        y: pdfY - 8,
        width: 10,
        height: 10,
        color: rgb(1, 1, 1),
        opacity: 0.9,
      });
      firstPage.drawText('X', {
        x,
        y: pdfY,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
        opacity: 1.0,
      });
      console.log(`✅ Checkbox X at (${x}, ${y}), PDF(${x}, ${pdfY})`);
    };
    
    console.log('🖊️  Drawing fields...\n');
    
    // Transaction type
    const transPos = pos('transactionNewPLN', 60, 140);
    drawCheckbox(transPos.x, transPos.y);
    
    // ID Type
    if (application.idType === 'Traffic Register Number') {
      const idPos = pos('idTypeTrafficRegister', 60, 195);
      drawCheckbox(idPos.x, idPos.y);
    }
    
    // ID Number
    let idNumber = '';
    if (application.idType === 'Traffic Register Number' || application.idType === 'Namibia ID-doc') {
      idNumber = application.trafficRegisterNumber || application.idNumber || '';
    } else if (application.idType === 'Business Reg. No') {
      idNumber = application.businessRegNumber || application.idNumber || '';
    }
    if (!idNumber) {
      console.log('⚠️  ID number is EMPTY!');
    }
    const idNumPos = pos('idNumber', 80, 228);
    drawText(idNumber, idNumPos.x, idNumPos.y, { size: idNumPos.fontSize });
    
    // Surname and initials
    const surnamePos = pos('surname', 80, 258);
    const initialsPos = pos('initials', 330, 258);
    drawText(application.surname, surnamePos.x, surnamePos.y, { size: surnamePos.fontSize });
    drawText('and', 300, surnamePos.y, { size: 9 }); // Use same Y as surname
    drawText(application.initials, initialsPos.x, initialsPos.y, { size: initialsPos.fontSize });
    
    // Postal address
    const postal1Pos = pos('postalAddressLine1', 80, 293);
    const postal2Pos = pos('postalAddressLine2', 80, 311);
    const postal3Pos = pos('postalAddressLine3', 80, 329);
    drawText(application.postalAddress?.line1, postal1Pos.x, postal1Pos.y, { size: postal1Pos.fontSize });
    drawText(application.postalAddress?.line2, postal2Pos.x, postal2Pos.y, { size: postal2Pos.fontSize });
    drawText(application.postalAddress?.line3, postal3Pos.x, postal3Pos.y, { size: postal3Pos.fontSize });
    
    // Plate choices
    if (application.plateFormat) {
      const plateFormatMap = {
        'Long/German': 'plateFormatLongGerman',
        'Normal': 'plateFormatNormal',
        'American': 'plateFormatAmerican',
        'Square': 'plateFormatSquare',
        'Small motorcycle': 'plateFormatMotorcycle',
      };
      
      if (plateFormatMap[application.plateFormat]) {
        const formatPos = pos(plateFormatMap[application.plateFormat], 60, 575);
        const quantityPos = pos('plateQuantity', 230, formatPos.y);
        drawCheckbox(formatPos.x, formatPos.y);
        drawText(application.quantity?.toString(), quantityPos.x, quantityPos.y, { size: quantityPos.fontSize });
        
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
    
    // Save
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-EXACT-OVERLAY-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Test PDF created!');
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`📊 Size: ${pdfBytes.length} bytes\n`);
    console.log('💡 Open this PDF and check if you can see:');
    console.log('   - White boxes behind all text (for visibility)');
    console.log('   - ID number, surname, initials');
    console.log('   - Postal address lines');
    console.log('   - Plate choices');
    console.log('   - Declaration place and date\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testExactOverlay();

