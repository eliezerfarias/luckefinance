import { FinancialMoment, Transaction } from '../types';

export const calculateFinancialStatus = (
  balance: number, 
  income: number, 
  expenses: number
): FinancialMoment => {
  if (income === 0) return 'equilibrado';
  
  const expenseToIncomeRatio = expenses / income;
  
  if (balance <= 0) {
    return 'endividado';
  } else if (expenseToIncomeRatio >= 0.8) {
    return 'equilibrado';
  } else {
    return 'saudável';
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

interface CurrentMonthData {
  income: number;
  expenses: number;
  balance: number;
  debts: number;
}

export const generateChartData = (
  transactions: Transaction[], 
  currentMonthData: CurrentMonthData,
  includeDebtsInExpenses: boolean
) => {
  const now = new Date();
  const months = Array(12)
    .fill(0)
    .map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    })
    .reverse();

  const labels = months.map(
    d => d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  );

  const monthlyData = months.map((month, index) => {
    // Use current month data for the last month
    if (index === months.length - 1) {
      return {
        income: currentMonthData.income,
        expenses: currentMonthData.expenses,
        balance: currentMonthData.balance,
        debts: currentMonthData.debts
      };
    }

    // Calculate data for each month independently
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === month.getMonth() &&
        tDate.getFullYear() === month.getFullYear() &&
        t.status === 'completed' // Only consider completed transactions
      );
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyDebtPayment = includeDebtsInExpenses ? currentMonthData.debts : 0;
    const totalMonthExpenses = monthExpenses + monthlyDebtPayment;
    const monthBalance = monthIncome - totalMonthExpenses;

    return {
      income: monthIncome,
      expenses: totalMonthExpenses,
      balance: monthBalance,
      debts: currentMonthData.debts
    };
  });

  return {
    labels,
    datasets: [
      {
        label: 'Receitas',
        data: monthlyData.map(d => d.income),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Despesas',
        data: monthlyData.map(d => d.expenses),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Saldo',
        data: monthlyData.map(d => d.balance),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Dívidas',
        data: monthlyData.map(d => d.debts),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: false,
      }
    ],
  };
};

export const getFinancialAdvice = (
  balance: number,
  income: number,
  expenses: number,
  transactions: Transaction[]
): string[] => {
  const advices: string[] = [];
  
  if (balance < 0) {
    advices.push('Cortar todos os gastos não essenciais por um mês');
  }
  
  if (expenses > income * 0.8) {
    advices.push('Criar um orçamento básico com valores para cada categoria');
  }
  
  const categories = transactions
    .filter(t => t.type === 'expense')
    .reduce((cats, t) => {
      if (!cats[t.category]) {
        cats[t.category] = 0;
      }
      cats[t.category] += t.amount;
      return cats;
    }, {} as Record<string, number>);
  
  const totalByCategory = Object.entries(categories);
  totalByCategory.sort((a, b) => b[1] - a[1]);
  
  if (totalByCategory.length > 0) {
    const [topCategory, topAmount] = totalByCategory[0];
    
    if (topAmount > income * 0.3) {
      advices.push(`Reduzir gastos com ${topCategory} (${formatCurrency(topAmount)})`);
    }
  }
  
  if (income > 0 && balance > 0) {
    const savingsRate = balance / income;
    
    if (savingsRate < 0.1) {
      advices.push('Separar pelo menos 10% da sua renda para emergências');
    } else if (savingsRate >= 0.2) {
      advices.push('Considerar investimentos para o seu dinheiro guardado');
    }
  }
  
  if (advices.length === 0) {
    advices.push('Criar um orçamento básico para cada categoria de gastos');
    advices.push('Separar pelo menos 10% da sua renda para emergências');
  }
  
  return advices.slice(0, 4);
};