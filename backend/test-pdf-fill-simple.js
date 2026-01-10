/**
 * Simple test to verify PDF filling works
 * This will create a test PDF with visible text to verify the overlay is working
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testPDFFill() {
  try {
    console.log('\n🧪 Testing PDF Fill (Simple Test)...\n');
    
    // Load the template PDF
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page dimensions: ${width} x ${height} points\n`);
    
    // Embed fonts to ensure text renders correctly
    const helveticaFont = await pdfDoc.embedFont('Helvetica-Bold');
    const helveticaRegular = await pdfDoc.embedFont('Helvetica');
    
    console.log('✅ Fonts embedded\n');
    
    // Draw test text at various positions to verify overlay works
    console.log('🖊️  Drawing test text at multiple positions...\n');
    
    // Draw a white background box first (to make text more visible)
    firstPage.drawRectangle({
      x: 40,
      y: height - 100,
      width: 200,
      height: 60,
      color: rgb(1, 1, 1), // White background
      borderColor: rgb(1, 0, 0),
      borderWidth: 2,
    });
    
    // Test 1: Top-left corner (should be visible) - LARGE RED TEXT
    firstPage.drawText('TOP-LEFT TEST', {
      x: 50,
      y: height - 50, // Y from bottom, so height - 50 from top
      size: 20, // Larger size
      font: helveticaFont,
      color: rgb(1, 0, 0), // Red text to make it visible
    });
    console.log('✅ Drew "TOP-LEFT TEST" in RED at (50, 50 from top)');
    
    // Test 2: Top-right corner - LARGE GREEN TEXT
    firstPage.drawText('TOP-RIGHT TEST', {
      x: width - 180,
      y: height - 50,
      size: 20,
      font: helveticaFont,
      color: rgb(0, 1, 0), // Green text
    });
    console.log('✅ Drew "TOP-RIGHT TEST" in GREEN at top-right');
    
    // Test 3: Center of page - LARGE BLUE TEXT
    firstPage.drawText('CENTER TEST', {
      x: width / 2 - 60,
      y: height / 2,
      size: 24,
      font: helveticaFont,
      color: rgb(0, 0, 1), // Blue text
    });
    console.log('✅ Drew "CENTER TEST" in BLUE at center');
    
    // Test 4: Draw some actual application data at estimated positions - LARGE BOLD TEXT
    firstPage.drawRectangle({
      x: 70,
      y: height - 280,
      width: 150,
      height: 30,
      color: rgb(1, 1, 0.8), // Light yellow background
      borderColor: rgb(1, 0, 0),
      borderWidth: 2,
    });
    firstPage.drawText('TEST SURNAME', {
      x: 80,
      y: height - 258, // Y from bottom
      size: 14,
      font: helveticaFont,
      color: rgb(0, 0, 0), // Black
    });
    console.log('✅ Drew "TEST SURNAME" in BLACK at (80, 258 from top)');
    
    firstPage.drawRectangle({
      x: 70,
      y: height - 250,
      width: 150,
      height: 30,
      color: rgb(0.8, 1, 0.8), // Light green background
      borderColor: rgb(0, 1, 0),
      borderWidth: 2,
    });
    firstPage.drawText('1234567890', {
      x: 80,
      y: height - 228, // ID number position
      size: 14,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Drew test ID number at (80, 228 from top)');
    
    // Draw a large X for checkbox test with background
    firstPage.drawRectangle({
      x: 50,
      y: height - 215,
      width: 30,
      height: 30,
      color: rgb(1, 0.9, 0.9), // Light red background
      borderColor: rgb(1, 0, 0),
      borderWidth: 3,
    });
    firstPage.drawText('X', {
      x: 60,
      y: height - 195, // Checkbox position
      size: 20,
      font: helveticaFont,
      color: rgb(1, 0, 0), // Red X
    });
    console.log('✅ Drew large checkbox X in RED at (60, 195 from top)');
    
    // Draw text along the edges to verify coordinates
    for (let i = 0; i < 5; i++) {
      const x = 50 + (i * 150);
      firstPage.drawText(`${x},50`, {
        x: x,
        y: height - 50,
        size: 12,
        font: helveticaRegular,
        color: rgb(0, 0, 0),
      });
    }
    console.log('✅ Drew coordinate markers along top edge');
    
    // Save the test PDF
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-FILL-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Test PDF created successfully!');
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 PDF size: ${pdfBytes.length} bytes\n`);
    console.log('💡 Open the PDF and check if you can see:');
    console.log('   - "TOP-LEFT TEST" in red at top-left');
    console.log('   - "TOP-RIGHT TEST" in green at top-right');
    console.log('   - "CENTER TEST" in blue at center');
    console.log('   - "TEST SURNAME" and ID number in black');
    console.log('   - Red X for checkbox\n');
    console.log('If you can see these, the overlay is working!');
    console.log('If not, there may be a coordinate system issue.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testPDFFill();

