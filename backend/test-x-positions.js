/**
 * Test different X positions to find correct horizontal alignment
 * This creates multiple test markers at different X positions
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function testXPositions() {
  try {
    console.log('\n🧪 Testing X Position Variations...\n');
    
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');
    
    console.log(`📄 Page: ${width} x ${height}\n`);
    console.log('📍 Drawing test markers at different X positions...\n');
    
    // Test different X positions for ID Number field (Y = 228)
    const testY = 228;
    const testXPositions = [40, 60, 80, 100, 120, 140, 160, 180, 200];
    
    testXPositions.forEach((x, index) => {
      const pdfY = height - testY;
      const label = `X=${x}`;
      
      // Different colors for each position
      const colors = [
        rgb(1, 0, 0), // Red
        rgb(0, 1, 0), // Green
        rgb(0, 0, 1), // Blue
        rgb(1, 1, 0), // Yellow
        rgb(1, 0, 1), // Magenta
        rgb(0, 1, 1), // Cyan
        rgb(0.5, 0, 0), // Dark red
        rgb(0, 0.5, 0), // Dark green
        rgb(0, 0, 0.5), // Dark blue
      ];
      
      firstPage.drawRectangle({
        x: x - 2,
        y: pdfY - 10,
        width: 30,
        height: 12,
        color: colors[index % colors.length],
        opacity: 0.6,
      });
      
      firstPage.drawText(label, {
        x: x,
        y: pdfY - 8,
        size: 8,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      console.log(`✅ Marked ${label} at (${x}, ${testY})`);
    });
    
    // Add instruction
    firstPage.drawText('Compare these markers with the ID Number field on the form', {
      x: 40,
      y: height - 50,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Save
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-X-POSITION-TEST.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ X Position Test PDF created!');
    console.log(`📄 Saved to: ${outputPath}\n`);
    console.log('💡 Which colored marker aligns best with the ID Number field?');
    console.log('   Tell me the X value and I will update all coordinates!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testXPositions();


