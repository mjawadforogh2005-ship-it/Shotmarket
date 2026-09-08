# ShotMarket End-to-End Testing Guide
## Module 27 - Complete Testing Workflow

---

## 🎯 Test Objective

Simulate the complete ShotMarket business flow:
1. Photographer registration & setup
2. Photo upload & gallery creation
3. QR code generation
4. Customer scanning & browsing
5. Payment processing
6. Payment approval
7. Download authorization
8. Security & attack testing

---

## 📋 Pre-Test Setup

### Prerequisites
- Two browsers (Chrome & Safari recommended)
- Test user email addresses
- Production-like environment
- Network access to Supabase
- Developer tools open for debugging

### Test Database
- Fresh test data or isolated test project
- No real customer data
- Ability to reset if needed

---

## ✅ TEST 1: Photographer Registration & Profile Setup

### Test Case 1.1: Register New Photographer
```
Steps:
1. Go to http://localhost:5500/register.html
2. Enter:
   - Full Name: "Test Photographer"
   - Email: "photographer@test.com"
   - Password: "SecurePassword123!"
   - Confirm: "SecurePassword123!"
3. Click "Create Account"

Expected Result:
✅ Account created successfully
✅ Email verification sent
✅ Redirected to login or dashboard
✅ User appears in Supabase auth_users table
✅ Profile record created in profiles table

Verification:
- Check Supabase Dashboard > Authentication > Users
- Check Supabase Dashboard > SQL Editor:
  SELECT * FROM profiles WHERE full_name = 'Test Photographer';
```

### Test Case 1.2: Login with Photographer Account
```
Steps:
1. Go to http://localhost:5500/login.html
2. Enter photographer email & password
3. Click "Sign In"

Expected Result:
✅ Login successful
✅ Redirected to dashboard
✅ User name displayed in header
✅ Session token created

Verification:
- Check browser localStorage for auth token
- Check Supabase session active
```

### Test Case 1.3: View & Edit Profile
```
Steps:
1. From dashboard, go to Profile
2. Add photographer information
3. Add bank account details
4. Save changes

Expected Result:
✅ Profile updated
✅ Bank info saved securely
✅ Avatar placeholder or upload works
✅ Data persists on refresh

Verification:
- SELECT * FROM profiles WHERE id = auth.uid();
- Bank info should be encrypted
```

---

## 📸 TEST 2: Album Creation & Photo Upload

### Test Case 2.1: Create New Album
```
Steps:
1. From dashboard, click "Create New Album"
2. Fill in album details:
   - Name: "Wedding Photos - Test"
   - Description: "Test wedding gallery"
   - Event Date: Today's date
   - Location: "Test City"
   - Privacy: "Private"
3. Click "Create Album"

Expected Result:
✅ Album created
✅ Album appears in dashboard
✅ Gallery token generated automatically
✅ QR code available

Verification:
- SELECT * FROM albums WHERE user_id = auth.uid();
- gallery_token should be populated (UUID)
```

### Test Case 2.2: Upload Photos
```
Steps:
1. Click on album created in 2.1
2. Click "Add Photos" or drag & drop
3. Select 5-10 test images
4. Wait for upload completion
5. Verify all photos appear

Expected Result:
✅ All photos uploaded
✅ Progress indicator shown
✅ Photos appear in album
✅ Photo count updated
✅ is_available = true in database

Verification:
- SELECT * FROM photos WHERE album_id = '<album-id>';
- Check storage bucket: shotmarket-private
- Files should be encrypted
```

### Test Case 2.3: Set Photo Prices (if applicable)
```
Steps:
1. From album view
2. Click on individual photo settings
3. Set price if feature available
4. Save

Expected Result:
✅ Price saved
✅ Reflects in payment calculation
```

---

## 🔗 TEST 3: QR Code Generation & Sharing

### Test Case 3.1: Generate QR Code
```
Steps:
1. From album dashboard
2. Look for "Your QR Code" section
3. Verify QR code is visible and scannable
4. Copy the gallery URL

Expected Result:
✅ QR code displayed (180x180px)
✅ QR code contains album ID & gallery token
✅ Copy to clipboard works
✅ URL format: 
   https://localhost:5500/gallery.html?album=<id>&token=<token>

Verification:
- Decode QR code with online decoder
- URL should include album ID and gallery token
```

