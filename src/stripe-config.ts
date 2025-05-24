export const products = {
  'Lucke Finance Monthly': {
    priceId: 'price_1RSMp0RR2YB7AZJBugymp5co',
    name: 'Lucke Finance Monthly',
    description: 'Controle financeiro pessoal inteligente',
    price: 1,
    mode: 'subscription' as const,
    features: [
      'Dashboard financeiro completo',
      'Análise de gastos em tempo real',
      'Categorização automática',
      'Suporte via email'
    ]
  },
  'Lucke Finance Yearly': {
    priceId: 'price_1RSMp0RR2YB7AZJBugymp5co',
    name: 'Lucke Finance Yearly',
    description: 'Controle financeiro pessoal inteligente',
    price: 7.99,
    mode: 'subscription' as const,
    features: [
      'Todas as features do plano mensal',
      'Consultor financeiro AI',
      'Relatórios avançados',
      'Suporte prioritário 24/7',
      'Economia de 33%'
    ]
  }
} as const;