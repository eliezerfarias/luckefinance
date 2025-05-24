import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../stripe-config';
import { createCheckoutSession } from '../../lib/stripe';
import { 
  Wallet, 
  LineChart, 
  Bot, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchase = async (productId: keyof typeof products) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const url = await createCheckoutSession(
        products[productId].priceId,
        products[productId].mode,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}`
      );
      
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-green-500" />
              <span className="ml-2 text-xl font-bold text-white">Lucke Finance</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-96">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Controle Financeiro do{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Futuro
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Transforme sua vida financeira com IA avançada e insights em tempo real.
              Tome decisões inteligentes e alcance seus objetivos.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center gap-2"
              >
                Comece Grátis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 -mt-72 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <LineChart className="w-8 h-8 text-green-500" />,
                title: 'Análise em Tempo Real',
                description: 'Acompanhe seus gastos e investimentos com atualizações instantâneas'
              },
              {
                icon: <Bot className="w-8 h-8 text-blue-500" />,
                title: 'IA Avançada',
                description: 'Receba recomendações personalizadas baseadas no seu perfil financeiro'
              },
              {
                icon: <Shield className="w-8 h-8 text-purple-500" />,
                title: 'Segurança Total',
                description: 'Seus dados protegidos com criptografia de ponta a ponta'
              },
              {
                icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
                title: 'Interface Intuitiva',
                description: 'Design moderno e fácil de usar para melhor experiência'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="bg-gray-700/50 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Escolha o Plano Perfeito para Você
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comece sua jornada para a liberdade financeira hoje mesmo com nossos planos acessíveis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {Object.entries(products).map(([id, product]) => (
              <div
                key={id}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">${product.price}</span>
                  <span className="text-gray-400 ml-2">
                    /{id.includes('Monthly') ? 'mês' : 'ano'}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(id as keyof typeof products)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Começar Agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;