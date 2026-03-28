import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/agents/types';

interface KnowledgeBase {
  [topic: string]: {
    answer: string;
    keywords: string[];
  };
}

const KNOWLEDGE_BASE: KnowledgeBase = {
  plano: {
    answer: 'Temos 3 planos disponíveis:\n\n🛡️ **Básico** - R$ 49,90/mês\n- Rastreamento básico\n- Alertas de velocidade\n- Suporte 8h/dia\n\n🚀 **Completo** - R$ 89,90/mês\n- Rastreamento em tempo real\n- Bloqueio remoto\n- Suporte 24h\n- App mobile\n\n🏢 **Frota** - R$ 149,90/mês por veículo\n- Tudo do Completo\n- Gestão de múltiplos veículos\n- Relatórios avançados\n- API integração',
    keywords: ['plano', 'preço', 'valor', 'custo', 'mensalidade', 'quanto custa'],
  },
  rastreamento: {
    answer: 'Nosso sistema de rastreamento funciona 24 horas por dia, 7 dias por semana! 🚗\n\n📍 **Como funciona:**\n1. Instalamos um dispositivo GPS no seu veículo\n2. Você acessa pelo app ou site\n3. Acompanhe em tempo real onde seu veículo está\n4. Receba alertas de movimento, cercas geográficas, etc.',
    keywords: ['rastrear', 'rastreamento', 'GPS', 'localizar', 'onde está'],
  },
  instalacao: {
    answer: 'A instalação é rápida e simples! ⚡\n\n⏱️ **Tempo:** Aproximadamente 2 horas\n\n📍 **Local:** Você pode trazer o veículo até nossa loja ou solicitar instalação em domicílio (consulte disponibilidade)\n\n📋 **Documentos necessários:**\n- Documento do veículo (CRLV)\n- Documento de identidade do proprietário',
    keywords: ['instalar', 'instalação', 'colocar', 'montar', 'colocado'],
  },
  bloqueio: {
    answer: 'Sim! Com o plano Completo ou Frota, você pode bloquear o veículo remotamente! 🔒\n\n⚡ **Como funciona:**\n1. Acesse o app ou ligue para nossa central\n2. Nossa equipe aciona o bloqueio\n3. O veículo para suavemente\n\n⚠️ **Importante:** O bloqueio só pode ser acionado com autorização do proprietário ou por ordem judicial.',
    keywords: ['bloquear', 'bloqueio', 'parar', 'desligar', 'imobilizar'],
  },
  seguro: {
    answer: 'O rastreamento Rastremix não é um seguro, mas ajuda a reduzir o valor do seu seguro veicular! 🛡️\n\n📉 **Economia:**\n- Muitos seguradoras oferecem até 30% de desconto\n- Comprovação de localização em caso de roubo\n- Recuperação mais rápida do veículo\n\n💡 **Dica:** Informe sua seguradora que você tem rastreamento Rastremix!',
    keywords: ['seguro', 'seguradora', 'proteção', 'cobertura'],
  },
  celular: {
    answer: 'Sim! Temos um app gratuito para Android e iPhone! 📱\n\n📲 **Funcionalidades do App:**\n- Rastreamento em tempo real\n- Histórico de percursos\n- Alertas no celular\n- Bloqueio remoto\n- Suporte via chat\n\n⬇️ Baixe na Play Store ou App Store!',
    keywords: ['celular', 'app', 'aplicativo', 'telefone', 'smartphone', 'android', 'iphone', 'ios'],
  },
  funcionando: {
    answer: 'Nosso sistema funciona em todo o território brasileiro! 🇧🇷\n\n📡 **Cobertura:**\n- 100% do Brasil\n- Funciona em áreas urbanas e rurais\n- Usa GPS + rede celular\n\n🌍 **No exterior:** O rastreamento funciona, mas o suporte pode ter limitações fora do Brasil.',
    keywords: ['funciona', 'cobertura', 'região', 'área', 'brasil', 'exterior'],
  },
  contato: {
    answer: 'Entre em contato conosco pelos canais: 📞\n\n📱 **Telefone:** (00) 0000-0000\n💬 **WhatsApp:** (00) 99999-9999\n📧 **E-mail:** contato@rastremix.com.br\n\n⏰ **Horário:** Segunda a Sexta, 8h às 18h\n🚨 **Emergências:** 24 horas',
    keywords: ['contato', 'telefone', 'ligar', 'falar', 'atendimento', 'whatsapp', 'email'],
  },
};

interface CustomerAgentConfig {
  enabled: boolean;
  autoRespond: boolean;
  maxMessages: number;
  greeting: string;
}

const DEFAULT_CONFIG: CustomerAgentConfig = {
  enabled: true,
  autoRespond: true,
  maxMessages: 50,
  greeting: 'Olá! 👋 Sou o assistente virtual da Rastremix. Como posso ajudá-lo hoje?',
};

export function useCustomerAgent(config: CustomerAgentConfig = DEFAULT_CONFIG) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (config.enabled && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: config.greeting,
        timestamp: new Date(),
      }]);
    }
  }, [config.enabled, config.greeting, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestAnswer = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword)) {
          return data.answer;
        }
      }
    }

    const followUp = [
      'Desculpe, não entendi completamente. 🤔\n\nPosso ajudar com:\n• Planos e preços\n• Rastreamento\n• Instalação\n• Bloqueio remoto\n• App mobile\n• Cobertura\n\nO que você gostaria de saber?',
      'Hmm, não tenho certeza sobre isso. 😅\n\nMas posso te ajudar com:\n• 📦 Nossos planos\n• 🛰️ Como funciona o rastreamento\n• ⚡ Instalação\n• 🔒 Bloqueio remoto\n\nMe conte o que precisa!',
    ];
    
    return followUp[Math.floor(Math.random() * followUp.length)];
  }, []);

  const generateResponse = useCallback(async (userMessage: string): Promise<string> => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    let response = findBestAnswer(userMessage);

    const needsHuman = ['falar com pessoa', 'atendente', 'humano', 'operador', 'especialista', 'encaminhar'];
    if (needsHuman.some(phrase => userMessage.toLowerCase().includes(phrase))) {
      response += '\n\n👤 Deseja ser transferido para um atendente humano? Digite "sim" para transferir.';
    }

    const isPositive = ['obrigado', 'muito bom', 'perfeito', 'entendi', 'show', 'legal', 'valeu'];
    if (isPositive.some(word => userMessage.toLowerCase().includes(word))) {
      response += '\n\n😊 Por nada! Se tiver mais dúvidas, estou aqui para ajudar!';
    }

    setIsTyping(false);
    return response;
  }, [findBestAnswer]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `${conversationId}-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    if (config.autoRespond) {
      const response = await generateResponse(content);
      
      const assistantMessage: ChatMessage = {
        id: `${conversationId}-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    }
  }, [content, conversationId, isTyping, config.autoRespond, generateResponse]);

  const clearConversation = useCallback(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: config.greeting,
      timestamp: new Date(),
    }]);
  }, [config.greeting]);

  const quickReplies = [
    { id: '1', label: '💰 Planos e Preços', message: 'Quero saber sobre os planos' },
    { id: '2', label: '🛰️ Como funciona', message: 'Como funciona o rastreamento?' },
    { id: '3', label: '⚡ Instalação', message: 'Como funciona a instalação?' },
    { id: '4', label: '📱 App', message: 'Tem app para celular?' },
  ];

  return {
    messages,
    isTyping,
    sendMessage,
    clearConversation,
    quickReplies,
    conversationId,
  };
}
