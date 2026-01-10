# PLN PDF Coordinate Alignment Fix Guide

## 🎯 Problem Identified

The field positions in `field-positions.json` don't align correctly with the actual form fields in the PLN-FORM.pdf template. This causes text and checkboxes to appear in wrong positions.

## ✅ Solution Implemented

I've created several tools to fix this issue:

### 1. **Corrected Field Positions** 
- Updated `field-positions.json` with better coordinates
- Adjusted for landscape orientation
- Fixed checkbox and text field alignments

### 2. **Testing Tools**
- `test-pdf-coordinate-fix.js` - Generates test PDF with sample data
- `fix-field-coordinates.js` - Updates coordinates with corrected values
- `interactive-coordinate-mapper.js` - Interactive tool for fine-tuning

## 🔧 How to Fix the Alignment

### Step 1: Apply Initial Corrections
```bash
# Apply the corrected coordinates
node fix-field-coordinates.js
```

### Step 2: Generate Test PDF
```bash
# Generate a test PDF to see current alignment
node test-pdf-coordinate-fix.js
```

### Step 3: Check the Generated PDF
Open the generated PDF: `backend/data/forms/PLN-FORM-COORDINATE-TEST-FIXED.pdf`

Compare it with the original form to see which fields need adjustment.

### Step 4: Fine-tune Coordinates (Interactive)
```bash
# Use the interactive mapper for precise adjustments
node interactive-coordinate-mapper.js
```

This tool allows you to:
- View all current field positions
- Edit specific field coordinates
- Generate test PDFs after changes
- Save updated coordinates

### Step 5: Test with Backend API
```bash
# Start backend and test the actual PDF generation
cd backend && npm run dev
```

Then submit a PLN application and download the PDF through the admin panel.

## 📏 Coordinate System Understanding

### PDF Coordinate System
- **Origin (0,0)**: Bottom-left corner
- **X-axis**: Increases left to right
- **Y-axis**: Increases bottom to top (upward)

### Form Layout Analysis
Based on the form image you provided:
- Form is in **landscape orientation** (wider than tall)
- **Left side**: Owner/Transferor details (Section A)
- **Right side**: Contact info and plate details (Section B)
- **Bottom**: Declaration and signature (Section E)

### Coordinate Adjustments Made

#### Major Sections:
- **Transaction checkbox**: Moved to top-left (25, 550)
- **ID Type checkboxes**: Positioned vertically (25, 480/460/440)
- **Text fields**: Aligned with form grid boxes
- **Plate choices**: Positioned in right columns (650, 720, 790)
- **Declaration**: Moved to bottom area (25, 100)

#### Key Improvements:
- **Reduced X coordinates** for left-aligned fields
- **Adjusted Y coordinates** for proper vertical spacing
- **Added character limits** for grid box fields
- **Improved font sizes** for better readability

## 🎯 Field Mapping Strategy

### Section A - Owner/Transferor (Left Side)
```json
"idTypeNamibiaID": { "x": 25, "y": 460, "type": "checkbox" },
"surname": { "x": 25, "y": 380, "fontSize": 8, "maxLength": 25 },
"postalAddressLine1": { "x": 25, "y": 350, "fontSize": 8 }
```

### Section B - Plate Details (Right Side)
```json
"plateFormatNormal": { "x": 500, "y": 360, "type": "checkbox" },
"plateChoice1": { "x": 650, "y": 380, "fontSize": 10, "maxLength": 8 }
```

### Contact Information (Right Side)
```json
"cellNumberCode": { "x": 500, "y": 440, "fontSize": 8 },
"email": { "x": 500, "y": 420, "fontSize": 8, "maxLength": 30 }
```

## 🧪 Testing Process

### 1. Visual Inspection
After generating test PDF:
- Check if checkboxes align with form checkboxes
- Verify text appears in correct grid boxes
- Ensure no text overlaps or goes outside boundaries

### 2. Common Adjustments Needed
If text appears:
- **Too high**: INCREASE Y coordinate
- **Too low**: DECREASE Y coordinate  
- **Too far left**: INCREASE X coordinate
- **Too far right**: DECREASE X coordinate

### 3. Fine-tuning Tips
- Start with major sections first
- Use one correctly positioned field as reference
- Adjust similar fields by same offset
- Test frequently with small changes

## 🔄 Iterative Improvement Process

1. **Generate test PDF**
2. **Identify misaligned fields**
3. **Adjust coordinates** (±5-10 pixels at a time)
4. **Generate new test PDF**
5. **Repeat until satisfied**
6. **Test with real backend API**

## 📋 Verification Checklist

### ✅ Checkboxes
- [ ] Transaction type (New PLN) marked
- [ ] ID type (Namibia ID-doc) marked  
- [ ] Plate format (Normal) marked
- [ ] Declaration role (Applicant) marked

### ✅ Text Fields
- [ ] ID number in correct grid boxes
- [ ] Surname in correct position
- [ ] Initials in correct position
- [ ] Address lines aligned properly
- [ ] Phone numbers in right positions
- [ ] Email in correct field
- [ ] Plate choices in right columns
- [ ] Declaration place and date correct

## 🚀 Quick Fix Commands

```bash
# Complete fix process
node fix-field-coordinates.js
node test-pdf-coordinate-fix.js

# Interactive fine-tuning
node interactive-coordinate-mapper.js

# Test with backend
cd backend && npm run dev
# Then test through admin panel
```

## 📁 Files Modified

- `backend/data/forms/field-positions.json` - Updated coordinates
- `backend/data/forms/field-positions-backup.json` - Original backup
- `backend/data/forms/PLN-FORM-COORDINATE-TEST-FIXED.pdf` - Test output

## 🎉 Expected Result

After applying these fixes, your PLN PDF generation should:
- ✅ Place all text in correct form fields
- ✅ Mark checkboxes in right positions  
- ✅ Align with official form layout
- ✅ Be ready for production use

The coordinate alignment issue will be resolved, and admins will be able to print properly filled PLN forms with all data in the correct positions!