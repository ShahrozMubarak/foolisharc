import React, { useState, useEffect, useMemo, useRef } from 'react';
import BrandLogo from './BrandLogo';
import {
  fetchProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  fetchOrdersFromDB,
  updateOrderStatusInDB,
  approveOrderInDB,
  fetchSubscribersFromDB,
  deleteSubscriberFromDB,
  fetchCustomersFromDB,
  fetchInquiriesFromDB
} from '../services/api';
import { notifyOrderApproved, notifyOrderStatusChange } from '../services/notificationService';
import ChartJS from 'chart.js/auto';


/**
 * 5 Admin Dashboard Themes from the user-provided template suite.
 * Default is 01: Camel & Espresso Luxury (#FAF6F0, #1C1612, #9A6E3E, #C69F6F) to match Zaytoun.
 */
const ADMIN_THEMES = [
  {
    id: "camel-atelier",
    shortName: "Warm Camel & Sand Atelier",
    company: "FOOLISH ARC",
    welcome: "Welcome back, Shahroz",
    sub: "Live atelier overview, client orders & store management",
    bgOuter: "#E6DDD0",
    bgCanvas: "#FAF6F0",
    sidebar: "#1C1612",
    sidebarActive: "#332820",
    featuredCard: "#9A6E3E",
    featuredText: "#FFFFFF",
    cardBg: "#FFFFFF",
    textMain: "#1E1915",
    textMuted: "#7C6A58",
    accent: "#9A6E3E",
    accentSoft: "#F3ECE1",
    kpi1: { title: "Total Sales", sub: "418 Orders", val: "$28,450.00", delta: "+22.4%", week: "+3.8k this week" },
    kpi2: { title: "Visitors", sub: "Avg. time: 6:15m", val: "18,940", delta: "+19.1%", week: "+2.4k this week" },
    kpi3: { title: "Refunds", sub: "0 Disputed", val: "14", delta: "-34.0%", week: "-12" },
    earnings: [42, 48, 39, 51, 36, 49, 55, 58, 44, 38, 47, 53, 49, 60],
    costs:    [18, 22, 19, 21, 17, 20, 24, 25, 22, 19, 21, 23, 20, 24],
    donutVal: "$18.4k",
    cats: ["Luxury Outerwear", "Pleated Trousers", "Poplin Shirts"],
    catData: [50, 32, 18]
  }
];

