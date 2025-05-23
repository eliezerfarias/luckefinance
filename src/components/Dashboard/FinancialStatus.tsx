import React from 'react';
import { FinancialMoment } from '../../types';

const statusDescriptions: Record<FinancialMoment, string> = {
  'saudável': 'Como os antigos mercadores da Babilônia, você está construindo sua fortuna com sabedoria. Lembre-se: "Uma parte de tudo que você ganha é seu para guardar." Continue investindo em seu futuro.',
  'equilibrado': 'Você está no caminho certo, como aprendemos com Arkad: "O ouro multiplica-se rapidamente para o homem que possui uma quantia crescente pela qual ele continua a ganhar mais ouro." Foque em aumentar sua margem de poupança.',
  'endividado': 'Como ensina O Homem Mais Rico da Babilônia: "Melhor é pouco cautela que muito arrependimento." Crie um plano para quitar suas dívidas e comece a construir sua riqueza hoje.'
};

const statusColors: Record<FinancialMoment, string> = {
  'saudável': 'bg-green-500',
  'equilibrado': 'bg-yellow-500',
  'endividado': 'bg-red-500'
};

const statusButtonTexts: Record<FinancialMoment, string[]> = {
  'saudável': ['Investir', 'Poupar', 'Multiplicar', 'Prosperar'],
  'equilibrado': ['Controlar', 'Planejar', 'Economizar', 'Crescer'],
  'endividado': ['Reduzir', 'Quitar', 'Organizar', 'Recuperar']
};

const financialTips: Record<FinancialMoment, string[]> = {
  'saudável': [
    '"Pague-se primeiro" - Separe 10% de toda sua renda para investimentos',
    'Diversifique seus investimentos como os mercadores da Babilônia',
    'Busque oportunidades de multiplicar sua renda com sabedoria',
    'Proteja seu patrimônio com investimentos seguros'
  ],
  'equilibrado': [
    'Mantenha registros detalhados de todas as suas despesas',
    'Viva com menos do que ganha, como ensina Arkad',
    'Estabeleça um orçamento rigoroso e siga-o fielmente',
    'Procure formas de aumentar sua renda atual'
  ],
  'endividado': [
    'Pare de contrair novas dívidas imediatamente',
    'Crie um plano de pagamento para cada dívida',
    'Corte todas as despesas não essenciais',
    'Busque fontes adicionais de renda para acelerar o pagamento'
  ]
};

interface FinancialStatusProps {
  status: FinancialMoment;
}

const FinancialStatus: React.FC<FinancialStatusProps> = ({ status }) => {
  return (
    <div className="bg-green-500 rounded-lg overflow-hidden shadow">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Seu momento financeiro
        </h2>
        <p className="text-sm text-gray-800">
          Baseado nos princípios dos mercadores da Babilônia
        </p>
      </div>
      
      <div className="bg-gray-900 p-4">
        <div className="flex gap-2 mb-4">
          {statusButtonTexts[status].map((text, index) => (
            <span
              key={index}
              className={`${
                statusColors[status]
              } text-xs text-gray-900 px-3 py-1 rounded-full font-medium`}
            >
              {text}
            </span>
          ))}
        </div>
        
        <p className="text-sm text-gray-300 mb-3">
          <span className="font-bold text-white">
            Você está: {' '}
            <span className={`text-${status === 'saudável' ? 'green' : status === 'equilibrado' ? 'yellow' : 'red'}-500`}>
              {status}
            </span>
          </span>
        </p>
        
        <p className="text-sm text-gray-400 mb-4">
          {statusDescriptions[status]}
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white mb-2">
            Sabedoria Financeira:
          </h3>
          {financialTips[status].map((tip, index) => (
            <p key={index} className="text-sm text-gray-400 flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              {tip}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialStatus;