import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, Shield } from 'lucide-react';
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
import { generateSatisfactionLink } from '@/lib/whatsappService';
import { useData } from '@/contexts/DataContext';

const TOTAL_STEPS = 10;
const IDLE_TIMEOUT = 120000;

interface Props {
  onClose: () => void;
}

export function RegistrationFlow({ onClose }: Props) {
  const { currentStep, setStep, reset, data } = useRegistrationStore();
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const customerData = {
        full_name: data.full_name || 'Cliente',
        phone: data.phone || '',
        cpf_cnpj: data.cpf_cnpj || null,
        email: data.email || null,
        cep: data.cep || null,
        street: data.street || null,
        number: data.number || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,
        vehicle_type: data.vehicle_type || null,
        plate: data.plate || null,
        brand: data.brand || null,
        model: data.model || null,
        year: data.year || null,
        color: data.color || null,
        plan: data.plan || null,
        payment_method: data.payment_method || null,
        technician_id: data.technician_id || null,
        technician_name: data.technician_name || null,
        status: 'novo_cadastro',
      };

      try {
        await saveCustomer(customerData);
      } catch (saveErr: any) {
        console.warn('⚠️ Erro ao salvar:', saveErr.message);
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const leadData = {
            name: data.full_name || 'Cliente',
            email: data.email || null,
            phone: data.phone || '',
            company: null,
            document: data.cpf_cnpj || null,
            address: data.street ? `${data.street}, ${data.number}` : null,
            city: data.city || null,
            state: data.state || null,
            status: 'novo',
            source: 'website',
            priority: 'media',
            value: 0,
            tags: ['Novo Cadastro'],
            notes: `Veículo: ${data.brand || ''} ${data.model || ''} (${data.plate || ''})\nPlano: ${data.plan || ''}\nForma de pagamento: ${data.payment_method || ''}`,
            owner_id: null,
            pipeline_id: 'default',
            stage_id: 'stage-1',
          };

          await supabase.from('leads').insert(leadData);
        } catch (leadErr) {
          console.warn('⚠️ Erro ao criar lead:', leadErr);
        }
      }

      next();
    } catch (err: any) {
      console.error('❌ Erro no salvamento:', err);
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0B] overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-white leading-none">RASTREMIX</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Onboarding</span>
          </div>
        </div>
        
        {currentStep < TOTAL_STEPS - 1 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoHome} 
            className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </header>

      {/* Progress Section */}
      {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-4">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS - 1} />
        </div>
      )}

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20 mx-6 mt-4 p-4 glass-red rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-200 font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-start lg:justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 p-6 flex justify-center border-t border-white/5 bg-black/20">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium">
          Rastremix Enterprise Security System © 2024
        </p>
      </footer>
    </div>
  );
}

