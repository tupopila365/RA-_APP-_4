const fs = require('fs');
const path = require('path');

// Fix PLN form field coordinates based on actual form layout
function fixFieldCoordinates() {
  console.log('🔧 Fixing PLN Form Field Coordinates...\n');
  
  // Based on the actual form image, here are the corrected coordinates
  // The form appears to be landscape orientation (wider than tall)
  // PDF coordinates: (0,0) is bottom-left, Y increases upward
  
  const correctedFieldPositions = {
    "pageDimensions": {
      "width": 841.68,  // A4 landscape width
      "height": 595.28  // A4 landscape height
    },
    "fields": {
      // Transaction type checkbox - "New Personalised Licence Number" (top left area)
      "transactionNewPLN": {
        "description": "Transaction type checkbox - New Personalised Licence Number",
        "x": 25,
        "y": 550,
        "type": "checkbox"
      },

      // Section A: PARTICULARS OF OWNER/TRANSFEROR
      
      // ID Type checkboxes (middle-left area)
      "idTypeTrafficRegister": {
        "description": "ID Type checkbox - Traffic Register Number",
        "x": 25,
        "y": 480,
        "type": "checkbox"
      },
      "idTypeNamibiaID": {
        "description": "ID Type checkbox - Namibia ID-doc",
        "x": 25,
        "y": 460,
        "type": "checkbox"
      },
      "idTypeBusinessReg": {
        "description": "ID Type checkbox - Business Reg. No",
        "x": 25,
        "y": 440,
        "type": "checkbox"
      },

      // Identification number (grid boxes in middle area)
      "idNumber": {
        "description": "Identification number / Business Reg. Number",
        "x": 25,
        "y": 410,
        "type": "text",
        "fontSize": 8,
        "maxLength": 20
      },

      // Name fields (grid boxes)
      "surname": {
        "description": "Surname",
        "x": 25,
        "y": 380,
        "type": "text",
        "fontSize": 8,
        "maxLength": 25
      },
      "initials": {
        "description": "Initials",
        "x": 400,
        "y": 380,
        "type": "text",
        "fontSize": 8,
        "maxLength": 5
      },
      "businessName": {
        "description": "Business Name (if Business Reg.)",
        "x": 25,
        "y": 380,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },

      // Postal address (3 lines of grid boxes)
      "postalAddressLine1": {
        "description": "Postal Address Line 1",
        "x": 25,
        "y": 350,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },
      "postalAddressLine2": {
        "description": "Postal Address Line 2",
        "x": 25,
        "y": 330,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },
      "postalAddressLine3": {
        "description": "Postal Address Line 3",
        "x": 25,
        "y": 310,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },

      // Street address (3 lines of grid boxes)
      "streetAddressLine1": {
        "description": "Street Address Line 1",
        "x": 25,
        "y": 280,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },
      "streetAddressLine2": {
        "description": "Street Address Line 2",
        "x": 25,
        "y": 260,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },
      "streetAddressLine3": {
        "description": "Street Address Line 3",
        "x": 25,
        "y": 240,
        "type": "text",
        "fontSize": 8,
        "maxLength": 40
      },

      // Phone numbers (right side of form)
      "telephoneHomeCode": {
        "description": "Telephone Home Code",
        "x": 500,
        "y": 480,
        "type": "text",
        "fontSize": 8,
        "maxLength": 4
      },
      "telephoneHomeNumber": {
        "description": "Telephone Home Number",
        "x": 540,
        "y": 480,
        "type": "text",
        "fontSize": 8,
        "maxLength": 10
      },
      "telephoneDayCode": {
        "description": "Telephone Day Code",
        "x": 500,
        "y": 460,
        "type": "text",
        "fontSize": 8,
        "maxLength": 4
      },
      "telephoneDayNumber": {
        "description": "Telephone Day Number",
        "x": 540,
        "y": 460,
        "type": "text",
        "fontSize": 8,
        "maxLength": 10
      },
      "cellNumberCode": {
        "description": "Cell Number Code",
        "x": 500,
        "y": 440,
        "type": "text",
        "fontSize": 8,
        "maxLength": 4
      },
      "cellNumberNumber": {
        "description": "Cell Number",
        "x": 540,
        "y": 440,
        "type": "text",
        "fontSize": 8,
        "maxLength": 10
      },
      "email": {
        "description": "Email",
        "x": 500,
        "y": 420,
        "type": "text",
        "fontSize": 8,
        "maxLength": 30
      },

      // Section B: PERSONALISED NUMBER PLATE (right side)
      
      // Plate format checkboxes (right column)
      "plateFormatLongGerman": {
        "description": "Plate Format checkbox - Long/German",
        "x": 500,
        "y": 380,
        "type": "checkbox"
      },
      "plateFormatNormal": {
        "description": "Plate Format checkbox - Normal",
        "x": 500,
        "y": 360,
        "type": "checkbox"
      },
      "plateFormatAmerican": {
        "description": "Plate Format checkbox - American",
        "x": 500,
        "y": 340,
        "type": "checkbox"
      },
      "plateFormatSquare": {
        "description": "Plate Format checkbox - Square",
        "x": 500,
        "y": 320,
        "type": "checkbox"
      },
      "plateFormatMotorcycle": {
        "description": "Plate Format checkbox - Small motorcycle",
        "x": 500,
        "y": 300,
        "type": "checkbox"
      },

      // Plate quantity and choices (right side)
      "plateQuantity": {
        "description": "Plate Quantity (1 or 2)",
        "x": 600,
        "y": 350,
        "type": "text",
        "fontSize": 10,
        "maxLength": 1
      },
      "plateChoice1": {
        "description": "1st Plate Choice",
        "x": 650,
        "y": 380,
        "type": "text",
        "fontSize": 10,
        "maxLength": 8
      },
      "plateChoice2": {
        "description": "2nd Plate Choice",
        "x": 720,
        "y": 380,
        "type": "text",
        "fontSize": 10,
        "maxLength": 8
      },
      "plateChoice3": {
        "description": "3rd Plate Choice",
        "x": 790,
        "y": 380,
        "type": "text",
        "fontSize": 10,
        "maxLength": 8
      },

      // Section C: REPRESENTATIVE/PROXY (if applicable)
      "representativeIdTypeTraffic": {
        "description": "Representative ID Type - Traffic Register",
        "x": 25,
        "y": 200,
        "type": "checkbox"
      },
      "representativeIdTypeIDDoc": {
        "description": "Representative ID Type - Namibia ID-doc",
        "x": 25,
        "y": 180,
        "type": "checkbox"
      },
      "representativeIdNumber": {
        "description": "Representative Identification Number",
        "x": 25,
        "y": 160,
        "type": "text",
        "fontSize": 8,
        "maxLength": 15
      },
      "representativeSurname": {
        "description": "Representative Surname",
        "x": 25,
        "y": 140,
        "type": "text",
        "fontSize": 8,
        "maxLength": 20
      },
      "representativeInitials": {
        "description": "Representative Initials",
        "x": 300,
        "y": 140,
        "type": "text",
        "fontSize": 8,
        "maxLength": 5
      },

      // Section D: VEHICLE PARTICULARS (middle area)
      "vehicleCurrentLicence": {
        "description": "Current Licence Number",
        "x": 300,
        "y": 200,
        "type": "text",
        "fontSize": 8,
        "maxLength": 10
      },
      "vehicleRegisterNumber": {
        "description": "Vehicle Register Number",
        "x": 300,
        "y": 180,
        "type": "text",
        "fontSize": 8,
        "maxLength": 15
      },
      "vehicleChassisNumber": {
        "description": "Chassis Number / VIN",
        "x": 300,
        "y": 160,
        "type": "text",
        "fontSize": 8,
        "maxLength": 20
      },
      "vehicleMake": {
        "description": "Vehicle Make",
        "x": 300,
        "y": 140,
        "type": "text",
        "fontSize": 8,
        "maxLength": 15
      },
      "vehicleSeries": {
        "description": "Series Name",
        "x": 300,
        "y": 120,
        "type": "text",
        "fontSize": 8,
        "maxLength": 15
      },

      // Section E: DECLARATION (bottom area)
      "declarationRoleApplicant": {
        "description": "Declaration Role - Applicant",
        "x": 25,
        "y": 100,
        "type": "checkbox"
      },
      "declarationRoleProxy": {
        "description": "Declaration Role - Proxy",
        "x": 150,
        "y": 100,
        "type": "checkbox"
      },
      "declarationRoleRepresentative": {
        "description": "Declaration Role - Representative",
        "x": 275,
        "y": 100,
        "type": "checkbox"
      },
      "declarationPlace": {
        "description": "Declaration Place",
        "x": 600,
        "y": 80,
        "type": "text",
        "fontSize": 8,
        "maxLength": 20
      },
      "declarationYear": {
        "description": "Declaration Year (YY)",
        "x": 720,
        "y": 60,
        "type": "text",
        "fontSize": 8,
        "maxLength": 2
      },
      "declarationMonth": {
        "description": "Declaration Month (MM)",
        "x": 750,
        "y": 60,
        "type": "text",
        "fontSize": 8,
        "maxLength": 2
      },
      "declarationDay": {
        "description": "Declaration Day (DD)",
        "x": 780,
        "y": 60,
        "type": "text",
        "fontSize": 8,
        "maxLength": 2
      }
    }
  };

  // Write the corrected field positions
  const configPath = path.join(__dirname, 'backend/data/forms/field-positions.json');
  const backupPath = path.join(__dirname, 'backend/data/forms/field-positions-backup.json');
  
  // Create backup of original
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath);
    console.log('✅ Created backup: field-positions-backup.json');
  }
  
  // Write corrected positions
  fs.writeFileSync(configPath, JSON.stringify(correctedFieldPositions, null, 2));
  console.log('✅ Updated field positions with corrected coordinates');
  
  console.log('\n📊 Field position summary:');
  console.log(`   Total fields: ${Object.keys(correctedFieldPositions.fields).length}`);
  console.log(`   Page dimensions: ${correctedFieldPositions.pageDimensions.width} x ${correctedFieldPositions.pageDimensions.height}`);
  
  console.log('\n🔍 Key coordinate changes:');
  console.log('   - Adjusted for landscape orientation');
  console.log('   - Fixed checkbox positions');
  console.log('   - Corrected text field alignments');
  console.log('   - Added character limits for grid boxes');
  
  console.log('\n🧪 Next steps:');
  console.log('1. Test PDF generation: node test-pdf-coordinate-fix.js');
  console.log('2. Generate a test PDF to verify positioning');
  console.log('3. Fine-tune coordinates if needed');
  
  return correctedFieldPositions;
}

// Run the fix
fixFieldCoordinates();