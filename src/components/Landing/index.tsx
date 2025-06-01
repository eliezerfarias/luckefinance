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
  Sparkles,
  TrendingUp,
  PiggyBank,
  Target
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
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center gap-2 transform hover:scale-105 transition-all duration-300"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <LineChart className="w-8 h-8 text-green-500" />,
                title: 'Análise em Tempo Real',
                description: 'Acompanhe seus gastos e investimentos com atualizações instantâneas e gráficos interativos.'
              },
              {
                icon: <Bot className="w-8 h-8 text-blue-500" />,
                title: 'IA Avançada',
                description: 'Receba recomendações personalizadas baseadas no seu perfil financeiro e objetivos.'
              },
              {
                icon: <Shield className="w-8 h-8 text-purple-500" />,
                title: 'Segurança Total',
                description: 'Seus dados protegidos com criptografia de ponta a ponta e autenticação segura.'
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-red-500" />,
                title: 'Gestão de Investimentos',
                description: 'Acompanhe seu portfólio e receba insights para otimizar seus investimentos.'
              },
              {
                icon: <PiggyBank className="w-8 h-8 text-yellow-500" />,
                title: 'Metas Financeiras',
                description: 'Defina e acompanhe suas metas financeiras com planos personalizados.'
              },
              {
                icon: <Target className="w-8 h-8 text-indigo-500" />,
                title: 'Planejamento Futuro',
                description: 'Projete seu futuro financeiro com simulações e cenários personalizados.'
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
                className="bg-[#1a1f2e] rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
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
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(id as keyof typeof products)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                >
                  Começar Agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              O Que Nossos Usuários Dizem
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Descubra como o Lucke Finance está transformando a vida financeira de pessoas reais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Empresário",
                content: "O Lucke Finance revolucionou a forma como gerencio minhas finanças. A IA realmente faz a diferença!"
              },
              {
                name: "Ana Santos",
                role: "Investidora",
                content: "As análises em tempo real e as recomendações personalizadas são impressionantes. Melhor investimento que fiz!"
              },
              {
                name: "Pedro Costa",
                role: "Profissional Liberal",
                content: "Finalmente encontrei uma plataforma que combina simplicidade com recursos avançados. Recomendo!"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300"
              >
                <p className="text-gray-300 mb-4">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 font-bold">
                      {testimonial.name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Comece Sua Jornada Financeira Hoje
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já estão transformando suas finanças com o Lucke Finance
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-2 transform hover:scale-105 transition-all duration-300"
          >
            Começar Gratuitamente
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wallet className="w-6 h-6 text-green-500" />
                <span className="ml-2 text-lg font-bold text-white">Lucke Finance</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando o futuro das finanças pessoais com tecnologia e inteligência artificial.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Termos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lucke Finance. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;