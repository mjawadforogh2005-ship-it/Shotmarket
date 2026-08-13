# 📸 ShotMarket

### Professional Photo Delivery & Marketplace Platform

ShotMarket is a front-end web platform designed specifically for photographers
to upload, organize, share, sell, and securely deliver event photography.

The platform was created to solve a real problem faced by photographers:
providing customers with an easy way to access their event photographs without
having to manually send hundreds of images.

---

## 🎯 Project Idea

ShotMarket connects photographers and their customers through private digital
photo galleries.

A photographer can:

- Create an event album
- Add event information
- Upload photographs
- Generate a QR code for the album
- Share the QR code with customers
- Manage customer access
- Provide payment information

A customer can:

- Scan the photographer's QR code
- Open the private gallery
- View available photographs
- Select photographs
- Review payment information
- Complete the simulated payment process
- Download the selected photographs

---

## ✨ Main Features

### 👨‍💼 Photographer Features

- Photographer dashboard
- Album creation
- Event information
- Drag & drop photo upload
- Photo preview
- Album management
- QR code generation
- Customer access
- Payment information
- Gallery management

### 👤 Customer Features

- QR-based gallery access
- Private photo galleries
- Photo selection
- Payment information
- Download access
- Responsive gallery interface

---

## 🧩 Project Modules

### Module 1 — Public Landing Page

Professional ShotMarket homepage containing:

- Hero section
- Features
- Gallery
- Pricing
- Contact
- Call-to-action buttons

### Module 2 — Authentication

- Login page
- Registration page

### Module 3 — Photographer Dashboard

- Album statistics
- Recent albums
- QR code access
- Quick actions

### Module 4 — Album & Photo Management

- Create album
- Event information
- Drag & drop upload
- Photo preview
- Album storage

### Module 5 — Customer Gallery

- Private gallery
- Photo selection
- Photographer information
- Customer access

### Module 6 — Payment & Bank Information

- Payment information
- Bank details
- Payment confirmation
- Download access

### Module 7 — QR & Navigation Integration

- QR-based gallery access
- Album linking
- Public navigation
- Connected pages

### Module 8 — Finalization & Deployment

- Responsive design
- UI polishing
- Code organization
- GitHub preparation
- Documentation
- Deployment

---

## 🛠 Technologies Used

- HTML5
- CSS3
- JavaScript
- LocalStorage
- QR Code technology
- Responsive Web Design

---

## 💾 Data Storage

This project currently uses browser `localStorage` as a temporary
front-end storage system.

This allows the project to demonstrate the complete application flow
without requiring a backend database.

The storage system can later be replaced with a real backend such as:

- Java
- Spring Boot
- PostgreSQL
- MySQL
- Cloud storage
- Authentication services

---

## 🎨 Design

ShotMarket uses a premium dark photography-inspired interface.

### Main Design Direction

- Dark navy background
- Gold accent color
- White typography
- Rounded cards
- Professional photography layout
- Subtle animations
- Responsive design

The design is intended to create a premium gallery/exhibition atmosphere
while keeping photographs as the visual focus.

---

## 📱 Responsive Design

ShotMarket is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The interface adapts navigation, cards, galleries and forms according
to screen size.

---

## 📂 Project Structure

```text
ShotMarket/
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── gallery.html
├── upload.html
├── payment.html
├── pricing.html
├── contact.html
│
├── css/
├── js/
├── assets/
│
├── README.md
└── .gitignore