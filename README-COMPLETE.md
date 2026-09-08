# ShotMarket 📸

**A modern, secure photo delivery platform for professional photographers and their clients.**

Photographers create private galleries and share QR codes. Customers scan QR codes, browse photos, select the ones they want, and make payments. Upon payment approval, customers can download their photos securely.

---

## 🌟 Features

### For Photographers
- ✅ **Professional Dashboard** - Manage albums, photos, and payments
- ✅ **Album Creation** - Create and organize photo galleries
- ✅ **Photo Upload** - Drag-and-drop photo management
- ✅ **QR Code Generation** - Share galleries via scannable QR codes
- ✅ **Payment Management** - Track and approve customer payments
- ✅ **Bank Account Setup** - Configure payment receiving details
- ✅ **Revenue Tracking** - Monitor earnings and sales
- ✅ **Secure Storage** - Private encrypted photo storage

### For Customers
- ✅ **QR Code Access** - Scan QR to view photos instantly
- ✅ **Photo Selection** - Choose which photos to purchase
- ✅ **Secure Payment** - Bank transfer payment option
- ✅ **Download Protection** - Time-limited signed download URLs
- ✅ **Mobile Friendly** - Optimized for phones and tablets
- ✅ **No Account Required** - Anonymous customer sessions

---

## 🏗️ Architecture

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Responsive design with mobile-first approach
- **Vanilla JavaScript** - No build tools required, direct browser execution

### Backend
- **Supabase** - PostgreSQL database with real-time API
- **Supabase Auth** - Photographer & anonymous customer authentication
- **Supabase Storage** - Secure photo file storage
- **Edge Functions** - Server-side gallery & download authorization

### Security
- **Row Level Security (RLS)** - Database-level access control
- **Storage Policies** - Encrypted file access control
- **JWT Authentication** - Secure session management
- **Signed URLs** - Time-limited temporary download access

---

## 📁 Project Structure

```
shotmarket/
├── index.html                  # Landing page
├── dashboard.html              # Photographer dashboard
├── gallery.html                # Customer gallery viewer
├── payment.html                # Payment checkout
├── upload.html                 # Album & photo upload
├── login.html                  # Authentication
├── register.html               # Sign up
├── profile.html                # Photographer profile
├── contact.html                # Contact page
│
├── css/
│   ├── variables.css           # Design tokens
│   ├── reset.css               # Normalize styles
│   ├── navbar.css              # Navigation styling
│   ├── components.css          # Reusable components
│   ├── hero.css                # Hero sections
│   ├── dashboard.css           # Dashboard styling
│   ├── gallery.css             # Gallery viewer
│   ├── payment.css             # Payment page
│   ├── upload.css              # Upload interface
│   ├── responsive.css          # Mobile & responsive
│   └── animations.css          # Animations
│
├── js/
│   ├── config.js               # Production configuration
│   ├── ux-helpers.js           # UX utilities & notifications
│   ├── supabaseClient.js       # Supabase client setup
│   ├── auth.js                 # Authentication logic
│   ├── dashboard.js            # Dashboard functionality
│   ├── gallery.js              # Gallery viewer
│   ├── payment.js              # Payment processing
│   ├── upload.js               # Photo upload
│   ├── qr.js                   # QR code generation
│   ├── storage.js              # LocalStorage utilities
│   ├── navbar.js               # Navigation
│   ├── main.js                 # Global initialization
│   └── animations.js           # Animation utilities
│
├── assets/
│   ├── fonts/                  # Custom fonts
│   ├── images/                 # Project images
│   └── icons/                  # Icon files
│
├── supabase/
│   ├── config.toml             # Supabase configuration
│   ├── rls-policies.sql        # Row Level Security policies
│   └── functions/
│       ├── gallery-access/     # Gallery access function
│       └── download-access/    # Download authorization function
│
├── README.md                   # This file
├── SECURITY-REVIEW.md          # Security audit checklist
├── PRODUCTION-SETUP.md         # Production deployment guide
└── package.json                # Project dependencies
```

---

## 🚀 Quick Start

### Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/shotmarket.git
cd shotmarket
```

2. **Set up Supabase**
   - Create a free account at https://supabase.com
   - Create a new project
   - Copy your project URL and Anon Key
   - Update `js/supabaseClient.js` with your credentials

3. **Run locally**
```bash
# Option 1: Using Python's built-in server
python -m http.server 5500

# Option 2: Using Node.js
npx http-server -p 5500

