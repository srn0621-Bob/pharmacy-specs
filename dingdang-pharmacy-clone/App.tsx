
import React, { useState, useEffect } from 'react';
import HomeView from './views/HomeView';
import ProductDetailView from './views/ProductDetailView';
import CartView from './views/CartView';
import CheckoutView from './views/CheckoutView';
import { ViewType, Product } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const navigateTo = (view: ViewType, product: Product | null = null) => {
    if (product) setSelectedProduct(product);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.HOME:
        return <HomeView onProductClick={(p) => navigateTo(ViewType.PRODUCT_DETAIL, p)} />;
      case ViewType.PRODUCT_DETAIL:
        return <ProductDetailView 
          product={selectedProduct} 
          onBack={() => setCurrentView(ViewType.HOME)} 
          onGoToCart={() => setCurrentView(ViewType.LIST)}
        />;
      case ViewType.LIST:
        return <CartView 
          onBack={() => setCurrentView(ViewType.HOME)} 
          onCheckout={() => setCurrentView(ViewType.CHECKOUT)}
          onProductClick={(p) => navigateTo(ViewType.PRODUCT_DETAIL, p)}
        />;
      case ViewType.CHECKOUT:
        return <CheckoutView onBack={() => setCurrentView(ViewType.LIST)} />;
      default:
        return <HomeView onProductClick={(p) => navigateTo(ViewType.PRODUCT_DETAIL, p)} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-bg-light shadow-xl relative overflow-x-hidden">
      {renderView()}
    </div>
  );
};

export default App;
