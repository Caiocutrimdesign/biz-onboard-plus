import { supabase, isSupabaseConfigured } from './supabase';

interface EmailData {
  to: string;
  customerName: string;
  plan?: string;
  vehicle?: string;
  plate?: string;
}

const EMAIL_CONFIG = {
  from: 'Rastremix <nao-responda@rastremix.com.br>',
  company: 'Rastremix',
  website: 'https://rastremix.com.br',
  phone: '(98) 99999-9999',
};

export async function sendWelcomeEmail(data: EmailData): Promise<boolean> {
  try {
    if (!data.to || !data.to.includes('@')) {
      console.log('📧 Email inválido, pulando envio...');
      return false;
    }

    const html = generateWelcomeEmailTemplate(data);

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.to,
          subject: `Bem-vindo à Rastremix, ${data.customerName}! 🚗`,
          html,
        },
      });

      if (error) {
        console.error('Erro ao enviar email via Supabase:', error);
        return false;
      }
      console.log('✅ Email enviado com sucesso via Supabase!');
      return true;
    }

    console.log('📧 Supabase não configurado para emails');
    console.log('📧 Email que seria enviado:', {
      to: data.to,
      subject: `Bem-vindo à Rastremix, ${data.customerName}!`,
    });
    return false;
  } catch (err) {
    console.error('Erro no serviço de email:', err);
    return false;
  }
}

function generateWelcomeEmailTemplate(data: EmailData): string {
  const planText = data.plan ? getPlanDescription(data.plan) : 'Rastreio Veicular';
  const vehicleInfo = data.vehicle ? `${data.vehicle}` : '';
  const plateInfo = data.plate ? ` (Placa: ${data.plate})` : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Rastremix</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 50%, #db2777 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🚗 Bem-vindo à Rastremix!
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 16px;">
                Seu veículo agora está mais seguro do que nunca
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Saudação -->
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">
                Olá, ${data.customerName}! 👋
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Sua solicitação de proteção veicular foi recebida com sucesso! 
                Nossa equipe entrará em contato em breve para dar continuidade ao seu cadastro.
              </p>
              
              <!-- Info Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #ea580c; margin: 0 0 15px; font-size: 18px;">
                      📋 Resumo do seu cadastro
                    </h3>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong style="color: #374151;">Plano escolhido:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">
                          ${planText}
                        </td>
                      </tr>
                      ${vehicleInfo ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong style="color: #374151;">Veículo:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">
                          ${vehicleInfo}
                        </td>
                      </tr>
                      ` : ''}
                      ${plateInfo ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong style="color: #374151;">Placa:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">
                          ${data.plate}
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong style="color: #374151;">Status:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                            ✅ Recebido
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- O que vem agora -->
              <h3 style="color: #1f2937; margin: 30px 0 15px; font-size: 18px;">
                📅 O que acontece agora?
              </h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                ${generateStepRow('1', 'Nossa equipe analisa seu cadastro', 'Verificamos todas as informações e preparemos sua proposta personalizada.')}
                ${generateStepRow('2', 'Entramos em contato com você', 'Em breve você receberá uma ligação ou mensagem para finalizar o processo.')}
                ${generateStepRow('3', 'Instalação do equipamento', 'Após aprovação, agendamos a instalação gratuita do rastreador.')}
                ${generateStepRow('4', 'Proteção ativada!', 'Seu veículo estará protegido 24 horas por dia, 7 dias por semana.')}
              </table>
              
              <!-- Benefícios -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #16a34a; margin: 0 0 15px; font-size: 18px;">
                      ✨ Com a Rastremix você tem:
                    </h3>
                    <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 2;">
                      <li>Rastreamento em tempo real 24h</li>
                      <li>Cobertura em todo o Brasil</li>
                      <li>Bloqueio remoto do veículo</li>
                      <li>Central de atendimento 24h</li>
                      <li>App gratuito para seu celular</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- Contato -->
              <div style="background: #1f2937; border-radius: 12px; padding: 25px; margin-top: 30px; text-align: center;">
                <p style="color: #ffffff; margin: 0 0 15px; font-size: 16px;">
                  Dúvidas? Estamos aqui para ajudar!
                </p>
                <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                  📞 ${EMAIL_CONFIG.phone}<br>
                  💬 WhatsApp disponível 24h
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px; font-size: 12px;">
                Este é um email automático. Por favor, não responda.
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 11px;">
                Rastremix - Proteção Veicular Inteligente<br>
                São Luís, Maranhão - Brasil<br>
                <a href="${EMAIL_CONFIG.website}" style="color: #f97316;">${EMAIL_CONFIG.website}</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

function generateStepRow(number: string, title: string, description: string): string {
  return `
    <tr>
      <td style="padding: 10px 0; vertical-align: top;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316, #dc2626); border-radius: 50%; width: 28px; height: 28px; text-align: center; vertical-align: middle;">
              <span style="color: white; font-size: 12px; font-weight: bold;">${number}</span>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding: 10px 0 10px 15px;">
        <p style="color: #1f2937; margin: 0; font-size: 14px; font-weight: 600;">
          ${title}
        </p>
        <p style="color: #6b7280; margin: 5px 0 0; font-size: 13px;">
          ${description}
        </p>
      </td>
    </tr>
  `;
}

function getPlanDescription(plan: string): string {
  const plans: Record<string, string> = {
    basico: 'Rastreio Básico - R$ 49/mês',
    bloqueio: 'Rastreio + Bloqueio - R$ 79/mês',
    completo: 'Rastreio Completo - R$ 129/mês',
    frota: 'Plano Frota - Sob consulta',
  };
  return plans[plan] || plan;
}

export async function sendConfirmationEmail(to: string, customerName: string): Promise<boolean> {
  return sendWelcomeEmail({
    to,
    customerName,
    plan: undefined,
    vehicle: undefined,
    plate: undefined,
  });
}