### Test Case 3.2: Download QR Code
```
Steps:
1. Click "Download QR Code"
2. Verify PNG file downloads

Expected Result:
✅ QR code PNG file downloaded
✅ File named: shotmarket-<album-id>-qr.png
✅ Can be printed

Verification:
- File should be PNG format
- File should be scannable
```

### Test Case 3.3: Test QR Code in Mobile Device
```
Steps:
1. Print QR or display on second device
2. Use mobile phone camera or QR scanner app
3. Scan QR code
4. Open link

Expected Result:
✅ Phone opens gallery.html with correct parameters
✅ Gallery loads successfully
✅ Photos visible
```

---

## 👁️ TEST 4: Customer Gallery Experience

### Test Case 4.1: Access Gallery via Valid QR
```
Steps:
1. In second browser/incognito window
2. Manually enter gallery URL with valid album ID & token
3. Observe gallery loads

Expected Result:
✅ Gallery loads
✅ Album title & description displayed
✅ Event date & location shown
✅ Photo count displayed
✅ All photos visible in grid
✅ Photos have proper aspect ratio
✅ Mobile responsive layout works

Verification:
- Page source should not contain raw photo URLs
- Images loaded via signed URLs
```

### Test Case 4.2: Gallery with Invalid Token
```
Steps:
1. Enter gallery URL with wrong token
2. Navigate to gallery.html without parameters

Expected Result:
✅ Shows error: "Gallery Not Found"
✅ Helpful message displayed
✅ "Return Home" button works
❌ Does NOT load photos

Verification:
- Check browser console for error
- Verify error from edge function
```

### Test Case 4.3: Photo Selection
```
Steps:
1. In gallery, click on photos to select
2. Should show selection indicator
3. Total selected count updated

Expected Result:
✅ Photos toggle selection
✅ Selection counter updates
✅ Selected photos stored in sessionStorage
✅ "Continue to Payment" button active

Verification:
- Check browser console: 
  console.log(sessionStorage.getItem('shotmarket_selected_photos'))
```

### Test Case 4.4: Lightbox/Preview
```
Steps:
1. Click on a photo to open preview
2. Navigate with arrows
3. Close lightbox

Expected Result:
✅ Photo opens in lightbox
✅ Full size visible
✅ Navigation works
✅ Close button works
✅ Mobile touch swipe works (if implemented)
```

---

## 💳 TEST 5: Payment Processing

### Test Case 5.1: Create Payment
```
Steps:
1. From gallery, select 3-5 photos
2. Click "Continue to Payment"
3. Observe payment page loads
4. Check amount calculated correctly

Expected Result:
✅ Redirected to payment.html with album parameter
✅ Album details displayed
✅ Selected photos listed
✅ Amount calculated correctly
✅ Photographer bank info displayed
✅ Anonymous session created (no account required)

Verification:
- Amount = sum of photo prices (or fixed amount)
- Check Supabase: 
  SELECT * FROM payments WHERE status = 'pending';
- Should have customer_id (anonymous user)
```

### Test Case 5.2: Submit Payment
```
Steps:
1. On payment page
2. Confirm bank transfer details visible
3. Click "I Have Made the Payment"
4. Observe confirmation

Expected Result:
✅ Payment status set to "pending"
✅ Photographer receives notification
✅ Customer sees "Awaiting Verification" message
✅ Payment ID stored in sessionStorage
✅ Can check payment status repeatedly

Verification:
- Payment record in DB with status = 'pending'
- Check browser:
  sessionStorage.getItem('shotmarket_payment_id')
- Check dashboard notification
```

### Test Case 5.3: Payment Status Display
```
Steps:
1. After submitting payment
2. Keep payment page open (or refresh)
3. Should show "Waiting for Verification"
4. Status should update (if background check implemented)

Expected Result:
✅ Status message displayed clearly
✅ Shows photographer will verify receipt
✅ Estimated approval time mentioned (if applicable)
```

---

