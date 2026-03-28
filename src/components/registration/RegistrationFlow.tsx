import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
import logo from '@/assets/logo-rastremix.png';

const TOTAL_STEPS = 8;
const IDLE_TIMEOUT = 120000; // 2 minutes

interface Props {
  onClose: () => void;
}

export function RegistrationFlow({ onClose }: Props) {
  const { currentStep, setStep, reset } = useRegistrationStore();
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

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

  const next = () => setStep(Math.min(currentStep + 1, TOTAL_STEPS - 1));
  const back = () => setStep(Math.max(currentStep - 1, 0));

  const handleSubmit = () => {
    // In future: save to database here
    next();
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
        <img src={logo} alt="Rastremix" className="h-8 w-auto" />
        {currentStep < TOTAL_STEPS - 1 && (
          <Button variant="ghost" size="icon" onClick={handleGoHome} className="text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </header>

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
          {currentStep === 6 && <StepNotes key="notes" onNext={handleSubmit} onBack={back} />}
          {currentStep === 7 && <StepSuccess key="success" onNewRegistration={handleNewRegistration} onGoHome={handleGoHome} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
