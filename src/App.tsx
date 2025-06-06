import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';
import Dashboard from './components/Dashboard';
import LoginForm from './components/Auth/LoginForm';
import Landing from './components/Landing';
import { useAuth } from './context/AuthContext';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <FinancialProvider>
              <Dashboard />
            </FinancialProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;