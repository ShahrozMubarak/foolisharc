import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AdminGate from '../components/AdminGate';
import { DEFAULT_OWNER_EMAIL } from '../utils/adminAuth';

function StudioPage({
  orders = [],
  onUpdateOrderStatus,
  products = [],
  onAddProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onDeleteProduct,
  onImportCatalog,
  themeConfig,
  onUpdateTheme,
  onTryOnProduct,
  user = null,
  onOpenAuthModal
}) {
  const navigate = useNavigate();

  const storedOrders = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
  const mergedOrders = [...orders, ...storedOrders.filter(so => !orders.some(o => o.id === so.id))];

  const [siteSettings, setSiteSettings] = useState(() =>
    JSON.parse(localStorage.getItem('foolisharc_site_settings') || '{"location":"Gulberg III, Lahore","email":"concierge@foolisharc.com","phone":"+92 300 1234567"}')
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSiteInfo = () => {
    localStorage.setItem('foolisharc_site_settings', JSON.stringify(siteSettings));
    window.dispatchEvent(new Event('storage'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCloseAdmin = () => {
    navigate('/shop');
  };

  const handleTryOn = (product) => {
    if (onTryOnProduct) {
      onTryOnProduct(product);
    }
    navigate('/shop');
  };

  const activeUser = (() => {
    if (user && user.email) return user;
    try {
      const stored = localStorage.getItem('zaytoun_client_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) return parsed;
      }
    } catch {}

    return {
      email: DEFAULT_OWNER_EMAIL,
      name: 'Shahroz Mubarak',
      firstName: 'Shahroz',
      lastName: 'Mubarak',
      authProvider: 'google',
      googleVerified: true,
      role: 'owner'
    };
  })();

  return (
    <AdminGate user={user} onOpenAuthModal={onOpenAuthModal}>
      <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Site Settings (Contact & Location)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={siteSettings.location || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.email || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Contact Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={siteSettings.phone || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Phone / WhatsApp"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveSiteInfo}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Save Site Info
              </button>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md animate-fadeIn">
                  ✓ Saved & synced to footer
                </span>
              )}
            </div>
          </div>
        </div>
        <AdminDashboard
          orders={mergedOrders}
          onUpdateOrderStatus={onUpdateOrderStatus}
          products={products}
          onAddProduct={onAddProduct}
          onUpdateProductStock={onUpdateProductStock}
          onUpdateProductPrice={onUpdateProductPrice}
          onDeleteProduct={onDeleteProduct}
          onImportCatalog={onImportCatalog}
          themeConfig={themeConfig}
          onUpdateTheme={onUpdateTheme}
          onCloseAdmin={handleCloseAdmin}
          onTryOnProduct={handleTryOn}
          user={activeUser}
        />
      </div>
    </AdminGate>
  );
}

export default StudioPage;
