import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';
import TransactionForm from './TransactionForm';
import { Edit2, Trash2, Calendar, ArrowLeft, ArrowRight, Check, Clock, AlertTriangle } from 'lucide-react';

const categories = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Renda',
  'Investimentos',
  'Renda Extra',
  'Outros'
];

const TransactionsTable: React.FC = () => {
  const { 
    transactions, 
    removeTransaction,
    updateTransaction,
    selectedTransactions,
    toggleSelectTransaction,
    selectAllTransactions,
    clearSelectedTransactions,
    removeSelectedTransactions,
    selectedMonth,
    setSelectedMonth
  } = useFinancial();
  
  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'income'>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const [year, month] = selectedMonth.split('-');
    const matchesMonth = 
      transactionDate.getFullYear() === parseInt(year) && 
      transactionDate.getMonth() === parseInt(month) - 1;
    
    if (!matchesMonth) return false;
    if (activeTab === 'all') return true;
    return transaction.type === (activeTab === 'income' ? 'income' : 'expense');
  });

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    console.log('Editing transaction:', transaction);
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleStatusChange = async (transaction: Transaction, newStatus: string) => {
    try {
      await updateTransaction(transaction.id, {
        ...transaction,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const handleRecurringToggle = async (transaction: Transaction) => {
    try {
      await updateTransaction(transaction.id, {
        ...transaction,
        recurring: transaction.recurring === 'recurring' ? 'one-time' : 'recurring'
      });
    } catch (error) {
      console.error('Error updating transaction recurring status:', error);
    }
  };

  const handleMonthChange = (increment: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + increment);
    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'late':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const allSelected = filteredTransactions.length > 0 && 
    filteredTransactions.every(t => selectedTransactions.includes(t.id));

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-700">
        <nav className="flex">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('all')}
          >
            Todas
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'expenses'
                ? 'text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('expenses')}
          >
            Despesas
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'income'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('income')}
          >
            Receitas
          </button>
        </nav>
      </div>

      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
            onClick={() => handleAddTransaction('income')}
          >
            Nova Receita
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
            onClick={() => handleAddTransaction('expense')}
          >
            Nova Despesa
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 hover:bg-gray-700 rounded text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-700 border-none rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1 hover:bg-gray-700 rounded text-white"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {selectedTransactions.length > 0 && (
            <div className="flex gap-2">
              <span className="text-sm text-gray-400">
                {selectedTransactions.length} selecionados
              </span>
              <button
                className="text-red-500 hover:text-red-400 text-sm"
                onClick={removeSelectedTransactions}
              >
                Excluir
              </button>
              <button
                className="text-gray-400 hover:text-gray-300 text-sm"
                onClick={clearSelectedTransactions}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <TransactionForm
          type={transactionType}
          onClose={handleFormClose}
          categories={categories}
          transaction={editingTransaction}
          selectedMonth={selectedMonth}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="p-4 w-8">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  checked={allSelected}
                  onChange={() => {
                    if (allSelected) {
                      clearSelectedTransactions();
                    } else {
                      selectAllTransactions();
                    }
                  }}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Descrição
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Valor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Recorrente
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-700">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => toggleSelectTransaction(transaction.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(transaction.date)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <select
                        value={transaction.status}
                        onChange={(e) => handleStatusChange(transaction, e.target.value)}
                        className="bg-gray-700 border-none rounded text-sm text-white"
                      >
                        {transaction.type === 'income' ? (
                          <>
                            <option value="pending">A receber</option>
                            <option value="completed">Recebido</option>
                          </>
                        ) : (
                          <>
                            <option value="pending">A pagar</option>
                            <option value="completed">Pago</option>
                            <option value="late">Atrasado</option>
                          </>
                        )}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRecurringToggle(transaction)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.recurring === 'recurring'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {transaction.recurring === 'recurring' ? 'Recorrente' : 'Único'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded hover:bg-gray-700"
                        title="Editar transação"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeTransaction(transaction.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-700"
                        title="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-400">
                  Nenhuma transação encontrada. Clique em "Nova Receita" ou "Nova Despesa" para adicionar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;