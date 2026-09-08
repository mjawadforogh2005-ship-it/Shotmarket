"""
ShotMarket Production Security Review
Module 24 - Final Security Audit Before Launch
"""

# ================================================================
# PRODUCTION SECURITY CHECKLIST
# ================================================================

## FRONTEND SECURITY

### ✅ No Secrets in Frontend Code
- [ ] Verify no service-role keys in JavaScript
- [ ] Verify no private API keys hardcoded
- [ ] Verify Supabase URL is public (anonKey only)
- [ ] Check git history for any committed secrets
  - Command: `git log --all -S "secret\|password\|key" -p`
  - Command: `git log --all -S "SUPABASE_SERVICE_ROLE" -p`

### ✅ Content Security Policy (CSP)
- [ ] Set proper CSP headers in production
  - `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `img-src 'self' https: data:`

### ✅ HTTPS & CORS
- [ ] Website uses HTTPS only
- [ ] CORS headers are restrictive
- [ ] Supabase CORS configured correctly
- [ ] No hardcoded http:// URLs

### ✅ Session Security
- [ ] Anonymous sessions work correctly
- [ ] Session tokens are secure (httpOnly cookies if possible)
- [ ] Session timeout is configured
- [ ] Logout clears all session data

## DATABASE SECURITY (Supabase)

### ✅ Row Level Security (RLS)

**Tables with RLS enabled:**
- [ ] profiles - photographers can only view own profile
- [ ] albums - photographers can only view/edit own albums
- [ ] photos - photographers can only view/edit own photos
- [ ] payments - proper payment isolation

**Verified policies:**
```sql
-- Photographers see only their albums
SELECT * FROM albums WHERE user_id = auth.uid();

-- Customers cannot see photographer data
SELECT * FROM albums WHERE user_id != auth.uid();  -- Should return 0

-- Photographer cannot see other photographer's albums
SELECT * FROM albums WHERE user_id != (SELECT id FROM auth.users WHERE id = auth.uid());

-- Payment isolation
SELECT * FROM payments WHERE user_id = auth.uid();  -- Photographer
SELECT * FROM payments WHERE customer_id = auth.uid();  -- Customer
```

### ✅ Authentication

- [ ] Sign-up email verification enabled
- [ ] Password reset workflow tested
- [ ] Anonymous auth properly scoped
- [ ] Session management secure
- [ ] JWT expiration configured
- [ ] Refresh token rotation enabled

### ✅ Data Access Patterns

- [ ] No N+1 queries in frontend
- [ ] Pagination implemented on large datasets
- [ ] Rate limiting on API calls
- [ ] Query timeouts configured

## STORAGE SECURITY (Supabase Storage)

### ✅ Bucket Policies

**shotmarket-private bucket:**
- [ ] Default deny policy
- [ ] Only authenticated photographers can upload
- [ ] Each user can only see/delete own files
- [ ] No public access

**Verified policy:**
```sql
-- Photographers can upload
CREATE POLICY "auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'shotmarket-private' AND auth.uid() IS NOT NULL);

