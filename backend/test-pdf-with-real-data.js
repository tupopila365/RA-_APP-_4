/**
 * Test PDF filling with realistic application data structure
 * This mimics what the actual API would receive
 */

const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testWithRealData() {
  try {
    console.log('\n🧪 Testing PDF Fill with Real Application Data...\n');
    
    // Create mock application data (matching IPLN structure)
    const mockApplication = {
      referenceId: 'PLN-2024-001',
      surname: 'MUKAMANA',
      idNumber: '1234567890123',
      idType: 'TrafficRegister',
      firstName: 'JEAN',
      postalAddress: 'PO BOX 1234 KIGALI',
      email: 'jean@example.com',
      phoneNumber: '0781234567',
      transactionType: 'newPln',
      plateChoices: [
        { plate: 'ABC123', priority: 1 },
        { plate: 'XYZ789', priority: 2 },
        { plate: 'DEF456', priority: 3 },
      ],
      declarationPlace: 'KIGALI',
      declarationDate: new Date('2024-01-15'),
      status: 'pending',
    };
    
    console.log('📋 Mock Application Data:');
    console.log(JSON.stringify(mockApplication, null, 2));
    console.log('\n');
    
    // Load the template PDF
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page dimensions: ${width} x ${height} points\n`);
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
    
    // Load field positions
    let fieldPositions = null;
    try {
      const positionsPath = path.join(__dirname, 'data/forms/field-positions.json');
      const positionsData = await fs.readFile(positionsPath, 'utf-8');
      fieldPositions = JSON.parse(positionsData);
      console.log('✅ Loaded field positions from config\n');
    } catch (error) {
      console.log('⚠️  Could not load field-positions.json, using defaults\n');
    }
    
    const pos = (fieldKey, defaultX, defaultY) => {
      if (fieldPositions?.fields?.[fieldKey]) {
        return {
          x: fieldPositions.fields[fieldKey].x,
          y: fieldPositions.fields[fieldKey].y,
          fontSize: fieldPositions.fields[fieldKey].fontSize || 9,
        };
      }
      return { x: defaultX, y: defaultY, fontSize: 9 };
    };
    
    const drawText = (text, x, y, options = {}) => {
      if (!text || text.trim() === '') return;
      const textValue = text.toString().trim();
      const pdfY = height - y;
      const fontSize = options.size || 9;
      const font = options.font || helveticaFont;
      
      // Draw white background for visibility
      const textWidth = textValue.length * (fontSize * 0.5);
      firstPage.drawRectangle({
        x: x - 1,
        y: pdfY - fontSize - 1,
        width: textWidth + 2,
        height: fontSize + 2,
        color: rgb(1, 1, 1),
        opacity: 0.85,
      });
      
      firstPage.drawText(textValue.toUpperCase(), {
        x,
        y: pdfY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
        opacity: 1.0,
      });
      
      console.log(`✅ Drew: "${textValue}" at (${x}, ${y})`);
    };
    
    const drawCheckbox = (x, y) => {
      const pdfY = height - y;
      firstPage.drawText('X', {
        x,
        y: pdfY,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
        opacity: 1.0,
      });
      console.log(`✅ Checkbox X at (${x}, ${y})`);
    };
    
    console.log('🖊️  Drawing application data...\n');
    
    // Transaction type
    if (mockApplication.transactionType === 'newPln') {
      const transPos = pos('transaction_newPln', 60, 140);
      drawCheckbox(transPos.x, transPos.y);
    }
    
    // ID Type
    if (mockApplication.idType === 'TrafficRegister') {
      const idTypePos = pos('idType_TrafficRegister', 60, 195);
      drawCheckbox(idTypePos.x, idTypePos.y);
    }
    
    // ID Number
    if (mockApplication.idNumber) {
      const idPos = pos('idNumber', 80, 228);
      drawText(mockApplication.idNumber, idPos.x, idPos.y, { size: idPos.fontSize });
    }
    
    // Surname
    if (mockApplication.surname) {
      const surnamePos = pos('surname', 80, 258);
      drawText(mockApplication.surname, surnamePos.x, surnamePos.y, { size: surnamePos.fontSize });
    }
    
    // First Name
    if (mockApplication.firstName) {
      const firstNamePos = pos('firstName', 80, 288);
      drawText(mockApplication.firstName, firstNamePos.x, firstNamePos.y, { size: firstNamePos.fontSize });
    }
    
    // Postal Address
    if (mockApplication.postalAddress) {
      const addrPos = pos('postalAddress', 80, 318);
      drawText(mockApplication.postalAddress, addrPos.x, addrPos.y, { size: addrPos.fontSize });
    }
    
    // Email
    if (mockApplication.email) {
      const emailPos = pos('email', 80, 348);
      drawText(mockApplication.email, emailPos.x, emailPos.y, { size: emailPos.fontSize });
    }
    
    // Phone
    if (mockApplication.phoneNumber) {
      const phonePos = pos('phoneNumber', 80, 378);
      drawText(mockApplication.phoneNumber, phonePos.x, phonePos.y, { size: phonePos.fontSize });
    }
    
    // Plate choices
    if (mockApplication.plateChoices && mockApplication.plateChoices.length > 0) {
      const plate1Pos = pos('plateChoice1', 295, 590);
      drawText(mockApplication.plateChoices[0].plate, plate1Pos.x, plate1Pos.y, { size: plate1Pos.fontSize });
      
      if (mockApplication.plateChoices.length > 1) {
        const plate2Pos = pos('plateChoice2', 420, 590);
        drawText(mockApplication.plateChoices[1].plate, plate2Pos.x, plate2Pos.y, { size: plate2Pos.fontSize });
      }
      
      if (mockApplication.plateChoices.length > 2) {
        const plate3Pos = pos('plateChoice3', 545, 590);
        drawText(mockApplication.plateChoices[2].plate, plate3Pos.x, plate3Pos.y, { size: plate3Pos.fontSize });
      }
    }
    
    // Declaration place
    if (mockApplication.declarationPlace) {
      const placePos = pos('declarationPlace', 400, 831);
      drawText(mockApplication.declarationPlace, placePos.x, placePos.y, { size: placePos.fontSize });
    }
    
    // Declaration date
    if (mockApplication.declarationDate) {
      const date = new Date(mockApplication.declarationDate);
      const year = date.getFullYear().toString();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const yearPos = pos('declarationYear', 460, 831);
      const monthPos = pos('declarationMonth', 495, 831);
      const dayPos = pos('declarationDay', 530, 831);
      
      drawText(year, yearPos.x, yearPos.y, { size: yearPos.fontSize });
      drawText(month, monthPos.x, monthPos.y, { size: monthPos.fontSize });
      drawText(day, dayPos.x, dayPos.y, { size: dayPos.fontSize });
    }
    
    // Save the test PDF
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-REAL-DATA-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Test PDF with real data created!');
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 PDF size: ${pdfBytes.length} bytes\n`);
    console.log('💡 Check if the application data appears in the correct positions\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testWithRealData();


