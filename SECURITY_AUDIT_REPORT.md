# Security Audit Report: User-Based Data Ownership and Access Control

**Date:** February 5, 2026  
**Database:** SQL Server  
**Authentication:** JWT Tokens

## Executive Summary

This audit reviewed the codebase for proper implementation of user-based data ownership and access control for Reports (Pothole Reports) and Applications (PLN, Vehicle Registration). Several critical security vulnerabilities were identified that could allow unauthorized access or modification of user data.

---

## ✅ Correct Implementations

### 1. Authentication Middleware
- **Location:** `backend/src/middlewares/auth.ts` and `backend/src/middlewares/appAuth.ts`
- **Status:** ✅ Correct
- **Details:** 
  - JWT tokens are properly verified
  - `userId` and `email` are extracted from JWT and set on `req.user`
  - No reliance on client-provided user information for authentication

### 2. PLN Application Creation
- **Location:** `backend/src/modules/pln/pln.controller.ts:132`
- **Status:** ✅ Correct
- **Details:**
  - Email is extracted from authenticated user: `const userEmail = authReq.user?.email`
  - Falls back to `req.body.email` only if user is not authenticated (line 187)
  - This is acceptable for public submissions

### 3. Vehicle Registration Application Creation
- **Location:** `backend/src/modules/vehicle-reg/vehicle-reg.controller.ts:144`
- **Status:** ✅ Correct
- **Details:**
  - Email is extracted from authenticated user: `const userEmail = authReq.user?.email`
  - Falls back to `req.body.email` only if user is not authenticated (line 234)
  - This is acceptable for public submissions

### 4. User-Specific Data Retrieval
- **Status:** ✅ Correct
- **Details:**
  - `getReportsByUserEmail()` filters by authenticated user's email
  - `getApplicationsByEmail()` filters by authenticated user's email
  - `getMyReports()` and `getMyApplications()` endpoints properly use authenticated user's email

---

## ❌ Critical Security Issues

### 1. Pothole Reports: userEmail Accepted from Request Body
**Severity:** 🔴 **CRITICAL**

**Location:** `backend/src/modules/pothole-reports/pothole-reports.controller.ts:29`

**Issue:**
```typescript
const userEmail = authReq.user?.email || req.body.userEmail || undefined;
```

**Problem:**
- An attacker can send `userEmail` in the request body to associate reports with any user's email
- This allows impersonation and data pollution

**Impact:**
- Users can create reports attributed to other users
- Data integrity compromised
- Potential for harassment or false attribution

**Fix Required:**
```typescript
// Only use authenticated user's email, never from request body
const userEmail = authReq.user?.email || undefined;
// Remove: || req.body.userEmail
```

---

### 2. Missing Ownership Verification in DELETE Operations

**Severity:** 🔴 **CRITICAL**

#### 2a. Pothole Reports Delete
**Location:** `backend/src/modules/pothole-reports/pothole-reports.service.ts:391-443`

**Issue:**
```typescript
async deleteReport(reportId: string): Promise<void> {
  const report = await repo.findOne({ where: { id } });
  // No check if report belongs to requesting user
  await repo.remove(report);
}
```

**Problem:**
- Any admin with `pothole-reports:manage` permission can delete ANY report
- No verification that the report belongs to the requesting user (if user-facing endpoint)
- Currently admin-only, but if user-facing delete is added, this is a vulnerability

**Impact:**
- Admins can delete any user's reports without authorization checks
- If user-facing delete endpoint is added, users could delete other users' reports

**Fix Required:**
```typescript
async deleteReport(reportId: string, requestingUserEmail?: string): Promise<void> {
  const report = await repo.findOne({ where: { id } });
  
  if (!report) {
    throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Report not found' };
  }
  
  // If user-facing endpoint, verify ownership
  if (requestingUserEmail && report.userEmail !== requestingUserEmail) {
    throw {
      statusCode: 403,
      code: ERROR_CODES.FORBIDDEN,
      message: 'You can only delete your own reports'
    };
  }
  
  await repo.remove(report);
}
```

#### 2b. PLN Applications Delete
**Status:** ⚠️ **No DELETE endpoint exists for users**
- Applications can only be deleted by admins (if such endpoint exists)
- If user-facing delete is added, ownership verification must be implemented

#### 2c. Vehicle Registration Applications Delete
**Status:** ⚠️ **No DELETE endpoint exists for users**
- Applications can only be deleted by admins (if such endpoint exists)
- If user-facing delete is added, ownership verification must be implemented

---

### 3. Missing Ownership Verification in UPDATE Operations

**Severity:** 🔴 **CRITICAL**

#### 3a. Pothole Reports Update
**Location:** `backend/src/modules/pothole-reports/pothole-reports.service.ts:253-292`

**Issue:**
```typescript
async updateReportStatus(reportId: string, status: ReportStatus, ...): Promise<PotholeReport> {
  const report = await repo.findOne({ where: { id } });
  // No ownership check
  report.status = status;
  await repo.save(report);
}
```

**Problem:**
- Currently admin-only, but no ownership verification
- If user-facing update endpoint is added, users could modify other users' reports

**Fix Required:**
```typescript
async updateReportStatus(
  reportId: string,
  status: ReportStatus,
  requestingUserEmail?: string,
  ...
): Promise<PotholeReport> {
  const report = await repo.findOne({ where: { id } });
  
  if (!report) {
    throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Report not found' };
  }
  
  // If user-facing endpoint, verify ownership
  if (requestingUserEmail && report.userEmail !== requestingUserEmail) {
    throw {
      statusCode: 403,
      code: ERROR_CODES.FORBIDDEN,
      message: 'You can only update your own reports'
    };
  }
  
  // ... rest of update logic
}
```

