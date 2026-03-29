interface CustomerData {
  full_name: string;
  phone: string;
  email?: string;
  vehicle?: string;
  plate?: string;
  plan?: string;
  city?: string;
  state?: string;
}

export function generateWhatsAppLink(customer: CustomerData): string {
  const phone = customer.phone?.replace(/\D/g, '') || '';
  
  const message = `🚗 *Olá, ${customer.full_name}!*

Seu cadastro na *Rastremix* foi realizado com sucesso!

📋 *Resumo:*
• Veículo: ${customer.vehicle || 'Não informado'}
• Placa: ${customer.plate || 'Não informada'}
• Plano: ${customer.plan || 'Não informado'}
• Localização: ${customer.city || ''}${customer.state ? ` - ${customer.state}` : ''}

📞 Nossa equipe entrará em contato em breve!

Agradecemos a confiança! 💚`;

  const encodedMessage = encodeURIComponent(message);
  
  const phoneNumber = phone.length > 10 
    ? `55${phone}` 
    : `55${phone}`;

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

export function generateSatisfactionLink(customerName: string, registrationId?: string): string {
  const message = `🌟 *Pesquisa de Satisfação - Rastremix*

Olá, ${customerName}!

Gostaríamos de saber sua opinião sobre o atendimento!

Por favor, responda brevemente:

1️⃣ Como foi seu atendimento?
   😊 Ótimo | 😐 Regular | 😞 Ruim

2️⃣ Our equipe entrou em contato?
   ✅ Sim | ⏳ Ainda não

3️⃣ Alguma sugestão?

Obrigado pela colaboração! 💚`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
}
