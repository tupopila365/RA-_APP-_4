/**
 * Test a single field position to help identify correct coordinates
 * 
 * Usage:
 *   node test-single-field.js --field idNumber --x 100 --y 230
 *   node test-single-field.js --field surname --x 80 --y 258
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      config[key] = value;
    }
  }
  
  return config;
}

async function testSingleField() {
  try {
    const config = parseArgs();
    
    const fieldName = config.field || 'idNumber';
    const testX = parseFloat(config.x) || 80;
    const testY = parseFloat(config.y) || 228;
    const testText = config.text || 'TEST TEXT HERE';
    
    console.log(`\n🧪 Testing Single Field Position\n`);
    console.log(`Field: ${fieldName}`);
    console.log(`X: ${testX}`);
    console.log(`Y: ${testY}`);
    console.log(`Text: ${testText}\n`);
    
    // Load template
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');
    const helvetica = await pdfDoc.embedFont('Helvetica');
    
    const pdfY = height - testY;
    
    // Draw a coordinate marker
    firstPage.drawLine({
      start: { x: testX - 20, y: pdfY },
      end: { x: testX + 150, y: pdfY },
      thickness: 1,
      color: rgb(1, 0, 0), // Red horizontal line
    });
    
    firstPage.drawLine({
      start: { x: testX, y: pdfY - 20 },
      end: { x: testX, y: pdfY + 20 },
      thickness: 1,
      color: rgb(0, 1, 0), // Green vertical line
    });
    
    // Draw background box
    firstPage.drawRectangle({
      x: testX - 2,
      y: pdfY - 12,
      width: 150,
      height: 14,
      color: rgb(1, 1, 0), // Yellow background
      opacity: 0.8,
    });
    
    firstPage.drawRectangle({
      x: testX - 2,
      y: pdfY - 12,
      width: 150,
      height: 14,
      borderColor: rgb(1, 0, 0), // Red border
      borderWidth: 2,
    });
    
    // Draw test text
    firstPage.drawText(testText, {
      x: testX,
      y: pdfY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Draw coordinates
    firstPage.drawText(`(${testX}, ${testY})`, {
      x: testX,
      y: pdfY - 25,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 1),
    });
    
    // Draw instruction
    firstPage.drawText(`Testing: ${fieldName}`, {
      x: 50,
      y: height - 30,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText(`Adjust with: node test-single-field.js --field ${fieldName} --x [NEW_X] --y [NEW_Y]`, {
      x: 50,
      y: height - 45,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    
    // Save
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-SINGLE-FIELD-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('✅ Test PDF created!');
    console.log(`📄 Saved to: ${outputPath}\n`);
    console.log('💡 Check if the yellow box aligns with the form field.');
    console.log(`   If not, adjust with:`);
    console.log(`   node test-single-field.js --field ${fieldName} --x [NEW_X] --y [NEW_Y]\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testSingleField();


