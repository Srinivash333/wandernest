# 🏡 Wandernest - Vacation Rental & Travel Platform

A full-stack, production-ready **vacation rental and travel accommodation platform** built with the **MVC (Model-View-Controller)** architectural pattern, **Passport.js** and **bcrypt** for secure authentication, and the **Mapbox API** for interactive maps and location geocoding.

---

## ✨ Features

- **🎨 Modern Travel & Stay UI/UX**:
  - Pill search bar with instant destination, title, and location filtering.
  - Horizontal scrollable Category Bar (Trending, Rooms, Iconic Cities, Mountains, Castles, Amazing Pools, Camping, Farms, Arctic, Beach, Boats).
  - Live **"Display total after taxes"** toggle (+18% GST calculation).
  - Responsive cards with smooth hover zoom, badges, and wishlist heart animations.
- **🔐 Authentication & Authorization (Passport.js + bcrypt)**:
  - User signup and login with secure **bcrypt** password hashing.
  - Session handling with `express-session` and flash notifications (`connect-flash`).
  - Authorization middleware: only listing owners can edit/delete listings; only review authors can delete their reviews.
- **🗺️ Mapbox API Integration**:
  - Backend forward geocoding using `@mapbox/mapbox-sdk` to automatically convert addresses/cities into GeoJSON coordinates (`[longitude, latitude]`).
  - Interactive **Mapbox GL JS** map on the listing show page with custom brand-colored pin marker, pulse animation, navigation controls, and location popup.
  - Built-in fallback coordinates and banner ensuring the app never breaks even if offline.
- **⭐ Reviews & Ratings**:
  - Interactive 5-star rating selector.
  - Review feed showing author name, review date, and star ratings.
- **📱 Fully Responsive Design**:
  - Mobile-friendly navbar with collapsible menu, off-canvas style filters, and adaptive grid.

---

## 🏗️ Architecture (MVC Pattern)

```
wandernest/
├── models/               # Data schemas (Model layer)
│   ├── listing.js        # GeoJSON coordinates, owner ref, reviews
│   ├── review.js         # Rating, comment, author ref
│   └── user.js           # Bcrypt hashing pre-save hook, comparePassword
├── views/                # Presentation templates (View layer)
│   ├── layouts/          # Boilerplate with Google Fonts & Mapbox GL JS
│   ├── includes/         # Navbar, footer, flash alerts
│   ├── listings/         # index.ejs, show.ejs, new.ejs, edit.ejs
│   └── users/            # signup.ejs, login.ejs
├── controllers/          # Business logic (Controller layer)
│   ├── listings.js       # Listing CRUD, search, categories, geocoding
│   ├── reviews.js        # Review creation & deletion
│   └── users.js          # User signup, login, logout
├── routes/               # Route endpoints (Router layer)
│   ├── listing.js        # /listings routes
│   ├── review.js         # /listings/:id/reviews routes
│   └── user.js           # /signup, /login, /logout routes
├── public/               # Static assets
│   ├── css/style.css     # Modern responsive design system & styling
│   └── js/               # map.js (Mapbox), script.js (interactions)
├── init/                 # Database seed script & sample data
├── middleware.js         # isLoggedIn, isOwner, isReviewAuthor, Joi validations
├── schema.js             # Joi schema validations
└── app.js                # Express app initialization & server entry
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally or a MongoDB Atlas URI

### 2. Environment Setup
Create a `.env` file in the project root:
```env
PORT=2005
MONGODB_URL=mongodb://127.0.0.1:27017/wandernest
SECRET=wandernest_super_secret_session_key_2026
MAPBOX_TOKEN=your_mapbox_public_token_here
```
*(A default Mapbox token is pre-configured; you can replace it with your own Mapbox public token from [mapbox.com](https://www.mapbox.com/)).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
Populate initial listings and create the default demo user:
```bash
node init/index.js
```

### 5. Start the Server
```bash
# Start directly
node app.js

# Or start with nodemon
npx nodemon app.js
```

Open your browser and navigate to:
```
http://localhost:2005/listings
```

---

## 🔑 Demo Credentials

To test owner permissions, creating listings, and submitting reviews immediately:
- **Username:** `demouser`
- **Password:** `demo123`
*(Or click "Sign up" to create your own account)*

---

## 📦 Tech Stack

- **Backend:** Node.js, Express.js 5
- **Database & ODM:** MongoDB, Mongoose 9
- **Authentication:** Passport.js, Passport-Local, bcrypt / bcryptjs
- **Frontend / Templating:** EJS, EJS-Mate
- **Maps & Geocoding:** Mapbox GL JS, @mapbox/mapbox-sdk
- **Styling:** Vanilla CSS3 (Custom Design System), Bootstrap 5.3, FontAwesome 6
- **Validation:** Joi
