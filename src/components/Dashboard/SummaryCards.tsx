import React from 'react';
import { formatCurrency } from '../../utils/calculations';
import { useFinancial } from '../../context/FinancialContext';
import { Twitch as Switch } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
  debts: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ income, expenses, balance, debts }) => {
  const { includeDebtsInExpenses, toggleIncludeDebtsInExpenses } = useFinancial();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-gray-400">Incluir parcelas de dívidas nas despesas do mês</span>
        <button
          onClick={toggleIncludeDebtsInExpenses}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            includeDebtsInExpenses ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              includeDebtsInExpenses ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Receitas</h3>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(income)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 shadow border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Despesas</h3>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(expenses)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Saldo</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Dívidas</h3>
          <p className="text-2xl font-bold text-yellow-500">
            {formatCurrency(debts)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;