import { motion } from 'framer-motion';

const STEP_LABELS = [
  'Início',
  'Dados',
  'Endereço',
  'Veículo',
  'Plano',
  'Pagamento',
  'Observações',
  'Confirmação',
];

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full px-4">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="bg-gradient-brand absolute left-0 top-0 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {STEP_LABELS[currentStep] || `Etapa ${currentStep + 1}`}
        </span>
        <span className="text-xs text-muted-foreground">
          {currentStep + 1} de {totalSteps}
        </span>
      </div>
    </div>
  );
}
