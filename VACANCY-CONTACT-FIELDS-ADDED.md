# Vacancy Contact Fields Added

## ✅ Changes Made

Added three new optional contact fields to the Vacancy model:

### New Fields:
1. **contactName** - Name of the contact person
2. **contactEmail** - Email address (with validation)
3. **contactTelephone** - Telephone number

### Backend Changes

**File:** `backend/src/modules/vacancies/vacancies.model.ts`

**Interface Updated:**
```typescript
export interface IVacancy extends MongooseDocument {
  // ... existing fields
  // Contact information
  contactName?: string;
  contactEmail?: string;
  contactTelephone?: string;
  // ...
}
```

**Schema Updated:**
```typescript
// Contact information fields
contactName: {
  type: String,
  trim: true,
},
contactEmail: {
  type: String,
  trim: true,
  lowercase: true,
  validate: {
    validator: function (v: string) {
      // Only validate if value is provided
      if (!v) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    },
    message: 'Invalid email format',
  },
},
contactTelephone: {
  type: String,
  trim: true,
},
```

### Features:
- ✅ All fields are **optional**
- ✅ Email field has **format validation**
- ✅ Email is automatically **converted to lowercase**
- ✅ All fields **trim whitespace**

## Next Steps

### 1. Update Frontend Vacancy Form

You'll need to add these fields to the vacancy form in the admin panel:

**File to update:** `admin/src/pages/Vacancies/VacancyForm.tsx` (or similar)

**Add these fields:**
```typescript
<TextField
  label="Contact Name"
  name="contactName"
  value={formData.contactName || ''}
  onChange={handleChange}
  fullWidth
  margin="normal"
/>

<TextField
  label="Contact Email"
  name="contactEmail"
  type="email"
  value={formData.contactEmail || ''}
  onChange={handleChange}
  fullWidth
  margin="normal"
  helperText="Email for applicants to contact"
/>

<TextField
  label="Contact Telephone"
  name="contactTelephone"
  type="tel"
  value={formData.contactTelephone || ''}
  onChange={handleChange}
  fullWidth
  margin="normal"
  helperText="Phone number for applicants to contact"
/>
```

### 2. Update Vacancy Service

**File to update:** `admin/src/services/vacancy.service.ts` (or similar)

**Add to interface:**
```typescript
export interface VacancyFormData {
  // ... existing fields
  contactName?: string;
  contactEmail?: string;
  contactTelephone?: string;
}
```

### 3. Restart Backend

```cmd
cd RA-_APP-_4\backend
npm run dev
```

The new fields will be available immediately!

## Testing

### Create/Edit Vacancy:
1. Go to Vacancies page
2. Create or edit a vacancy
3. Fill in the contact fields (optional)
4. Save
5. Verify the contact information is saved

### Validation:
- Try entering an invalid email → Should show error
- Leave fields empty → Should work (fields are optional)
- Enter valid data → Should save successfully

## Database Migration

**Note:** Existing vacancies will automatically have these fields as `undefined`. No migration needed!

When you update an existing vacancy, you can add the contact information.
