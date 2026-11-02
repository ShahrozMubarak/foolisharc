

```markdown
You are an expert mobile software architect and senior mobile engineer.
I have uploaded the complete codebase for "Zaytoun Atelier" (an ultra-luxury Olive & Camel couture fashion ecommerce platform).

### Objective:
Convert this web application into a complete, high-performance, production-ready Mobile Application (choose either React Native with Expo & NativeWind or Flutter, with React Native / Expo preferred).

### Key Features to Replicate in the Mobile App:
1. **Brand & Design Identity**:
   - Palette: white , Camel/Caramel (`#C19A6B` / `#D4A373`), Onyx/Charcoal (`#1A1A1A`), Cream/Ivory (`#FAF7F2`).
   - Typography: Serif luxury headings (Playfair / Cormorant Garamond style) paired with clean geometric body text (Inter / Outfit).
   - Micro-interactions: Smooth haptics, spring animations, fluid tab navigation, and bottom sheets.

2. **Core Screens & Navigation**:
   - **Tab Navigator**:
     - 🏠 **Home**: Hero section, curated collections, animated marquee, featured products.
     - 🛍️ **Shop / Catalog**: Dynamic category filtering (All, Men, Women, Knitwear, Outerwear), search with debounced filtering, and sorting.
     - 👗 **Fitting Room / Studio**: Interactive 3D/2D look customizer (translating `formeEngine.js` and `FittingRoom.jsx` to mobile).
     - 🛒 **Cart & Bag**: Slide-up bottom sheet cart, quantity counters, currency conversion, promo codes.
     - 👤 **Account & Admin**: Profile, order history, tracking, Google Sign-in, and secret Admin Gate passcode modal.
   - **Stack Screens**:
     - **Product Detail**: Image carousel with pinch-to-zoom, size selector, fabric details modal, "Add to Bag", and haptic feedback.
     - **Checkout Flow**: Shipping address, payment method selection, order summary, and order confirmation.
     - **Order Tracking**: Order ID lookup with dynamic stepper progress (Order Placed -> Tailoring -> Shipped -> Delivered).
     - **Admin Gate & Dashboard**: Passcode-protected access (`src/components/AdminGate.jsx`), managing orders, subscribers, and stats.

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
