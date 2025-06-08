import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Transaction, FinancialGoal, FinancialMoment, DebtAgreement } from '../types';
import { calculateFinancialStatus } from '../utils/calculations';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FinancialContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Transaction) => Promise<void>;
  financialGoal: FinancialGoal;
  updateFinancialGoal: (goal: Omit<FinancialGoal, 'id'>) => Promise<void>;
  financialMoment: FinancialMoment;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalDebts: number;
  selectedTransactions: string[];
  toggleSelectTransaction: (id: string) => void;
  selectAllTransactions: () => void;
  clearSelectedTransactions: () => void;
  removeSelectedTransactions: () => Promise<void>;
  agreements: DebtAgreement[];
  addAgreement: (agreement: Omit<DebtAgreement, 'id' | 'createdAt'>) => Promise<void>;
  removeAgreement: (id: string) => Promise<void>;
  updateAgreement: (id: string, agreement: Partial<DebtAgreement>) => Promise<void>;
  includeDebtsInExpenses: boolean;
  toggleIncludeDebtsInExpenses: () => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  addCategory: (name: string, type: 'income' | 'expense') => Promise<void>;
}

const defaultGoal: Omit<FinancialGoal, 'id'> = {
  title: 'Meta principal',
  description: 'Nenhuma meta definida para este mês. Clique em "Editar" para adicionar.',
  target: 0,
  current: 0,
  period: 'monthly',
  deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialGoal, setFinancialGoal] = useState<FinancialGoal>({ ...defaultGoal, id: null });
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [totalDebts, setTotalDebts] = useState(0);
  const [agreements, setAgreements] = useState<DebtAgreement[]>([]);
  const [includeDebtsInExpenses, setIncludeDebtsInExpenses] = useState(() => {
    const saved = localStorage.getItem('includeDebtsInExpenses');
    return saved ? JSON.parse(saved) : true;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('selectedMonth');
    if (saved) return saved;
    
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Save selectedMonth to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedMonth', selectedMonth);
  }, [selectedMonth]);

  // Save includeDebtsInExpenses to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('includeDebtsInExpenses', JSON.stringify(includeDebtsInExpenses));
  }, [includeDebtsInExpenses]);

  // Filter transactions for the selected month
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const [year, month] = selectedMonth.split('-');
    return (
      transactionDate.getFullYear() === parseInt(year) &&
      transactionDate.getMonth() === parseInt(month) - 1
    );
  });
  
  // Calculate total income only from completed income transactions for the selected month
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const calculateMonthlyDebtPayments = () => {
    return agreements
      .filter(a => a.status === 'active')
      .reduce((sum, agreement) => sum + (agreement.totalAmount / agreement.installments), 0);
  };
  
  // Calculate total expenses only from completed expense transactions for the selected month
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0) + 
    (includeDebtsInExpenses ? calculateMonthlyDebtPayments() : 0);
  
  const balance = totalIncome - totalExpenses;
  const [financialMoment, setFinancialMoment] = useState<FinancialMoment>('equilibrado');

  const toggleIncludeDebtsInExpenses = () => {
    setIncludeDebtsInExpenses(prev => !prev);
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadFinancialGoal();
      loadDebts();
      loadAgreements();
    }
  }, [user]);
  
  useEffect(() => {
    setFinancialMoment(calculateFinancialStatus(balance, totalIncome, totalExpenses));
  }, [balance, totalIncome, totalExpenses]);

  const loadAgreements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('debt_agreements')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeAgreements = data.map(agreement => ({
        ...agreement,
        startDate: new Date(agreement.start_date),
        createdAt: new Date(agreement.created_at),
        totalAmount: Number(agreement.total_amount)
      }));

      setAgreements(activeAgreements);

      // Calculate total from active agreements
      const totalFromAgreements = activeAgreements.reduce((total, agreement) => {
        return total + Number(agreement.totalAmount);
      }, 0);

      setTotalDebts(totalFromAgreements);
    } catch (error) {
      console.error('Error loading agreements:', error);
    }
  };

  const loadDebts = async () => {
    if (!user) return;

    try {
      // Get total from active agreements
      const { data: agreementsData, error: agreementsError } = await supabase
        .from('debt_agreements')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (agreementsError) throw agreementsError;

      const agreementsTotal = agreementsData.reduce((sum, agreement) => {
        return sum + Number(agreement.total_amount);
      }, 0);

      setTotalDebts(agreementsTotal);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data.map(t => ({
        ...t,
        date: new Date(t.date)
      })));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadFinancialGoal = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFinancialGoal({
          ...data,
          deadline: new Date(data.deadline)
        });
      } else {
        // If no goal exists, create one with default values
        const { data: newGoal, error: insertError } = await supabase
          .from('financial_goals')
          .insert([{ ...defaultGoal, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newGoal) {
          setFinancialGoal({
            ...newGoal,
            deadline: new Date(newGoal.deadline)
          });
        }
      }
    } catch (error) {
      console.error('Error loading financial goal:', error);
    }
  };

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{
          user_id: user.id,
          name,
          type
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setTransactions([{ ...data, date: new Date(data.date) }, ...transactions]);

      // If transaction is recurring, create future occurrences
      if (transaction.recurring === 'recurring') {
        const futureMonths = 11; // Create for the next 11 months (1 year total)
        const futureTransactions = Array.from({ length: futureMonths }, (_, index) => {
          const futureDate = new Date(transaction.date);
          futureDate.setMonth(futureDate.getMonth() + index + 1);
          return {
            ...transaction,
            user_id: user.id,
            date: futureDate,
            status: 'pending' // Future transactions start as pending
          };
        });

        const { error: batchError } = await supabase
          .from('transactions')
          .insert(futureTransactions);

        if (batchError) throw batchError;

        // Reload transactions to get the newly created recurring ones
        loadTransactions();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const removeTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error removing transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Transaction) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update(updatedTransaction)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(
        transactions.map(t => (t.id === id ? updatedTransaction : t))
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const updateFinancialGoal = async (goal: Omit<FinancialGoal, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .upsert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setFinancialGoal({ ...data, deadline: new Date(data.deadline) });
    } catch (error) {
      console.error('Error updating financial goal:', error);
      throw error;
    }
  };

  const addAgreement = async (agreement: Omit<DebtAgreement, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('debt_agreements')
        .insert([{
          user_id: user.id,
          name: agreement.name,
          total_amount: agreement.totalAmount,
          installments: agreement.installments,
          start_date: agreement.startDate.toISOString(),
          notes: agreement.notes,
          status: agreement.status
        }])
        .select()
        .single();

      if (error) throw error;

      const newAgreement: DebtAgreement = {
        ...data,
        totalAmount: Number(data.total_amount),
        startDate: new Date(data.start_date),
        createdAt: new Date(data.created_at)
      };

      setAgreements([newAgreement, ...agreements]);
      
      // Update total debts when adding new agreement
      setTotalDebts(prevTotal => prevTotal + agreement.totalAmount);

      // Add first installment as a transaction
      await addTransaction({
        description: `Parcela 1/${agreement.installments} - ${agreement.name}`,
        category: 'Acordo de Dívida',
        date: agreement.startDate,
        amount: agreement.totalAmount / agreement.installments,
        type: 'expense',
        status: 'pending',
        recurring: 'recurring'
      });
    } catch (error) {
      console.error('Error adding agreement:', error);
      throw error;
    }
  };

  const updateAgreement = async (id: string, agreement: Partial<DebtAgreement>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('debt_agreements')
        .update({
          name: agreement.name,
          total_amount: agreement.totalAmount,
          installments: agreement.installments,
          start_date: agreement.startDate?.toISOString(),
          notes: agreement.notes,
          status: agreement.status
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedAgreement: DebtAgreement = {
        ...data,
        totalAmount: Number(data.total_amount),
        startDate: new Date(data.start_date),
        createdAt: new Date(data.created_at)
      };

      setAgreements(agreements.map(a => a.id === id ? updatedAgreement : a));
      
      // Update total debts
      const oldAgreement = agreements.find(a => a.id === id);
      if (oldAgreement && agreement.totalAmount) {
        setTotalDebts(prevTotal => prevTotal - oldAgreement.totalAmount + agreement.totalAmount);
      }
    } catch (error) {
      console.error('Error updating agreement:', error);
      throw error;
    }
  };

  const removeAgreement = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('debt_agreements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const removedAgreement = agreements.find(a => a.id === id);
      if (removedAgreement) {
        setTotalDebts(prevTotal => prevTotal - removedAgreement.totalAmount);
      }

      setAgreements(agreements.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error removing agreement:', error);
      throw error;
    }
  };

  const toggleSelectTransaction = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(tId => tId !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  const selectAllTransactions = () => {
    setSelectedTransactions(filteredTransactions.map(t => t.id));
  };

  const clearSelectedTransactions = () => {
    setSelectedTransactions([]);
  };

  const removeSelectedTransactions = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', selectedTransactions)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(transactions.filter(t => !selectedTransactions.includes(t.id)));
      setSelectedTransactions([]);
    } catch (error) {
      console.error('Error removing selected transactions:', error);
      throw error;
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        addTransaction,
        removeTransaction,
        updateTransaction,
        financialGoal,
        updateFinancialGoal,
        financialMoment,
        totalIncome,
        totalExpenses,
        balance,
        totalDebts,
        selectedTransactions,
        toggleSelectTransaction,
        selectAllTransactions,
        clearSelectedTransactions,
        removeSelectedTransactions,
        agreements,
        addAgreement,
        removeAgreement,
        updateAgreement,
        includeDebtsInExpenses,
        toggleIncludeDebtsInExpenses,
        selectedMonth,
        setSelectedMonth,
        addCategory
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};