## ✅ TEST 6: Photographer Payment Approval

### Test Case 6.1: View Pending Payments
```
Steps:
1. Login as photographer
2. Go to dashboard
3. Look for "Payment Requests" section
4. Should see test payment created in TEST 5

Expected Result:
✅ Pending payment visible
✅ Shows album name
✅ Shows amount & currency
✅ Shows customer payment method
✅ Shows submission timestamp
✅ "Mark as Paid" button available

Verification:
- Payment visible in payments-dashboard
- All required fields displayed
```

### Test Case 6.2: Verify Payment & Approve
```
Steps:
1. Photographer checks bank account
2. Verifies transfer received
3. Clicks "Mark as Paid"
4. Confirms action in dialog

Expected Result:
✅ Confirmation dialog appears
✅ Warning about verifying receipt
✅ Payment status changes to "paid"
✅ Dashboard updates
✅ Customer receives notification (or can check)

Verification:
- SELECT * FROM payments WHERE id = '<payment-id>';
- status should now be 'paid'
- updated_at should be recent
```

### Test Case 6.3: Payment appears in Revenue
```
Steps:
1. Photographer dashboard
2. Check "Total Revenue" stat
3. Should reflect new paid payment

Expected Result:
✅ Revenue stat updated
✅ Amount shows correctly
✅ Currency correct
✅ Calculation accurate

Verification:
- Dashboard stat calculation correct
```

---

## ⬇️ TEST 7: Photo Download

### Test Case 7.1: Download Link Appears After Approval
```
Steps:
1. From payment browser
2. Refresh payment.html after photographer approves
3. Check for "Download" section

Expected Result:
✅ "Payment Approved" message appears
✅ Photo list displayed
✅ "Download My Photos" button visible
✅ All purchased photos listed

Verification:
- Payment status checked
- Photos retrieved correctly
```

### Test Case 7.2: Download Single Photo
```
Steps:
1. Click download button next to photo
2. File should download

Expected Result:
✅ Photo file downloads
✅ File name preserved
✅ Quality maintained
✅ File format correct (JPG/PNG)

Verification:
- Check download folder for file
- File integrity verified
```

### Test Case 7.3: Download All Photos
```
Steps:
1. Click "Download All" or similar
2. Multiple files download

Expected Result:
✅ All selected photos download
✅ Each has unique name
✅ No duplicate downloads
✅ Sequential timing (not all at once)

Verification:
- Check all files in download folder
```

### Test Case 7.4: Verify Signed URL Expiration
```
Steps:
1. Note download link from earlier test
2. Save the signed URL
3. Wait > 2 hours (or manually expire in code)
4. Try to access saved URL directly

Expected Result:
❌ Signed URL returns 403 Forbidden
❌ Photo not accessible
✅ Clear error message displayed

Verification:
- Network tab shows 403 error
- Signed URL truly expired
```

---

## 🔒 TEST 8: Security & Authorization Testing

### Test Case 8.1: Cross-Photographer Access Prevention
```
Steps:
1. Login as Photographer A
2. Get album ID from Photographer B
3. Try to edit/delete Photographer B's album

Expected Result:
❌ Action blocked
❌ Error message: "Permission Denied" or similar
✅ Album data not exposed

Verification:
- Check RLS policy blocks access
- Database audit log shows attempted access
```

### Test Case 8.2: Customer Cannot Modify Payment
```
Steps:
1. As customer (anonymous session)
2. Try to update payment amount
3. Try to set payment status to "paid"

Expected Result:
❌ All update attempts fail
❌ 403 Forbidden or permission error
✅ No payment modifications

Verification:
- Network tab shows 403 errors
- Payment record unchanged
```

### Test Case 8.3: Access Unpaid Photos
```
Steps:
1. As customer (different session)
2. Try to access unpaid photo directly
3. Try to get signed URL without paid payment

Expected Result:
❌ Cannot access photos
❌ Edge function blocks access
❌ 403 Forbidden or 404 Not Found

Verification:
- Photos not retrievable
- Error logged properly
```

