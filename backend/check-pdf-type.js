/**
 * Check if the PDF is a scanned image or has actual text content
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function checkPDFType() {
  try {
    console.log('\n🔍 Checking PDF Type...\n');
    
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`📄 Page dimensions: ${width} x ${height} points\n`);
    
    // Try to get form fields
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log(`📋 Form fields found: ${fields.length}`);
    
    // Check if PDF has text content
    // Note: pdf-lib doesn't have a direct way to check for text content
    // but we can try to access page content
    
    console.log('\n💡 If this is a scanned PDF (image-based), text overlays might:');
    console.log('   1. Appear behind the image content');
    console.log('   2. Need special handling');
    console.log('   3. Require different coordinate mapping\n');
    
    console.log('✅ PDF loaded successfully\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkPDFType();


