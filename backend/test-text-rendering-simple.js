/**
 * Minimal test to check if text renders horizontally or vertically
 */

const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testTextRendering() {
  try {
    console.log('\n🧪 Testing Text Rendering (Minimal Test)...\n');
    
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
    const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');
    
    console.log('🖊️  Drawing test text...\n');
    
    // Test 1: Simple text without font
    console.log('Test 1: Text without font');
    firstPage.drawText('MUKAMANA', {
      x: 100,
      y: height - 200,
      size: 12,
      color: rgb(1, 0, 0), // Red
    });
    
    // Test 2: Text with font
    console.log('Test 2: Text with Helvetica font');
    firstPage.drawText('MUKAMANA', {
      x: 100,
      y: height - 220,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 1, 0), // Green
    });
    
    // Test 3: Text with explicit rotation
    console.log('Test 3: Text with explicit 0 degree rotation');
    firstPage.drawText('MUKAMANA', {
      x: 100,
      y: height - 240,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 1), // Blue
      rotate: degrees(0),
    });
    
    // Test 4: Multiple words
    console.log('Test 4: Multiple words as single string');
    firstPage.drawText('ABC 123 XYZ', {
      x: 100,
      y: height - 260,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0), // Black
      rotate: degrees(0),
    });
    
    // Test 5: Check if string is being split
    const testString = 'TEST';
    console.log('Test 5: Single word', testString);
    // Draw entire string in one call
    firstPage.drawText(testString, {
      x: 100,
      y: height - 280,
      size: 16,
      font: helveticaBold,
      color: rgb(1, 0, 1), // Magenta
      rotate: degrees(0),
    });
    
    // Save
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-TEXT-RENDERING-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Test PDF created!');
    console.log(`📄 Saved to: ${outputPath}\n`);
    console.log('💡 Check the PDF:');
    console.log('   - Red text at top: No font');
    console.log('   - Green text: With Helvetica font');
    console.log('   - Blue text: With explicit rotation=0');
    console.log('   - Black text: Multiple words');
    console.log('   - Magenta text: Bold single word\n');
    console.log('If ANY text renders vertically, the issue is with pdf-lib or the PDF template.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testTextRendering();


