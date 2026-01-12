# PLN Form Security Implementation Guide

## Overview
This guide provides step-by-step instructions to implement enterprise-grade security for the PLN (Personalised License Number) form submission system.

## Security Features Implemented

### 🔐 **Data Protection**
- Field-level encryption for all PII (Personal Identifiable Information)
- Secure hash-based searching for encrypted fields
- Database encryption at rest
- Secure file storage with antivirus scanning

### 🛡️ **Attack Prevention**
- CAPTCHA protection against automated abuse
- CSRF token validation
- Rate limiting (5 submissions per hour per IP)
- Input sanitization and validation
- XSS and injection attack prevention

### 📊 **Monitoring & Auditing**
- Comprehensive audit logging
- Security event tracking
- File upload monitoring
- Admin action logging

### 🔒 **File Security**
- Magic number validation (file signature verification)
- Antivirus scanning with quarantine
- PDF structure validation
- Malware pattern detection

## Installation Steps

### 1. Install Required Dependencies

```bash
cd backend
npm install helmet isomorphic-dompurify validator axios multer
npm install --save-dev @types/multer

cd ../app
npm install react-native-webview
```

### 2. Environment Configuration

Add these variables to your `.env` files:

**Backend (.env):**
```env
# Security Configuration
FIELD_ENCRYPTION_KEY=your-32-character-encryption-key-here
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
SECURITY_AUDIT_LOG_LEVEL=info
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=900000

# File Security
ANTIVIRUS_API_KEY=your-antivirus-api-key
ANTIVIRUS_API_URL=https://your-antivirus-service.com/api
FILE_QUARANTINE_ENABLED=true
```

**Frontend (.env):**
```env
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### 3. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `FIELD_ENCRYPTION_KEY` in your `.env` file.

### 4. Set Up Google reCAPTCHA

1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Create a new site with reCAPTCHA v3
3. Add your domain(s)
4. Copy the Site Key and Secret Key to your environment variables

### 5. Database Migration

Run the encryption fields migration:

```bash
cd backend
npm run build
node dist/migrations/001-add-encryption-fields.js
```

### 6. Update PLN Routes

The routes have been updated with the new security middleware stack:

```typescript
// Security middleware order (already implemented):
SecurityHeaders → RateLimit → CAPTCHA → CSRF → FileUpload → InputSanitization → AuditLogging → Controller
```

### 7. Frontend Integration

Update your PLN form screens to use the new security components:

```javascript
import { CaptchaComponent } from '../components/CaptchaComponent';
import { SecurityService } from '../services/securityService';

// In your form component:
const [captchaToken, setCaptchaToken] = useState(null);

const handleCaptchaVerify = (token) => {
  setCaptchaToken(token);
};

const handleSubmit = async () => {
  if (!captchaToken) {
    Alert.alert('Security Error', 'Please complete security verification');
    return;
  }

  try {
    const { formData, headers } = await SecurityService.prepareSecureSubmission(
      formData,
      documentFile,
      captchaToken
    );

    const response = await fetch(`${API_BASE_URL}/api/pln/applications`, {
      method: 'POST',
      body: formData,
      headers,
    });

    // Handle response...
  } catch (error) {
    // Handle error...
  }
};
```

## Security Testing Checklist

### ✅ **Input Validation Testing**
- [ ] Test XSS injection in text fields
- [ ] Test SQL injection attempts
- [ ] Test file upload with malicious files
- [ ] Test oversized file uploads
- [ ] Test invalid file types

### ✅ **Authentication & Authorization**
- [ ] Test JWT token expiration
- [ ] Test invalid tokens
- [ ] Test role-based access control
- [ ] Test admin permission requirements

### ✅ **Rate Limiting**
- [ ] Test submission rate limits (5/hour)
- [ ] Test general API rate limits (100/15min)
- [ ] Test tracking rate limits (20/5min)
- [ ] Test rate limit bypass attempts

### ✅ **CAPTCHA Protection**
- [ ] Test form submission without CAPTCHA
- [ ] Test with invalid CAPTCHA tokens
- [ ] Test CAPTCHA bypass attempts
- [ ] Test CAPTCHA timeout scenarios

### ✅ **File Upload Security**
- [ ] Test malware file uploads
- [ ] Test file signature spoofing
- [ ] Test PDF with embedded JavaScript
- [ ] Test file size limits
- [ ] Test quarantine functionality

### ✅ **Data Encryption**
- [ ] Verify PII is encrypted in database
- [ ] Test search functionality with hashed fields
- [ ] Test decryption in admin panel
- [ ] Test encryption key rotation

## Monitoring & Maintenance

### Daily Tasks
- [ ] Review security audit logs
- [ ] Check quarantine folder for threats
- [ ] Monitor rate limiting effectiveness
- [ ] Review failed authentication attempts

### Weekly Tasks
- [ ] Clean up old quarantine files
- [ ] Review and rotate CSRF tokens
- [ ] Update antivirus signatures
- [ ] Analyze security metrics

### Monthly Tasks
- [ ] Security penetration testing
- [ ] Review and update security policies
- [ ] Audit user permissions
- [ ] Update security dependencies

## Security Incident Response

### 1. **Malware Detection**
```bash
# Check quarantine folder
ls -la backend/quarantine/

