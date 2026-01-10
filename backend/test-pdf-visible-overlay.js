/**
 * Test to create a visible overlay on the PDF
 * This version draws white backgrounds behind text to ensure visibility
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testVisibleOverlay() {
  try {
    console.log('\n🧪 Testing Visible PDF Overlay...\n');
    
    // Load the template PDF
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page dimensions: ${width} x ${height} points\n`);
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont('Helvetica-Bold');
    
    console.log('🖊️  Drawing visible test overlays with white backgrounds...\n');
    
    // Test 1: Draw a large white box with red border and text INSIDE it
    firstPage.drawRectangle({
      x: 40,
      y: height - 100,
      width: 300,
      height: 50,
      color: rgb(1, 1, 1), // White fill
      borderColor: rgb(1, 0, 0),
      borderWidth: 3,
    });
    firstPage.drawText('VISIBLE TEST 1 - RED BORDER', {
      x: 50,
      y: height - 65,
      size: 16,
      font: helveticaFont,
      color: rgb(1, 0, 0),
    });
    console.log('✅ Drew white box with red text at top-left');
    
    // Test 2: Draw text with yellow background (highly visible)
    firstPage.drawRectangle({
      x: width - 300,
      y: height - 100,
      width: 260,
      height: 50,
      color: rgb(1, 1, 0), // Yellow fill
      borderColor: rgb(0, 0, 0),
      borderWidth: 2,
    });
    firstPage.drawText('VISIBLE TEST 2 - YELLOW', {
      x: width - 290,
      y: height - 65,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Drew yellow box with black text at top-right');
    
    // Test 3: Draw actual form field positions with markers
    // ID Number field
    firstPage.drawRectangle({
      x: 75,
      y: height - 245,
      width: 150,
      height: 20,
      color: rgb(0.9, 1, 0.9), // Light green
      borderColor: rgb(0, 0.5, 0),
      borderWidth: 2,
    });
    firstPage.drawText('ID: 1234567890123', {
      x: 80,
      y: height - 228,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Drew ID number field marker at estimated position');
    
    // Surname field
    firstPage.drawRectangle({
      x: 75,
      y: height - 275,
      width: 150,
      height: 20,
      color: rgb(1, 0.9, 0.9), // Light red
      borderColor: rgb(0.5, 0, 0),
      borderWidth: 2,
    });
    firstPage.drawText('SURNAME: TEST', {
      x: 80,
      y: height - 258,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Drew surname field marker at estimated position');
    
    // Plate choice
    firstPage.drawRectangle({
      x: 295,
      y: height - 590,
      width: 80,
      height: 20,
      color: rgb(0.9, 0.9, 1), // Light blue
      borderColor: rgb(0, 0, 0.5),
      borderWidth: 2,
    });
    firstPage.drawText('ABC123', {
      x: 300,
      y: height - 575,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Drew plate choice marker at estimated position');
    
    // Save the test PDF
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-VISIBLE-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Visible test PDF created!');
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 PDF size: ${pdfBytes.length} bytes\n`);
    console.log('💡 Open the PDF and you should see:');
    console.log('   - A WHITE box with RED border and text at top-left');
    console.log('   - A YELLOW box with text at top-right');
    console.log('   - Colored boxes marking estimated form field positions\n');
    console.log('⚠️  If you STILL can\'t see these colored boxes,');
    console.log('   the PDF template might be preventing overlays.\n');
    console.log('   Solution: We may need to use PDF flattening or');
    console.log('   create the filled form from scratch instead.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testVisibleOverlay();


