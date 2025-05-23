import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/calculations';

const FinancialGoal: React.FC = () => {
  const { financialGoal, updateFinancialGoal } = useFinancial();
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(financialGoal);

  const handleSave = () => {
    updateFinancialGoal(editedGoal);
    setIsEditing(false);
  };

  const progress = financialGoal.target > 0 
    ? Math.min(Math.round((financialGoal.current / financialGoal.target) * 100), 100)
    : 0;

  const currentDate = new Date();
  const month = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="bg-green-500 rounded-lg p-4 shadow transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Meta para {month} de {year}
        </h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-gray-900 text-white text-sm px-3 py-1 rounded hover:bg-gray-800 transition-colors"
        >
          {isEditing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="goalTitle" className="block text-sm font-medium text-gray-800">
              Título
            </label>
            <input
              id="goalTitle"
              type="text"
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm"
              value={editedGoal.title}
              onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="goalDescription" className="block text-sm font-medium text-gray-800">
              Descrição
            </label>
            <input
              id="goalDescription"
              type="text"
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm"
              value={editedGoal.description}
              onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="goalTarget" className="block text-sm font-medium text-gray-800">
              Valor da meta (R$)
            </label>
            <input
              id="goalTarget"
              type="number"
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm"
              value={editedGoal.target}
              onChange={(e) => setEditedGoal({ ...editedGoal, target: Number(e.target.value) })}
            />
          </div>
          <div>
            <label htmlFor="goalCurrent" className="block text-sm font-medium text-gray-800">
              Valor atual (R$)
            </label>
            <input
              id="goalCurrent"
              type="number"
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm"
              value={editedGoal.current}
              onChange={(e) => setEditedGoal({ ...editedGoal, current: Number(e.target.value) })}
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="mb-2">
            <h3 className="font-medium text-white">{financialGoal.title}</h3>
            <p className="text-sm text-gray-400">{financialGoal.description}</p>
          </div>
          
          {financialGoal.target > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progresso: {progress}%</span>
                <span>
                  {formatCurrency(financialGoal.current)} / {formatCurrency(financialGoal.target)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialGoal;