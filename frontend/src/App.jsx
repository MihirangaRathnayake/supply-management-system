import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import Profile from './pages/Profile';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Shipments from './pages/Shipments';
import OrderScanEnhanced from './pages/OrderScanEnhanced';
import ErrorBoundary from './components/ErrorBoundary';
import TestPage from './pages/TestPage';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';

// Placeholder components for routes not yet implemented
const Placeholder = ({ title }) => (
  <div className="card">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-slate-500">This module is under development.</p>
  </div>
);

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <UnsavedChangesProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/orderscan" element={<ErrorBoundary><OrderScanEnhanced /></ErrorBoundary>} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/new" element={<CreateOrder />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </UnsavedChangesProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
