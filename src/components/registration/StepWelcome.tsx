import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center px-6 text-center"
    >
      <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
        Vamos ativar sua proteção
      </h2>
      <p className="mt-3 text-lg text-muted-foreground">
        de forma rápida e prática 🚗
      </p>
      <p className="mt-6 max-w-md text-muted-foreground">
        Em poucos minutos você completa seu cadastro e nossa equipe dá
        continuidade à ativação do seu rastreador.
      </p>
      <Button
        size="lg"
        onClick={onNext}
        className="bg-gradient-brand shadow-brand mt-10 h-14 px-10 text-lg font-semibold text-primary-foreground"
      >
        Começar
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
}
