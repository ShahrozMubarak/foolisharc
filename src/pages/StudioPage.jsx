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
