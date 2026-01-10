/**
 * Test script to verify PDF overlay is working
 * Usage: node test-pdf-overlay.js
 */

const { pdfService } = require('./dist/services/pdf.service');
const fs = require('fs').promises;
const path = require('path');

async function testPDFOverlay() {
  try {
    console.log('\n🧪 Testing PDF Overlay...\n');
    
    // Create test application data
    const testApplication = {
      referenceId: 'TEST-001',
      idType: 'Namibia ID-doc',
      trafficRegisterNumber: '1234567890123',
      surname: 'Test',
      initials: 'T',
      postalAddress: {
        line1: '123 Test Street',
        line2: 'Windhoek',
        line3: 'Namibia',
      },
      streetAddress: {
        line1: '123 Test Street',
        line2: 'Windhoek',
        line3: 'Namibia',
      },
      cellNumber: {
        code: '264',
        number: '811234567',
      },
      email: 'test@example.com',
      plateFormat: 'Normal',
      quantity: 2,
      plateChoices: [
        { text: 'ABC123', meaning: 'Test choice 1' },
        { text: 'XYZ789', meaning: 'Test choice 2' },
        { text: 'DEF456', meaning: 'Test choice 3' },
      ],
      declarationAccepted: true,
      declarationDate: new Date(),
      declarationPlace: 'Windhoek',
      declarationRole: 'applicant',
      documentUrl: 'test.pdf',
      status: 'SUBMITTED',
      statusHistory: [],
    };

        const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');

    console.log('📄 Template path:', templatePath);
    console.log('📋 Test application data:', JSON.stringify(testApplication, null, 2));
    console.log('');

    // Check if template exists
    try {
      await fs.access(templatePath);
      console.log('✅ Template PDF found');
    } catch (error) {
      console.error('❌ Template PDF not found:', templatePath);
      process.exit(1);
    }

    // Fill the PDF
    console.log('🖊️  Filling PDF with test data...');
    const pdfBuffer = await pdfService.fillPLNFormPDF(testApplication, templatePath);

    // Save test output
    const outputPath = path.join(__dirname, 'data/forms/PLN-FORM-TEST-OUTPUT.pdf');
    await fs.writeFile(outputPath, pdfBuffer);

    console.log('✅ PDF filled successfully!');
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 PDF size: ${pdfBuffer.length} bytes`);
    console.log('');
    console.log('💡 Open the output PDF to verify the data appears correctly');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error testing PDF overlay:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testPDFOverlay();

