/**
 * Test to check if coordinate system is rotated
 */

const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testCoordinateSystem() {
  try {
    console.log('\n🧪 Testing Coordinate System...\n');
    
    // Load template
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page: ${width} x ${height} points\n`);
    
    // Check page rotation
    try {
      const rotation = firstPage.node.get('Rotate');
      console.log(`Page rotation: ${rotation}\n`);
    } catch (e) {
      console.log('Could not read page rotation\n');
    }
    
    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    
    console.log('Testing different coordinate approaches...\n');
    
    // Test 1: Normal coordinates
    console.log('Test 1: Normal X,Y (X=100, Y=from top=200)');
    firstPage.drawText('NORMAL', {
      x: 100,
      y: height - 200,
      size: 12,
      font: helveticaFont,
      color: rgb(1, 0, 0), // Red
    });
    
    // Test 2: Swapped coordinates (maybe X and Y are swapped?)
    console.log('Test 2: Swapped coordinates (X=200, Y=100)');
    firstPage.drawText('SWAPPED', {
      x: 200,
      y: height - 100,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 1, 0), // Green
    });
    
    // Test 3: Character by character with normal coords
    console.log('Test 3: Character by character, normal coords');
    let x = 100;
    const y = height - 250;
    'CHARBYCHAR'.split('').forEach((char, i) => {
      firstPage.drawText(char, {
        x: x + (i * 8),
        y: y, // Same Y for all
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 1), // Blue
      });
    });
    
    // Test 4: Character by character with swapped coords
    console.log('Test 4: Character by character, SWAPPED coords');
    let y2 = height - 300;
    const x2 = 100;
    'SWAPPEDCOORDS'.split('').forEach((char, i) => {
      firstPage.drawText(char, {
        x: x2, // Same X for all (vertical line)
        y: y2 - (i * 15), // Decrement Y (going up)
        size: 12,
        font: helveticaFont,
        color: rgb(1, 0, 1), // Magenta
      });
    });
    
    // Save
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-COORDINATE-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Test PDF created!');
    console.log(`📄 Saved to: ${outputPath}\n`);
    console.log('💡 Check which approach renders horizontally:\n');
    console.log('   - RED: Normal X,Y coordinates');
    console.log('   - GREEN: Swapped coordinates');
    console.log('   - BLUE: Character-by-char with incrementing X');
    console.log('   - MAGENTA: Character-by-char with incrementing Y\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testCoordinateSystem();


