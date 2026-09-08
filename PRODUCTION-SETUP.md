# ShotMarket Production Configuration Guide
## Module 25 - Production Setup Instructions

---

## STEP 1: Update Configuration File

Edit `js/config.js` and update the production domain:

```javascript
getProductionDomain: function() {
    // TODO: Replace with your actual production domain
    return "YOUR_PRODUCTION_DOMAIN.com";  // e.g., "shotmarket.com"
},

getBaseURL: function() {
    if (this.isDevelopment()) {
        return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
    }
    // Update this to your production domain
    return "https://YOUR_PRODUCTION_DOMAIN.com";  // Include https://
},
```

**Example for shotmarket.com:**
```javascript
getProductionDomain: function() {
    return "shotmarket.com";
},

getBaseURL: function() {
    if (this.isDevelopment()) {
        return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
    }
    return "https://shotmarket.com";
},
```

---

## STEP 2: Configure Supabase

### 2.1 Create Production Supabase Project

If not already done:
1. Go to https://app.supabase.com
2. Create new project for production
3. Copy the production URL and Anon Key
4. Update `js/supabaseClient.js` and `js/config.js`:

```javascript
supabase: {
    url: "https://your-production-project.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
},
```

### 2.2 Configure CORS

In Supabase dashboard → Project Settings → API:

Add your production domain to CORS allowed origins:
```
https://shotmarket.com
https://www.shotmarket.com
```

### 2.3 Configure Auth Redirects

In Supabase dashboard → Authentication → URL Configuration:

```
Site URL: https://shotmarket.com
Redirect URLs:
  - https://shotmarket.com/dashboard.html
  - https://shotmarket.com/gallery.html
  - https://shotmarket.com/payment.html
  - https://shotmarket.com/upload.html
```

### 2.4 Enable Email Verification

In Supabase dashboard → Authentication → Email:

- Enable email verification
- Configure email templates (optional but recommended)
- Set email confirmation timeout

### 2.5 Set JWT Expiration

In Supabase dashboard → Authentication → JWT:

```
JWT Expiration Limit: 3600  (1 hour)
Refresh Token Expiration: 604800  (7 days)
```

### 2.6 Create Storage Buckets

In Supabase dashboard → Storage:

Create two buckets:

**1. shotmarket-private** (PRIVATE)
```
Bucket: shotmarket-private
Public: false (Private)
File upload size limit: 100 MB
```

**2. shotmarket-public** (Optional, for future features)
```
Bucket: shotmarket-public
Public: true
File upload size limit: 50 MB
```

### 2.7 Install RLS Policies

In Supabase dashboard → SQL Editor:

Copy the entire content from `supabase/rls-policies.sql` and execute it.

This will enable RLS and create all security policies.

### 2.8 Test Database Connection

Run this test query in SQL Editor:

```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

Should return policies for profiles, albums, photos, and payments tables.

---

## STEP 3: Configure Hosting

### 3.1 Choose Hosting Provider

Options:
- **Netlify** (Recommended for simplicity)
- **Vercel** (Great for performance)
- **GitHub Pages** (Free but limited)
- **AWS S3 + CloudFront** (Scalable)
- **Your own server** (Full control)

### 3.2 Netlify Deployment (Recommended)

1. Push project to GitHub

```bash
git add .
git commit -m "Production ready: ShotMarket v1.0"
git push origin main
```

2. Go to https://netlify.com and connect your GitHub repository

3. Configure build settings:
```
Build command: (none needed - static site)
Publish directory: .
```

4. Add environment variables in Netlify dashboard:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

5. Configure redirects (`netlify.toml`):

Create file `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  command = "echo 'Static site ready'"
  publish = "."

[context.production]
  environment = { SITE_NAME = "ShotMarket Production" }