### Test Case 8.4: Gallery Token Validation
```
Steps:
1. Try gallery with valid album ID, invalid token
2. Try with token from different album
3. Try with SQL injection: token = "'; DROP TABLE users; --"

Expected Result:
❌ All attempts fail
❌ "Gallery not found" error
✅ No SQL injection possible
✅ No data leakage

Verification:
- Database remains intact
- Error logs show attempts
```

### Test Case 8.5: Direct Storage Access
```
Steps:
1. Try direct URL to photo file:
   https://[project].supabase.co/storage/v1/object/public/shotmarket-photos/...
2. Try to list bucket contents

Expected Result:
❌ Access denied (403 Forbidden)
❌ Cannot list files
❌ Cannot download without signed URL

Verification:
- Storage policy blocks access
```

---

## 📱 TEST 9: Mobile & Responsive Design

### Test Case 9.1: Test on Mobile Devices
```
Devices to test:
- iPhone 12/13/14
- Samsung Galaxy S21/S22
- iPad (tablet)
- Landscape & portrait orientations

Test each page:
- Gallery page - can see photos, select works
- Payment page - form readable, buttons tappable
- Dashboard - stats visible, buttons accessible
- Upload - file selection works

Expected Result:
✅ All pages readable on mobile
✅ Touch targets >= 44px
✅ No horizontal scrolling
✅ Responsive images
✅ Mobile keyboard doesn't break layout
✅ Downloads work on mobile
```

### Test Case 9.2: QR Scanning on Mobile
```
Steps:
1. On iPhone: Use built-in camera
2. On Android: Use Google Lens or QR scanner
3. Scan generated QR code
4. Should open gallery

Expected Result:
✅ Opens correct gallery
✅ All photos load
✅ Can select & buy
✅ Responsive layout
```

### Test Case 9.3: Landscape Mode
```
Steps:
1. Rotate device to landscape
2. Use app normally

Expected Result:
✅ Layout adjusts
✅ No broken layout
✅ All functionality works
✅ Photos grid responsive
```

---

## ⚡ TEST 10: Performance & Load Testing

### Test Case 10.1: Page Load Times
```
Measure with browser DevTools:

Page Load Times (Target < 3 seconds):
- Dashboard: ___ seconds
- Gallery: ___ seconds
- Payment: ___ seconds
- Upload: ___ seconds

Expected Result:
✅ All pages load in < 3 seconds
✅ No "Time to Interactive" > 5 seconds
✅ Cumulative Layout Shift < 0.1
```

### Test Case 10.2: Image Optimization
```
Steps:
1. Open gallery page
2. Check Network tab
3. Note image file sizes

Expected Result:
✅ Images < 200KB each
✅ Modern formats (WebP/AVIF offered)
✅ Lazy loading implemented
✅ Total page size < 2MB
```

### Test Case 10.3: Concurrent Users
```
Steps:
1. Open same gallery in 3-5 browser tabs
2. All try to download simultaneously
3. Monitor server response

Expected Result:
✅ All downloads succeed
✅ No server errors
✅ No timeouts
✅ Performance acceptable
```

---

## 🧪 TEST 11: Error Handling & Edge Cases

### Test Case 11.1: Network Failure
```
Steps:
1. Use DevTools to throttle network (Offline)
2. Try to load gallery
3. Try to submit payment
4. Resume network

Expected Result:
✅ Clear error messages
✅ Retry options available
✅ No infinite loading spinners
✅ Data not lost
```

### Test Case 11.2: Database Timeout
```
Steps:
1. Artificially delay database (if possible)
2. Try to load dashboard
3. Try to submit payment

Expected Result:
✅ Timeout error shown
✅ Timeout < 30 seconds
✅ User can retry
```

### Test Case 11.3: Missing Album
```
Steps:
1. Try to access album that doesn't exist
2. URL: gallery.html?album=invalid-uuid&token=token

Expected Result:
✅ "Gallery Not Found" error
✅ Helpful message
✅ "Return Home" button works
```

### Test Case 11.4: Session Expiration
```
Steps:
1. Login as photographer
2. Leave open > 1 hour
3. Try to perform action

Expected Result:
✅ Redirected to login
✅ Clear message: "Session expired"
✅ Can login again
✅ No data lost
```

---