#### 3b. PLN Applications Update
**Location:** `backend/src/modules/pln/pln.service.ts:615-672`

**Issue:**
- Admin-only status updates don't verify ownership
- If user-facing update endpoint is added, ownership verification must be implemented

#### 3c. Vehicle Registration Applications Update
**Location:** `backend/src/modules/vehicle-reg/vehicle-reg.service.ts:526-579`

**Issue:**
- Admin-only status updates don't verify ownership
- If user-facing update endpoint is added, ownership verification must be implemented

---

### 4. Public GET Endpoint Exposes All Reports

**Severity:** 🟡 **MEDIUM**

**Location:** `backend/src/modules/pothole-reports/pothole-reports.routes.ts:38-41`

**Issue:**
```typescript
router.get('/:id', potholeReportsController.getReport.bind(potholeReportsController));
```

**Problem:**
- Public endpoint allows anyone to view any report by ID
- No authentication or ownership verification
- Sensitive information (location, photos, userEmail) exposed

**Impact:**
- Privacy violation
- Potential for tracking users' reporting patterns
- Exposure of sensitive location data

**Fix Required:**
```typescript
// Option 1: Make authenticated and verify ownership
router.get(
  '/:id',
  authenticateAppUser, // Require authentication
  potholeReportsController.getReport.bind(potholeReportsController)
);

// In controller, verify ownership:
async getReport(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
  const report = await potholeReportsService.getReportById(req.params.id);
  
  // Verify ownership if user is authenticated
  if (req.user?.email && report.userEmail !== req.user.email) {
    res.status(403).json({
      success: false,
      error: { code: ERROR_CODES.FORBIDDEN, message: 'Access denied' }
    });
    return;
  }
  
  // ... return report
}
```

---

### 5. Database Schema: Missing userId Field

**Severity:** 🟡 **MEDIUM**

**Issue:**
- Entities use `userEmail` (nullable string) instead of `userId` (foreign key)
- `PotholeReport`, `PLN`, and `VehicleReg` entities don't have `userId` field
- Reliance on email matching is less secure than ID-based ownership

**Impact:**
- Email addresses can change
- Less efficient queries (string comparison vs integer foreign key)
- Potential for inconsistencies if email format changes

**Recommendation:**
- Add `userId` foreign key column to all entities
- Maintain `userEmail` for backward compatibility if needed
- Use `userId` for ownership checks

**Example Fix:**
```typescript
// In PotholeReport entity
@Column({ type: 'int', nullable: true })
@Index(['userId'])
userId: number | null;

@Column({ type: 'varchar', length: 255, nullable: true })
userEmail: string | null; // Keep for backward compatibility
```

---

## 🔧 Recommended Fixes Summary

### Priority 1: Critical Fixes

1. **Remove userEmail from request body in pothole reports creation**
   - File: `backend/src/modules/pothole-reports/pothole-reports.controller.ts:29`
   - Change: `const userEmail = authReq.user?.email || undefined;`

2. **Add ownership verification to DELETE operations**
   - Files: 
     - `backend/src/modules/pothole-reports/pothole-reports.service.ts:391`
     - Add to PLN and VehicleReg services if user-facing delete endpoints are created
   - Verify `report.userEmail === requestingUserEmail` before deletion

3. **Add ownership verification to UPDATE operations**
   - Files:
     - `backend/src/modules/pothole-reports/pothole-reports.service.ts:253`
     - Add to PLN and VehicleReg services if user-facing update endpoints are created
   - Verify ownership before allowing updates

### Priority 2: Important Fixes

4. **Secure public GET endpoint**
   - File: `backend/src/modules/pothole-reports/pothole-reports.routes.ts:38`
   - Require authentication and verify ownership

5. **Add userId foreign key to entities**
   - Files:
     - `backend/src/modules/pothole-reports/pothole-reports.entity.ts`
     - `backend/src/modules/pln/pln.entity.ts`
     - `backend/src/modules/vehicle-reg/vehicle-reg.entity.ts`
   - Migrate to userId-based ownership checks

---

## 📋 Testing Checklist

After implementing fixes, verify:

- [ ] Users cannot create reports/applications with another user's email
- [ ] Users can only view their own reports/applications (unless admin)
- [ ] Users can only update their own reports/applications (unless admin)
- [ ] Users can only delete their own reports/applications (unless admin)
- [ ] Admin operations still work correctly
- [ ] Public endpoints (if any) don't expose sensitive user data
- [ ] All SELECT queries filter by authenticated user's identifier
- [ ] All UPDATE/DELETE queries verify ownership before execution

---

## 📝 Notes

1. **Admin Operations:** Current admin-only operations (status updates, etc.) don't verify ownership, which may be intentional for administrative purposes. However, if user-facing update/delete endpoints are added, ownership verification is critical.

2. **Email vs UserId:** The system currently uses email-based ownership. Consider migrating to userId-based ownership for better security and performance.

3. **Public Endpoints:** Some endpoints are intentionally public (e.g., report creation without auth). Ensure these don't allow user impersonation.

4. **Device ID Fallback:** The pothole reports system uses deviceId as a fallback for unauthenticated users. This is acceptable but should not be used for authenticated users.

---

## Conclusion

The codebase has several critical security vulnerabilities related to data ownership and access control. The most critical issue is accepting `userEmail` from the request body in pothole report creation, which allows user impersonation. Additionally, missing ownership verification in update/delete operations could allow unauthorized data modification if user-facing endpoints are added.

All identified issues should be addressed before deploying to production.
