import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PRODUCTS, COLOR_PALETTE_INFO, CATALOG_VERSION } from './data/products';
import * as FormeEngine from './engine/formeEngine';
import { CurrencyProvider } from './context/CurrencyContext';
import * as API from './services/api';

// Components
import ScrollProgressBar from './components/ScrollProgressBar';
import Preloader from './components/Preloader';
import MarqueeStrip from './components/MarqueeStrip';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import AutomatedOrderNoticeModal from './components/AutomatedOrderNoticeModal';
import { notifyOrderPlaced, notifyGazetteSubscribed } from './services/notificationService';
import ProductModal from './components/ProductModal';
import BrandPaletteGuide from './components/BrandPaletteGuide';
import SizeGuideModal from './components/SizeGuideModal';
import FitFinderModal from './components/FitFinderModal';
import FabricTextureModal from './components/FabricTextureModal';
import SearchOverlay from './components/SearchOverlay';
import BackToTop from './components/BackToTop';
import GoogleAuthModal from './components/GoogleAuthModal';

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
const StudioPage = lazy(() => import('./pages/StudioPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function CartRoute({setOpen}) {
  useEffect(()=>{setOpen(true);},[setOpen]);
  return <Navigate to="/shop" replace/>;
}
export default function App() {
  // Theme Mode: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_theme');
      return saved ? JSON.parse(saved) : 'light';
    } catch {
      return 'light';
    }
  });

  // Theme Brand Configuration (editable in Studio)
  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_theme_config');
      return saved ? JSON.parse(saved) : {
        brand: "FOOLISH ARC",
        olive: "#E6D3B3",
        camel: "#C69F6F"
      };
    } catch {
      return {
        brand: "FOOLISH ARC",
        olive: "#E6D3B3",
        camel: "#C69F6F"
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_theme', JSON.stringify(theme));
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.warn("Theme storage error:", e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_theme_config', JSON.stringify(themeConfig));
      document.documentElement.style.setProperty('--olive', themeConfig.olive || '#E6D3B3');
      document.documentElement.style.setProperty('--camel', themeConfig.camel || '#C69F6F');
      if (themeConfig.linen) {
        document.documentElement.style.setProperty('--linen', themeConfig.linen);
      }
      if (themeConfig.onyx) {
        document.documentElement.style.setProperty('--onyx', themeConfig.onyx);
      }
    } catch (e) {
      console.warn("Theme config storage error:", e);
    }
  }, [themeConfig]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Products catalog (persisted to localStorage with automatic version sync)
  const [products, setProducts] = useState(() => {
    try {
      const savedVersion = localStorage.getItem('zaytoun_catalog_version');
      if (savedVersion !== CATALOG_VERSION) {
        localStorage.setItem('zaytoun_catalog_version', CATALOG_VERSION);
        localStorage.setItem('zaytoun_products', JSON.stringify(PRODUCTS));
        return PRODUCTS;
      }
      const saved = localStorage.getItem('zaytoun_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_products', JSON.stringify(products));
    } catch (e) {
      console.warn("Products storage error:", e);
    }
  }, [products]);

  // Sync initial state from MongoDB Atlas if available
  useEffect(() => {
    API.fetchProductsFromDB().then(dbProds => {
      if (Array.isArray(dbProds) && dbProds.length > 0) setProducts(dbProds);
    }).catch(() => {});

    API.fetchThemeFromDB().then(dbTheme => {
      if (dbTheme && dbTheme.brand) setThemeConfig(prev => ({ ...prev, ...dbTheme }));
      if (dbTheme?.siteSettings) {
        try {
          localStorage.setItem('foolisharc_site_settings', JSON.stringify(dbTheme.siteSettings));
          window.dispatchEvent(new Event('storage'));
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // Outfits state per mannequin collection (women, men, kids)
  const [outfits, setOutfits] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_outfits');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Outfits storage error:", e);
    }

    return {
      women: {
        top: { id: "women-shirt-01", variant: 0 },
        bottom: { id: "women-jeans-01", variant: 0 }
      },
      men: {
        top: { id: "men-tee-01", variant: 0 },
        bottom: { id: "men-jeans-01", variant: 0 }
      },
      kids: {
        top: { id: "men-tee-01", variant: 0 },
        bottom: { id: "men-jeans-01", variant: 0 }
      }
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_outfits', JSON.stringify(outfits));
    } catch (e) {
      console.warn("Outfits storage error:", e);
    }
  }, [outfits]);

  // Currently selected demographic for fitting room
  const [selectedPerson, setSelectedPerson] = useState('women');

  // Shopping Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("Cart storage error:", e);
    }
  }, [cart]);

  // Wishlist state (array of product IDs)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Wishlist storage error:", e);
    }
  }, [wishlist]);

  // Order history is sourced from the database, not seeded or trusted from browser storage.
  const [orders, setOrders] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      for (const key of ['zaytoun_orders','zaytoun_client_user','foolisharc_user','zaytoun_user','foolisharc_fit_profile']) localStorage.removeItem(key);
    } catch {}
    let active=true;
    API.fetchCustomerSession().then(user=>{if(active && user) setCurrentUser(current=>current || user);});
    return ()=>{active=false;};
  }, []);

  // Google Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: "Sign in with Google to Add to Bag",
    subtitle: "To curate your luxury wardrobe and place orders, please sign in with your Google account.",
    pendingItem: null
  });

  // Toast Notification state
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Open Google Auth Modal
  const handleOpenAuthModal = (config = {}) => {
    setAuthModalConfig({
      title: config.title || "Sign in with Google",
      subtitle: config.subtitle || "Welcome to FOOLISH ARC. Please sign in with your Google account.",
      pendingItem: config.pendingItem || null
    });
    setIsAuthModalOpen(true);
  };

  // On Sign In Success - Accepts verified Google users or direct credentials
  const handleAuthSuccess = (authUser, redirectItem = null) => {
    if (!authUser || !authUser.email) {
      console.warn("Blocked invalid login attempt:", authUser);
      return;
    }

    const { accessToken: _googleAccessToken, ...safeAuthUser } = authUser;
    setCurrentUser(safeAuthUser);
    setIsAuthModalOpen(false);

    // If an item was queued when clicking "Add to Cart":
    if (redirectItem || authModalConfig.pendingItem) {
      const item = redirectItem || authModalConfig.pendingItem;
      addToCartDirect(
        item.product || item,
        item.selectedSize || item.size || 'M',
        item.selectedColor || item.color,
        item.quantity || 1
      );
      setToastNotification({
        title: "Added to Your Bag",
        message: `Welcome, ${authUser.firstName || authUser.name}! "${item.name || 'Garment'}" has been added to your bag.`
      });
      setIsCartOpen(true);
    } else {
      setToastNotification({
        title: authUser.authProvider === 'google' ? "Signed In with Google" : "Signed In",
        message: `Welcome back to FOOLISH ARC, ${authUser.firstName || authUser.name}!`
      });
    }

    setAuthModalConfig({
      title: "Sign in to Add to Bag",
      subtitle: "To curate your luxury wardrobe and place orders, please sign in with your account.",
      pendingItem: null
    });
  };

  // Sign out handler
  const handleLogout = async () => {
    try { await API.logoutCustomerSession(); }
    catch { setToastNotification({ title: 'Still signed in', message: 'Sign-out failed. Please try again.' }); return; }
    setCurrentUser(null);
    setFitProfile(null);
    try {
      localStorage.removeItem('zaytoun_client_user');
      sessionStorage.removeItem('zaytoun_admin_session');
      sessionStorage.removeItem('zaytoun_admin_jwt');
      sessionStorage.removeItem('foolisharc_admin_token');
    } catch {}
    setToastNotification({
      title: "Signed Out",
      message: "You have signed out of your Google client account."
    });
  };

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isAutomatedOrderModalOpen, setIsAutomatedOrderModalOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isPaletteGuideOpen, setIsPaletteGuideOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [isFitProfileModalOpen, setIsFitProfileModalOpen] = useState(false);
  const [fitProfile,setFitProfile]=useState(null);

  useEffect(() => {
    const handleOpenAuth = () => setIsGoogleAuthModalOpen(true);
    const handleOpenFit = () => setIsFitProfileModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    window.addEventListener('open-fit-finder', handleOpenFit);
    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuth);
      window.removeEventListener('open-fit-finder', handleOpenFit);
    };
  }, []);
  useEffect(()=>{
    let active=true;
    setFitProfile(null);
    API.fetchFitProfileFromAPI().then(profile=>{if(active) setFitProfile(profile);});
    return ()=>{active=false;};
  },[currentUser?.email]);
  const handleSaveFitProfile=setFitProfile;
  const handleDeleteFitProfile=()=>setFitProfile(null);

  const handleSwitchCartItemSize = (itemId, oldSize, color, newSize) => {
    setCart(prev => {
      const sameColor = item => item.id === itemId && (item.selectedColor || item.colorName || item.primaryColor || 'Olive') === color;
      const source = prev.find(item => sameColor(item) && item.selectedSize === oldSize);
      if (!source || newSize === oldSize) return prev;
      const target = prev.find(item => sameColor(item) && item.selectedSize === newSize);
      const quantity = source.quantity + (target?.quantity || 0);
      if (quantity > Math.min(20, source.stockPerSize?.[newSize] ?? source.stock ?? 0)) return prev;
      return prev.filter(item => item !== target).map(item => item === source
        ? { ...item, selectedSize: newSize, size: newSize, quantity } : item);
    });
  };

  // Automated notification handler for subscriptions
  const handleSubscriptionNotification = (email) => {
    notifyGazetteSubscribed(email);
    setToastNotification({
      title: "Gazette Subscription Active",
      message: `Thank you for subscribing! Drop alerts and receipts will be delivered to ${email}.`
    });
  };

  // Direct Cart Addition (Internal)
  const addToCartDirect = (product, size = 'M', color = null, quantity = 1) => {
    if (!product?.id) return;
    const safeQuantity = Math.min(20, Math.max(1, Number(quantity) || 1));
    const garmentColor = color || product.colors?.[0]?.name || product.primaryColor || 'Olive';
    setCart(prev => {
      const existing = prev.find(
        item => item.id === product.id && item.selectedSize === size && (item.selectedColor === garmentColor || !item.selectedColor)
      );
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size && (item.selectedColor === garmentColor || !item.selectedColor)
            ? { ...item, quantity: Math.min(20, item.quantity + safeQuantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          selectedSize: size,
          selectedColor: garmentColor,
          quantity: safeQuantity
        }
      ];
    });
  };

  const handleAddToCart = (product, size = 'M', color = null, quantity = 1) => {
    if (!currentUser) {
      setToastNotification({
        title: "Sign In Required",
        message: "Please sign in or create an account to add items to your shopping bag."
      });
      setIsGoogleAuthModalOpen(true);
      return false;
    }
    addToCartDirect(product, size, color, quantity);
    setSelectedProductModal(null);
    setIsCartOpen(true);
    return true;
  };

  const handleUpdateQuantity = (itemId, size, color, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId && item.selectedSize === size && (item.selectedColor || item.colorName || item.primaryColor || 'Olive') === color) {
            const nextQty = Math.min(20, item.quantity + delta);
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (itemId, size, color) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && item.selectedSize === size && (item.selectedColor || item.colorName || item.primaryColor || 'Olive') === color)));
  };

  const handleToggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleEquip = (product, variantIndex = 0) => {
    const person = product.person || product.gender || selectedPerson;
    setSelectedPerson(person);

    setOutfits(prev => {
      const currentPersonOutfit = prev[person] || {};
      const slot = product.slot;
      const isAlreadyEquipped = currentPersonOutfit[slot]?.id === product.id;

      if (isAlreadyEquipped && currentPersonOutfit[slot]?.variant === variantIndex) {
        // Unequip item
        const updated = { ...currentPersonOutfit };
        delete updated[slot];
        return { ...prev, [person]: updated };
      }

      // Equip item using Forme replacement logic
      const updated = FormeEngine.equip(currentPersonOutfit, product, variantIndex);
      return { ...prev, [person]: updated };
    });
  };

  const handleSelectVariant = (slot, variantIndex) => {
    setOutfits(prev => {
      const currentPersonOutfit = prev[selectedPerson] || {};
      if (!currentPersonOutfit[slot]) return prev;
      return {
        ...prev,
        [selectedPerson]: {
          ...currentPersonOutfit,
          [slot]: {
            ...currentPersonOutfit[slot],
            variant: variantIndex
          }
        }
      };
    });
  };

  const handleClearOutfit = (person = selectedPerson) => {
    setOutfits(prev => ({
      ...prev,
      [person]: {}
    }));
  };

  const handleResetOutfit = (person = selectedPerson) => {
    const defaults = {
      women: { top: { id: "women-shirt-01", variant: 0 }, bottom: { id: "women-jeans-01", variant: 0 } },
      men: { top: { id: "men-tee-01", variant: 0 }, bottom: { id: "men-jeans-01", variant: 0 } },
      kids: { top: { id: "men-tee-01", variant: 0 }, bottom: { id: "men-jeans-01", variant: 0 } }
    };
    setOutfits(prev => ({
      ...prev,
      [person]: defaults[person] || {}
    }));
  };

  const handleAddLookToBag = (person = selectedPerson, size = 'M') => {
    const personOutfit = outfits[person] || {};
    const equippedIds = Object.values(personOutfit).map(item => item?.id).filter(Boolean);
    const lookItems = products.filter(p => equippedIds.includes(p.id));

    if (lookItems.length === 0) return;

    for (const item of lookItems) {
      const color=item.colors?.[personOutfit[item.slot]?.variant || 0];
      addToCartDirect(item,size,typeof color === 'string' ? color : color?.name);
    }
    setIsCartOpen(true);
  };

  const handleTryOnProduct = (product) => {
    handleToggleEquip(product);
  };

  // Checkout commits to MongoDB before the UI confirms or clears the bag.
  const handleConfirmOrder = async (orderData) => {
    const savedResponse = await API.saveOrderToDB(orderData);
    const savedOrder = savedResponse?.orderNumber ? savedResponse : savedResponse?.order;
    if (!savedOrder?.orderNumber) {
      throw new Error('The order was not confirmed by the server. Your bag is still saved.');
    }

    setOrders(prev => [savedOrder, ...prev.filter(order =>
      String(order?.orderNumber || order?.id) !== String(savedOrder.orderNumber)
    )]);

    if (Array.isArray(savedResponse.inventory)) {
      setProducts(prev => prev.map(product =>
        savedResponse.inventory.find(item => item.id === product.id) || product
      ));
    }

    try {
      if (savedOrder.customer?.email) {
        sessionStorage.setItem('foolisharc_tracking_email', savedOrder.customer.email);
      }
    } catch {}

    setCart([]);
    setIsCheckoutOpen(false);
    setConfirmedOrder(savedOrder);
    setIsAutomatedOrderModalOpen(false);
    try { notifyOrderPlaced(savedOrder); } catch (error) { console.warn('Order notification could not be shown:', error.message); }

    setToastNotification({
      title: `Order #${savedOrder.orderNumber} confirmed`,
      message: 'Your order has been securely saved. We will contact you with updates.'
    });

    return savedOrder;
  };

  const handleUpdateOrderStatus = (orderId, newStatus, serverResult = null) => {
    const cleanId = String(orderId || '').toLowerCase().trim();
    const normalizedStatus = String(newStatus || 'pending').toLowerCase().trim();
    const serverOrder = serverResult?.order;

    setOrders(prev => prev.map(order => {
      const orderKeys = [order?.orderNumber, order?.id, order?._id].map(value => String(value || '').toLowerCase());
      return orderKeys.includes(cleanId) ? { ...order, ...(serverOrder || {}), status: normalizedStatus } : order;
    }));

    if (Array.isArray(serverResult?.inventory)) {
      setProducts(prev => prev.map(product =>
        serverResult.inventory.find(item => item.id === product.id) || product
      ));
    }
  };

  // Product and appearance changes are persisted first; failures are surfaced to the Studio.
  const handleAddProduct = async (newProduct) => {
    const saved = await API.saveProductToDB(newProduct);
    setProducts(prev => [saved, ...prev.filter(product => product.id !== saved.id)]);
    return saved;
  };

  const handleUpdateProductStock = async (id, size, stock) => {
    const current = products.find(product => product.id === id);
    if (!current) throw new Error('Product not found.');
    const stockPerSize = {
      ...(current.stockPerSize || {}),
      [size]: Math.max(0, Number(stock) || 0)
    };
    const updated = {
      ...current,
      stockPerSize,
      stock: Object.values(stockPerSize).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)
    };
    const saved = await API.saveProductToDB(updated);
    setProducts(prev => prev.map(product => product.id === id ? saved : product));
    return saved;
  };

  const handleUpdateProductPrice = async (id, price) => {
    const current = products.find(product => product.id === id);
    if (!current) throw new Error('Product not found.');
    const saved = await API.saveProductToDB({ ...current, price: Math.max(0, Number(price) || 0) });
    setProducts(prev => prev.map(product => product.id === id ? saved : product));
    return saved;
  };

  const handleDeleteProduct = async (id) => {
    await API.deleteProductFromDB(id);
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const handleImportCatalog = async (importedProducts) => {
    if (!Array.isArray(importedProducts) || importedProducts.length === 0) return;
    const savedProducts = [];
    for (const product of importedProducts) {
      savedProducts.push(await API.saveProductToDB(product));
    }
    setProducts(prev => {
      const map = new Map(prev.map(product => [product.id, product]));
      savedProducts.forEach(product => map.set(product.id, product));
      return Array.from(map.values());
    });
  };

  const handleUpdateTheme = async (newConfig) => {
    const updated = { ...themeConfig, ...newConfig };
    const saved = await API.saveThemeToDB(updated);
    setThemeConfig(prev => ({ ...prev, ...saved }));
    return saved;
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <BrowserRouter>
      <CurrencyProvider>
        {/* Top Global Scroll Progress Bar */}
        <ScrollProgressBar />

      {/* Luxury Initial Preloader */}
      <Preloader />

      <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-white dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors font-sans antialiased selection:bg-camel-500 selection:text-white">
        
        {/* Minimalist Top Navigation Bar */}
        <Navbar
          cartCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          brandName={themeConfig.brand}
          user={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          fitProfile={fitProfile}
          onOpenFitProfile={() => setIsFitProfileModalOpen(true)}
        />

        {/* Multi-Page Routes */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <Suspense fallback={<p role="status" className="p-8 text-center">Loading…</p>}><Routes>
            {/* Home / Preview Landing Page */}
            <Route
              path="/"
              element={
                <HomePage
                  products={products}
                  onAddToCart={handleAddToCart}
                  onOpenProductModal={(p) => setSelectedProductModal(p)}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                  outfits={outfits}
                  themeConfig={themeConfig}
                  onSubscribe={handleSubscriptionNotification}
                />
              }
            />

            {/* Shop / Collection Page */}
            <Route
              path="/shop"
              element={
                <ShopPage
                  products={products}
                  onAddToCart={handleAddToCart}
                  onOpenProductModal={(p) => setSelectedProductModal(p)}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                  onTryOnProduct={handleTryOnProduct}
                />
              }
            />

            {/* Dedicated Product Detail Page Routes */}
            <Route
              path="/product/:id"
              element={
                <ProductDetailPage
                  products={products}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                  onOpenProductModal={(p) => setSelectedProductModal(p)}
                  fitProfile={fitProfile}
                  onSaveFitProfile={handleSaveFitProfile}
                  onDeleteFitProfile={handleDeleteFitProfile}
                />
              }
            />
            <Route
              path="/shop/:id"
              element={
                <ProductDetailPage
                  products={products}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                  onOpenProductModal={(p) => setSelectedProductModal(p)}
                  fitProfile={fitProfile}
                  onSaveFitProfile={handleSaveFitProfile}
                  onDeleteFitProfile={handleDeleteFitProfile}
                />
              }
            />

            {/* Cart Route: Opens Cart & navigates cleanly */}
            <Route
              path="/cart"
              element={
                <CartRoute setOpen={setIsCartOpen} />
              }
            />

            {/* Fitting Room Redirect */}
            <Route path="/fitting-room" element={<Navigate to="/shop" replace />} />

            {/* Lookbook Route */}
            <Route path="/lookbook" element={<Navigate to="/shop" replace />} />

            {/* Story & Palette Page */}
            <Route path="/story" element={<AboutPage />} />
            <Route path="/about" element={<Navigate to="/story" replace />} />

            {/* Concierge & Showroom Page */}
            <Route path="/contact" element={<ContactPage />} />

            {/* Studio / Admin Dashboard Page (Strictly Gated by Owner Email) */}
            <Route
              path="/studio"
              element={
                <StudioPage
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProductStock={handleUpdateProductStock}
                  onUpdateProductPrice={handleUpdateProductPrice}
                  onDeleteProduct={handleDeleteProduct}
                  onImportCatalog={handleImportCatalog}
                  themeConfig={themeConfig}
                  onUpdateTheme={handleUpdateTheme}
                  onTryOnProduct={handleTryOnProduct}
                  user={currentUser}
                  onOpenAuthModal={handleOpenAuthModal}
                />
              }
            />

            {/* Dedicated Admin Portal Route */}
            <Route
              path="/admin"
              element={
                <StudioPage
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProductStock={handleUpdateProductStock}
                  onUpdateProductPrice={handleUpdateProductPrice}
                  onDeleteProduct={handleDeleteProduct}
                  onImportCatalog={handleImportCatalog}
                  themeConfig={themeConfig}
                  onUpdateTheme={handleUpdateTheme}
                  onTryOnProduct={handleTryOnProduct}
                  user={currentUser}
                  onOpenAuthModal={handleOpenAuthModal}
                />
              }
            />

            {/* Admin Aliases */}
            <Route path="/admin-panel" element={<Navigate to="/admin" replace />} />
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Order Consignment Tracking Pages */}
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/track/:orderId" element={<OrderTrackingPage />} />

            {/* Google OAuth 2.0 Direct Callback */}
            <Route
              path="/auth/google/callback"
              element={<GoogleAuthCallbackPage onAuthSuccess={handleAuthSuccess} />}
            />

            {/* Explicit 404 Route */}
            <Route path="/404" element={<NotFoundPage onOpenAuthModal={handleOpenAuthModal} />} />

            {/* Catch-all route renders 404 Page Not Found */}
            <Route path="*" element={<NotFoundPage onOpenAuthModal={handleOpenAuthModal} />} />
          </Routes></Suspense>
        </main>

        {/* Global Footer */}
        <Footer
          onOpenBrandGuide={() => setIsPaletteGuideOpen(true)}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          onOpenFabricModal={() => setIsFabricModalOpen(true)}
        />

        {/* Global Modals & Drawers */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          user={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          fitProfile={fitProfile}
          onSwitchItemSize={handleSwitchCartItemSize}
          onCheckout={() => {
            if (!currentUser) {
              setIsCartOpen(false);
              setIsGoogleAuthModalOpen(true);
              setToastNotification({
                title: "Sign In Required",
                message: "Please sign in or create an account to proceed to checkout."
              });
              return;
            }
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        <FitFinderModal
          isOpen={isFitProfileModalOpen}
          onClose={() => setIsFitProfileModalOpen(false)}
          product={selectedProductModal || products[0]}
          fitProfile={fitProfile}
          onSaveProfile={handleSaveFitProfile}
          onDeleteProfile={handleDeleteFitProfile}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        />

        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            user={currentUser}
            onConfirmOrder={handleConfirmOrder}
          />
        )}

        {isAutomatedOrderModalOpen && confirmedOrder && (
          <AutomatedOrderNoticeModal
            order={confirmedOrder}
            isOpen={isAutomatedOrderModalOpen}
            onClose={() => setIsAutomatedOrderModalOpen(false)}
          />
        )}

        {Boolean(confirmedOrder) && (
          <OrderConfirmationModal
            order={confirmedOrder}
            isOpen={Boolean(confirmedOrder)}
            onClose={() => setConfirmedOrder(null)}
          />
        )}

        {Boolean(selectedProductModal) && (
          <ProductModal
            product={selectedProductModal}
            isOpen={Boolean(selectedProductModal)}
            onClose={() => setSelectedProductModal(null)}
            onAddToCart={handleAddToCart}
            onTryOn={handleTryOnProduct}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={selectedProductModal ? wishlist.includes(selectedProductModal.id) : false}
            onOpenFitFinder={() => setIsFitProfileModalOpen(true)}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />
        )}

        <BrandPaletteGuide
          isOpen={isPaletteGuideOpen}
          onClose={() => setIsPaletteGuideOpen(false)}
        />

        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
        />

        <FabricTextureModal
          isOpen={isFabricModalOpen}
          onClose={() => setIsFabricModalOpen(false)}
        />

        {/* Optional customer sign-in */}
        <GoogleAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          pendingItem={authModalConfig.pendingItem}
          title={authModalConfig.title}
          subtitle={authModalConfig.subtitle}
        />

        {/* Luxury Floating Toast Notification */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-none">
            <div className="flex items-center space-x-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-2xl shadow-2xl border border-camel-400/50 max-w-sm pointer-events-auto">
              <div className="w-7 h-7 rounded-full bg-camel-500 text-onyx-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ✓
              </div>
              <div className="text-xs">
                <p className="font-bold tracking-tight">{toastNotification.title || "Notification"}</p>
                <p className="text-neutral-300 dark:text-neutral-600 mt-0.5 leading-snug">{toastNotification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Catalog Search & Back To Top */}
        <SearchOverlay
          products={products}
          onSelect={(p) => setSelectedProductModal(p)}
        />
        <BackToTop />

      </div>
      </CurrencyProvider>
    </BrowserRouter>
  );
}