```

6. Add custom domain:
   - Go to Domain management
   - Add your domain
   - Configure DNS (follow Netlify instructions)

### 3.3 Alternative: Vercel Deployment

1. Push to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

### 3.4 SSL/TLS Certificate

- **Netlify**: Automatic (Let's Encrypt)
- **Vercel**: Automatic (Let's Encrypt)  
- **Custom server**: Use Certbot for Let's Encrypt

---

## STEP 4: Configure Edge Functions

### 4.1 Deploy Edge Functions to Supabase

In Supabase dashboard → Edge Functions:

1. Create function: `gallery-access`
2. Create function: `download-access`

Or deploy via Supabase CLI:

```bash
supabase functions deploy gallery-access
supabase functions deploy download-access
```

Verify deployment:
- Go to Edge Functions in Supabase dashboard
- Should see both functions listed
- Test via Studio API explorer

---

## STEP 5: Configure Email (Optional but Recommended)

### 5.1 Email Provider Setup

**Option 1: Supabase Default Email** (Limited to 4 emails/day)

Skip configuration - it works by default

**Option 2: SendGrid**

1. Sign up at https://sendgrid.com
2. Get API key
3. In Supabase dashboard → Authentication → Email Providers:
   - Select SendGrid
   - Add API key
   - Configure sender email

**Option 3: AWS SES**

1. Set up AWS SES
2. In Supabase dashboard:
   - Select AWS SES
   - Configure credentials

---

## STEP 6: Configure Payment Tracking (Optional)

If using analytics:

1. Set up analytics account (Google Analytics, Mixpanel, etc.)
2. Add tracking code to HTML files
3. Track key events:
   - Payment created
   - Payment approved
   - Photo downloaded
   - QR scanned

Example Google Analytics (global.html head):
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## STEP 7: Production Checklist

Before going live, verify:

```
CONFIGURATION:
[ ] Production domain in config.js
[ ] Supabase production project configured
[ ] CORS configured for production domain
[ ] Auth redirects configured
[ ] Storage buckets created
[ ] RLS policies installed
[ ] Edge Functions deployed
[ ] Database indexes optimized

SECURITY:
[ ] HTTPS enabled
[ ] SSL certificate valid
[ ] Environment variables secure
[ ] No hardcoded secrets in code
[ ] Supabase authentication locked down
[ ] Rate limiting configured

PERFORMANCE:
[ ] Images optimized
[ ] JavaScript minified
[ ] CSS optimized
[ ] Database queries optimized
[ ] CDN configured (if using)

TESTING:
[ ] All pages load correctly
[ ] Authentication works
[ ] Payment flow works
[ ] Gallery displays correctly
[ ] QR codes work
[ ] Mobile responsive tested
[ ] Error messages work

MONITORING:
[ ] Error tracking enabled
[ ] Performance monitoring enabled
[ ] Uptime monitoring enabled
[ ] Backup automated

FINAL:
[ ] DNS propagated
[ ] Website accessible from domain
[ ] Email verification working
[ ] Support contact available
```

---

## STEP 8: Post-Launch Monitoring

### 8.1 Monitor Key Metrics

- Page load time (should be < 3 seconds)
- Error rate (should be < 0.1%)
- Uptime (should be > 99.5%)
- Active users
- Payment success rate

### 8.2 Set Up Alerts

Configure alerts for:
- Server errors
- Payment failures
- High error rates
- Downtime

### 8.3 Regular Backups

- Supabase automatically backs up data
- Keep storage files backed up
- Test restoration process monthly

### 8.4 Security Monitoring

- Review access logs weekly
- Monitor failed login attempts
- Check for suspicious activity
- Update dependencies monthly

---

## TROUBLESHOOTING

### Issue: QR Codes not loading from production domain

**Solution:**
- Verify config.js has correct production URL
- Clear browser cache
- Test QR code URLs manually

### Issue: Payment not approved message

**Solution:**
- Verify edge function is deployed
- Check Supabase function logs
- Verify payment record in database

### Issue: Photos not downloading

**Solution:**
- Verify signed URLs working
- Check storage bucket permissions
- Verify RLS policies correct

### Issue: Email verification not sending

**Solution:**
- Verify email provider configured
- Check Supabase email logs
- Verify sender domain
- Check spam folder

### Issue: CORS errors

**Solution:**
- Add domain to Supabase CORS whitelist
- Verify hosting domain matches config
- Clear browser cache

---

## ROLLBACK PROCEDURE

If critical issues found after launch:

1. Revert to last known good version:
```bash
git revert <commit-hash>
git push origin main
```

2. Redeploy from previous version on Netlify/Vercel

3. Notify users if needed

4. Investigate issue

5. Fix and redeploy

---

## VERSION UPDATES

To update production:

1. Test changes thoroughly locally
2. Commit changes: `git commit -m "Describe changes"`
3. Push to main: `git push origin main`
4. Netlify/Vercel automatically deploys
5. Test production changes

---

## SUPPORT & MAINTENANCE

### Weekly Tasks
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify backups

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Review security audit
- [ ] Optimize database queries
- [ ] Check SSL certificate expiry

### Quarterly Tasks
- [ ] Full security review
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Update documentation

---

## Next Steps

1. Update config.js with your domain
2. Configure Supabase project
3. Deploy Edge Functions
4. Choose hosting and deploy
5. Test thoroughly
6. Monitor production
7. Scale as needed

**Congratulations! ShotMarket is ready for production!** 🚀
