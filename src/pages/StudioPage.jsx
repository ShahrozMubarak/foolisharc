import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AdminGate from '../components/AdminGate';
import { logoutAdmin } from '../services/api';

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



  const handleCloseAdmin = async () => {
    await logoutAdmin();
    navigate('/shop');
  };

  const handleTryOn = (product) => {
    if (onTryOnProduct) {
      onTryOnProduct(product);
    }
    navigate('/shop');
  };



  return (
    <AdminGate>
      {adminUser => (
        <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] antialiased">
          <AdminDashboard
            orders={orders}
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
            user={adminUser}
          />
        </div>
      )}
    </AdminGate>
  );
}

export default StudioPage;
