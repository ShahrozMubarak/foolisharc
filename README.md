# 🌿 FOOLISH ARC — Haute Couture & Ready-to-Wear Storefront

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

An immersive, high-fashion e-commerce web application inspired by the earthy luxury of Mediterranean landscapes. Built around a signature palette of **Deep Olive** (`#364634`), **Desert Camel** (`#C69F6F`), **Alabaster White**, and **Onyx Black**, **FOOLISH ARC** bridges physical tailoring with cutting-edge digital experiences—featuring 3D interactive mannequin turntables and a 2D mix-and-match virtual fitting room engine.

---

## ✨ Features & Highlights

### 🧵 1. Immersive 3D & 2D Fitting Experience
* **3D Mannequin Turntable**: Interactive 3D garment visualization powered by `@google/model-viewer` and WebGL, allowing 360° orbital rotation, tilt control, and garment inspection.
* **FORME Layering Engine**: Deterministic SVG-based try-on system supporting **Women**, **Men**, and **Kids** mannequins with intelligent garment layering (tops + bottoms combine, dresses replace outfits, outerwear layers on top).
* **Demographic Switching & Color Fidelity**: Real-time palette switching with authentic fabric representations (silk, cashmere, linen, leather).

### 🛍️ 2. Luxury E-Commerce Flow
* **Multi-Currency Engine**: Display switcher supporting **PKR (Rs)**, **USD ($)**, **EUR (€)**, and **GBP (£)** with auto-conversion.
* **Guest Checkout & Tracking**: Interactive cart drawer, validated guest checkout, database-confirmed order receipts, and **Order Tracking** verified with the order number and checkout email.
* **Editorial Showcase**: Curated campaigns, marquee strips, fabric texture modal, and dynamic size guide.

### 🎨 3. Atelier Studio & Customization
* **Server-Verified Owner Studio**: Add, update, and manage products with custom transparent cutout alignments and positioning tools.
* **Brand Appearance Controls**: Edit store branding and accent colors directly with live preview and catalog export/import (`products.json`).
* **Dark & Light Mode**: Fluid day/night switching persisted in local storage.

### 🛡️ 4. Full-Stack Architecture
* **RESTful Backend**: Node.js & Express 5 API handling products, orders, customer inquiries, newsletter subscribers, and admin authentication.
* **Database & Mail Services**: MongoDB (Mongoose) with transactional schemas, plus email dispatch powered by **Resend** and **Nodemailer (Gmail SMTP)**.
* **Regression Tests**: Node test-runner checks for fitting-room rendering, catalog behavior, sizing, pricing, and garment layering. These are not browser-driven end-to-end tests; see `REPAIR_NOTES.md` for the current test status.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, React Router v7 |
| **3D & Graphics** | `@google/model-viewer`, Three.js-compatible GLB models, SVG engine |
| **Backend** | Node.js (ESM), Express 5, Mongoose 9 (MongoDB) |
| **Auth & Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `joi` input validation |
| **Email Services** | `resend`, `nodemailer` (SMTP fallback) |
| **Testing** | Node test runner, regression assertions |

---

## 📁 Project Structure

```text
foolisharc-storefront/
├── public/
│   ├── images/              # High-resolution editorial campaign photos
│   ├── models/              # 3D GLB assets (mannequins, coats, dresses)
│   └── videos/              # Hero background fashion videos
├── server/
│   ├── index.js             # Express API entry point & routes
│   ├── db.js                # MongoDB connection handler
│   ├── models/              # Mongoose models (Order, Product, Customer, etc.)
│   ├── middleware/          # JWT authentication & Joi request validation
│   └── services/            # Email notifications (Resend / Nodemailer)
├── src/
│   ├── components/          # Reusable UI (Navbar, Cart, 3D Mannequin, Modals)
│   ├── context/             # Currency and global state providers
│   ├── data/                # Static catalog and brand color palette definitions
│   ├── engine/              # FORME 2D layering and cutout calculation engine
│   ├── pages/               # HomePage, ShopPage, StudioPage, OrderTracking, etc.
│   ├── App.jsx              # Application router and root state
│   └── index.css            # Tailwind directives and custom animation styles
├── tests/                   # Node regression tests for tier-1 features
├── .env.example             # Template for environment variables
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite development and build configuration
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v20.19+ on Node 20, or v22.12+
* **npm**: v9.0.0 or higher
* **MongoDB**: A local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI

### Installation

1. Install Node.js 22.12 or newer.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

4. Configure MongoDB Atlas and owner access in `.env`:

   - `MONGODB_URI`: your private Atlas connection string.
   - `ADMIN_EMAIL`: the owner sign-in email.
   - `ADMIN_PASSWORD_HASH`: a bcrypt hash created by `npm run admin:hash`.
   - `JWT_SECRET`: a random secret with at least 32 characters. Generate one with `openssl rand -base64 48`.
   - `PUBLIC_APP_URL` and `CORS_ORIGINS`: the exact storefront origin used in production.

5. Create a bcrypt password hash in an interactive terminal:

   ```bash
   npm run admin:hash
   ```

   The script hides the password while typing. Copy the resulting hash into `ADMIN_PASSWORD_HASH`. Use a unique password of at least 12 characters.

6. Set the same server-only variables in your hosting provider (for example, Vercel Project Settings → Environment Variables). Do not commit `.env`, and do not prefix database credentials, password hashes, or JWT secrets with `VITE_`.

### Owner Studio

Open `/studio` and sign in with `ADMIN_EMAIL` and the password used to generate `ADMIN_PASSWORD_HASH`. Owner access is checked by the API and protected with short-lived signed sessions. Browser profile data and custom request headers cannot grant owner permissions.

### Checkout and inventory

Checkout prices are recalculated from the database catalog. Stock reservation and order creation run in one MongoDB transaction; the Atlas deployment must support transactions (a replica set or sharded cluster). If the transaction fails, the checkout is not reported as successful and the customer's bag is retained.

Cash on Delivery is enabled by default. JazzCash and EasyPaisa appear only when their account number and account title are configured in the server environment. Card payments remain disabled until a real payment processor is integrated.

### Email

Email delivery is optional. Configure either `RESEND_API_KEY` plus `RESEND_FROM`, or SMTP settings (`EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`). Set `ADMIN_NOTIFICATION_EMAIL` to receive owner alerts. No provider key or test sender is embedded in the source.

## 🏃 Running the Application

### Option A: Run Full Stack (Frontend + Backend concurrently)
```bash
npm run dev:all
```

### Option B: Run Individually
* **Frontend Dev Server:**
  ```bash
  npm run dev
  ```
  App will be accessible at: `http://localhost:5173`

* **Backend Express Server:**
  ```bash
  npm run server
  ```
  API will run at: `http://localhost:5000`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🧪 Running Tests

Run the current regression suite with:
```bash
npm test
```

See `REPAIR_NOTES.md` for the test results recorded for this source snapshot and the remaining verification work.

---