export default function AdminDashboard({
  orders: propOrders = [],
  onUpdateOrderStatus,
  products: propProducts = [],
  onAddProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onDeleteProduct,
  themeConfig,
  onUpdateTheme,
  onCloseAdmin,
  user = null
}) {
  // Theme & Navigation State
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const activeTheme = ADMIN_THEMES[activeThemeIdx];
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'summary' | 'custom' | 'messages' | 'products' | 'orders' | 'customers' | 'settings'
  const [timeRange, setTimeRange] = useState('Last 14 Days');
  const [globalSearch, setGlobalSearch] = useState('');
  const [studioToast, setStudioToast] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Studio Site Settings State (Contact & Location)
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('foolisharc_site_settings') ||
        '{"location":"Gulberg III, Lahore","email":"concierge@foolisharc.com","phone":"+92 300 1234567","hours":"Mon - Sat: 10:00 AM - 8:00 PM PKT"}'
      );
    } catch {
      return {
        location: "Gulberg III, Lahore",
        email: "concierge@foolisharc.com",
        phone: "+92 300 1234567",
        hours: "Mon - Sat: 10:00 AM - 8:00 PM PKT"
      };
    }
  });
  const [siteSettingsSaved, setSiteSettingsSaved] = useState(false);

  const handleSaveSiteSettings = () => {
    localStorage.setItem('foolisharc_site_settings', JSON.stringify(siteSettings));
    window.dispatchEvent(new Event('storage'));
    setSiteSettingsSaved(true);
    showToast("Site address & contact settings saved and synced!");
    setTimeout(() => setSiteSettingsSaved(false), 3500);
  };

  // Live MongoDB States
  const [liveProducts, setLiveProducts] = useState(propProducts);
  const [liveOrders, setLiveOrders] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
      const map = new Map();
      (propOrders || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
      (stored || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
      return Array.from(map.values());
    } catch {
      return propOrders || [];
    }
  });
  const [subscribers, setSubscribers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Filter States
  const [productDepartmentFilter, setProductDepartmentFilter] = useState('all');
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [transcriptCopied, setTranscriptCopied] = useState(false);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImageTab, setProductImageTab] = useState('upload');
  const garmentFileInputRef = useRef(null);

  const [productForm, setProductForm] = useState({
    name: '',
    person: 'women',
    category: 'Outerwear',
    slot: 'outer',
    price: 15000,
    originalPrice: 18000,
    primaryColor: 'Camel',
    colorHex: '#C69F6F',
    imageUrl: '',
    description: '',
    stockXS: 5,
    stockS: 10,
    stockM: 12,
    stockL: 8,
    stockXL: 4
  });

  // Chart Canvas Refs
  const salesCanvasRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const salesChartRef = useRef(null);
  const donutChartRef = useRef(null);

  const showToast = (msg) => {
    setStudioToast(msg);
    setTimeout(() => setStudioToast(''), 3000);
  };

  // Sync initial and refresh from MongoDB Atlas
  const loadAllDataFromMongoDB = async () => {
    setLoading(true);
    try {
      const [dbProds, dbOrders, dbSubs, dbCusts, dbInqs] = await Promise.all([
        fetchProductsFromDB(),
        fetchOrdersFromDB(),
        fetchSubscribersFromDB(),
        fetchCustomersFromDB(),
        fetchInquiriesFromDB()
      ]);

      if (Array.isArray(dbProds) && dbProds.length > 0) setLiveProducts(dbProds);
      if (Array.isArray(dbOrders) && dbOrders.length > 0) {
        setLiveOrders(prev => {
          const map = new Map();
          (propOrders || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
          (prev || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
          dbOrders.forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
          return Array.from(map.values());
        });
      }
      if (Array.isArray(dbSubs)) setSubscribers(dbSubs);
      if (Array.isArray(dbCusts)) setCustomers(dbCusts);
      if (Array.isArray(dbInqs)) setInquiries(dbInqs);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Error refreshing MongoDB data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDataFromMongoDB();
  }, []);

  // Real-time synchronization when orders are placed on storefront
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
          setLiveOrders(prev => {
            const map = new Map();
            (prev || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
            stored.forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
            return Array.from(map.values());
          });
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) setLiveProducts(propProducts);
  }, [propProducts]);

  useEffect(() => {
    if (propOrders && propOrders.length > 0) {
      setLiveOrders(prev => {
        if (!prev || prev.length === 0) return propOrders;
        const prevMap = new Map();
        prev.forEach(o => {
          if (o) {
            const key = String(o._id || o.orderNumber || o.id).toLowerCase();
            prevMap.set(key, o);
          }
        });
        const merged = propOrders.map(po => {
          const key = String(po._id || po.orderNumber || po.id).toLowerCase();
          const existing = prevMap.get(key);
          return existing ? { ...po, ...existing } : po;
        });
        const mergedKeys = new Set(merged.map(o => String(o._id || o.orderNumber || o.id).toLowerCase()));
        const extras = prev.filter(o => o && !mergedKeys.has(String(o._id || o.orderNumber || o.id).toLowerCase()));
        return [...merged, ...extras];
      });
    }
  }, [propOrders]);

  // Proactively refresh orders whenever user switches to or views the Orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      try {
        const stored = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
          setLiveOrders(prev => {
            const map = new Map();
            (prev || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
            stored.forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
            return Array.from(map.values());
          });
        }
      } catch {}

      fetchOrdersFromDB().then(dbOrders => {
        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          setLiveOrders(prev => {
            const map = new Map();
            (prev || []).forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
            dbOrders.forEach(o => { if (o) map.set(String(o._id || o.orderNumber || o.id).toLowerCase(), o); });
            return Array.from(map.values());
          });
        }
      }).catch(() => {});
    }
  }, [activeTab]);

  // Total Gross Revenue Calculation
  const totalRevenue = useMemo(() => {
    return liveOrders.reduce((sum, ord) => sum + Number(ord.total || ord.pricing?.finalTotal || 0), 0);
  }, [liveOrders]);

  // Dual Line Chart (Sales Performance: Earnings vs Costs)
  useEffect(() => {
    if (!salesCanvasRef.current) return;
    const ctx = salesCanvasRef.current.getContext('2d');
    if (salesChartRef.current) {
      salesChartRef.current.destroy();
    }

    const days = ["03 Wed", "04 Thu", "05 Fri", "06 Sat", "07 Sun", "08 Mon", "09 Tue", "10 Wed", "11 Thu", "12 Fri", "13 Sat", "14 Sun", "15 Mon", "16 Tue"];

    // Adjust data based on timeRange
    const multiplier = timeRange === 'This Quarter' ? 2.2 : (timeRange === 'Last 30 Days' ? 1.5 : 1.0);
    const earningsData = activeTheme.earnings.map(v => Math.round(v * multiplier));
    const costsData = activeTheme.costs.map(v => Math.round(v * multiplier));

    salesChartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Earnings',
            data: earningsData,
            borderColor: activeTheme.accent,
            backgroundColor: 'transparent',
            borderWidth: 2.8,
            pointRadius: 0,
            pointHoverRadius: 6,
            tension: 0.42
          },
          {
            label: 'Costs',
            data: costsData,
            borderColor: '#D4D4D8',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.42
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1C1612',
            titleColor: '#FFFFFF',
            bodyColor: '#E6D3B3',
            padding: 10,
            cornerRadius: 12
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#A1A1AA', font: { size: 10 }, maxRotation: 0 }
          },
          y: {
            min: 0,
            ticks: { stepSize: 15 * multiplier, color: '#A1A1AA', font: { size: 10 } },
            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }
          }
        }
      }
    });

    return () => {
      if (salesChartRef.current) salesChartRef.current.destroy();
    };
  }, [activeThemeIdx, timeRange, activeTab]);

  // Donut Chart (Top Categories)
  useEffect(() => {
    if (!donutCanvasRef.current) return;
    const ctx = donutCanvasRef.current.getContext('2d');
    if (donutChartRef.current) {
      donutChartRef.current.destroy();
    }

    donutChartRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: activeTheme.cats,
        datasets: [{
          data: activeTheme.catData,
          backgroundColor: [activeTheme.accent, '#71717A', '#E4E4E7'],
          borderWidth: 0,
          cutout: '76%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateRotate: true, duration: 1100 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1C1612',
            titleColor: '#FFFFFF',
            bodyColor: '#E6D3B3',
            padding: 10,
            cornerRadius: 12
          }
        }
      }
    });

    return () => {
      if (donutChartRef.current) donutChartRef.current.destroy();
    };
  }, [activeThemeIdx, activeTab]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((p) => {
      const departmentMatch =
        productDepartmentFilter === 'all' ||
        (p.person || p.gender || '').toLowerCase() === productDepartmentFilter.toLowerCase();
      const q = globalSearch.trim().toLowerCase();
      const searchMatch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.primaryColor && p.primaryColor.toLowerCase().includes(q));
      return departmentMatch && searchMatch;
    });
  }, [liveProducts, productDepartmentFilter, globalSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return liveOrders.filter((order) => {
      const statusMatch =
        orderFilterStatus === 'all' ||
        (order.status || 'pending').toLowerCase() === orderFilterStatus.toLowerCase();
      const q = globalSearch.trim().toLowerCase();
      const searchMatch =
        !q ||
        (order.orderNumber && String(order.orderNumber).toLowerCase().includes(q)) ||
        (order.customer?.firstName && String(order.customer.firstName).toLowerCase().includes(q)) ||
        (order.customer?.lastName && String(order.customer.lastName).toLowerCase().includes(q)) ||
        (order.customer?.email && String(order.customer.email).toLowerCase().includes(q)) ||
        (order.customer?.phone && String(order.customer.phone).toLowerCase().includes(q)) ||
        (order.customer?.city && String(order.customer.city).toLowerCase().includes(q));
      return statusMatch && searchMatch;
    });
  }, [liveOrders, orderFilterStatus, globalSearch]);

  // Handle Order Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) {
      console.warn("handleStatusChange called without orderId");
      return;
    }
    const cleanId = String(orderId).toLowerCase().trim();
    const normalizedStatus = String(newStatus || 'pending').toLowerCase().trim();

    // 1. Immediately update local state in AdminDashboard
    setLiveOrders(prev =>
      prev.map(o => {
        if (!o) return o;
        const num = String(o.orderNumber || '').toLowerCase().trim();
        const id = String(o.id || '').toLowerCase().trim();
        const mongoId = String(o._id || '').toLowerCase().trim();
        if (num === cleanId || id === cleanId || mongoId === cleanId) {
          return { ...o, status: normalizedStatus };
        }
        return o;
      })
    );

    if (selectedOrderDetails) {
      const modalNum = String(selectedOrderDetails.orderNumber || '').toLowerCase().trim();
      const modalId = String(selectedOrderDetails.id || '').toLowerCase().trim();
      const modalMongoId = String(selectedOrderDetails._id || '').toLowerCase().trim();
      if (modalNum === cleanId || modalId === cleanId || modalMongoId === cleanId) {
        setSelectedOrderDetails(prev => (prev ? { ...prev, status: normalizedStatus } : null));
      }
    }

    // 2. Persist to MongoDB and local storage
    try {
      await updateOrderStatusInDB(orderId, normalizedStatus);
    } catch (e) {
      console.warn("updateOrderStatusInDB note:", e);
    }

    // 3. Notify parent component (App.jsx)
    if (typeof onUpdateOrderStatus === 'function') {
      try {
        onUpdateOrderStatus(orderId, normalizedStatus);
      } catch (err) {
        console.warn("onUpdateOrderStatus note:", err);
      }
    }

    // 4. Send background notification & toast
    try {
      notifyOrderStatusChange(orderId, normalizedStatus);
    } catch (notifErr) {
      console.warn("Notification error:", notifErr);
    }
    showToast(`Order status updated to ${normalizedStatus}`);
  };

  // Handle Order Approval & Transcript
  const handleApproveOrder = async (order) => {
    if (!order) return;
    const orderId = order._id || order.id || order.orderNumber;
    if (!orderId) {
      alert("Cannot approve order: missing order reference ID");
      return;
    }
    const cleanId = String(orderId).toLowerCase().trim();
    setApprovalLoading(true);
    try {
      const res = await approveOrderInDB(orderId);
      const trackingNumber = res?.trackingNumber || res?.order?.trackingNumber || `TCS-${Math.floor(10000000 + Math.random() * 90000000)}-PK`;
      const updatedOrder = {
        ...order,
        status: 'approved',
        courier: 'TCS Express',
        trackingNumber: trackingNumber,
        approvedAt: new Date().toISOString()
      };

      setLiveOrders(prev =>
        prev.map(o => {
          if (!o) return o;
          const num = String(o.orderNumber || '').toLowerCase().trim();
          const id = String(o.id || '').toLowerCase().trim();
          const mongoId = String(o._id || '').toLowerCase().trim();
          if (num === cleanId || id === cleanId || mongoId === cleanId) {
            return { ...o, ...updatedOrder };
          }
          return o;
        })
      );
      setSelectedOrderDetails(prev => (prev ? { ...prev, ...updatedOrder } : null));

      try {
        await updateOrderStatusInDB(orderId, 'approved', { trackingNumber, courier: 'TCS Express', approvedAt: new Date().toISOString() });
      } catch (e) {}

      if (typeof onUpdateOrderStatus === 'function') {
        try {
          onUpdateOrderStatus(orderId, 'approved');
        } catch {}
      }

      try {
        notifyOrderApproved(updatedOrder);
      } catch (notifErr) {
        console.warn("Notification error:", notifErr);
      }

      const cleanPhone = String(order.customer?.phone || '').replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0')
        ? '92' + cleanPhone.slice(1)
        : (cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone);

      const msg = `Assalam-o-Alaikum ${order.customer?.firstName || 'Valued Client'},\n\nYour FOOLISH ARC order #${order.orderNumber || order.id} has been verified and APPROVED.\n\nConsignment Tracking: ${trackingNumber}\nCourier: TCS Express\nLive Track: ${window.location.origin}/track/${order.orderNumber || order.id}\n\nThank you for choosing FOOLISH ARC.`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
      showToast("Order Approved! Opening WhatsApp dispatch message...");
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error("Error approving order:", err);
      alert("Error approving order: " + (err?.message || String(err)));
    } finally {
      setApprovalLoading(false);
    }
  };

  // Automated Transcript Text Generator
  const generateTranscriptText = (order) => {
    if (!order) return '';
    const dateStr = order.createdAt || new Date().toLocaleDateString();
    const itemsList = (order.items || []).map((it, idx) => 
      `  [${idx + 1}] ${it.name} | Size: ${it.size || 'M'} | Qty: ${it.quantity || 1} | Price: PKR ${(it.price || 0).toLocaleString()}`
    ).join('\n');

    return `=======================================================
FOOLISH ARC — VERIFIED ORDER TRANSCRIPT
=======================================================
Order Reference: #${order.orderNumber || order.id || 'N/A'}
Date & Time:    ${dateStr}
Status:         ${(order.status || 'pending').toLowerCase()}
Verification:   256-Bit SSL Atelier Certified

CUSTOMER DOSSIER:
Name:           ${order.customer?.firstName || ''} ${order.customer?.lastName || ''}
Email:          ${order.customer?.email || 'N/A'}
Contact Phone:  ${order.customer?.phone || 'N/A'}
Destination:    ${order.customer?.address || 'N/A'}, ${order.customer?.city || 'Pakistan'}

SETTLEMENT & PAYMENT:
Payment Method: ${String(order.paymentMethod || 'cod').toLowerCase()}
Total Amount:   PKR ${(order.total || order.pricing?.finalTotal || 0).toLocaleString()}
Courier Partner: ${order.courier || 'TCS Express'}
Consignment No: ${order.trackingNumber || 'Pending Dispatch Assignment'}

ITEMS MANIFEST:
${itemsList || '  Standard Couture Selection'}
=======================================================
FOOLISH ARC Atelier | contact@foolisharc.com
=======================================================`;
  };

  const handleCopyTranscript = (order) => {
    const text = generateTranscriptText(order);
    navigator.clipboard.writeText(text);
    setTranscriptCopied(true);
    showToast("Order transcript copied to clipboard!");
    setTimeout(() => setTranscriptCopied(false), 2500);
  };

  const handleDownloadTranscript = (order) => {
    const text = generateTranscriptText(order);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-transcript-${order.orderNumber || order.id || 'foolisharc'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded official order transcript!");
  };

  // Garment Upload / Edit Handlers
  const handleGarmentFileProcess = (file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("File exceeds 8MB limit. Please choose a smaller compressed image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setProductForm(prev => ({ ...prev, imageUrl: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductImageTab('upload');
    setProductForm({
      name: '',
      person: 'women',
      category: 'Outerwear',
      slot: 'outer',
      price: 15000,
      originalPrice: 18000,
      primaryColor: 'Camel',
      colorHex: '#C69F6F',
      imageUrl: '',
      description: 'Handcrafted luxury piece tailored in breathable Belgian linen and pure fibers.',
      stockXS: 5,
      stockS: 10,
      stockM: 12,
      stockL: 8,
      stockXL: 4
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id);
    const existingImg = prod.images?.[0] || prod.image || '';
    setProductImageTab(existingImg && existingImg.startsWith('http') ? 'url' : 'upload');
    setProductForm({
      name: prod.name || '',
      person: prod.person || prod.gender || 'women',
      category: prod.category || 'Apparel',
      slot: prod.slot || 'top',
      price: prod.price || 0,
      originalPrice: prod.originalPrice || prod.price || 0,
      primaryColor: prod.primaryColor || prod.colorName || 'Camel',
      colorHex: prod.color || '#C69F6F',
      imageUrl: existingImg,
      description: prod.description || '',
      stockXS: prod.stockPerSize?.XS ?? 5,
      stockS: prod.stockPerSize?.S ?? 10,
      stockM: prod.stockPerSize?.M ?? 12,
      stockL: prod.stockPerSize?.L ?? 8,
      stockXL: prod.stockPerSize?.XL ?? 4
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert("Please enter a garment title.");
      return;
    }

    const stockMap = {
      XS: Number(productForm.stockXS) || 0,
      S: Number(productForm.stockS) || 0,
      M: Number(productForm.stockM) || 0,
      L: Number(productForm.stockL) || 0,
      XL: Number(productForm.stockXL) || 0
    };
    const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
    const targetId = editingProductId || `forme-${Date.now().toString(36)}`;

    const productPayload = {
      id: targetId,
      name: productForm.name.trim(),
      slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      person: productForm.person,
      gender: productForm.person,
      category: productForm.category,
      slot: productForm.slot,
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice || productForm.price),
      primaryColor: productForm.primaryColor,
      color: productForm.colorHex,
      colorName: productForm.primaryColor,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      stock: totalStock,
      stockPerSize: stockMap,
      images: productForm.imageUrl ? [productForm.imageUrl] : [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
      ],
      description: productForm.description
    };

    setLiveProducts(prev => {
      const idx = prev.findIndex(p => p.id === targetId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...productPayload };
        return copy;
      }
      return [productPayload, ...prev];
    });

    if (onAddProduct) onAddProduct(productPayload);
    await saveProductToDB(productPayload);
    setIsProductModalOpen(false);
    showToast(`Garment "${productPayload.name}" saved to inventory!`);
  };

  const handleInlineStockChange = (prodId, size, delta) => {
    setLiveProducts(prev =>
      prev.map(p => {
        if (p.id !== prodId) return p;
        const currentStockMap = p.stockPerSize || { XS: 2, S: 5, M: 8, L: 4, XL: 2 };
        const newSizeStock = Math.max(0, (currentStockMap[size] || 0) + delta);
        const updatedMap = { ...currentStockMap, [size]: newSizeStock };
        const updatedTotal = Object.values(updatedMap).reduce((a, b) => a + b, 0);
        const updatedProd = { ...p, stockPerSize: updatedMap, stock: updatedTotal };
        if (onUpdateProductStock) onUpdateProductStock(prodId, size, newSizeStock);
        saveProductToDB(updatedProd);
        return updatedProd;
      })
    );
  };

  const handleDeleteProductConfirm = async (prodId) => {
    if (!window.confirm("Remove this garment from public catalog?")) return;
    setLiveProducts(prev => prev.filter(p => p.id !== prodId));
    if (onDeleteProduct) onDeleteProduct(prodId);
    await deleteProductFromDB(prodId);
    showToast("Garment removed from catalog.");
  };

  const adminName = user?.firstName || user?.name || "Shahroz";
  const userInitials = String(user?.name || "Shahroz Mubarak")
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || "SM";

  return (
    <div
      className="min-h-screen p-2 sm:p-5 lg:p-8 flex flex-col items-center justify-start transition-colors duration-500 font-sans"
      style={{ backgroundColor: activeTheme.bgOuter }}
    >
      {/* ===================================================================== */}
      {/* TOP CONTROLLER BAR (5 ADMIN STYLES SWITCHER + EXIT BUTTON)            */}
      {/* ===================================================================== */}
      <div className="w-full max-w-[1440px] mb-4 bg-[#111113] text-white border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE STUDIO</span>
          </div>
          <span className="hidden sm:inline text-xs text-neutral-400 font-medium">|</span>
          <span className="hidden sm:inline text-xs text-neutral-300 font-semibold">{activeTheme.shortName}</span>
        </div>

        {/* Center: Brand Badge */}
        <div className="flex items-center gap-2">
          <img src="/images/brand/foolish/arc_emblem.png" alt="Foolish Arc" className="h-5 w-auto object-contain" />
          <span className="text-xs font-black tracking-widest text-[#E6D3B3] uppercase">FOOLISH ARC ATELIER</span>
        </div>

        {/* Right: Refresh & Close Admin */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllDataFromMongoDB}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
            title="Refresh database records"
          >
            <span>↻</span>
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync Atlas'}</span>
          </button>
          <button
            type="button"
            onClick={onCloseAdmin}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#C69F6F] hover:bg-[#b08b5d] text-white transition shadow-sm"
          >
            Exit Studio
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* OUTER ROUNDED FRAME MATCHING THE MOQUPS E-COM SCREENSHOT               */}
      {/* ===================================================================== */}
      <div
        id="admin-frame-shell"
        className="w-full max-w-[1440px] rounded-[30px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[860px] border border-black/5 transition-colors duration-500 relative"
        style={{ backgroundColor: activeTheme.bgCanvas }}
      >
        {/* =================================================================== */}
        {/* MOBILE TOP BAR (Screens < lg) with Hamburger Navigation             */}
        {/* =================================================================== */}
        <div
          className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-black/10 shrink-0"
          style={{ backgroundColor: activeTheme.sidebar }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl border border-white/20 flex items-center justify-center p-1 bg-white/5 shrink-0">
              <img src="/images/brand/foolish/arc_emblem.png" alt="Foolish Arc" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">
                FOOLISH ARC
              </span>
              <span className="text-[10px] text-[#C69F6F] font-bold uppercase tracking-wider block">
                Studio • {activeTab.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-2 text-xs font-black transition border border-white/15"
              aria-label="Open Studio Navigation Menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>MENU</span>
              {liveOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#C69F6F] text-black text-[10px] font-black flex items-center justify-center">
                  {liveOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* MOBILE SLIDE-OVER NAVIGATION DRAWER                                 */}
        {/* =================================================================== */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in Menu Panel */}
            <div
              className="relative w-4/5 max-w-xs h-full p-6 flex flex-col justify-between text-white shadow-2xl z-10 overflow-y-auto animate-fadeIn"
              style={{ backgroundColor: activeTheme.sidebar }}
            >
              <div className="space-y-6">
                {/* Header & Close */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <img src="/images/brand/foolish/arc_emblem.png" alt="Emblem" className="w-7 h-7 object-contain" />
                    <span className="font-black text-sm tracking-tight">FOOLISH ARC</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                      activeTab === 'overview' ? 'bg-[#332820] text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>📊</span>
                      <span>Overview</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                      activeTab === 'orders' ? 'bg-[#332820] text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>📦</span>
                      <span className="font-black text-sm">Orders</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C69F6F] text-black text-xs font-black">
                      {liveOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length} pending
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                      activeTab === 'products' ? 'bg-[#332820] text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>🛍️</span>
                      <span>Products</span>
                    </span>
                    <span className="text-xs opacity-75">{liveProducts.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                      activeTab === 'customers' ? 'bg-[#332820] text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>👥</span>
                      <span>Customers</span>
                    </span>
                    <span className="text-xs opacity-75">{customers.length || liveOrders.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('messages'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                      activeTab === 'messages' ? 'bg-[#332820] text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>💬</span>
                      <span>Messages</span>
                    </span>
                    <span className="text-xs opacity-75">{inquiries.length || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                      activeTab === 'settings' ? 'bg-[#332820] text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>⚙️</span>
                      <span>Settings &amp; Contact</span>
                    </span>
                  </button>
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-white/10 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    loadAllDataFromMongoDB();
                    showToast("Refreshing database...");
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={loading}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-between transition border border-white/10"
                >
                  <span className="flex items-center gap-2.5">
                    <span className={loading ? "animate-spin" : ""}>↻</span>
                    <span>{loading ? "Refreshing..." : "Refresh Studio"}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sync Atlas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onCloseAdmin) onCloseAdmin();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#C69F6F] hover:bg-[#b08b5d] text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
                >
                  <span>✕</span>
                  <span>Exit Studio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* LEFT VERTICAL SIDEBAR (Desktop lg+)                                 */}
        {/* =================================================================== */}
        <aside
          className="hidden lg:flex lg:w-[260px] shrink-0 p-6 flex-col justify-between text-white transition-colors duration-500"
          style={{ backgroundColor: activeTheme.sidebar }}
        >
          <div className="space-y-7">
            {/* Brand Header */}
            <div className="flex items-center gap-3 px-2 pt-1 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center p-1 bg-white/5 shrink-0">
                <img src="/images/brand/foolish/arc_emblem.png" alt="Foolish Arc" className="h-full w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-[14px] tracking-tight text-white block truncate">
                  FOOLISH ARC
                </span>
                <span className="text-[10px] text-[#C69F6F] font-semibold tracking-wider uppercase block">
                  Studio • New York
                </span>
              </div>
            </div>

            {/* Sidebar Navigation Tree */}
            <nav className="space-y-1.5 text-[13px]">
              {/* Overview Group */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    activeTab === 'overview' || activeTab === 'summary'
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'overview' ? activeTheme.sidebarActive : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Overview</span>
                  </span>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="mt-1 space-y-1 pl-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'overview'
                        ? 'text-white bg-white/10'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 opacity-85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h7" />
                    </svg>
                    <span>Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'custom'
                        ? 'text-white bg-white/10'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Custom view</span>
                  </button>
                </div>
              </div>

              {/* Messages / Inquiries */}
              <div className="pt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    activeTab === 'messages'
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'messages' ? activeTheme.sidebarActive : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Messages</span>
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[11px] flex items-center justify-center font-bold">
                    {inquiries.length || 2}
                  </span>
                </button>

                {/* Products */}
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    activeTab === 'products'
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'products' ? activeTheme.sidebarActive : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Products</span>
                  </span>
                  <span className="text-[11px] opacity-75 font-semibold">
                    {liveProducts.length}
                  </span>
                </button>

                {/* Orders */}
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    activeTab === 'orders'
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'orders' ? activeTheme.sidebarActive : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Orders</span>
                  </span>
                  <span className="w-5 h-5 rounded-full bg-[#C69F6F] text-white text-[10px] flex items-center justify-center font-bold">
                    {liveOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length}
                  </span>
                </button>

                {/* Customers */}
                <button
                  type="button"
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    activeTab === 'customers'
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'customers' ? activeTheme.sidebarActive : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Customers</span>
                  </span>
                  <span className="text-[11px] opacity-75 font-semibold">
                    {customers.length || liveOrders.length}
                  </span>
                </button>
              </div>
            </nav>

            {/* Fixed Atelier Brand Signature */}
            <div className="pt-4 border-t border-white/10 px-2 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#C69F6F] block font-bold">
                Atelier Signature
              </span>
              <p className="text-[11px] text-neutral-400 font-medium">
                Warm Camel &amp; Sand Luxury Palette
              </p>
            </div>
          </div>

          {/* Bottom Settings Link & Studio Controls */}
          <div className="pt-5 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-[13px] font-bold ${
                activeTab === 'settings' ? 'text-white bg-white/15' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loadAllDataFromMongoDB();
                showToast("Refreshing database records...");
              }}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
              title="Refresh database records"
            >
              <span className="flex items-center gap-2">
                <span className={loading ? "animate-spin" : ""}>↻</span>
                <span>{loading ? "Syncing..." : "Refresh Studio"}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Sync</span>
            </button>

            <button
              type="button"
              onClick={onCloseAdmin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#C69F6F] hover:bg-[#b08b5d] text-stone-950 font-black text-xs uppercase tracking-wider transition shadow-sm"
            >
              <span>✕</span>
              <span>Exit Studio</span>
            </button>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* MAIN WORKSPACE                                                      */}
        {/* =================================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 overflow-y-auto max-h-none lg:max-h-[860px]">
          {/* TOP HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-[28px] font-black tracking-tight"
                style={{ color: activeTheme.textMain }}
              >
                {activeTheme.welcome.includes('Matthew') ? `Welcome back, ${adminName}` : activeTheme.welcome}
              </h1>
              <p
                className="text-xs sm:text-[13px] font-medium mt-1"
                style={{ color: activeTheme.textMuted }}
              >
                {activeTheme.sub}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              {/* Search Pill */}
              <div className="relative flex items-center bg-[#E6E7EB] dark:bg-black/10 rounded-full px-4 py-2 w-48 sm:w-64 border border-black/5 shadow-inner">
                <svg className="w-4 h-4 text-neutral-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search orders, garments..."
                  className="bg-transparent text-xs text-neutral-800 placeholder-neutral-500 focus:outline-none w-full font-medium"
                />
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => showToast(`${liveOrders.filter(o => o.status === 'pending').length} pending orders waiting verification`)}
                className="relative p-2.5 rounded-full hover:bg-black/5 transition"
                title="Notifications"
              >
                <svg className="w-5 h-5" style={{ color: activeTheme.textMain }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#9A6E3E] text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {liveOrders.filter(o => o.status === 'pending').length || 4}
                </span>
              </button>

              {/* Profile Pill */}
              <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-white border border-black/5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9A6E3E] to-[#C69F6F] text-white font-black text-xs flex items-center justify-center shadow-inner">
                  {userInitials}
                </div>
                <span className="text-xs font-bold" style={{ color: activeTheme.textMain }}>
                  {adminName}
                </span>
              </div>
            </div>
          </header>

          {/* ================================================================= */}
          {/* TAB: OVERVIEW & SUMMARY (DEFAULT KPI CARDS + 2 ANALYTICS CHARTS)  */}
          {/* ================================================================= */}
          {(activeTab === 'overview' || activeTab === 'summary') && (
            <div className="space-y-8">
              {/* ROW 1: THE 3 KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Card 1: Featured Card */}
                <div
                  className="rounded-[26px] p-6 flex flex-col justify-between min-h-[195px] shadow-xl transition-all hover:-translate-y-1 duration-300"
                  style={{
                    backgroundColor: activeTheme.featuredCard,
                    color: activeTheme.featuredText
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold tracking-tight">Total Sales</div>
                        <div className="text-[11px] opacity-75 font-semibold">
                          {liveOrders.length > 0 ? `${liveOrders.length} Orders` : activeTheme.kpi1.sub}
                        </div>
                      </div>
                    </div>
                    <span className="opacity-60 text-sm font-bold">›</span>
                  </div>

                  <div className="text-3xl sm:text-[34px] font-black tracking-tight my-3">
                    {totalRevenue > 0
                      ? `PKR ${totalRevenue.toLocaleString()}`
                      : activeTheme.kpi1.val}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 font-bold">
                    <span className="flex items-center gap-1">
                      <span>↗</span>
                      <span>{activeTheme.kpi1.delta}</span>
                    </span>
                    <span className="opacity-75">{activeTheme.kpi1.week}</span>
                  </div>
                </div>

                {/* KPI Card 2: White Card */}
                <div
                  className="rounded-[26px] p-6 flex flex-col justify-between min-h-[195px] shadow-sm border border-black/5 transition-all hover:-translate-y-1 duration-300"
                  style={{
                    backgroundColor: activeTheme.cardBg,
                    color: activeTheme.textMain
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: activeTheme.accentSoft }}
                      >
                        <svg className="w-5 h-5" style={{ color: activeTheme.accent }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold tracking-tight">Visitors</div>
                        <div className="text-[11px] font-semibold" style={{ color: activeTheme.textMuted }}>
                          {activeTheme.kpi2.sub}
                        </div>
                      </div>
                    </div>
                    <span className="opacity-50 text-sm font-bold">›</span>
                  </div>

                  <div className="text-3xl sm:text-[34px] font-black tracking-tight my-3">
                    {activeTheme.kpi2.val}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 font-bold">
                    <span className="flex items-center gap-1" style={{ color: activeTheme.accent }}>
                      <span>↗</span>
                      <span>{activeTheme.kpi2.delta}</span>
                    </span>
                    <span style={{ color: activeTheme.textMuted }}>{activeTheme.kpi2.week}</span>
                  </div>
                </div>

                {/* KPI Card 3: White Card */}
                <div
                  className="rounded-[26px] p-6 flex flex-col justify-between min-h-[195px] shadow-sm border border-black/5 transition-all hover:-translate-y-1 duration-300"
                  style={{
                    backgroundColor: activeTheme.cardBg,
                    color: activeTheme.textMain
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: activeTheme.accentSoft }}
                      >
                        <svg className="w-5 h-5" style={{ color: activeTheme.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold tracking-tight">Refunds</div>
                        <div className="text-[11px] font-semibold" style={{ color: activeTheme.textMuted }}>
                          {activeTheme.kpi3.sub}
                        </div>
                      </div>
                    </div>
                    <span className="opacity-50 text-sm font-bold">›</span>
                  </div>

                  <div className="text-3xl sm:text-[34px] font-black tracking-tight my-3">
                    {activeTheme.kpi3.val}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 font-bold">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span>↘</span>
                      <span>{activeTheme.kpi3.delta}</span>
                    </span>
                    <span style={{ color: activeTheme.textMuted }}>{activeTheme.kpi3.week}</span>
                  </div>
                </div>
              </div>

              {/* ROW 2: SALES PERFORMANCE LINE CHART + TOP CATEGORIES DONUT CHART */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card: Sales Performance (Cols 1-8) */}
                <div
                  className="lg:col-span-8 rounded-[26px] p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between transition-colors duration-500"
                  style={{ backgroundColor: activeTheme.cardBg, color: activeTheme.textMain }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <h2 className="text-base font-black tracking-tight">Sales Performance</h2>
                    <div className="flex items-center gap-2.5 text-xs">
                      <button
                        type="button"
                        onClick={() => showToast("Exporting store report...")}
                        className="px-3.5 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-neutral-200 text-neutral-800 font-bold flex items-center gap-1.5 transition"
                      >
                        <span>Export data</span>
                        <span className="text-[10px]">▼</span>
                      </button>
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3.5 py-1.5 rounded-full bg-[#F4F5F7] text-neutral-800 font-bold focus:outline-none cursor-pointer border-none"
                      >
                        <option>Last 14 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                      </select>
                    </div>
                  </div>

                  {/* Legend Row */}
                  <div className="flex items-center gap-6 text-xs mb-4" style={{ color: activeTheme.textMuted }}>
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: activeTheme.accent }}></span>
                      <span>Earnings</span>
                    </span>
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#D4D4D8] inline-block"></span>
                      <span>Costs</span>
                    </span>
                  </div>

                  {/* Dual Wave Line Canvas */}
                  <div className="relative h-64 w-full">
                    <canvas ref={salesCanvasRef}></canvas>
                  </div>
                </div>

                {/* Right Card: Top Categories Donut Chart (Cols 9-12) */}
                <div
                  className="lg:col-span-4 rounded-[26px] p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between transition-colors duration-500"
                  style={{ backgroundColor: activeTheme.cardBg, color: activeTheme.textMain }}
                >
                  <h2 className="text-base font-black tracking-tight mb-2">Top Categories</h2>

                  <div className="relative h-52 w-full flex items-center justify-center my-2">
                    <canvas ref={donutCanvasRef}></canvas>
                    {/* Centered Total Value Inside Ring */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xl font-black tracking-tight" style={{ color: activeTheme.textMain }}>
                        {activeTheme.donutVal}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Categories Legend */}
                  <div className="space-y-2.5 pt-3 border-t border-black/5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5 font-bold">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: activeTheme.accent }}></span>
                        <span>{activeTheme.cats[0]}</span>
                      </span>
                      <span className="font-extrabold">$3,420</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5 font-bold">
                        <span className="w-3 h-3 rounded-sm bg-[#71717A] inline-block"></span>
                        <span>{activeTheme.cats[1]}</span>
                      </span>
                      <span className="font-extrabold">$1,840</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5 font-bold">
                        <span className="w-3 h-3 rounded-sm bg-[#E4E4E7] inline-block"></span>
                        <span>{activeTheme.cats[2]}</span>
                      </span>
                      <span className="font-extrabold">$940</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 3: RECENT STORE TRANSACTIONS QUICK MANIFEST */}
              <div
                className="rounded-[26px] p-6 sm:p-7 shadow-sm border border-black/5 transition-colors duration-500 space-y-4"
                style={{ backgroundColor: activeTheme.cardBg, color: activeTheme.textMain }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black tracking-tight">Recent Client Orders</h3>
                    <p className="text-xs font-semibold" style={{ color: activeTheme.textMuted }}>
                      Live feed of incoming orders across Pakistan and international dispatch.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-black/10 hover:bg-black/5 transition"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-black/5 text-[11px] uppercase tracking-wider text-neutral-400">
                        <th className="py-2.5 px-3">Order Ref</th>
                        <th className="py-2.5 px-3">Client</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-bold">
                      {liveOrders.slice(0, 5).map((ord) => {
                        const status = (ord.status || 'pending').toLowerCase();
                        return (
                          <tr key={ord._id || ord.id || ord.orderNumber} className="hover:bg-black/[0.02] transition">
                            <td className="py-3 px-3 font-mono text-[#9A6E3E]">
                              #{ord.orderNumber || ord.id}
                            </td>
                            <td className="py-3 px-3">
                              {ord.customer?.firstName} {ord.customer?.lastName}
                            </td>
                            <td className="py-3 px-3 text-neutral-500">
                              {ord.customer?.city || 'Pakistan'}
                            </td>
                            <td className="py-3 px-3 uppercase text-[10px]">
                              {ord.paymentMethod || 'COD'}
                            </td>
                            <td className="py-3 px-3 font-extrabold">
                              PKR {(ord.total || ord.pricing?.finalTotal || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black lowercase ${
                                status === 'approved' || status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE9DF] text-[#9A6E3E] font-bold text-xs transition"
                              >
                                Review Dossier
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: PRODUCTS (CATALOG MANAGEMENT & INLINE STOCK EDITORS)          */}
          {/* ================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: activeTheme.textMain }}>
                    Garment Catalog & Inventory
                  </h2>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: activeTheme.textMuted }}>
                    {filteredProducts.length} Atelier garments active in live storefront.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={productDepartmentFilter}
                    onChange={(e) => setProductDepartmentFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-neutral-800 shadow-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Departments</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenCreateProduct}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all active:scale-95 flex items-center gap-2"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    <span>+</span>
                    <span>Add New Garment</span>
                  </button>
                </div>
              </div>

              {/* Products Table Card */}
              <div
                className="rounded-[26px] p-6 shadow-sm border border-black/5 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: activeTheme.cardBg }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/5 text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                        <th className="py-3 px-3">Garment</th>
                        <th className="py-3 px-3">Dept</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3">Stock Per Size (XS / S / M / L / XL)</th>
                        <th className="py-3 px-3">Total</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-semibold">
                      {filteredProducts.map((prod) => {
                        const stockMap = prod.stockPerSize || { XS: 3, S: 6, M: 8, L: 4, XL: 2 };
                        const img = prod.images?.[0] || prod.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80";

                        return (
                          <tr key={prod.id} className="hover:bg-black/[0.02] transition">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img}
                                  alt={prod.name}
                                  className="w-11 h-14 rounded-lg object-cover border border-black/10 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-neutral-900">{prod.name}</div>
                                  <div className="text-[10px] text-neutral-400 font-mono">#{prod.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 uppercase text-[11px] font-bold text-neutral-600">
                              {prod.person || prod.gender || 'unisex'}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-neutral-900">
                              PKR {(prod.price || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
                                  <div
                                    key={sz}
                                    className="flex items-center gap-1 bg-[#FAF6F0] px-2 py-1 rounded-md border border-[#E8E0D5]"
                                  >
                                    <span className="text-[10px] font-bold text-[#8C6A3E]">{sz}:</span>
                                    <span className="font-black text-xs text-neutral-900">{stockMap[sz] || 0}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleInlineStockChange(prod.id, sz, 1)}
                                      className="w-4 h-4 rounded bg-white hover:bg-neutral-200 text-neutral-800 flex items-center justify-center text-[10px] font-bold shadow-2xs cursor-pointer"
                                      title={`Increase ${sz} stock`}
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInlineStockChange(prod.id, sz, -1)}
                                      className="w-4 h-4 rounded bg-white hover:bg-neutral-200 text-neutral-800 flex items-center justify-center text-[10px] font-bold shadow-2xs cursor-pointer"
                                      title={`Decrease ${sz} stock`}
                                    >
                                      -
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-black text-neutral-900">
                              {prod.stock || Object.values(stockMap).reduce((a, b) => a + b, 0)}
                            </td>
                            <td className="py-3 px-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(prod)}
                                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 font-bold text-neutral-700 text-xs transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProductConfirm(prod.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-bold text-red-600 text-xs transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: ORDERS (LIVE ORDER DISPATCH & TRANSCRIPT RECEIPT)             */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: activeTheme.textMain }}>
                    Order Dispatch & Customer Manifest
                  </h2>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: activeTheme.textMuted }}>
                    {filteredOrders.length} orders in queue. Automatic receipt transcripts generated on approval.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={orderFilterStatus}
                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-neutral-800 shadow-sm focus:outline-none cursor-pointer lowercase"
                  >
                    <option value="all">all statuses</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div
                className="rounded-[26px] p-6 shadow-sm border border-black/5 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: activeTheme.cardBg }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/5 text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                        <th className="py-3 px-3">Order Number</th>
                        <th className="py-3 px-3">Client & Contact</th>
                        <th className="py-3 px-3">Items Manifest</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Total Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-semibold">
                      {filteredOrders.map((ord) => {
                        const status = (ord.status || 'pending').toLowerCase();
                        return (
                          <tr key={ord._id || ord.id || ord.orderNumber} className="hover:bg-black/[0.02] transition">
                            <td className="py-3.5 px-3">
                              <span className="font-mono text-[#9A6E3E] font-bold block">
                                #{ord.orderNumber || ord.id}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {ord.createdAt || 'Recent'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-neutral-900">
                                {ord.customer?.name || `${ord.customer?.firstName || ''} ${ord.customer?.lastName || ''}`.trim() || ord.customer?.email || 'Valued Client'}
                              </div>
                              <div className="text-[11px] text-neutral-500 font-normal">
                                {ord.customer?.city || 'Pakistan'} | {ord.customer?.phone || ord.customer?.email || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-neutral-800">
                                {(ord.items || []).length} Garment(s)
                              </span>
                              <span className="text-[10px] text-neutral-500 block truncate max-w-[160px]">
                                {(ord.items || []).map(i => i.name).join(', ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="uppercase text-[11px] font-bold text-neutral-800">
                                  {ord.paymentMethod || 'COD'}
                                </span>
                                {ord.paymentReceipt && (
                                  <button
                                    type="button"
                                    onClick={() => setEnlargedReceipt(ord.paymentReceipt)}
                                    className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black hover:bg-emerald-200"
                                    title="View attached payment proof screenshot"
                                  >
                                    Proof 📎
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-extrabold text-neutral-900">
                              PKR {(ord.total || ord.pricing?.finalTotal || 0).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3">
                              <select
                                value={status}
                                onChange={(e) => handleStatusChange(ord._id || ord.id || ord.orderNumber, e.target.value)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black lowercase tracking-wider focus:outline-none cursor-pointer border-none shadow-2xs ${
                                  status === 'approved' || status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-neutral-100 text-neutral-800'
                                }`}
                              >
                                <option value="pending">pending</option>
                                <option value="approved">approved</option>
                                <option value="processing">processing</option>
                                <option value="shipped">shipped</option>
                                <option value="delivered">delivered</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-2">
                              {status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveOrder(ord)}
                                  disabled={approvalLoading}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                                >
                                  Approve &amp; Dispatch
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="px-3 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE9DF] text-[#9A6E3E] font-bold text-xs transition border border-[#E8E0D5]"
                              >
                                Dossier &amp; Transcript
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: MESSAGES / INQUIRIES                                         */}
          {/* ================================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight" style={{ color: activeTheme.textMain }}>
                  Client Concierge &amp; Inquiries
                </h2>
                <p className="text-xs font-semibold mt-0.5" style={{ color: activeTheme.textMuted }}>
                  Customer messages received via the Contact &amp; Concierge form.
                </p>
              </div>

              <div
                className="rounded-[26px] p-6 shadow-sm border border-black/5 divide-y divide-black/5 transition-colors duration-500"
                style={{ backgroundColor: activeTheme.cardBg }}
              >
                {inquiries.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400 font-medium">
                    No pending inquiries. All client requests have been resolved.
                  </div>
                ) : (
                  inquiries.map((inq, idx) => (
                    <div key={inq._id || idx} className="py-4 space-y-2 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm">{inq.name || 'Anonymous Client'}</span>
                          <span className="text-neutral-400 text-xs">({inq.email})</span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#9A6E3E]">{inq.subject || 'Garment Inquiry'}</div>
                      <p className="text-xs text-neutral-700 leading-relaxed bg-[#FAF6F0] p-3 rounded-xl border border-[#E8E0D5]">
                        "{inq.message}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: CUSTOMERS                                                    */}
          {/* ================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight" style={{ color: activeTheme.textMain }}>
                  Client Registry &amp; Dossiers
                </h2>
                <p className="text-xs font-semibold mt-0.5" style={{ color: activeTheme.textMuted }}>
                  Google-verified couture patrons and registered store clients.
                </p>
              </div>

              <div
                className="rounded-[26px] p-6 shadow-sm border border-black/5 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: activeTheme.cardBg }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/5 text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                        <th className="py-3 px-3">Client</th>
                        <th className="py-3 px-3">Email Address</th>
                        <th className="py-3 px-3">Contact</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-semibold">
                      {liveOrders.map((ord, idx) => (
                        <tr key={idx} className="hover:bg-black/[0.02] transition">
                          <td className="py-3 px-3 font-bold text-neutral-900">
                            {ord.customer?.firstName} {ord.customer?.lastName}
                          </td>
                          <td className="py-3 px-3 text-neutral-600 font-mono">
                            {ord.customer?.email || 'client@foolisharc.com'}
                          </td>
                          <td className="py-3 px-3 text-neutral-800">
                            {ord.customer?.phone || 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-neutral-600">
                            {ord.customer?.city || 'Pakistan'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              Verified Patron
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: SETTINGS & BRAND PALETTE                                      */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: activeTheme.textMain }}>
                  Atelier &amp; Storefront Settings
                </h2>
                <p className="text-xs sm:text-[13px] font-semibold mt-1" style={{ color: activeTheme.textMuted }}>
                  Manage physical studio location, public contact info, customer hotline, and brand palette.
                </p>
              </div>

              {/* 1. Storefront Contact & Address Details */}
              <div
                className="rounded-[26px] p-6 sm:p-8 shadow-sm border border-black/5 space-y-6 transition-colors duration-500"
                style={{ backgroundColor: activeTheme.cardBg }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                  <div>
                    <h3 className="text-base font-black text-neutral-900 tracking-tight">
                      📍 Atelier Location &amp; Contact Details
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                      These values appear live in the site footer, invoices, customer assistance, and WhatsApp concierge.
                    </p>
                  </div>
                  {siteSettingsSaved && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl animate-fadeIn">
                      ✓ Saved &amp; Live
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                      Studio Address / Location
                    </label>
                    <input
                      type="text"
                      value={siteSettings.location || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                      placeholder="e.g. Gulberg III, Lahore, Pakistan"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E] transition"
                    />
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                      Rendered on footer address line &amp; package packing slips
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                      Public Concierge Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.email || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      placeholder="e.g. concierge@foolisharc.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E] transition"
                    />
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                      Client inquiry receiver &amp; order confirmation sender
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                      Phone &amp; WhatsApp Concierge
                    </label>
                    <input
                      type="text"
                      value={siteSettings.phone || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E] transition"
                    />
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                      Powers direct WhatsApp click-to-chat in footer and checkout
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                      Concierge Operating Hours
                    </label>
                    <input
                      type="text"
                      value={siteSettings.hours || 'Mon - Sat: 10:00 AM - 8:00 PM PKT'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hours: e.target.value })}
                      placeholder="e.g. Mon - Sat: 10:00 AM - 8:00 PM PKT"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E] transition"
                    />
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                      Display hours for customer inquiries and phone support
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">
                    Changes broadcast immediately to footer and customer views
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveSiteSettings}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    Save Contact Info
                  </button>
                </div>
              </div>

              {/* 2. Brand Identity & Palette */}
              <div
                className="rounded-[26px] p-6 sm:p-8 shadow-sm border border-black/5 space-y-6 transition-colors duration-500"
                style={{ backgroundColor: activeTheme.cardBg }}
              >
                <div className="pb-4 border-b border-black/5">
                  <h3 className="text-base font-black text-neutral-900 tracking-tight">
                    🎨 Brand Monogram &amp; Palette
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    Signature luxury palette codes across slow fashion catalog.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                    Brand Atelier Name
                  </label>
                  <input
                    type="text"
                    defaultValue="FOOLISH ARC"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                      Primary Camel Hex
                    </label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        defaultValue="#C69F6F"
                        className="w-10 h-10 rounded-lg cursor-pointer border border-black/10"
                      />
                      <span className="font-mono text-xs font-bold text-neutral-700">#C69F6F</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                      Accent Sand Hex
                    </label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        defaultValue="#E6D3B3"
                        className="w-10 h-10 rounded-lg cursor-pointer border border-black/10"
                      />
                      <span className="font-mono text-xs font-bold text-neutral-700">#E6D3B3</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">
                    MongoDB Atlas Cluster: Connected &amp; Synced
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast("Brand settings saved!")}
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-sm transition"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: ADD / EDIT GARMENT                                             */}
      {/* ===================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-neutral-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-black/10 my-8">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-black tracking-tight text-neutral-900">
              {editingProductId ? 'Edit Garment Manifest' : 'Add New Couture Garment'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Updates will synchronize across live MongoDB Atlas catalog and storefront.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Garment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E]"
                    placeholder="e.g. Belgian Linen Trench"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Department *
                  </label>
                  <select
                    value={productForm.person}
                    onChange={(e) => setProductForm(p => ({ ...p, person: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none cursor-pointer"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#9A6E3E]"
                    placeholder="Outerwear, Trousers..."
                  />
                </div>
              </div>

              {/* Stock Per Size Inputs */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-2">
                  Inventory Stock Per Size
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
                    <div key={sz} className="p-2 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-center">
                      <span className="block text-[10px] font-bold text-[#8C6A3E]">{sz}</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm[`stock${sz}`]}
                        onChange={(e) => setProductForm(p => ({ ...p, [`stock${sz}`]: e.target.value }))}
                        className="w-full bg-white text-center text-xs font-black rounded-lg py-1 mt-1 border border-black/10 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                  Garment Photography (PNG/JPG/WEBP)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setProductImageTab('upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      productImageTab === 'upload' ? 'bg-[#9A6E3E] text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductImageTab('url')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      productImageTab === 'url' ? 'bg-[#9A6E3E] text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Web URL
                  </button>
                </div>

                {productImageTab === 'upload' ? (
                  <div
                    onClick={() => garmentFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E8E0D5] hover:border-[#9A6E3E] rounded-2xl p-6 text-center cursor-pointer bg-[#FAF6F0] transition"
                  >
                    <input
                      ref={garmentFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGarmentFileProcess(e.target.files?.[0])}
                    />
                    <span className="text-xs font-bold text-neutral-700 block">
                      Click to upload high-res atelier garment photo
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      Max file size: 8MB
                    </span>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs font-bold text-neutral-900 focus:outline-none"
                  />
                )}

                {productForm.imageUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={productForm.imageUrl}
                      alt="Preview"
                      className="w-14 h-16 rounded-xl object-cover border border-black/10"
                    />
                    <span className="text-xs font-bold text-emerald-700">✓ Image loaded ready for catalog</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition"
                  style={{ backgroundColor: activeTheme.accent }}
                >
                  Save to Catalog →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ORDER DOSSIER & VERIFIED TRANSCRIPT RECEIPT                     */}
      {/* ===================================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-neutral-900 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-black/10 my-8 space-y-6">
            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            {/* Dossier Header */}
            <div className="border-b border-black/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-[#9A6E3E] uppercase">
                  OFFICIAL ORDER DOSSIER
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black lowercase">
                  {(selectedOrderDetails.status || 'pending').toLowerCase()}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-neutral-900 mt-1">
                Order #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}
              </h3>
              <p className="text-xs text-neutral-500">
                Created: {selectedOrderDetails.createdAt || 'Recent'} | Courier: {selectedOrderDetails.courier || 'TCS Express'}
              </p>
            </div>

            {/* Customer & Shipping Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8E0D5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8C6A3E] block tracking-wider">
                  Customer Information
                </span>
                <div className="font-bold text-neutral-900 text-sm">
                  {selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}
                </div>
                <div className="text-neutral-600 font-mono">{selectedOrderDetails.customer?.email}</div>
                <div className="text-neutral-700 font-bold">{selectedOrderDetails.customer?.phone}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8E0D5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8C6A3E] block tracking-wider">
                  Delivery Destination
                </span>
                <div className="font-bold text-neutral-900">
                  {selectedOrderDetails.customer?.city || 'Pakistan'}, {selectedOrderDetails.customer?.province || 'Punjab'}
                </div>
                <div className="text-neutral-600 leading-snug">
                  {selectedOrderDetails.customer?.address || 'Standard Address'}
                </div>
                <div className="text-[11px] text-neutral-500 font-bold">
                  Payment: {String(selectedOrderDetails.paymentMethod || 'cod').toLowerCase()}
                </div>
              </div>
            </div>

            {/* Cancellation Notice if Cancelled */}
            {selectedOrderDetails.status === 'cancelled' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1">
                <span className="font-bold text-red-800 uppercase tracking-wider block">
                  Consignment Cancelled
                </span>
                <p className="text-red-700">
                  Reason: <strong>{selectedOrderDetails.cancelReason || 'Client request'}</strong>
                </p>
                {selectedOrderDetails.cancelNote && (
                  <p className="italic text-neutral-600 font-mono text-[11px]">
                    "{selectedOrderDetails.cancelNote}"
                  </p>
                )}
                {selectedOrderDetails.cancelledAt && (
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Cancelled: {new Date(selectedOrderDetails.cancelledAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Client Review if Delivered & Reviewed */}
            {selectedOrderDetails.review && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 uppercase tracking-wider">
                    Verified Client Review
                  </span>
                  <span className="text-amber-500 font-bold text-sm">
                    {'★'.repeat(selectedOrderDetails.review.rating || 5)}
                  </span>
                </div>
                {selectedOrderDetails.review.fitRating && (
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                    Fit: {selectedOrderDetails.review.fitRating}
                  </span>
                )}
                {selectedOrderDetails.review.comment && (
                  <p className="italic text-neutral-700 leading-relaxed pt-1">
                    "{selectedOrderDetails.review.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Items Manifest */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Garments Ordered
              </span>
              <div className="border border-black/10 rounded-2xl divide-y divide-black/5 overflow-hidden">
                {(selectedOrderDetails.items || []).map((item, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs font-semibold bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] flex items-center justify-center font-bold text-[#8C6A3E]">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900">{item.name}</div>
                        <div className="text-[10px] text-neutral-500">
                          Size: {item.size || 'M'} | Qty: {item.quantity || 1}
                        </div>
                      </div>
                    </div>
                    <div className="font-black text-neutral-900">
                      PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Automated Official Transcript
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = generateTranscriptText(selectedOrderDetails);
                      if (navigator.share) {
                        navigator.share({
                          title: `FOOLISH ARC Order #${selectedOrderDetails.orderNumber || selectedOrderDetails.id}`,
                          text: text
                        }).catch(() => {});
                      } else {
                        handleCopyTranscript(selectedOrderDetails);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition"
                  >
                    🔗 Share
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyTranscript(selectedOrderDetails)}
                    className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition"
                  >
                    {transcriptCopied ? '✓ Copied' : '📋 Copy Text'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTranscript(selectedOrderDetails)}
                    className="px-3 py-1 rounded-lg bg-[#9A6E3E] text-white text-xs font-bold transition shadow-xs"
                  >
                    ⬇ Download .txt
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-2xl bg-[#1C1612] text-[#E6D3B3] font-mono text-xs overflow-x-auto leading-relaxed max-h-48 border border-black/10">
                {generateTranscriptText(selectedOrderDetails)}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/10">
              <div className="text-base font-black text-neutral-900">
                Total: PKR {(selectedOrderDetails.total || selectedOrderDetails.pricing?.finalTotal || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                  <span className="lowercase">status:</span>
                  <select
                    value={(selectedOrderDetails.status || 'pending').toLowerCase()}
                    onChange={(e) => handleStatusChange(selectedOrderDetails._id || selectedOrderDetails.id || selectedOrderDetails.orderNumber, e.target.value)}
                    className="px-2.5 py-1 rounded-xl text-xs font-black lowercase tracking-wider border border-black/10 bg-neutral-50 text-neutral-800 focus:outline-none cursor-pointer"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
                {selectedOrderDetails.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleApproveOrder(selectedOrderDetails)}
                    disabled={approvalLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm cursor-pointer"
                  >
                    Approve &amp; Dispatch TCS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer transition"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ENLARGED PAYMENT RECEIPT PREVIEW                               */}
      {/* ===================================================================== */}
      {enlargedReceipt && (
        <div
          onClick={() => setEnlargedReceipt(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl p-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEnlargedReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>
            <span className="text-xs font-bold text-neutral-500 block mb-2 px-2">
              Payment Verification Screenshot Attached by Client:
            </span>
            <img
              src={enlargedReceipt}
              alt="Payment Proof"
              className="max-h-[75vh] w-auto mx-auto rounded-2xl object-contain border border-black/10"
            />
          </div>
        </div>
      )}

      {/* Studio Toast Notification */}
      {studioToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1C1612] text-white text-xs font-bold shadow-2xl border border-white/20 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C69F6F] animate-pulse"></span>
          <span>{studioToast}</span>
        </div>
      )}
    </div>
  );
}
