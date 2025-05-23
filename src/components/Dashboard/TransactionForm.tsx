import React, { useState, useEffect } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction, TransactionType } from '../../types';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  type: TransactionType;
  onClose: () => void;
  categories: string[];
  transaction?: Transaction | null;
  selectedMonth: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  type, 
  onClose, 
  categories: defaultCategories, 
  transaction,
  selectedMonth 
}) => {
  const { addTransaction, updateTransaction, addCategory } = useFinancial();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    category: '',
    date: new Date(),
    amount: 0,
    type,
    status: type === 'income' ? 'pending' : 'pending',
    recurring: 'one-time'
  });
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(defaultCategories);

  useEffect(() => {
    // Filter categories based on transaction type
    const typeSpecificCategories = defaultCategories.filter(category => {
      const isExpenseCategory = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação'].includes(category);
      const isIncomeCategory = ['Renda', 'Investimentos', 'Renda Extra'].includes(category);
      return type === 'expense' ? isExpenseCategory : isIncomeCategory;
    });
    setFilteredCategories(typeSpecificCategories);
  }, [type, defaultCategories]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: new Date(transaction.date)
      });
    } else {
      // Set default date to selected month
      const [year, month] = selectedMonth.split('-');
      const defaultDate = new Date();
      defaultDate.setFullYear(parseInt(year));
      defaultDate.setMonth(parseInt(month) - 1);
      setFormData(prev => ({
        ...prev,
        date: defaultDate
      }));
    }
  }, [transaction, selectedMonth]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setError(null);
    
    if (name === 'amount') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === 'date') {
      const newDate = new Date(value);
      if (!isNaN(newDate.getTime())) {
        setFormData({ ...formData, date: newDate });
      }
    } else if (name === 'category' && value === 'new') {
      setShowNewCategoryInput(true);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      setError('Por favor, insira um nome para a categoria');
      return;
    }

    try {
      await addCategory(newCategory, type);
      setFormData({ ...formData, category: newCategory });
      setShowNewCategoryInput(false);
      setNewCategory('');
    } catch (error) {
      setError('Erro ao adicionar nova categoria');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Por favor, faça login para adicionar uma transação');
      return;
    }

    if (!formData.description || !formData.amount || formData.amount <= 0) {
      setError('Por favor, preencha todos os campos corretamente');
      return;
    }

    try {
      if (transaction) {
        await updateTransaction(transaction.id, {
          ...formData,
          id: transaction.id,
          user_id: user.id,
          type,
        } as Transaction);
      } else {
        await addTransaction({
          ...formData,
          user_id: user.id,
          type,
          description: formData.description,
          category: formData.category || filteredCategories[0],
          date: formData.date || new Date(),
          amount: formData.amount,
          status: formData.status || (type === 'income' ? 'pending' : 'pending'),
          recurring: formData.recurring || 'one-time'
        } as Transaction);
      }
      onClose();
    } catch (error) {
      console.error('Error with transaction:', error);
      setError('Erro ao processar transação. Por favor, tente novamente.');
    }
  };

  return (
    <div className="bg-gray-800 p-4">
      <h3 className="text-lg font-medium text-white mb-4">
        {transaction ? 'Editar' : 'Nova'} {type === 'income' ? 'Receita' : 'Despesa'}
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500 text-white rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Descrição
          </label>
          <input
            type="text"
            name="description"
            id="description"
            required
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300">
            Categoria
          </label>
          {showNewCategoryInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nova categoria"
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="mt-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <select
              name="category"
              id="category"
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Nova categoria</option>
            </select>
          )}
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">
            Data
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.date?.toISOString().split('T')[0]}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
            Valor (R$)
          </label>
          <input
            type="number"
            name="amount"
            id="amount"
            required
            step="0.01"
            min="0.01"
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.amount || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300">
            Status
          </label>
          <select
            name="status"
            id="status"
            required
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.status}
            onChange={handleChange}
          >
            {type === 'income' ? (
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

        <div>
          <label htmlFor="recurring" className="block text-sm font-medium text-gray-300">
            Recorrência
          </label>
          <select
            name="recurring"
            id="recurring"
            required
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.recurring}
            onChange={handleChange}
          >
            <option value="one-time">Único</option>
            <option value="recurring">Recorrente</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`${
              type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            } text-white px-4 py-2 rounded`}
          >
            {transaction ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;