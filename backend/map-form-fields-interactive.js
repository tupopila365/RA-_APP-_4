/**
 * Interactive tool to help map form field positions
 * This creates a PDF with visible markers that help identify correct positions
 */

const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function mapFormFields() {
  try {
    console.log('\n🗺️  Creating Interactive Form Field Mapper...\n');
    
    // Load template
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page: ${width} x ${height} points\n`);
    
    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');
    const helvetica = await pdfDoc.embedFont('Helvetica');
    
    console.log('📐 Drawing coordinate grid...\n');
    
    // Draw a coordinate grid to help identify positions
    for (let x = 0; x < width; x += 50) {
      firstPage.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      if (x % 100 === 0 && x > 0) {
        firstPage.drawText(`${x}`, {
          x: x - 10,
          y: height - 15,
          size: 8,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
    
    for (let y = 0; y < height; y += 50) {
      firstPage.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      if (y % 100 === 0 && y > 0) {
        firstPage.drawText(`${height - y}`, {
          x: 5,
          y: y - 5,
          size: 8,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
    
    console.log('📍 Drawing sample field markers at current positions...\n');
    
    // Draw markers for key fields to see current positions
    const fieldMarkers = [
      { label: 'ID Number', x: 80, y: 228, note: 'Should align with ID field' },
      { label: 'Surname', x: 80, y: 258, note: 'Should align with Surname field' },
      { label: 'Postal Addr L1', x: 80, y: 293, note: 'Postal Address Line 1' },
      { label: 'Plate Choice 1', x: 300, y: 570, note: 'First plate choice' },
      { label: 'Decl Place', x: 450, y: 490, note: 'Declaration place' },
      { label: 'Decl Date', x: 490, y: 508, note: 'Declaration date (YY)' },
    ];
    
    fieldMarkers.forEach((marker) => {
      const pdfY = height - marker.y;
      
      // Draw a bright colored box
      firstPage.drawRectangle({
        x: marker.x - 5,
        y: pdfY - 15,
        width: 150,
        height: 15,
        color: rgb(1, 1, 0), // Yellow background
        opacity: 0.7,
      });
      
      // Draw border
      firstPage.drawRectangle({
        x: marker.x - 5,
        y: pdfY - 15,
        width: 150,
        height: 15,
        borderColor: rgb(1, 0, 0), // Red border
        borderWidth: 1,
      });
      
      // Draw text
      firstPage.drawText(`${marker.label}`, {
        x: marker.x,
        y: pdfY - 12,
        size: 9,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      // Draw coordinates
      firstPage.drawText(`(${marker.x}, ${marker.y})`, {
        x: marker.x,
        y: pdfY - 25,
        size: 7,
        font: helvetica,
        color: rgb(0, 0, 1),
      });
      
      console.log(`✅ Marked "${marker.label}" at (${marker.x}, ${marker.y})`);
    });
    
    // Add instructions box
    firstPage.drawRectangle({
      x: width - 220,
      y: height - 100,
      width: 200,
      height: 90,
      color: rgb(1, 1, 1),
      borderColor: rgb(0, 0, 0),
      borderWidth: 2,
    });
    
    firstPage.drawText('INSTRUCTIONS:', {
      x: width - 210,
      y: height - 25,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText('1. Compare yellow boxes', {
      x: width - 210,
      y: height - 40,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText('   with actual form fields', {
      x: width - 210,
      y: height - 52,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText('2. Note coordinate differences', {
      x: width - 210,
      y: height - 64,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText('3. Update field-positions.json', {
      x: width - 210,
      y: height - 76,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    
    // Save
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-FIELD-MAPPER.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('\n✅ Field mapper PDF created!');
    console.log(`📄 Saved to: ${outputPath}\n`);
    console.log('💡 Instructions:');
    console.log('   1. Open PLN-FORM-FIELD-MAPPER.pdf');
    console.log('   2. Compare yellow boxes with actual form fields');
    console.log('   3. Note how much each box needs to move (X and Y)');
    console.log('   4. Update field-positions.json with corrected coordinates\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

mapFormFields();

