# How to Correct PDF Field Coordinates

## Quick Guide

### Step 1: Open the Test PDFs
1. Open `PLN-FORM-X-POSITION-TEST.pdf` - Shows markers at different X positions
2. Open `PLN-FORM-FIELD-MAPPER.pdf` - Shows a grid and current field markers
3. Open `PLN-FORM.pdf` - The original form template

### Step 2: Identify Correct Positions
1. Compare the colored markers/test boxes with the actual form fields
2. Note which marker aligns best with each field
3. Write down the correct X and Y coordinates

### Step 3: Update field-positions.json
Edit `RA-_APP-_4/backend/data/forms/field-positions.json` and update the coordinates:

```json
{
  "fields": {
    "idNumber": {
      "x": 80,    // Change this X value
      "y": 228,   // Change this Y value
      "type": "text",
      "fontSize": 9
    }
  }
}
```

### Step 4: Test Your Changes
Run the test script to see if coordinates are correct:
```bash
node test-pdf-exact-overlay.js
```

Open the generated PDF to verify positions are correct.

## Coordinate System

- **Origin (0,0)**: Top-left corner of the page
- **X-axis**: Horizontal (left to right)
- **Y-axis**: Vertical (top to bottom)
- **Page size**: 841.68 x 595.2 points (A4 landscape)

## Tips

1. **X position**: How far from the left edge (in points)
2. **Y position**: How far from the top edge (in points)
3. **1 point = 1/72 inch** (approximately 0.35mm)

## Common Adjustments

- If text is too far **LEFT**: Decrease X value
- If text is too far **RIGHT**: Increase X value
- If text is too far **UP**: Decrease Y value
- If text is too far **DOWN**: Increase Y value

## Testing Individual Fields

Use the `test-single-field.js` script to test one field at a time:

```bash
node test-single-field.js --field idNumber --x 100 --y 230
```


