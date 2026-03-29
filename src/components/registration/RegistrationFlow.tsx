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
import { StepPayment } from './StepPayment';
import { StepNotes } from './StepNotes';
import { StepSuccess } from './StepSuccess';
import { useRegistrationStore } from '@/store/registrationStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const TOTAL_STEPS = 8;
const IDLE_TIMEOUT = 120000;

interface Props {
  onClose: () => void;
}

interface CustomerData {
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
  status: string;
  created_at: string;
}

export function RegistrationFlow({ onClose }: Props) {
  const { currentStep, setStep, reset, data } = useRegistrationStore();
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

  const saveToLocalStorage = (customerData: CustomerData) => {
    const existing = JSON.parse(localStorage.getItem('rastremix_customers') || '[]');
    existing.push({
      ...customerData,
      id: `local-${Date.now()}`,
      synced: false,
    });
    localStorage.setItem('rastremix_customers', JSON.stringify(existing));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const customerData: CustomerData = {
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
        status: 'novo_cadastro',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured() && supabase) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert(customerData);

        if (customerError) {
          console.error('Erro ao salvar no Supabase:', customerError);
          throw customerError;
        }

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

        await supabase.from('leads').insert(leadData);
        
        console.log('✅ Cadastro salvo no Supabase com sucesso!');
      } else {
        console.warn('⚠️ Supabase não configurado, salvando localmente...');
        saveToLocalStorage(customerData);
        console.log('✅ Cadastro salvo localmente!');
      }

      next();
    } catch (err: any) {
      console.error('Erro completo:', err);
      
      const customerData: CustomerData = {
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
        status: 'novo_cadastro',
        created_at: new Date().toISOString(),
      };
      
      saveToLocalStorage(customerData);
      
      console.log('✅ Cadastro salvo localmente como fallback!');
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
          {currentStep === 5 && <StepPayment key="payment" onNext={next} onBack={back} />}
          {currentStep === 6 && <StepNotes key="notes" onNext={handleSubmit} onBack={back} isSubmitting={isSubmitting} />}
          {currentStep === 7 && <StepSuccess key="success" onNewRegistration={handleNewRegistration} onGoHome={handleGoHome} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
