import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeaderNav from "./components/HeaderNav";

import DashboardPage from "./pages/DashboardPage";
import ProductsListPage from "./pages/ProductsListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import IncreaseStockPage from "./pages/IncreaseStockPage";
import ReduceStockPage from "./pages/ReduceStockPage";
import StockUpdatesPage from "./pages/StockUpdatesPage";
import ShopPage from "./pages/ShopPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <HeaderNav />
        <main className="container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/products/:id" element={<ProductDetailPage />} />
            <Route path="/products" element={<ProductsListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id/edit" element={<EditProductPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/reduce-stock" element={<ReduceStockPage />} />
            <Route path="/increase-stock" element={<IncreaseStockPage />} />
            <Route path="/stock-updates" element={<StockUpdatesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
