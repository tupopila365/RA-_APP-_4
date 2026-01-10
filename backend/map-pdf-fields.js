/**
 * Script to help map field positions on the PLN-FORM.pdf template
 * This creates a test PDF with numbered markers to help identify exact coordinates
 * 
 * Usage: node map-pdf-fields.js
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function mapPDFFields() {
  try {
    console.log('\n🗺️  Mapping PDF Field Positions...\n');
    
    // Path to the template PDF
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    
    // Read the template PDF
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    console.log(`📄 Page dimensions: ${width} x ${height} points (A4)`);
    console.log(`   (1 point = 1/72 inch)\n`);
    
    // Create a grid of markers to help identify positions
    console.log('📍 Drawing coordinate grid and markers...\n');
    
    // Draw grid lines every 50 points
    for (let x = 0; x <= width; x += 50) {
      firstPage.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    }
    
    for (let y = 0; y <= height; y += 50) {
      firstPage.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    }
    
    // Draw coordinate labels at intersections
    for (let x = 0; x <= width; x += 50) {
      for (let y = 0; y <= height; y += 50) {
        const labelY = height - y; // Invert Y for PDF coordinates
        firstPage.drawText(`${x},${y}`, {
          x: x + 2,
          y: labelY - 8,
          size: 6,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
    
    // Draw field position markers based on estimated locations
    // These are approximate - you'll need to adjust based on actual PDF
    const fieldMarkers = [
      { name: 'Transaction: New PLN', x: 60, y: 140 },
      { name: 'ID Type: Traffic Register', x: 60, y: 195 },
      { name: 'ID Type: Namibia ID', x: 180, y: 195 },
      { name: 'ID Type: Business Reg', x: 320, y: 195 },
      { name: 'ID Number', x: 80, y: 228 },
      { name: 'Surname', x: 80, y: 258 },
      { name: 'Initials', x: 330, y: 258 },
      { name: 'Postal Address Line 1', x: 80, y: 293 },
      { name: 'Postal Address Line 2', x: 80, y: 311 },
      { name: 'Postal Address Line 3', x: 80, y: 329 },
      { name: 'Street Address Line 1', x: 80, y: 363 },
      { name: 'Street Address Line 2', x: 80, y: 381 },
      { name: 'Street Address Line 3', x: 80, y: 399 },
      { name: 'Phone Home Code', x: 200, y: 433 },
      { name: 'Phone Home Number', x: 280, y: 433 },
      { name: 'Phone Day Code', x: 200, y: 451 },
      { name: 'Phone Day Number', x: 280, y: 451 },
      { name: 'Cell Code', x: 200, y: 469 },
      { name: 'Cell Number', x: 280, y: 469 },
      { name: 'Email', x: 200, y: 487 },
      { name: 'Plate Format: Long/German', x: 60, y: 563 },
      { name: 'Plate Format: Normal', x: 60, y: 575 },
      { name: 'Plate Format: American', x: 60, y: 587 },
      { name: 'Plate Format: Square', x: 60, y: 599 },
      { name: 'Plate Format: Motorcycle', x: 60, y: 611 },
      { name: 'Plate Quantity', x: 230, y: 575 },
      { name: 'Plate Choice 1', x: 300, y: 575 },
      { name: 'Plate Choice 2', x: 380, y: 575 },
      { name: 'Plate Choice 3', x: 460, y: 575 },
      { name: 'Rep ID Type: Traffic', x: 60, y: 673 },
      { name: 'Rep ID Type: ID Doc', x: 180, y: 673 },
      { name: 'Rep ID Number', x: 80, y: 698 },
      { name: 'Rep Surname', x: 80, y: 723 },
      { name: 'Rep Initials', x: 330, y: 723 },
      { name: 'Vehicle: Current Licence', x: 250, y: 763 },
      { name: 'Vehicle: Register Number', x: 250, y: 781 },
      { name: 'Vehicle: Chassis/VIN', x: 250, y: 799 },
      { name: 'Vehicle: Make', x: 250, y: 817 },
      { name: 'Vehicle: Series', x: 250, y: 835 },
      { name: 'Declaration: Applicant', x: 60, y: 493 },
      { name: 'Declaration: Proxy', x: 180, y: 493 },
      { name: 'Declaration: Representative', x: 320, y: 493 },
      { name: 'Declaration Place', x: 450, y: 813 },
      { name: 'Declaration Year', x: 490, y: 831 },
      { name: 'Declaration Month', x: 510, y: 831 },
      { name: 'Declaration Day', x: 530, y: 831 },
    ];
    
    // Draw markers for each field
    fieldMarkers.forEach((marker, index) => {
      const labelY = height - marker.y; // Invert Y for PDF coordinates
      
      // Draw a red circle at the position
      firstPage.drawCircle({
        x: marker.x,
        y: labelY,
        size: 3,
        color: rgb(1, 0, 0),
      });
      
      // Draw the field name and coordinates
      firstPage.drawText(`${index + 1}. ${marker.name}`, {
        x: marker.x + 5,
        y: labelY + 5,
        size: 7,
        color: rgb(1, 0, 0),
      });
      
      firstPage.drawText(`(${marker.x}, ${marker.y})`, {
        x: marker.x + 5,
        y: labelY - 5,
        size: 6,
        color: rgb(0.5, 0, 0),
      });
    });
    
    // Save the mapped PDF
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-MAPPED.pdf');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    console.log('✅ Mapping complete!');
    console.log(`📄 Output saved to: ${outputPath}\n`);
    console.log('📋 Field Positions Mapped:\n');
    console.log('='.repeat(70));
    
    fieldMarkers.forEach((marker, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${marker.name.padEnd(40, ' ')} x: ${marker.x.toString().padStart(4, ' ')}, y: ${marker.y.toString().padStart(4, ' ')}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Instructions:');
    console.log('   1. Open PLN-FORM-MAPPED.pdf in a PDF viewer');
    console.log('   2. Check if the red markers align with the actual field positions');
    console.log('   3. If not aligned, note the correct coordinates');
    console.log('   4. Update the coordinates in overlayTextOnPDF() method\n');
    console.log('📝 Note: Y coordinates in PDF are from bottom-left (0,0)');
    console.log('   In the code, we use: y: height - actualY\n');
    
  } catch (error) {
    console.error('\n❌ Error mapping PDF fields:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the mapping
mapPDFFields();


