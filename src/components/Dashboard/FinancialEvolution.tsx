import React, { useState, useEffect } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { generateChartData } from '../../utils/calculations';
import Chart from '../UI/Chart';

const FinancialEvolution: React.FC = () => {
  const { 
    transactions, 
    totalIncome,
    totalExpenses,
    balance,
    totalDebts,
    includeDebtsInExpenses 
  } = useFinancial();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Use the same values from the cards for the current month
    const currentMonthData = {
      income: totalIncome,
      expenses: totalExpenses,
      balance: balance,
      debts: totalDebts
    };

    // Generate historical data for previous months
    const chartData = generateChartData(transactions, currentMonthData, includeDebtsInExpenses);
    setChartData(chartData);
  }, [transactions, totalIncome, totalExpenses, balance, totalDebts, includeDebtsInExpenses]);

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Evolução Financeira Mensal</h2>
        </div>
      </div>
      
      <div className="p-4 h-80">
        {chartData ? (
          <Chart data={chartData} type="line" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialEvolution;