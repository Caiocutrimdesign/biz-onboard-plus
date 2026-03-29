import { motion } from 'framer-motion';
import { MessageCircle, Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  onNext: () => void;
  onBack: () => void;
  onWhatsApp: () => void;
  customerName: string;
}

export function StepSatisfaction({ onNext, onBack, onWhatsApp, customerName }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Cadastro Concluído!</h2>
        <p className="text-muted-foreground">
          {customerName}, seu cadastro foi recebido com sucesso!
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          Compartilhe sua experiência
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Gostaríamos de saber como foi sua experiência com nosso atendimento. 
          Sua opinião é muito importante para melhorarmos sempre!
        </p>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { emoji: '😊', label: 'Ótimo', color: 'bg-green-100 hover:bg-green-200' },
            { emoji: '😐', label: 'Regular', color: 'bg-yellow-100 hover:bg-yellow-200' },
            { emoji: '😞', label: 'Ruim', color: 'bg-red-100 hover:bg-red-200' },
          ].map((item) => (
            <button
              key={item.label}
              className={`p-4 rounded-xl ${item.color} text-center transition-all`}
            >
              <span className="text-3xl mb-1 block">{item.emoji}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={onWhatsApp}
          className="w-full bg-green-500 hover:bg-green-600 text-white h-14"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Enviar Feedback via WhatsApp
        </Button>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          onClick={onNext}
          className="flex-1"
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Finalizar
        </Button>
      </div>
    </motion.div>
  );
}
