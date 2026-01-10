const fs = require('fs');
const path = require('path');

// Test the corrected PDF field coordinates
async function testCorrectedCoordinates() {
  console.log('🧪 Testing Corrected PLN PDF Coordinates...\n');
  
  try {
    // Check if pdf-lib is available
    let PDFLibDocument;
    try {
      const pdfLib = require('pdf-lib');
      PDFLibDocument = pdfLib.PDFDocument;
      console.log('✅ pdf-lib library available');
    } catch (error) {
      console.log('❌ pdf-lib not installed. Installing...');
      console.log('Run: cd backend && npm install pdf-lib');
      return;
    }
    
    // Load the template and field positions
    const templatePath = path.join(__dirname, 'backend/data/forms/PLN-FORM.pdf');
    const fieldPositionsPath = path.join(__dirname, 'backend/data/forms/field-positions.json');
    
    if (!fs.existsSync(templatePath)) {
      console.error('❌ Template PDF not found:', templatePath);
      return;
    }
    
    if (!fs.existsSync(fieldPositionsPath)) {
      console.error('❌ Field positions not found:', fieldPositionsPath);
      return;
    }
    
    console.log('✅ Template and field positions found');
    
    // Load field positions
    const fieldPositions = JSON.parse(fs.readFileSync(fieldPositionsPath, 'utf-8'));
    console.log(`📊 Loaded ${Object.keys(fieldPositions.fields).length} field positions`);
    
    // Load template PDF
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFLibDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    console.log(`📄 PDF page dimensions: ${width} x ${height}`);
    
    // Set page rotation to 0 to ensure proper orientation
    // firstPage.setRotation({ angle: 0 }); // Skip rotation setting
    
    // Embed fonts
    const { rgb } = require('pdf-lib');
    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
    
    // Sample test data
    const testData = {
      idType: 'Namibia ID-doc',
      trafficRegisterNumber: '12345678901',
      surname: 'SMITH',
      initials: 'J.D.',
      postalAddress: {
        line1: 'P.O. Box 123',
        line2: 'Windhoek',
        line3: 'Namibia'
      },
      streetAddress: {
        line1: '123 Main Street',
        line2: 'Klein Windhoek',
        line3: 'Windhoek'
      },
      cellNumber: { code: '264', number: '81234567' },
      email: 'john.smith@example.com',
      plateFormat: 'Normal',
      quantity: 1,
      plateChoices: [
        { text: 'SMITH1' },
        { text: 'JDS123' },
        { text: 'COOL1' }
      ],
      declarationPlace: 'Windhoek',
      declarationDate: new Date()
    };
    
    console.log('\n🎯 Adding test data to PDF...');
    
    // Helper function to draw text
    const drawText = (text, x, y, options = {}) => {
      if (!text) return;
      
      const fontSize = options.fontSize || 10;
      const font = options.bold ? helveticaBoldFont : helveticaFont;
      
      // Convert Y coordinate (our config uses top-down, PDF uses bottom-up)
      const pdfY = height - y;
      
      // Bounds check
      if (x < 0 || x > width || pdfY < 0 || pdfY > height) {
        console.warn(`⚠️  Text out of bounds: "${text}" at (${x}, ${y})`);
        return;
      }
      
      try {
        firstPage.drawText(String(text), {
          x,
          y: pdfY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
        console.log(`✓ Drew "${text}" at (${x}, ${y})`);
      } catch (error) {
        console.error(`❌ Error drawing "${text}": ${error.message}`);
      }
    };
    
    // Helper function to draw checkbox
    const drawCheckbox = (x, y) => {
      const pdfY = height - y;
      
      if (x < 0 || x > width || pdfY < 0 || pdfY > height) {
        console.warn(`⚠️  Checkbox out of bounds at (${x}, ${y})`);
        return;
      }
      
      try {
        firstPage.drawText('X', {
          x,
          y: pdfY,
          size: 12,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
        console.log(`✓ Drew checkbox at (${x}, ${y})`);
      } catch (error) {
        console.error(`❌ Error drawing checkbox: ${error.message}`);
      }
    };
    
    // Apply test data to form fields
    const fields = fieldPositions.fields;
    
    // Transaction type
    if (fields.transactionNewPLN) {
      drawCheckbox(fields.transactionNewPLN.x, fields.transactionNewPLN.y);
    }
    
    // ID Type
    if (testData.idType === 'Namibia ID-doc' && fields.idTypeNamibiaID) {
      drawCheckbox(fields.idTypeNamibiaID.x, fields.idTypeNamibiaID.y);
    }
    
    // ID Number
    if (fields.idNumber) {
      drawText(testData.trafficRegisterNumber, fields.idNumber.x, fields.idNumber.y, {
        fontSize: fields.idNumber.fontSize
      });
    }
    
    // Name
    if (fields.surname) {
      drawText(testData.surname, fields.surname.x, fields.surname.y, {
        fontSize: fields.surname.fontSize
      });
    }
    if (fields.initials) {
      drawText(testData.initials, fields.initials.x, fields.initials.y, {
        fontSize: fields.initials.fontSize
      });
    }
    
    // Addresses
    if (fields.postalAddressLine1) {
      drawText(testData.postalAddress.line1, fields.postalAddressLine1.x, fields.postalAddressLine1.y, {
        fontSize: fields.postalAddressLine1.fontSize
      });
    }
    if (fields.postalAddressLine2) {
      drawText(testData.postalAddress.line2, fields.postalAddressLine2.x, fields.postalAddressLine2.y, {
        fontSize: fields.postalAddressLine2.fontSize
      });
    }
    if (fields.postalAddressLine3) {
      drawText(testData.postalAddress.line3, fields.postalAddressLine3.x, fields.postalAddressLine3.y, {
        fontSize: fields.postalAddressLine3.fontSize
      });
    }
    
    if (fields.streetAddressLine1) {
      drawText(testData.streetAddress.line1, fields.streetAddressLine1.x, fields.streetAddressLine1.y, {
        fontSize: fields.streetAddressLine1.fontSize
      });
    }
    if (fields.streetAddressLine2) {
      drawText(testData.streetAddress.line2, fields.streetAddressLine2.x, fields.streetAddressLine2.y, {
        fontSize: fields.streetAddressLine2.fontSize
      });
    }
    if (fields.streetAddressLine3) {
      drawText(testData.streetAddress.line3, fields.streetAddressLine3.x, fields.streetAddressLine3.y, {
        fontSize: fields.streetAddressLine3.fontSize
      });
    }
    
    // Phone and email
    if (fields.cellNumberCode) {
      drawText(testData.cellNumber.code, fields.cellNumberCode.x, fields.cellNumberCode.y, {
        fontSize: fields.cellNumberCode.fontSize
      });
    }
    if (fields.cellNumberNumber) {
      drawText(testData.cellNumber.number, fields.cellNumberNumber.x, fields.cellNumberNumber.y, {
        fontSize: fields.cellNumberNumber.fontSize
      });
    }
    if (fields.email) {
      drawText(testData.email, fields.email.x, fields.email.y, {
        fontSize: fields.email.fontSize
      });
    }
    
    // Plate format
    if (testData.plateFormat === 'Normal' && fields.plateFormatNormal) {
      drawCheckbox(fields.plateFormatNormal.x, fields.plateFormatNormal.y);
    }
    
    // Plate quantity
    if (fields.plateQuantity) {
      drawText(testData.quantity.toString(), fields.plateQuantity.x, fields.plateQuantity.y, {
        fontSize: fields.plateQuantity.fontSize
      });
    }
    
    // Plate choices
    if (fields.plateChoice1) {
      drawText(testData.plateChoices[0].text, fields.plateChoice1.x, fields.plateChoice1.y, {
        fontSize: fields.plateChoice1.fontSize
      });
    }
    if (fields.plateChoice2) {
      drawText(testData.plateChoices[1].text, fields.plateChoice2.x, fields.plateChoice2.y, {
        fontSize: fields.plateChoice2.fontSize
      });
    }
    if (fields.plateChoice3) {
      drawText(testData.plateChoices[2].text, fields.plateChoice3.x, fields.plateChoice3.y, {
        fontSize: fields.plateChoice3.fontSize
      });
    }
    
    // Declaration
    if (fields.declarationRoleApplicant) {
      drawCheckbox(fields.declarationRoleApplicant.x, fields.declarationRoleApplicant.y);
    }
    if (fields.declarationPlace) {
      drawText(testData.declarationPlace, fields.declarationPlace.x, fields.declarationPlace.y, {
        fontSize: fields.declarationPlace.fontSize
      });
    }
    
    // Date
    const date = testData.declarationDate;
    if (fields.declarationYear) {
      drawText(date.getFullYear().toString().slice(2), fields.declarationYear.x, fields.declarationYear.y, {
        fontSize: fields.declarationYear.fontSize
      });
    }
    if (fields.declarationMonth) {
      drawText((date.getMonth() + 1).toString().padStart(2, '0'), fields.declarationMonth.x, fields.declarationMonth.y, {
        fontSize: fields.declarationMonth.fontSize
      });
    }
    if (fields.declarationDay) {
      drawText(date.getDate().toString().padStart(2, '0'), fields.declarationDay.x, fields.declarationDay.y, {
        fontSize: fields.declarationDay.fontSize
      });
    }
    
    // Save the test PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, 'backend/data/forms/PLN-FORM-COORDINATE-TEST-FIXED.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log(`\n✅ Test PDF generated: ${outputPath}`);
    console.log('\n📋 Next steps:');
    console.log('1. Open the generated PDF and check field alignment');
    console.log('2. If fields are still misaligned, run the interactive coordinate mapper');
    console.log('3. Update field positions as needed');
    console.log('4. Test with actual backend API');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testCorrectedCoordinates();