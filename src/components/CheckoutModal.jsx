import {priceOrder} from '../utils/pricing';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SymbioteButton from './SymbioteButton';
import { fetchPaymentMethods } from '../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartItems: propCartItems,
  pricing,
  onOrderCompleted,
  onConfirmOrder,
  user = null
}) {
  const navigate = useNavigate();

  const rawList = propCartItems || cart || [];
  const normalizedCartItems = rawList.map(item => {
    const p = item.product || item;
    return {
      product: p,
      id: p.id || item.id,
      name: p.name || item.name || 'Garment',
      price: Number(p.price || item.price || 0),
      size: item.selectedSize || item.size || 'M',
      color: item.selectedColor || item.colorName || item.color || p.primaryColor || 'Olive',
      quantity: Number(item.quantity || 1)
    };
  });

  const subtotal = normalizedCartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const activePricing = pricing || priceOrder(subtotal);

  // Checkout Steps: 1: 'shipping', 2: 'payment'
  const [step, setStep] = useState('shipping');
  
  // Shipping Form State (pre-filled with clean Google user profile if signed in)
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0].replace(/[^a-zA-Z\s]/g, '') : ""),
    lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ').replace(/[^a-zA-Z\s]/g, '') : ""),
    email: user?.email || "",
    phone: user?.phone ? user.phone.replace(/[^0-9]/g, '').slice(0, 11) : "",
    address: user?.address ? user.address.replace(/[<>{}$~%^*=;`+?]/g, '') : "",
    city: user?.city ? user.city.replace(/[^a-zA-Z\s]/g, '') : "",
    province: user?.province ? user.province.replace(/[^a-zA-Z\s]/g, '') : "",
    postalCode: user?.postalCode ? user.postalCode.replace(/[^0-9]/g, '').slice(0, 6) : "",
    orderNotes: ""
  }));

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState({});

  // Receipt Proof Attachment States (for JazzCash / EasyPaisa / Bank)
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);
  const fileInputRef = useRef(null);

  // Automatically sync customer name and email when Google user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || (user.name ? user.name.split(' ')[0].replace(/[^a-zA-Z\s]/g, '') : ""),
        lastName: prev.lastName || user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ').replace(/[^a-zA-Z\s]/g, '') : ""),
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Available payment methods: COD plus owner-configured manual wallets.
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // JazzCash state (empty initial values, digits only)
  const [jazzcashPhone, setJazzcashPhone] = useState("");
  const [jazzcashCnic, setJazzcashCnic] = useState("");

  // EasyPaisa state (empty initial values, digits only)
  const [easypaisaPhone, setEasypaisaPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([{ id: 'cod', enabled: true, label: 'Cash on Delivery' }]);
  const idempotencyRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchPaymentMethods().then(methods => {
      if (!active) return;
      setPaymentMethods(methods);
      if (!methods.some(method => method.id === paymentMethod)) setPaymentMethod('cod');
    });
    return () => { active = false; };
  }, []);

  const paymentMethodConfig = paymentMethods.find(method => method.id === paymentMethod);

  const PAKISTANI_CITIES = [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", 
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", 
    "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha"
  ];

  // Active Real-Time Input Filtering: Prevents typing invalid characters into fields
  const handleInputChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === 'firstName' || name === 'lastName') {
      // Disallow numbers, signs, and symbols. Letters and spaces only.
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone') {
      // Disallow letters, signs, and symbols. Digits only, max 11 digits.
      value = value.replace(/[^0-9]/g, '').slice(0, 11);
    } else if (name === 'city' || name === 'province') {
      // Disallow numbers and special characters. Letters and spaces only.
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'postalCode') {
      // Disallow letters and symbols. Digits only, max 6 digits.
      value = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'address') {
      // Strip potentially malicious code characters (<, >, {, }, $, ~, %, ^, *, =, ;, `, +, ?)
      value = value.replace(/[<>{}$~%^*=;`+?]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const processReceiptFile = (file) => {
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setReceiptError("File exceeds 3MB. Please upload a smaller image.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setReceiptError("Invalid file type. Please upload a PNG, JPG or WEBP receipt image.");
      return;
    }

    setReceiptFile(file);
    setReceiptFileName(file.name);
    setReceiptError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0];
    processReceiptFile(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptFileName("");
    setReceiptError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProceedToPayment = (e) => {
    if (e) e.preventDefault();

    const nextErrors = {};
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.replace(/\D/g, '');
    const address = formData.address.trim();

    if (!/^[a-zA-Z\s]{1,70}$/.test(firstName)) nextErrors.firstName = 'Enter a valid first name.';
    if (!/^[a-zA-Z\s]{1,70}$/.test(lastName)) nextErrors.lastName = 'Enter a valid last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!/^(?:92)?3\d{9}$|^03\d{9}$/.test(phone)) nextErrors.phone = 'Enter a valid Pakistani mobile number.';
    if (address.length < 8 || address.length > 300) nextErrors.address = 'Enter a complete delivery address (8–300 characters).';

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError('');
    setStep('payment');
  };

  const handleFinalizeOrder = async () => {
    if (isSubmitting) return;
    setSubmitError('');

    if (!paymentMethodConfig?.enabled) {
      setSubmitError('Please choose an available payment method.');
      return;
    }
    if (['jazzcash', 'easypaisa'].includes(paymentMethod) && !receiptPreview) {
      setReceiptError('Upload a payment receipt image to continue.');
      setSubmitError('A payment receipt is required for this payment method.');
      return;
    }

    if (paymentMethod === 'jazzcash' && (!/^03\d{9}$/.test(jazzcashPhone) || !/^[a-zA-Z0-9]{4,30}$/.test(jazzcashCnic))) {
      setSubmitError('Enter the JazzCash sender mobile number and transaction ID.');
      return;
    }
    if (paymentMethod === 'easypaisa' && !/^03\d{9}$/.test(easypaisaPhone)) {
      setSubmitError('Enter the EasyPaisa sender mobile number.');
      return;
    }

    const cleanCustomer = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      province: formData.province.trim(),
      postalCode: formData.postalCode.trim(),
      orderNotes: formData.orderNotes.trim()
    };
    const items = normalizedCartItems.map(item => ({
      id: item.id,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    }));
    setIsSubmitting(true);
    try {
      const signature=JSON.stringify({customer:cleanCustomer,items,paymentMethod,receiptPreview,receiptFileName,jazzcashPhone,jazzcashCnic,easypaisaPhone});
      const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(signature))),v=>v.toString(16).padStart(2,'0')).join('');
      let previous=idempotencyRef.current;
      if (!previous) { try {previous=JSON.parse(sessionStorage.getItem('foolisharc_checkout_attempt'));} catch {} }
      idempotencyRef.current=previous?.digest===digest ? previous : {digest,key:crypto.randomUUID()};
      try {sessionStorage.setItem('foolisharc_checkout_attempt',JSON.stringify(idempotencyRef.current));} catch {}
      if (typeof onConfirmOrder !== 'function') {
        throw new Error('Checkout is temporarily unavailable. Please contact the store.');
      }

      const savedOrder = await onConfirmOrder({
        idempotencyKey: idempotencyRef.current.key,
        customer: cleanCustomer,
        paymentMethod,
        paymentReceipt: receiptPreview || undefined,
        receiptFileName: receiptFileName || undefined,
        paymentReference: paymentMethod === 'jazzcash'
          ? { senderPhone: jazzcashPhone, transactionId: jazzcashCnic }
          : paymentMethod === 'easypaisa'
            ? { senderPhone: easypaisaPhone, transactionId: '' }
            : undefined,
        items
      });

      if (!savedOrder?.orderNumber) {
        throw new Error('The server did not confirm this order. Your bag is still saved.');
      }

      idempotencyRef.current = null;
      try {sessionStorage.removeItem('foolisharc_checkout_attempt');} catch {}
      if (onOrderCompleted) onOrderCompleted(savedOrder);
      if (onClose) onClose();
      navigate(`/track/${encodeURIComponent(savedOrder.orderNumber)}`);
    } catch (error) {
      setSubmitError(error?.message || 'We could not place your order. Your bag has been kept safe; please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-onyx-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-[#1A1613] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E6D3B3] relative fade-in">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#FAF6F0] dark:bg-[#231E19] border-b border-[#E8E0D5] dark:border-[#332A22] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-serif text-xl sm:text-2xl font-black text-[#1C1612] dark:text-white tracking-wider">FOOLISH ARC</span>
            <span className="text-[10px] bg-[#9A6E3E] text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-2xs">
              CONFIDENTIAL DOSSIER
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Progress Bar - Clickable to Switch Steps */}
        <div className="grid grid-cols-2 bg-[#F5EFE6] dark:bg-[#1E1915] border-b border-[#E8E0D5] dark:border-[#332A22] text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setStep('shipping')}
            className={`py-3 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              step === 'shipping'
                ? 'bg-[#9A6E3E] text-white shadow-inner font-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 font-bold'
            }`}
          >
            <span>1. Delivery Dossier</span>
          </button>
          <button
            type="button"
            onClick={() => setStep('payment')}
            className={`py-3 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              step === 'payment'
                ? 'bg-[#9A6E3E] text-white shadow-inner font-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 font-bold'
            }`}
          >
            <span>2. Payment &amp; Confirmation</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* STEP 1: SHIPPING & CONTACT */}
          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-3">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1612] dark:text-white">
                  Client Delivery Dossier
                </h3>
                <span className="text-xs text-[#9A6E3E] font-bold tracking-wider uppercase">Step 1 of 2</span>
              </div>

              {user && (
                <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div className="flex-1 min-w-0 font-bold">
                    <span>Google Verified Patron: </span>
                    <span className="text-[#1C1612] dark:text-white font-extrabold">{user.name} ({user.email})</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border p-3 text-xs font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/20 transition shadow-inner ${
                      formErrors.firstName ? 'border-red-500 bg-red-50/20' : 'border-[#D8CEBF] dark:border-[#382F26]'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-600 text-xs font-bold mt-1 uppercase">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border p-3 text-xs font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/20 transition shadow-inner ${
                      formErrors.lastName ? 'border-red-500 bg-red-50/20' : 'border-[#D8CEBF] dark:border-[#382F26]'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-600 text-xs font-bold mt-1 uppercase">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={11}
                    required
                    placeholder="03001234567"
                    className={`w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border p-3 text-xs font-mono font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/20 transition shadow-inner ${
                      formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-[#D8CEBF] dark:border-[#382F26]'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-600 text-xs font-bold mt-1 uppercase">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3]">
                      Email Address *
                    </label>
                    {user?.email && (
                      <span className="text-[10px] font-black text-[#8C6A3E] dark:text-[#E6D3B3] uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E6D3B3] dark:border-[#382F26]">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={Boolean(user?.email)}
                    required
                    placeholder="client@domain.com"
                    className={`w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border p-3 text-xs font-mono font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] transition shadow-inner ${
                      formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-[#D8CEBF] dark:border-[#382F26]'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-xs font-bold mt-1 uppercase">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="House / Apartment, Street, Phase / Block"
                  className={`w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border p-3 text-xs font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/20 transition shadow-inner ${
                    formErrors.address ? 'border-red-500 bg-red-50/20' : 'border-[#D8CEBF] dark:border-[#382F26]'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-red-600 text-xs font-bold mt-1 uppercase">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                    City *
                  </label>
                  <select required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] p-3 text-xs font-bold uppercase text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] cursor-pointer shadow-inner"
                  >
                    <option value="">Select a city</option>
                    {PAKISTANI_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] p-3 text-xs font-bold uppercase text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    maxLength={6}
                    placeholder="54000"
                    className={`w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border p-3 text-xs font-mono font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] transition shadow-inner ${
                      formErrors.postalCode ? 'border-red-500 bg-red-50/20' : 'border-[#D8CEBF] dark:border-[#382F26]'
                    }`}
                  />
                  {formErrors.postalCode && (
                    <p className="text-red-600 text-xs font-bold mt-1 uppercase">{formErrors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#8C6A3E] dark:text-[#E6D3B3] mb-1.5">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="Gate code, landmark, or specific packaging notes..."
                  className="w-full rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] p-3 text-xs font-bold text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] shadow-inner"
                />
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-between items-center border-t border-[#EFE9DF] dark:border-[#2C241D]">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white font-bold transition"
                >
                  ← Return to Bag
                </button>
                <button
                  type="submit"
                  className="arrow-runway bg-[#1C1612] hover:bg-[#7A4B26] text-white font-bold px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment Options</span>
                  <span className="arrow-runway-box">
                    <b>→</b>
                    <b>→</b>
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1612] dark:text-white">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-[#7C6A58] dark:text-neutral-400 font-medium">Choose your preferred gateway to finalize your order.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Payable Total</span>
                  <div className="font-black text-[#9A6E3E] text-lg sm:text-xl tracking-tight">
                    Rs. {activePricing.finalTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 4 Interactive Payment Options Grid */}
              <div className="space-y-3">
                
                {/* 1. Cash on Delivery (COD) */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                    paymentMethod === 'cod'
                      ? 'border-[#9A6E3E] bg-[#FAF6F0] dark:bg-[#251E18] shadow-sm'
                      : 'border-[#E8E0D5] dark:border-[#332A22] hover:border-[#9A6E3E]/60 bg-white dark:bg-[#1A1613]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-[#9A6E3E] cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs sm:text-sm font-black text-[#1C1612] dark:text-white">Cash on Delivery (COD)</strong>
                        <span className="text-[10px] bg-[#EFE9DF] text-[#8C6A3E] font-bold px-2 py-0.5 rounded-full">Most Popular</span>
                      </div>
                      <span className="text-xs font-bold text-neutral-500">TCS / Leopards</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                      Pay cash directly to the courier rider upon receiving your luxury package at your doorstep.
                    </p>
                  </div>
                </div>

                {paymentMethods.some(method => method.id === 'jazzcash' && method.enabled) && <div 
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                    paymentMethod === 'jazzcash'
                      ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                      : 'border-[#E8E0D5] dark:border-[#332A22] hover:border-red-400 bg-white dark:bg-[#1A1613]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={() => setPaymentMethod('jazzcash')}
                    className="mt-1 accent-red-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-black">JC</span>
                        <strong className="text-xs sm:text-sm font-black text-red-700 dark:text-red-400">JazzCash Mobile Wallet</strong>
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">Manual Verification</span>
                      </div>
                      <span className="text-xs font-bold text-neutral-500">Instant</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                      Transfer using the account details shown below and upload your receipt for manual verification.
                    </p>
                  </div>
                </div>}

                {paymentMethods.some(method => method.id === 'easypaisa' && method.enabled) && <div 
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                    paymentMethod === 'easypaisa'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-[#E8E0D5] dark:border-[#332A22] hover:border-emerald-400 bg-white dark:bg-[#1A1613]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={() => setPaymentMethod('easypaisa')}
                    className="mt-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">EP</span>
                        <strong className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-400">EasyPaisa Account</strong>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">USSD / App</span>
                      </div>
                      <span className="text-xs font-bold text-neutral-500">Telenor / All Nets</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                      Transfer using the account details shown below and upload your receipt for manual verification.
                    </p>
                  </div>
                </div>}

              </div>

              {/* Sub-Forms depending on selected payment method */}
              <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] space-y-4 shadow-2xs">
                {paymentMethod === 'cod' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-[#8C6A3E] dark:text-[#E6D3B3] font-black">
                      <span>✓ Cash On Delivery Confirmed</span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200 font-semibold leading-relaxed">
                      Courier will collect <strong className="text-[#9A6E3E] font-black">Rs. {activePricing.finalTotal.toLocaleString()}</strong> in cash at <strong>{formData.address}, {formData.city}</strong>.
                    </p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Your order will be booked immediately and dispatched with real-time tracking updates.
                    </p>
                  </div>
                )}

                {paymentMethod === 'jazzcash' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900/40 pb-2">
                      <span className="font-black text-red-800 dark:text-red-400 uppercase tracking-wide">JazzCash Transfer Instructions</span>
                      <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">Manual Verification</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-[#1A1613] border border-red-200 dark:border-red-900/40 rounded-xl space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-sans">Send Payment To:</span>
                        <strong className="text-red-700 dark:text-red-400 font-bold">{paymentMethodConfig?.accountNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-sans">Account Title:</span>
                        <strong className="text-neutral-900 dark:text-white font-bold">{paymentMethodConfig?.accountTitle || 'FOOLISH ARC'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-sans">Payable Total:</span>
                        <strong className="text-[#9A6E3E] font-black">Rs. {activePricing.finalTotal.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-1">
                          Sender Mobile Number *
                        </label>
                        <input
                          type="tel"
                          value={jazzcashPhone}
                          onChange={(e) => setJazzcashPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                          maxLength={11}
                          placeholder="03001234567"
                          className="w-full rounded-xl bg-white dark:bg-[#1A1613] border border-[#D8CEBF] dark:border-[#382F26] p-3 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-red-500 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-1">
                          Transaction ID (TID)
                        </label>
                        <input
                          type="text"
                          value={jazzcashCnic}
                          onChange={(e) => setJazzcashCnic(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20))}
                          maxLength={20}
                          placeholder="e.g. 1092837461"
                          className="w-full rounded-xl bg-white dark:bg-[#1A1613] border border-[#D8CEBF] dark:border-[#382F26] p-3 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-red-500 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'easypaisa' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40 pb-2">
                      <span className="font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">EasyPaisa Transfer Instructions</span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Manual Verification</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-[#1A1613] border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-sans">Send Payment To:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{paymentMethodConfig?.accountNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-sans">Account Title:</span>
                        <strong className="text-neutral-900 dark:text-white font-bold">{paymentMethodConfig?.accountTitle || 'FOOLISH ARC'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-sans">Payable Total:</span>
                        <strong className="text-[#9A6E3E] font-black">Rs. {activePricing.finalTotal.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-1">
                        Sender EasyPaisa Number *
                      </label>
                      <input
                        type="tel"
                        value={easypaisaPhone}
                        onChange={(e) => setEasypaisaPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                        maxLength={11}
                        placeholder="03451234567"
                        className="w-full rounded-xl bg-white dark:bg-[#1A1613] border border-[#D8CEBF] dark:border-[#382F26] p-3 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                      />
                    </div>
                  </div>
                )}

                {/* MANDATORY PAYMENT RECEIPT PROOF ATTACHMENT BOX */}
                {['jazzcash', 'easypaisa', 'bank'].includes(paymentMethod) && (
                  <div className="mt-4 pt-4 border-t border-[#E8E0D5] dark:border-[#332A22]">
                    <div className="p-5 bg-white dark:bg-[#1A1613] border-2 border-dashed border-[#C69F6F]/60 rounded-2xl space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs uppercase tracking-widest text-[#1C1612] dark:text-white font-black block">
                            PAYMENT PROOF ATTACHMENT *
                          </strong>
                        </div>
                        {receiptPreview && (
                          <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 tracking-wider">
                            ✓ PROOF ATTACHED
                          </span>
                        )}
                      </div>

                      {/* Native file input */}
                      <input
                        id="checkout-receipt-input"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleReceiptFileChange}
                        className="hidden"
                        aria-label="Upload payment receipt image"
                      />

                      {!receiptPreview ? (
                        <label
                          htmlFor="checkout-receipt-input"
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingReceipt(true); }}
                          onDragLeave={() => setIsDraggingReceipt(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingReceipt(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              processReceiptFile(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition text-center cursor-pointer group ${
                            isDraggingReceipt
                              ? 'border-[#9A6E3E] bg-[#FAF6F0]'
                              : 'border-[#D8CEBF] bg-[#FAF9F6] dark:bg-[#201A16] hover:border-[#9A6E3E]'
                          }`}
                        >
                          <svg className="w-8 h-8 text-[#9A6E3E] group-hover:scale-110 transition-transform mb-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1C1612] text-white text-xs font-black uppercase tracking-wider rounded-xl group-hover:bg-[#9A6E3E] transition shadow-sm pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Choose Receipt Image</span>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 font-medium pointer-events-none">or drag &amp; drop payment screenshot directly here</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5 font-mono font-bold pointer-events-none">PNG, JPG, WEBP (Max 3MB)</span>
                        </label>
                      ) : (
                        <div className="p-3.5 bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img
                              src={receiptPreview}
                              alt="Payment receipt preview"
                              className="w-14 h-16 rounded-xl object-cover border border-[#E8E0D5] shadow-xs bg-white flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <strong className="block text-xs font-black text-neutral-900 dark:text-white truncate font-mono">
                                {receiptFileName}
                              </strong>
                              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                                ✓ Ready to be verified by Atelier Studio
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                            <label
                              htmlFor="checkout-receipt-input"
                              className="px-3.5 py-1.5 bg-white dark:bg-[#1A1613] border border-[#D8CEBF] hover:border-[#9A6E3E] text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                            >
                              Change File
                            </label>
                            <button
                              type="button"
                              onClick={handleRemoveReceipt}
                              className="text-xs text-red-600 hover:text-red-800 font-bold uppercase underline tracking-wider cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {receiptError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold">
                          {receiptError}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  {submitError}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-4 flex justify-between items-center border-t border-[#EFE9DF] dark:border-[#2C241D]">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition"
                >
                  ← BACK TO DOSSIER
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeOrder}
                  disabled={isSubmitting}
                  className={`btn-confirm-payment bg-[#1C1612] hover:bg-[#7A4B26] text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl flex items-center space-x-2 active:scale-95 cursor-pointer disabled:cursor-not-allowed ${
                    isSubmitting ? 'confirming' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>AUTHORIZING TRANSACTION...</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span>CONFIRM PAYMENT • RS. {activePricing.finalTotal.toLocaleString()}</span>
                      <span className="arrow-runway-box">
                        <b>→</b>
                        <b>→</b>
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
