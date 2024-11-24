import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ChartOfAccounts } from './pages/ChartOfAccounts';
import { Transactions } from './pages/Transactions';
import { Companies } from './pages/Companies';
import { Standards } from './pages/Standards';
import { CompanyDashboard } from './pages/companies/CompanyDashboard';
import { RagMapperTest } from './components/debug/RagMapperTest';
import { useAuthStore } from './store/authStore';

// Placeholder components for routes
const Dashboard = () => <div className="text-2xl">Dashboard Content (Coming Soon)</div>;
const Reports = () => <div className="text-2xl">Reports (Coming Soon)</div>;
const Users = () => <div className="text-2xl">Users Management (Coming Soon)</div>;
const Settings = () => <div className="text-2xl">Settings (Coming Soon)</div>;

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />} 
        />
        
        {/* Protected Routes */}
        {isAuthenticated ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/standards" element={<Standards />} />
            <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/rag-test" element={<RagMapperTest />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;