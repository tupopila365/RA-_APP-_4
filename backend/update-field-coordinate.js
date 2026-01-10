/**
 * Helper script to update a single field coordinate in field-positions.json
 * 
 * Usage:
 *   node update-field-coordinate.js idNumber 100 230
 *   node update-field-coordinate.js surname 90 260
 */

const fs = require('fs').promises;
const path = require('path');

async function updateCoordinate() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('\n❌ Usage: node update-field-coordinate.js [fieldName] [x] [y]');
      console.log('   Example: node update-field-coordinate.js idNumber 100 230\n');
      process.exit(1);
    }
    
    const fieldName = args[0];
    const newX = parseFloat(args[1]);
    const newY = parseFloat(args[2]);
    const fontSize = args[3] ? parseFloat(args[3]) : null;
    
    if (isNaN(newX) || isNaN(newY)) {
      console.log('\n❌ Error: X and Y must be numbers');
      process.exit(1);
    }
    
    const positionsPath = path.join(__dirname, 'data/forms/field-positions.json');
    const data = await fs.readFile(positionsPath, 'utf-8');
    const fieldPositions = JSON.parse(data);
    
    if (!fieldPositions.fields[fieldName]) {
      console.log(`\n⚠️  Field "${fieldName}" not found. Creating new entry...`);
      fieldPositions.fields[fieldName] = {
        description: fieldName,
        type: 'text',
      };
    }
    
    // Get old values
    const oldX = fieldPositions.fields[fieldName].x;
    const oldY = fieldPositions.fields[fieldName].y;
    
    // Update values
    fieldPositions.fields[fieldName].x = newX;
    fieldPositions.fields[fieldName].y = newY;
    
    if (fontSize) {
      fieldPositions.fields[fieldName].fontSize = fontSize;
    }
    
    // Save
    await fs.writeFile(positionsPath, JSON.stringify(fieldPositions, null, 2), 'utf-8');
    
    console.log(`\n✅ Updated field: ${fieldName}`);
    console.log(`   Old: (${oldX || 'N/A'}, ${oldY || 'N/A'})`);
    console.log(`   New: (${newX}, ${newY})`);
    if (fontSize) {
      console.log(`   Font size: ${fontSize}`);
    }
    console.log('\n💡 Test the change with: node test-single-field.js --field ' + fieldName + ' --x ' + newX + ' --y ' + newY + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

updateCoordinate();


