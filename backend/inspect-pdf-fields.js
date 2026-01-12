/**
 * Script to inspect PDF form field names
 * Usage: node inspect-pdf-fields.js
 * 
 * This script will read the PLN-FORM.pdf template and list all form field names
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function inspectPDFFields() {
  try {
    // Resolve path to PDF template
    const templatePath = path.join(__dirname, 'data/forms/PLN-FORM.pdf');
    
    console.log('\n🔍 Inspecting PDF Form Fields...\n');
    console.log('PDF Template:', templatePath);
    console.log('');
    
    // Read the PDF file
    const templateBytes = await fs.readFile(templatePath);
    console.log(`✅ PDF loaded successfully (${templateBytes.length} bytes)\n`);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`📋 Found ${fields.length} form fields:\n`);
    console.log('=' .repeat(60));
    
    if (fields.length === 0) {
      console.log('⚠️  WARNING: No form fields found in this PDF!');
      console.log('   This PDF may not have interactive form fields (AcroForm).');
      console.log('   It might be a static PDF that needs to be converted to a fillable form.');
      console.log('');
    } else {
      // Group fields by type
      const fieldsByType = {
        text: [],
        checkbox: [],
        radio: [],
        dropdown: [],
        other: []
      };
      
      fields.forEach((field) => {
        const name = field.getName();
        const type = field.constructor.name;
        
        if (type.includes('PDFTextField')) {
          fieldsByType.text.push({ name, type });
        } else if (type.includes('PDFCheckBox')) {
          fieldsByType.checkbox.push({ name, type });
        } else if (type.includes('PDFRadioGroup')) {
          fieldsByType.radio.push({ name, type });
        } else if (type.includes('PDFDropdown')) {
          fieldsByType.dropdown.push({ name, type });
        } else {
          fieldsByType.other.push({ name, type });
        }
      });
      
      // Print text fields
      if (fieldsByType.text.length > 0) {
        console.log('\n📝 TEXT FIELDS:');
        console.log('-'.repeat(60));
        fieldsByType.text.forEach(({ name, type }) => {
          console.log(`  • ${name} (${type})`);
        });
      }
      
      // Print checkboxes
      if (fieldsByType.checkbox.length > 0) {
        console.log('\n☑️  CHECKBOXES:');
        console.log('-'.repeat(60));
        fieldsByType.checkbox.forEach(({ name, type }) => {
          console.log(`  • ${name} (${type})`);
        });
      }
      
      // Print radio buttons
      if (fieldsByType.radio.length > 0) {
        console.log('\n🔘 RADIO BUTTONS:');
        console.log('-'.repeat(60));
        fieldsByType.radio.forEach(({ name, type }) => {
          console.log(`  • ${name} (${type})`);
        });
      }
      
      // Print dropdowns
      if (fieldsByType.dropdown.length > 0) {
        console.log('\n📋 DROPDOWNS:');
        console.log('-'.repeat(60));
        fieldsByType.dropdown.forEach(({ name, type }) => {
          console.log(`  • ${name} (${type})`);
        });
      }
      
      // Print other fields
      if (fieldsByType.other.length > 0) {
        console.log('\n❓ OTHER FIELDS:');
        console.log('-'.repeat(60));
        fieldsByType.other.forEach(({ name, type }) => {
          console.log(`  • ${name} (${type})`);
        });
      }
      
      // Print all field names in a simple list for easy copying
      console.log('\n');
      console.log('='.repeat(60));
      console.log('\n📋 ALL FIELD NAMES (for easy copying):\n');
      fields.forEach((field) => {
        console.log(`  "${field.getName()}",`);
      });
    }
    
    console.log('\n');
    console.log('='.repeat(60));
    console.log('\n✅ Inspection complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error inspecting PDF:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the inspection
inspectPDFFields();










