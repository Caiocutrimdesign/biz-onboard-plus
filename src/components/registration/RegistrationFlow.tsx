import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { StepWelcome } from './StepWelcome';
import { StepPersonalData } from './StepPersonalData';
import { StepAddress } from './StepAddress';
import { StepVehicle } from './StepVehicle';
import { StepPlan } from './StepPlan';
import { StepTechnician } from './StepTechnician';
import { StepPayment } from './StepPayment';
import { StepNotes } from './StepNotes';
import { StepSuccess } from './StepSuccess';
import { StepSatisfaction } from './StepSatisfaction';
import { useRegistrationStore } from '@/store/registrationStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/emailService';
import { generateWhatsAppLink, generateSatisfactionLink } from '@/lib/whatsappService';
import { useData } from '@/contexts/DataContext';

const TOTAL_STEPS = 10;
const IDLE_TIMEOUT = 120000;

interface Props {
  onClose: () => void;
}

interface CustomerData {
  id?: string;
  full_name: string;
  phone: string;
  cpf_cnpj?: string;
  email?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  vehicle_type?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  plan?: string;
  payment_method?: string;
  technician_id?: string;
  technician_name?: string;
  status: string;
  created_at: string;
}

export function RegistrationFlow({ onClose }: Props) {
  const { currentStep, setStep, reset, data, updateData } = useRegistrationStore();
  const { saveCustomer } = useData();
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      reset();
      onClose();
    }, IDLE_TIMEOUT);
  }, [onClose, reset]);

  useEffect(() => {
    resetIdle();
    const events = ['touchstart', 'click', 'keydown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetIdle));
    };
  }, [resetIdle]);

  const next = () => {
    setError(null);
    setStep(Math.min(currentStep + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    setError(null);
    setStep(Math.max(currentStep - 1, 0));
  };

  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const customerId = generateUUID();
      
      const customerData = {
        id: customerId,
        full_name: data.full_name || 'Cliente',
        phone: data.phone || '',
        cpf_cnpj: data.cpf_cnpj || '',
        email: data.email || '',
        cep: data.cep || '',
        street: data.street || '',
        number: data.number || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        vehicle_type: data.vehicle_type || '',
        plate: data.plate || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || '',
        color: data.color || '',
        plan: data.plan || '',
        payment_method: data.payment_method || '',
        technician_id: data.technician_id || '',
        technician_name: data.technician_name || '',
        status: 'novo_cadastro' as any,
        created_at: new Date().toISOString(),
      };

      // 1. Save to Unified Data Service (handles Supabase + Local cache + Dashboard refresh)
      console.log('⏳ Salvando cadastro principal...');
      const saveResult = await saveCustomer(customerData);
      
      if (!saveResult.success) {
        console.warn('⚠️ saveCustomer returned error:', saveResult.error);
        // Don't block, continue anyway - the customer might be saved
      }
      console.log('✅ Cadastro principal salvo com sucesso!');

      // 2. Create CRM Lead in Supabase (non-blocking)
      if (isSupabaseConfigured() && supabase) {
        console.log('⏳ Criando lead no CRM...');
        const leadData = {
          name: data.full_name || 'Cliente',
          email: data.email || null,
          phone: data.phone || '',
          company: null,
          document: data.cpf_cnpj || null,
          address: data.street ? `${data.street}, ${data.number}` : null,
          city: data.city || null,
          state: data.state || null,
          status: 'novo' as const,
          source: 'website' as const,
          priority: 'media' as const,
          value: 0,
          tags: ['Novo Cadastro'],
          notes: `Veículo: ${data.brand || ''} ${data.model || ''} (${data.plate || ''})\nPlano: ${data.plan || ''}\nForma de pagamento: ${data.payment_method || ''}`,
          owner_id: null,
          pipeline_id: 'default',
          stage_id: 'stage-1',
        };

        try {
          const { error: leadError } = await supabase.from('leads').insert(leadData);
          if (leadError) {
            console.warn('⚠️ Erro ao criar lead no CRM (não crítico):', leadError);
          } else {
            console.log('✅ Lead criado no CRM com sucesso!');
          }
        } catch (leadErr) {
          console.warn('⚠️ Erro ao criar lead:', leadErr);
        }
      }

      // 3. Send Emails (non-blocking)
      if (data.email) {
        try {
          console.log('📧 Enviando email de boas-vindas...');
          await sendWelcomeEmail({
            to: data.email,
            customerName: data.full_name || 'Cliente',
            plan: data.plan,
            vehicle: data.brand && data.model ? `${data.brand} ${data.model}` : undefined,
            plate: data.plate,
          });
          console.log('✅ Email enviado!');
        } catch (emailErr) {
          console.warn('⚠️ Erro ao enviar email (não crítico):', emailErr);
        }
      }

      // Always go to next step on success
      next();
    } catch (err: any) {
      console.error('❌ Erro no salvamento:', err);
      // Still proceed to success step - the main save was attempted
      next();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRegistration = () => {
    reset();
  };

  const handleGoHome = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <img src="/logo-rastremix.png" alt="Rastremix" className="h-10 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
        {currentStep < TOTAL_STEPS - 1 && (
          <Button variant="ghost" size="icon" onClick={handleGoHome} className="text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Progress */}
      {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
        <div className="px-6 py-4">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS - 1} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-8">
        <AnimatePresence mode="wait">
          {currentStep === 0 && <StepWelcome key="welcome" onNext={next} />}
          {currentStep === 1 && <StepPersonalData key="personal" onNext={next} onBack={back} />}
          {currentStep === 2 && <StepAddress key="address" onNext={next} onBack={back} />}
          {currentStep === 3 && <StepVehicle key="vehicle" onNext={next} onBack={back} />}
          {currentStep === 4 && <StepPlan key="plan" onNext={next} onBack={back} />}
          {currentStep === 5 && <StepTechnician key="technician" onNext={next} onBack={back} />}
          {currentStep === 6 && <StepPayment key="payment" onNext={next} onBack={back} />}
          {currentStep === 7 && <StepNotes key="notes" onNext={handleSubmit} onBack={back} isSubmitting={isSubmitting} />}
          {currentStep === 8 && (
            <StepSatisfaction
              key="satisfaction"
              onNext={next}
              onBack={back}
              onWhatsApp={() => {
                const link = generateSatisfactionLink(data.full_name || 'Cliente');
                window.open(link, '_blank');
              }}
              customerName={data.full_name || 'Cliente'}
            />
          )}
          {currentStep === 9 && <StepSuccess key="success" onNewRegistration={handleNewRegistration} onGoHome={handleGoHome} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