-- Photographers can only access own files  
CREATE POLICY "auth_view_own" ON storage.objects
  FOR SELECT USING (bucket_id = 'shotmarket-private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Delete own files only
CREATE POLICY "auth_delete_own" ON storage.objects
  FOR DELETE USING (bucket_id = 'shotmarket-private' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### ✅ Signed URLs

- [ ] Expiration time set to 2 hours (7200 seconds)
- [ ] Signed URLs cannot be forged
- [ ] Old bucket `shotmarket-photos` cleaned up or archived
- [ ] No permanent public URLs

### ✅ File Handling

- [ ] File type validation on upload
- [ ] File size limits enforced
- [ ] Malware scanning considered
- [ ] File names sanitized

## EDGE FUNCTIONS SECURITY

### ✅ gallery-access Function

**Verification:**
- [ ] Uses SERVICE_ROLE_KEY (server-side)
- [ ] Validates album ID and gallery token
- [ ] Only returns available photos
- [ ] Creates signed URLs with expiration
- [ ] No sensitive data exposed in response
- [ ] Proper error handling
- [ ] Rate limiting implemented
- [ ] Request validation (no injection)

**Test:**
```typescript
// Should succeed
POST /functions/v1/gallery-access
{ "albumId": "valid-id", "galleryToken": "valid-token" }

// Should fail
POST /functions/v1/gallery-access
{ "albumId": "wrong-id", "galleryToken": "invalid-token" }  // 404

POST /functions/v1/gallery-access
{ "albumId": "'; DROP TABLE albums; --" }  // Injection blocked
```

### ✅ download-access Function

**Verification:**
- [ ] Validates payment status = "paid"
- [ ] Verifies payment belongs to album
- [ ] Verifies customer owns payment
- [ ] Only returns purchased photos
- [ ] Generates signed URLs
- [ ] Proper error messages (no data leakage)
- [ ] Time-based download limit

**Test:**
```typescript
// Should succeed
POST /functions/v1/download-access
{ "paymentId": "valid-id", "albumId": "correct-album", "photoIds": [...] }

// Should fail - unpaid payment
POST /functions/v1/download-access with status="pending"  // 403

// Should fail - wrong customer
POST /functions/v1/download-access with different customer_id  // 403

// Should fail - expired signed URL after 2 hours
// Verify signed URLs expire
```

## PAYMENT SECURITY

### ✅ Price Calculation

- [ ] Amount calculated server-side (in Edge Function)
- [ ] No client-side price manipulation possible
- [ ] Currency validation
- [ ] Decimal precision correct
- [ ] Min/max amount limits enforced

### ✅ Payment Record

- [ ] Payment status starts as "pending"
- [ ] Only photographers can change status to "paid"
- [ ] Payment cannot be modified after "paid"
- [ ] Customer cannot see other customer's payments
- [ ] Payment metadata is immutable

### ✅ Bank Information

- [ ] Bank details encrypted in database
- [ ] Only photographer can view own bank info
- [ ] Customer cannot see bank details
- [ ] No bank info logged in frontend

## AUTHENTICATION FLOWS

### ✅ Photographer Flow

**Test steps:**
1. Register new photographer
   - [ ] Email verification sent
   - [ ] Account created
   - [ ] Profile created
   - [ ] Can login

2. Login
   - [ ] Session established
   - [ ] Can access dashboard
   - [ ] Can see own albums only
   - [ ] Cannot see other photographers

3. Logout
   - [ ] Session cleared
   - [ ] Redirected to login
   - [ ] Credentials no longer valid

### ✅ Customer Flow

**Test steps:**
1. Access gallery via QR code
   - [ ] Gallery loads with correct album
   - [ ] Can view photos
   - [ ] Can select photos

2. Payment process
   - [ ] Anonymous session created
   - [ ] Payment created with correct amount
   - [ ] Cannot modify amount
   - [ ] Bank info displayed correctly

3. After photographer marks paid
   - [ ] Payment status updates
   - [ ] Download button appears
   - [ ] Can download purchased photos only
   - [ ] Signed URLs expire after 2 hours

## INJECTION & XSS PREVENTION

### ✅ Input Validation

- [ ] escapeHtml/escapeHTML used consistently
- [ ] HTML special characters escaped
- [ ] SQL injection protection via parameterized queries
- [ ] No eval() or dangerous string operations
- [ ] File names sanitized

**Check commands:**
```bash
grep -r "innerHTML.*=" js/ | grep -v escapeHtml
grep -r "\.from.*select.*\+" js/  # String concatenation
grep -r "eval\|Function(" js/
```

### ✅ Cross-Site Scripting (XSS)

- [ ] User input never rendered as HTML
- [ ] Template literals used safely
- [ ] Event handlers not from user input
- [ ] No dangerous DOM methods

**Test:**
```javascript
// Try album name: <img src=x onerror=alert('XSS')>
// Should display as text, not execute
```

## ATTACK TESTING

### ✅ Authorization Bypass

Test cases:
```javascript
// Photographer 1 tries to access Photographer 2's albums
const albums = await supabase
  .from("albums")
  .select("*")
  .eq("user_id", otherPhotographerId);
// Should return 0 rows

// Customer tries to directly access storage
fetch("https://storage.supabase.co/shotmarket-private/photo-uuid.jpg")
// Should return 403 Forbidden

// Customer tries to access unpaid photos in SQL
SELECT * FROM photos WHERE payment.status != "paid"
// Should return 0 rows (RLS prevents access)
```

### ✅ Payment Tampering

Test cases:
```javascript
// Try to change payment amount before photographer approves
UPDATE payments SET amount = 1 WHERE id = paymentId;
// Should fail (RLS prevents modification by customer)

// Try to mark own payment as paid
UPDATE payments SET status = "paid" WHERE id = paymentId;
// Should fail (RLS prevents customer from updating)
```

### ✅ Token Attacks

Test cases:
```javascript
// Gallery with invalid token
GET /gallery.html?album=valid&token=invalid
// Should show error, not photos

// Gallery with expired QR link
// (Simulate by removing gallery_token from album)
// Should not load

// Reuse downloaded link after expiration
// Signed URL should be invalid after 2 hours
```

## LOGGING & MONITORING

- [ ] Error logs captured securely
- [ ] No sensitive data in logs
- [ ] Login attempts logged
- [ ] Failed payment attempts logged
- [ ] Storage access logged
- [ ] Edge Function errors logged

## DEPLOYMENT SECURITY

### ✅ Environment Variables

- [ ] Production secrets in environment, not code
- [ ] Supabase URL is safe to be public
- [ ] Service role key never in frontend
- [ ] Database connection pooling configured

### ✅ Dependencies

- [ ] All npm packages are from trusted sources
- [ ] Audit for known vulnerabilities
  - Command: `npm audit`
- [ ] Outdated packages checked
  - Command: `npm outdated`
- [ ] Lock file committed

### ✅ API Keys & Secrets

- [ ] Supabase publishable key only in frontend
- [ ] Service role key only in backend/functions
- [ ] GitHub secrets configured for CI/CD
- [ ] Keys rotated periodically
- [ ] Revoke old keys before launching

## GDPR & PRIVACY

- [ ] Privacy policy available
- [ ] Data retention policy defined
- [ ] User data can be exported
- [ ] User data can be deleted
- [ ] Compliance with local regulations

## FINAL SECURITY SIGN-OFF

```
Completion Date: ___________
Reviewed By: ___________
Issues Found: ___________
Issues Resolved: ___________
Ready for Production: [ ] YES  [ ] NO
```

---

## TESTING COMMANDS

```bash
# Check for hardcoded secrets
git log --all -S "secret\|password\|SUPABASE_" -p

# Find potential injection points
grep -r "innerHTML\|eval\|Function" js/ src/ --include="*.js"

# Check for XSS vulnerabilities
grep -r "innerHTML\s*=" js/ --include="*.js" | grep -v escapeHtml

# Verify no console.log with sensitive data
grep -r "console.log.*token\|console.log.*password\|console.log.*secret" js/

# Check for mixed HTTP/HTTPS
grep -r "http://" . --include="*.js" --include="*.html" | grep -v localhost
```

---

## DEPLOYMENT CHECKLIST

Before deploying to production:

```
SECURITY:
[ ] RLS policies installed
[ ] Storage policies installed
[ ] CORS configured
[ ] HTTPS enabled
[ ] CSP headers set
[ ] Secrets in environment variables

CONFIGURATION:
[ ] Production domain configured
[ ] Supabase production project
[ ] Email verification enabled
[ ] Rate limiting configured

TESTING:
[ ] All unit tests passing
[ ] Integration tests passing
[ ] End-to-end tests passing
[ ] Security tests passing
[ ] Performance tests passing

BACKUPS:
[ ] Database backups automated
[ ] Storage backups planned
[ ] Rollback plan prepared

MONITORING:
[ ] Error tracking enabled
[ ] Logging configured
[ ] Alerts configured
[ ] Uptime monitoring enabled

DOCUMENTATION:
[ ] API documentation complete
[ ] Security documentation complete
[ ] Deployment guide complete
[ ] Troubleshooting guide complete
```

---

This checklist should be reviewed and signed off before any production deployment.