# Option 3: Using VS Code Live Server extension
```

4. **Access the site**
```
http://localhost:5500
```

### Deploying to Production

See [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md) for detailed instructions.

---

## 🔐 Security

This project implements enterprise-grade security:

- **Row Level Security (RLS)** on all database tables
- **End-to-end encryption** for photo storage
- **JWT-based authentication** with automatic expiration
- **Signed URLs** for time-limited file access (2-hour expiry)
- **HTTPS/TLS** required for production
- **CORS protection** on backend API
- **SQL injection protection** via parameterized queries
- **XSS protection** with HTML escaping

See [SECURITY-REVIEW.md](./SECURITY-REVIEW.md) for the complete security audit.

---

## 📊 Database Schema

### profiles
```sql
id (uuid)              -- User ID from auth
full_name (text)       -- Photographer name
avatar_url (text)      -- Profile picture
created_at (timestamp) -- Account creation date
```

### albums
```sql
id (uuid)              -- Album ID
user_id (uuid)         -- Photographer ID (FK)
name (text)            -- Album name
description (text)     -- Album details
event_date (date)      -- When event occurred
location (text)        -- Where photos taken
privacy (enum)         -- private/public
gallery_token (uuid)   -- QR access token
created_at (timestamp) -- Upload date
```

### photos
```sql
id (uuid)              -- Photo ID
album_id (uuid)        -- Album (FK)
user_id (uuid)         -- Photographer (FK)
file_name (text)       -- Original filename
storage_path (text)    -- Path in storage bucket
is_available (bool)    -- Can be viewed/purchased
created_at (timestamp) -- Upload date
```

### payments
```sql
id (uuid)              -- Payment ID
album_id (uuid)        -- Album (FK)
user_id (uuid)         -- Photographer (FK)
customer_id (uuid)     -- Customer/Anonymous (FK)
amount (numeric)       -- Payment amount
currency (text)        -- Currency code
status (enum)          -- pending/paid/failed
selected_photos (json) -- List of photo IDs
created_at (timestamp) -- Payment creation
updated_at (timestamp) -- Last update
```

---

## 🔧 Configuration

### Development Configuration
- Base URL: `http://localhost:5500`
- Supabase Project: Development/Test project
- Authentication: Email verification optional

### Production Configuration
Edit `js/config.js`:

```javascript
getProductionDomain: function() {
    return "shotmarket.com";  // ← Update this
},
```

See [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md) for full configuration guide.

---

## 📱 Browser Support

- ✅ Chrome/Edge (Latest 2 versions)
- ✅ Firefox (Latest 2 versions)
- ✅ Safari (Latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎨 Design System

### Colors
- Primary: `#3B82F6` (Blue)
- Success: `#10B981` (Green)
- Error: `#EF4444` (Red)
- Warning: `#F59E0B` (Amber)
- Dark: `#1F2937` (Gray-800)

### Typography
- **Headings**: Manrope (700, 600)
- **Body**: DM Sans (400, 500)
- **Mono**: Courier/Monospace (code)

### Spacing
- Small: 8px
- Medium: 16px
- Large: 24px
- XLarge: 32px

---

## 🧪 Testing

### Manual Testing Checklist

**Photographer Flow:**
- [ ] Register new account
- [ ] Upload photos to album
- [ ] Generate QR code
- [ ] View dashboard stats
- [ ] Approve payment
- [ ] View revenue

**Customer Flow:**
- [ ] Scan QR code
- [ ] View photo gallery
- [ ] Select photos
- [ ] Complete payment
- [ ] Download photos

**Edge Cases:**
- [ ] Invalid QR token
- [ ] Expired signed URLs
- [ ] Cross-photographer access (should fail)
- [ ] Unpaid photo access (should fail)
- [ ] Mobile responsiveness
- [ ] Offline error handling

---

## 📈 Performance

### Page Load Times (Target)
- Homepage: < 2 seconds
- Dashboard: < 3 seconds
- Gallery: < 2 seconds
- Payment: < 2 seconds

### Optimization
- Images: Optimized with compression
- CSS: Minified in production
- JavaScript: Minified in production
- Caching: Browser and CDN caching enabled

---

## 🛠️ Maintenance

### Weekly
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify backups

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review security alerts
- [ ] Optimize queries
- [ ] Check SSL certificate

### Quarterly
- [ ] Full security audit
- [ ] Performance review
- [ ] User feedback analysis
- [ ] Update documentation

---

## 🐛 Troubleshooting

### "Gallery Not Found" Error
- Verify QR token in URL parameters
- Check album exists in database
- Verify token hasn't expired

### "Payment Error" on Checkout
- Check payment Edge Function is deployed
- Verify Supabase project in production
- Check network connectivity

### Photos Not Displaying
- Verify photos uploaded successfully
- Check storage bucket access
- Verify is_available = true in database

### CORS Errors
- Add domain to Supabase CORS whitelist
- Verify hosting domain configured
- Clear browser cache

For more troubleshooting, see [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md#troubleshooting).

---

## 📚 Documentation

- [SECURITY-REVIEW.md](./SECURITY-REVIEW.md) - Complete security audit
- [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md) - Deployment guide
- [Supabase Documentation](https://supabase.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)

---

## 👥 Team & Support

**Developer**: Your Name  
**Email**: your.email@example.com  
**Support**: support@shotmarket.com  

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Backend infrastructure
- [Font Awesome](https://fontawesome.com) - Icons
- [Google Fonts](https://fonts.google.com) - Typography
- [QRCode.js](https://davidshimjs.github.io/qrcodejs/) - QR generation

---

## 📝 Changelog

### v1.0.0 - Initial Release (2024)
- ✅ Photographer authentication
- ✅ Album & photo management
- ✅ QR code generation
- ✅ Customer gallery viewer
- ✅ Payment system
- ✅ Download authorization
- ✅ Mobile responsive design
- ✅ Production ready security

---

**ShotMarket** - Bringing photographers and customers together securely. 📸✨
