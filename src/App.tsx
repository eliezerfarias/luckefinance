import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';
import Dashboard from './components/Dashboard';
import LoginForm from './components/Auth/LoginForm';
import { useAuth } from './context/AuthContext';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return user ? (
    <FinancialProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Dashboard />
      </div>
    </FinancialProvider>
  ) : (
    <LoginForm />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;