## 📊 TEST 12: Data Integrity

### Test Case 12.1: Payment Record Integrity
```
After payment flow, verify in database:

SELECT * FROM payments WHERE id = '<test-payment-id>';

Expected fields:
✅ id - unique UUID
✅ album_id - correct album
✅ user_id - photographer ID
✅ customer_id - anonymous customer
✅ amount - correct amount
✅ currency - correct currency
✅ status - 'paid' after approval
✅ selected_photos - JSON array of photo IDs
✅ created_at - recent timestamp
✅ updated_at - recent timestamp
```

### Test Case 12.2: Photo Record Integrity
```
After photo upload:

SELECT * FROM photos WHERE album_id = '<album-id>';

Expected:
✅ All photos have file_name
✅ All have storage_path
✅ is_available = true
✅ user_id = photographer
✅ created_at populated
```

### Test Case 12.3: No Data Loss
```
Steps:
1. Upload photos
2. Create payment
3. Restart browser
4. Verify data persists

Expected Result:
✅ All data in database
✅ No photos lost
✅ No payments lost
✅ Consistent state
```

---

## 🎯 TEST RESULTS TEMPLATE

```
TEST EXECUTION REPORT
=====================
Date: ___________
Tester: ___________
Environment: Development / Production
Browser: ___________
Device: ___________

TEST 1: Registration & Profile
  - Test 1.1: ✅ / ❌
  - Test 1.2: ✅ / ❌
  - Test 1.3: ✅ / ❌

TEST 2: Album & Upload
  - Test 2.1: ✅ / ❌
  - Test 2.2: ✅ / ❌
  - Test 2.3: ✅ / ❌

TEST 3: QR Code
  - Test 3.1: ✅ / ❌
  - Test 3.2: ✅ / ❌
  - Test 3.3: ✅ / ❌

TEST 4: Gallery Experience
  - Test 4.1: ✅ / ❌
  - Test 4.2: ✅ / ❌
  - Test 4.3: ✅ / ❌
  - Test 4.4: ✅ / ❌

TEST 5: Payment
  - Test 5.1: ✅ / ❌
  - Test 5.2: ✅ / ❌
  - Test 5.3: ✅ / ❌

TEST 6: Photographer Approval
  - Test 6.1: ✅ / ❌
  - Test 6.2: ✅ / ❌
  - Test 6.3: ✅ / ❌

TEST 7: Download
  - Test 7.1: ✅ / ❌
  - Test 7.2: ✅ / ❌
  - Test 7.3: ✅ / ❌
  - Test 7.4: ✅ / ❌

TEST 8: Security
  - Test 8.1: ✅ / ❌
  - Test 8.2: ✅ / ❌
  - Test 8.3: ✅ / ❌
  - Test 8.4: ✅ / ❌
  - Test 8.5: ✅ / ❌

TEST 9: Mobile
  - Test 9.1: ✅ / ❌
  - Test 9.2: ✅ / ❌
  - Test 9.3: ✅ / ❌

TEST 10: Performance
  - Test 10.1: ✅ / ❌
  - Test 10.2: ✅ / ❌
  - Test 10.3: ✅ / ❌

TEST 11: Error Handling
  - Test 11.1: ✅ / ❌
  - Test 11.2: ✅ / ❌
  - Test 11.3: ✅ / ❌
  - Test 11.4: ✅ / ❌

TEST 12: Data Integrity
  - Test 12.1: ✅ / ❌
  - Test 12.2: ✅ / ❌
  - Test 12.3: ✅ / ❌

SUMMARY:
Total Tests: 46
Passed: ___
Failed: ___
Pass Rate: ___%

ISSUES FOUND:
1. _____________________
2. _____________________
3. _____________________

READY FOR PRODUCTION: [ ] YES  [ ] NO

Sign-off: ________________
Date: ________________
```

---

## ✨ After All Tests Pass

1. Document any issues found
2. Fix critical issues before launch
3. Retest affected functionality
4. Update README with any known limitations
5. Create backup of test data
6. Prepare launch announcement
7. Monitor first 24 hours closely

**Congratulations! ShotMarket is ready for real users!** 🚀