# Review antivirus logs
grep "THREAT_DETECTED" backend/logs/security.log
```

### 2. **Rate Limit Violations**
```bash
# Check rate limit logs
grep "RATE_LIMIT_EXCEEDED" backend/logs/security.log

# Block suspicious IPs (if needed)
# Add to firewall or load balancer
```

### 3. **Authentication Failures**
```bash
# Review failed login attempts
grep "AUTH_FAILED" backend/logs/security.log

# Check for brute force patterns
grep -c "AUTH_FAILED.*IP:" backend/logs/security.log | sort -nr
```

## Performance Considerations

### Database Indexes
Ensure these indexes exist for encrypted field searches:

```javascript
// MongoDB indexes for encrypted fields
db.plns.createIndex({ "surname_hash": 1 });
db.plns.createIndex({ "email_hash": 1 });
db.plns.createIndex({ "trafficRegisterNumber_hash": 1 });
db.plns.createIndex({ "businessRegNumber_hash": 1 });
```

### Caching Strategy
- Cache CSRF tokens in Redis
- Cache rate limit counters
- Cache antivirus scan results (for duplicate files)

### Load Balancing
- Distribute file uploads across multiple servers
- Use CDN for static security assets
- Implement sticky sessions for CSRF tokens

## Compliance & Regulations

### GDPR Compliance
- ✅ Data encryption at rest and in transit
- ✅ Right to be forgotten (data deletion)
- ✅ Data breach notification logging
- ✅ Consent tracking for data processing

### Security Standards
- ✅ OWASP Top 10 protection
- ✅ ISO 27001 security controls
- ✅ PCI DSS compliance (if handling payments)
- ✅ SOC 2 Type II controls

## Troubleshooting

### Common Issues

**1. Encryption Key Not Found**
```bash
Error: Environment variable FIELD_ENCRYPTION_KEY is required
```
Solution: Generate and set the encryption key in your `.env` file.

**2. CAPTCHA Verification Failed**
```bash
Error: CAPTCHA verification failed
```
Solution: Check reCAPTCHA keys and domain configuration.

**3. File Upload Rejected**
```bash
Error: File contains threats
```
Solution: Check antivirus service configuration and quarantine folder.

**4. Rate Limit Exceeded**
```bash
Error: Too many PLN applications submitted
```
Solution: Wait for rate limit window to reset or whitelist legitimate users.

## Support & Maintenance

### Log Locations
- Security logs: `backend/logs/security.log`
- Audit logs: `backend/logs/audit.log`
- Error logs: `backend/logs/error.log`
- Quarantine: `backend/quarantine/`

### Monitoring Endpoints
- Health check: `GET /api/health`
- Security status: `GET /api/security/status` (admin only)
- Metrics: `GET /api/metrics` (admin only)

### Emergency Procedures
1. **Security Breach**: Immediately rotate all keys and tokens
2. **Malware Outbreak**: Enable strict quarantine mode
3. **DDoS Attack**: Activate emergency rate limiting
4. **Data Leak**: Follow incident response plan and notify authorities

---

## Conclusion

This security implementation provides enterprise-grade protection for your PLN form submission system. Regular monitoring, testing, and updates are essential to maintain security effectiveness.

For additional support or security questions, refer to the security team or create an issue in the project repository.