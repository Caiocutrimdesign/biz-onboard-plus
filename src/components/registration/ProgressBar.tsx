import { motion } from 'framer-motion';

const STEP_LABELS = [
  'Início',
  'Identificação',
  'Endereço',
  'Veículo',
  'Plano',
  'Técnico',
  'Pagamento',
  'Revisão',
  'Avaliação',
  'Concluído',
];

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2 px-1">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">
            Progresso do Cadastro
          </span>
          <span className="text-sm font-display font-medium text-white/90">
            {STEP_LABELS[currentStep] || `Etapa ${currentStep + 1}`}
          </span>
        </div>
        <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
        <motion.div
          className="bg-gradient-brand absolute left-0 top-0 h-full rounded-full shadow-[0_0_15px_rgba(255,0,0,0.3)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

