# 🏛️ FUNNY ARC — Mobile App Conversion Prompt for Google AI Studio

> **Instructions for Google AI Studio**:
> 1. In Google AI Studio (https://aistudio.google.com), select **Gemini 1.5 Pro** or **Gemini 2.0 Flash / Pro**.
> 2. Click the **+** (Upload file) icon and attach `funny-arc-ai-studio.zip` (or `zaytoun-atelier-ai-studio.zip`).
> 3. Paste the prompt below into the prompt box and click **Run**.

---

### PROMPT TO COPY & PASTE INTO GOOGLE AI STUDIO:

```markdown
You are an expert mobile software architect and senior mobile engineer.
I have uploaded the complete codebase for "FUNNY ARC" (an ultra-luxury contemporary couture fashion atelier ecommerce platform).

### Objective:
Convert this web application into a complete, high-performance, production-ready Mobile Application (choose either React Native with Expo SDK 52+ & NativeWind or Flutter, with React Native / Expo preferred).

### Key Features to Replicate in the Mobile App:
1. **Brand & Design Identity**:
   - Brand Name: "FUNNY ARC"
   - Palette: Pure White (`#FFFFFF`), Camel/Caramel (`#C19A6B` / `#D4A373` / `#9A6E3E`), Onyx/Charcoal (`#1A1A1A`), Cream/Ivory (`#FAF7F2` / `#FAF6F0`).
   - Typography: Serif luxury headings (Playfair / Cormorant Garamond style) paired with clean geometric body text (Inter / Outfit / SF Pro).
   - Micro-interactions: Smooth haptics, spring animations, fluid tab navigation, and bottom sheets.
   - Status Text: Consistently format all order statuses in clean lowercase (`pending`, `approved`, `processing`, `shipped`, `delivered`, `cancelled`).

2. **Core Screens & Navigation**:
   - **Tab Navigator**:
     - 🏠 **Home**: Hero section, curated collections, animated marquee, featured products.
     - 🛍️ **Shop / Catalog**: Dynamic category filtering (All, Men, Women, Knitwear, Outerwear), search with debounced filtering, and sorting.
     - 👗 **Fitting Room / Studio**: Interactive 3D/2D look customizer (translating `formeEngine.js` and `FittingRoom.jsx` to mobile).
     - 🛒 **Cart & Bag**: Slide-up bottom sheet cart, quantity counters, currency conversion (PKR, USD, EUR), promo codes.
     - 👤 **Account & Admin**: Profile, order history, tracking, Google Sign-in, and secret Admin Gate passcode/owner access.
   - **Stack Screens**:
     - **Product Detail**: Image carousel with pinch-to-zoom, size selector, fabric details modal, "Add to Bag", and haptic feedback.
     - **Checkout Flow**: Shipping address, payment method selection (COD, JazzCash, EasyPaisa, Bank Proof Upload), order summary, and order confirmation.
     - **Order Tracking**: Order ID lookup with dynamic stepper progress (order placed -> tailoring -> shipped -> delivered).
     - **Admin Gate & Dashboard**: Passcode/email-protected access (`src/components/AdminGate.jsx`), managing orders with lowercase status switcher, TCS courier approval, subscribers, and live stats.

3. **Global State & Services**:
   - Currency Context (dynamic switching across USD, EUR, GBP, PKR, AED, SAR).
   - Cart State (persisted with AsyncStorage / secure storage).
   - Auth State (Google OAuth / JWT token storage).
   - API Service layer communicating with the existing Express / MongoDB backend (`server/index.js`).

4. **Deliverables Required**:
   - Step 1: Complete recommended project structure and setup instructions (e.g. `npx create-expo-app`).
   - Step 2: Essential configuration files (`app.json`, `tailwind.config.js`, dependencies list).
   - Step 3: Complete code for the navigation structure and core screens (Home, Shop, Product Detail, Cart, Fitting Room, Admin).
   - Step 4: Shared components (Buttons, Product Cards, Bottom Sheets, Currency selector).
   - Step 5: Instructions on how to connect the mobile app to the Node.js backend.
```
