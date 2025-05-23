import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestPayload {
  question: string;
  context: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    recentTransactions: any[];
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { question, context } = payload;

    // Initialize AI model
    const model = new Supabase.ai.Session('gte-small');

    // Generate response based on context
    const response = await generateResponse(question, context, model);

    return new Response(
      JSON.stringify({
        response,
        category: getCategoryFromQuestion(question),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});

async function generateResponse(
  question: string,
  context: RequestPayload['context'],
  model: any,
) {
  const prompt = `
    Como consultor financeiro, responda à seguinte pergunta considerando este contexto:
    - Saldo atual: R$ ${context.balance}
    - Renda total: R$ ${context.totalIncome}
    - Despesas totais: R$ ${context.totalExpenses}
 
    Pergunta: ${question}
    
    Forneça uma resposta profissional, clara e acionável em português.
  `;

  const embedding = await model.run(prompt);
  
  // Map the embedding to pre-defined responses based on similarity
  const response = mapToResponse(embedding, question, context);
  
  return response;
}

function getCategoryFromQuestion(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('investir') || lowerQuestion.includes('aplicar')) {
    return 'investment';
  } else if (lowerQuestion.includes('economi') || lowerQuestion.includes('gastar')) {
    return 'savings';
  } else if (lowerQuestion.includes('dívida') || lowerQuestion.includes('devendo')) {
    return 'debt';
  } else if (lowerQuestion.includes('renda') || lowerQuestion.includes('ganhar')) {
    return 'income';
  }
  
  return 'general';
}

function mapToResponse(
  embedding: number[],
  question: string,
  context: RequestPayload['context'],
): string {
  // Simplified response mapping based on financial context
  const { balance, totalIncome, totalExpenses } = context;
  const savingsRate = (totalIncome - totalExpenses) / totalIncome;
  
  if (balance < 0) {
    return `Observo que seu saldo está negativo. Recomendo priorizar o controle de gastos imediatamente. Comece cortando despesas não essenciais e crie um plano de emergência para recuperar seu saldo positivo. Uma estratégia eficaz é listar todos os gastos e identificar onde pode haver cortes.`;
  }
  
  if (savingsRate < 0.1) {
    return `Sua taxa de poupança está abaixo do ideal (${(savingsRate * 100).toFixed(1)}%). O recomendado é guardar pelo menos 10% da sua renda. Sugiro revisar seus gastos mensais e identificar oportunidades para aumentar sua economia. Comece com pequenas mudanças em categorias não essenciais.`;
  }
  
  if (savingsRate > 0.2) {
    return `Parabéns! Você está conseguindo poupar ${(savingsRate * 100).toFixed(1)}% da sua renda, o que é excelente. Agora é um bom momento para considerar investimentos de longo prazo. Diversifique seus investimentos entre renda fixa e variável de acordo com seu perfil de risco.`;
  }
  
  return `Com base na sua situação financeira atual, recomendo estabelecer metas claras de economia e criar um orçamento detalhado. Separe seus gastos por categorias e defina limites mensais. Isso ajudará você a ter mais controle e atingir seus objetivos financeiros.`;
}