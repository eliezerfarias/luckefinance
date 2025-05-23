import React, { useState, useEffect } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { getFinancialAdvice } from '../../utils/calculations';
import { supabase } from '../../lib/supabase';
import { Brain, ThumbsUp, ThumbsDown } from 'lucide-react';

const AIFinancialAdvisor: React.FC = () => {
  const { balance, totalIncome, totalExpenses, transactions } = useFinancial();
  const [advice, setAdvice] = useState<string[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [conversation, setConversation] = useState<{ isUser: boolean; text: string; id?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAdvice(getFinancialAdvice(balance, totalIncome, totalExpenses, transactions));
    loadSavedSuggestions();
  }, [balance, totalIncome, totalExpenses, transactions]);

  const loadSavedSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setConversation(data.map(suggestion => ({
          isUser: false,
          text: suggestion.content,
          id: suggestion.id
        })));
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSendQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setIsLoading(true);
    setConversation(prev => [...prev, { isUser: true, text: userQuestion }]);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-advisor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          context: {
            balance,
            totalIncome,
            totalExpenses,
            recentTransactions: transactions.slice(0, 5)
          }
        })
      });

      const data = await response.json();
      
      const { data: suggestion, error } = await supabase
        .from('ai_suggestions')
        .insert({
          content: data.response,
          category: data.category || 'general'
        })
        .select()
        .single();

      if (error) throw error;

      setConversation(prev => [...prev, { 
        isUser: false, 
        text: data.response,
        id: suggestion.id
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setConversation(prev => [...prev, { 
        isUser: false, 
        text: 'Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
      setUserQuestion('');
    }
  };

  const handleFeedback = async (suggestionId: string, isHelpful: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ is_helpful: isHelpful })
        .eq('id', suggestionId);

      if (error) throw error;

      setConversation(prev =>
        prev.map(msg =>
          msg.id === suggestionId
            ? { ...msg, feedbackGiven: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <Brain className="w-5 h-5 text-green-500" />
        <div>
          <h2 className="text-lg font-semibold text-white">
            Seu Consultor Financeiro AI
          </h2>
          <p className="text-sm text-gray-400">
            Tire suas dúvidas sobre finanças pessoais
          </p>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4">
        <div className="mb-4">
          <h3 className="text-md font-medium text-white mb-2">
            Recomendações personalizadas:
          </h3>
          <ul className="space-y-1 text-sm text-gray-400">
            {advice.map((item, index) => (
              <li key={index} className="flex items-baseline gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <p>Faça uma pergunta para começar a conversa com o assistente.</p>
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                      msg.isUser
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {!msg.isUser && msg.id && !msg.feedbackGiven && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <button
                          onClick={() => handleFeedback(msg.id!, true)}
                          className="p-1 hover:text-green-500 transition-colors"
                          title="Útil"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id!, false)}
                          className="p-1 hover:text-red-500 transition-colors"
                          title="Não útil"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Como posso melhorar minhas finanças?"
              className="flex-1 rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
            />
            <button
              onClick={handleSendQuestion}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white transition-colors`}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFinancialAdvisor;