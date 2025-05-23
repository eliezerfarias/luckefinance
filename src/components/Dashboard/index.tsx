import React, { useRef, useEffect } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import FinancialGoal from './FinancialGoal';
import FinancialStatus from './FinancialStatus';
import SummaryCards from './SummaryCards';
import FinancialEvolution from './FinancialEvolution';
import TransactionsTable from './TransactionsTable';
import DebtAgreements from './DebtAgreements';
import AIFinancialAdvisor from './AIFinancialAdvisor';
import { LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    totalIncome,
    totalExpenses,
    balance,
    financialMoment,
    totalDebts
  } = useFinancial();
  
  const { userProfile, signOut } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div ref={dashboardRef} className="container mx-auto px-4 py-6 max-w-7xl">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, {userProfile?.nickname || 'usuário'}!
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </header>

      <div className="space-y-6">
        <FinancialGoal />
        
        <FinancialStatus 
          status={financialMoment} 
        />
        
        <SummaryCards 
          income={totalIncome}
          expenses={totalExpenses}
          balance={balance}
          debts={totalDebts}
        />
        
        <FinancialEvolution />
        
        <TransactionsTable />
        
        <DebtAgreements />
        
        <AIFinancialAdvisor />
      </div>
    </div>
  );
};

export default Dashboard;