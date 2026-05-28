import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layouts/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Suppliers from './pages/suppliers/Suppliers';
import SupplierForm from './pages/suppliers/SupplierForm';
import Airlines from './pages/airlines/Airlines';
import AirlineForm from './pages/airlines/AirlineForm';
import Airports from './pages/airports/Airports';
import AirportForm from './pages/airports/AirportForm';
import Transactions from './pages/transactions/Transactions';
import TransactionForm from './pages/transactions/TransactionForm';
import Invoices from './pages/invoices/Invoices';
import InvoiceDetails from './pages/invoices/InvoiceDetails';
import Reports from './pages/reports/Reports';
import Profile from './pages/Profile';

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/new" element={<SupplierForm />} />
          <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
          <Route path="/airlines" element={<Airlines />} />
          <Route path="/airlines/new" element={<AirlineForm />} />
          <Route path="/airlines/:id/edit" element={<AirlineForm />} />
          <Route path="/airports" element={<Airports />} />
          <Route path="/airports/new" element={<AirportForm />} />
          <Route path="/airports/:id/edit" element={<AirportForm />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<TransactionForm />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;