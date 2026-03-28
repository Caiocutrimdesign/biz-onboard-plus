import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onNewRegistration: () => void;
  onGoHome: () => void;
}

export function StepSuccess({ onNewRegistration, onGoHome }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-success/10"
      >
        <CheckCircle2 className="h-16 w-16 text-success" />
      </motion.div>
      <h2 className="font-display text-3xl font-bold md:text-4xl">
        Cadastro enviado com sucesso 🎉
      </h2>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Agora nossa equipe vai continuar sua ativação. Em breve entraremos em contato pelo WhatsApp.
      </p>
      <div className="mt-10 flex gap-4">
        <Button variant="outline" onClick={onGoHome} className="h-12 gap-2 px-6">
          <Home className="h-4 w-4" />
          Finalizar
        </Button>
        <Button onClick={onNewRegistration} className="bg-gradient-brand h-12 gap-2 px-6 text-primary-foreground">
          <RotateCcw className="h-4 w-4" />
          Novo Cadastro
        </Button>
      </div>
    </motion.div>
  );
}
