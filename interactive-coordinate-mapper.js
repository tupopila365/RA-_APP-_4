const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Interactive coordinate mapper for PLN form fields
class InteractiveCoordinateMapper {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.fieldPositionsPath = path.join(__dirname, 'backend/data/forms/field-positions.json');
    this.fieldPositions = null;
    this.currentField = null;
  }
  
  async start() {
    console.log('🎯 Interactive PLN Form Coordinate Mapper\n');
    console.log('This tool helps you fine-tune field positions by:');
    console.log('1. Showing current coordinates for each field');
    console.log('2. Allowing you to adjust X,Y positions');
    console.log('3. Generating test PDFs to verify alignment');
    console.log('4. Saving updated coordinates\n');
    
    // Load current field positions
    try {
      this.fieldPositions = JSON.parse(fs.readFileSync(this.fieldPositionsPath, 'utf-8'));
      console.log(`✅ Loaded ${Object.keys(this.fieldPositions.fields).length} field positions\n`);
    } catch (error) {
      console.error('❌ Failed to load field positions:', error.message);
      this.rl.close();
      return;
    }
    
    await this.showMainMenu();
  }
  
  async showMainMenu() {
    console.log('📋 Main Menu:');
    console.log('1. View all field positions');
    console.log('2. Edit specific field coordinates');
    console.log('3. Generate test PDF with current coordinates');
    console.log('4. Reset to backup coordinates');
    console.log('5. Save and exit');
    console.log('6. Exit without saving');
    
    const choice = await this.askQuestion('\nEnter your choice (1-6): ');
    
    switch (choice.trim()) {
      case '1':
        await this.viewAllFields();
        break;
      case '2':
        await this.editFieldCoordinates();
        break;
      case '3':
        await this.generateTestPDF();
        break;
      case '4':
        await this.resetToBackup();
        break;
      case '5':
        await this.saveAndExit();
        break;
      case '6':
        this.exit();
        break;
      default:
        console.log('❌ Invalid choice. Please try again.\n');
        await this.showMainMenu();
    }
  }
  
  async viewAllFields() {
    console.log('\n📊 Current Field Positions:\n');
    
    const fields = this.fieldPositions.fields;
    const fieldNames = Object.keys(fields).sort();
    
    console.log('Field Name'.padEnd(30) + 'X'.padEnd(8) + 'Y'.padEnd(8) + 'Type'.padEnd(12) + 'Description');
    console.log('-'.repeat(80));
    
    fieldNames.forEach(fieldName => {
      const field = fields[fieldName];
      console.log(
        fieldName.padEnd(30) +
        field.x.toString().padEnd(8) +
        field.y.toString().padEnd(8) +
        field.type.padEnd(12) +
        field.description.substring(0, 40)
      );
    });
    
    console.log('\n');
    await this.showMainMenu();
  }
  
  async editFieldCoordinates() {
    console.log('\n🔧 Edit Field Coordinates\n');
    
    const fieldNames = Object.keys(this.fieldPositions.fields).sort();
    console.log('Available fields:');
    fieldNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
    const fieldChoice = await this.askQuestion('\nEnter field number or name: ');
    
    let fieldName;
    if (/^\\d+$/.test(fieldChoice.trim())) {
      const index = parseInt(fieldChoice.trim()) - 1;
      if (index >= 0 && index < fieldNames.length) {
        fieldName = fieldNames[index];
      }
    } else {
      fieldName = fieldChoice.trim();
    }
    
    if (!fieldName || !this.fieldPositions.fields[fieldName]) {
      console.log('❌ Invalid field selection.\n');
      await this.editFieldCoordinates();
      return;
    }
    
    const field = this.fieldPositions.fields[fieldName];
    console.log(`\n📍 Current position for "${fieldName}":`);
    console.log(`   X: ${field.x}`);
    console.log(`   Y: ${field.y}`);
    console.log(`   Type: ${field.type}`);
    console.log(`   Description: ${field.description}`);
    
    const newX = await this.askQuestion(`\nEnter new X coordinate (current: ${field.x}): `);
    const newY = await this.askQuestion(`Enter new Y coordinate (current: ${field.y}): `);
    
    if (newX.trim() && !isNaN(newX.trim())) {
      field.x = parseInt(newX.trim());
      console.log(`✅ Updated X to ${field.x}`);
    }
    
    if (newY.trim() && !isNaN(newY.trim())) {
      field.y = parseInt(newY.trim());
      console.log(`✅ Updated Y to ${field.y}`);
    }
    
    const continueEditing = await this.askQuestion('\nEdit another field? (y/n): ');
    if (continueEditing.toLowerCase().startsWith('y')) {
      await this.editFieldCoordinates();
    } else {
      await this.showMainMenu();
    }
  }
  
  async generateTestPDF() {
    console.log('\n🧪 Generating test PDF with current coordinates...');
    
    try {
      // Save current positions temporarily
      const tempPath = path.join(__dirname, 'backend/data/forms/field-positions-temp.json');
      fs.writeFileSync(tempPath, JSON.stringify(this.fieldPositions, null, 2));
      
      // Run the coordinate test script
      const { spawn } = require('child_process');
      const testProcess = spawn('node', ['test-pdf-coordinate-fix.js'], {
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Test PDF generated successfully!');
          console.log('📄 Check: backend/data/forms/PLN-FORM-COORDINATE-TEST-FIXED.pdf');
        } else {
          console.log('\n❌ Test PDF generation failed');
        }
        this.showMainMenu();
      });
      
    } catch (error) {
      console.error('❌ Failed to generate test PDF:', error.message);
      await this.showMainMenu();
    }
  }
  
  async resetToBackup() {
    const backupPath = path.join(__dirname, 'backend/data/forms/field-positions-backup.json');
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ No backup file found.\n');
      await this.showMainMenu();
      return;
    }
    
    const confirm = await this.askQuestion('⚠️  This will reset all coordinates to backup. Continue? (y/n): ');
    if (confirm.toLowerCase().startsWith('y')) {
      try {
        const backupData = fs.readFileSync(backupPath, 'utf-8');
        this.fieldPositions = JSON.parse(backupData);
        console.log('✅ Coordinates reset to backup values.\n');
      } catch (error) {
        console.error('❌ Failed to load backup:', error.message);
      }
    }
    
    await this.showMainMenu();
  }
  
  async saveAndExit() {
    try {
      fs.writeFileSync(this.fieldPositionsPath, JSON.stringify(this.fieldPositions, null, 2));
      console.log('✅ Field positions saved successfully!');
      console.log('🎯 You can now test the updated coordinates with your backend API.');
      this.exit();
    } catch (error) {
      console.error('❌ Failed to save field positions:', error.message);
      this.exit();
    }
  }
  
  exit() {
    console.log('\n👋 Goodbye!');
    this.rl.close();
  }
  
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Quick coordinate adjustment suggestions based on common form layouts
function suggestCoordinateAdjustments() {
  console.log('💡 Common Coordinate Adjustment Tips:\n');
  
  console.log('📋 Form Layout Analysis:');
  console.log('- The form appears to be in landscape orientation');
  console.log('- Checkboxes are typically small (10-15px)');
  console.log('- Text fields in grid boxes need precise alignment');
  console.log('- PDF coordinates: (0,0) = bottom-left, Y increases upward\n');
  
  console.log('🎯 Adjustment Guidelines:');
  console.log('- If text appears too high: INCREASE Y coordinate');
  console.log('- If text appears too low: DECREASE Y coordinate');
  console.log('- If text appears too far left: INCREASE X coordinate');
  console.log('- If text appears too far right: DECREASE X coordinate\n');
  
  console.log('📏 Typical Spacing:');
  console.log('- Between form lines: 15-20 pixels');
  console.log('- Grid box width: 10-12 pixels');
  console.log('- Font size for grid boxes: 8-10px');
  console.log('- Font size for regular text: 9-11px\n');
  
  console.log('🔍 Testing Strategy:');
  console.log('1. Start with major sections (A, B, C, D, E)');
  console.log('2. Align one field per section first');
  console.log('3. Use that field as reference for others in same section');
  console.log('4. Generate test PDF after each major adjustment');
  console.log('5. Fine-tune individual fields last\n');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    suggestCoordinateAdjustments();
  } else if (args.includes('--tips')) {
    suggestCoordinateAdjustments();
  } else {
    const mapper = new InteractiveCoordinateMapper();
    mapper.start().catch(console.error);
  }
}