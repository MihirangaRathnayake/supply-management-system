import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

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
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/suppliers" element={<Placeholder title="Supplier Management" />} />
              <Route path="/products" element={<Placeholder title="Product Catalog" />} />
              <Route path="/warehouses" element={<Placeholder title="Warehouse Management" />} />
              <Route path="/inventory" element={<Placeholder title="Inventory Tracking" />} />
              <Route path="/orders" element={<Placeholder title="Purchase Orders" />} />
              <Route path="/shipments" element={<Placeholder title="Shipment Tracking" />} />
              <Route path="/analytics" element={<Placeholder title="Analytics & Reports" />} />
              <Route path="/settings" element={<Placeholder title="System Settings" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
