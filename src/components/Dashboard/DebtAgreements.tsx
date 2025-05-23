import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { DebtAgreement } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { Plus, AlertCircle, Edit2, Trash2 } from 'lucide-react';

const DebtAgreements: React.FC = () => {
  const { agreements, addAgreement, removeAgreement, updateAgreement } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<DebtAgreement | null>(null);
  const [formData, setFormData] = useState<Partial<DebtAgreement>>({
    name: '',
    totalAmount: 0,
    installments: 1,
    startDate: new Date(),
    notes: '',
    status: 'active'
  });
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (agreement: DebtAgreement) => {
    setEditingAgreement(agreement);
    setFormData({
      ...agreement,
      startDate: new Date(agreement.startDate)
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.totalAmount || !formData.installments) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.totalAmount <= 0) {
      setError('O valor total deve ser maior que zero');
      return;
    }

    if (formData.installments <= 0) {
      setError('O número de parcelas deve ser maior que zero');
      return;
    }

    try {
      if (editingAgreement) {
        await updateAgreement(editingAgreement.id, formData as DebtAgreement);
      } else {
        await addAgreement(formData as DebtAgreement);
      }
      setShowForm(false);
      setEditingAgreement(null);
      setFormData({
        name: '',
        totalAmount: 0,
        installments: 1,
        startDate: new Date(),
        notes: '',
        status: 'active'
      });
    } catch (error) {
      setError('Erro ao processar acordo. Por favor, tente novamente.');
    }
  };

  const calculateInstallmentAmount = (totalAmount: number, installments: number) => {
    return totalAmount / installments;
  };

  const getRemainingInstallments = (agreement: DebtAgreement) => {
    if (agreement.status !== 'active') return 0;
    
    const startDate = new Date(agreement.startDate);
    const currentDate = new Date();
    const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (currentDate.getMonth() - startDate.getMonth());
    
    return Math.max(0, agreement.installments - monthsDiff);
  };

  function formatDateForInput(dateString: string | undefined | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Dívidas e Acordos Ativos</h2>
          <button
            onClick={() => {
              setEditingAgreement(null);
              setFormData({
                name: '',
                totalAmount: 0,
                installments: 1,
                startDate: new Date(),
                notes: '',
                status: 'active'
              });
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Acordo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h3 className="text-lg font-medium text-white mb-4">
            {editingAgreement ? 'Editar' : 'Novo'} Acordo de Pagamento
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nome do Acordo
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-300">
                Valor Total (R$)
              </label>
              <input
                type="number"
                id="totalAmount"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="installments" className="block text-sm font-medium text-gray-300">
                Número de Parcelas
              </label>
              <input
                type="number"
                id="installments"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                Data de Início
              </label>
              <input
                type="date"
                id="startDate"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                value={formatDateForInput(formData.startDate?.toString())}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Observações
              </label>
              <textarea
                id="notes"
                rows={3}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAgreement(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                {editingAgreement ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Valor Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Valor Parcela
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Parcelas Restantes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Início
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {agreements.length > 0 ? (
              agreements.map((agreement) => {
                const remainingInstallments = getRemainingInstallments(agreement);
                const installmentAmount = calculateInstallmentAmount(agreement.totalAmount, agreement.installments);
                
                return (
                  <tr key={agreement.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>
                        <p className="font-medium">{agreement.name}</p>
                        {agreement.notes && (
                          <p className="text-xs text-gray-400 mt-1">{agreement.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(agreement.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(installmentAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {remainingInstallments} / {agreement.installments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(agreement.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agreement.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : agreement.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {agreement.status === 'active' ? 'Ativo' :
                         agreement.status === 'completed' ? 'Concluído' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(agreement)}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeAgreement(agreement.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">
                  Nenhum acordo cadastrado. Clique em "Novo Acordo" para adicionar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DebtAgreements;