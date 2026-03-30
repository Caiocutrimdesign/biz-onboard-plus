import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, CheckCircle, Camera, 
  Trash2, Save, FileText, Loader2, Pen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from 'react-signature-canvas';
import { Service, PhotoType } from '@/types/tec';

interface FinalizeViewProps {
  service: Partial<Service>;
  onBack: () => void;
  onSave: (observations: string, signature: string) => void;
  onUploadPhoto: (file: File, type: PhotoType) => Promise<string | null>;
}

export function FinalizeView({ service, onBack, onSave, onUploadPhoto }: FinalizeViewProps) {
  const [observations, setObservations] = useState('');
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const sigPad = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearSignature = () => sigPad.current?.clear();

  const handleFinalize = () => {
    if (sigPad.current?.isEmpty()) {
      alert('A assinatura do cliente é obrigatória!');
      return;
    }
    const signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
    onSave(observations, signatureData || '');
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading('depois');
    const url = await onUploadPhoto(file, 'depois');
    setUploading(null);
    
    // In a real app we would update the service photos here
    // But for simplicity in this flow, we assume the parent handles it
  };

  const photosFinal = (service.photos || []).filter(p => p.type === 'depois');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Finalizar Atendimento</h1>
          <p className="text-sm text-muted-foreground">{service.client_name}</p>
        </div>
      </div>

      {/* Checklist / Final Photos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Fotos Finais (Instalação)</h2>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 border-orange-200"
            onClick={handlePhotoClick}
            disabled={uploading === 'depois'}
          >
            {uploading === 'depois' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-orange-600" />}
            Adicionar
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {photosFinal.map(photo => (
            <div key={photo.id} className="relative min-w-[120px] h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              <img src={photo.url} alt="Final" className="w-full h-full object-cover" />
            </div>
          ))}
          {photosFinal.length === 0 && (
            <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-muted-foreground">
              <p className="text-[10px]">Pelo menos 1 foto final é recomendada</p>
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* Observations */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" />
          Observações do Técnico
        </h2>
        <Textarea 
          placeholder="Descreva detalhes da instalação, dificuldades ou recomendações..."
          className="min-h-[120px] rounded-xl border-gray-200 focus:ring-orange-500"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
      </div>

      {/* Signature Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Pen className="w-5 h-5 text-orange-500" />
            Assinatura do Cliente
          </h2>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={clearSignature}>Limpar</Button>
        </div>
        <Card className="overflow-hidden border-2 border-dashed border-gray-200 bg-white">
          <SignatureCanvas 
            ref={sigPad}
            penColor="black"
            canvasProps={{
              className: "signature-canvas w-full h-48",
              style: { width: '100%', height: '192px' }
            }}
          />
        </Card>
        <p className="text-[10px] text-center text-muted-foreground italic">
          Ao assinar, o cliente confirma que o serviço foi realizado conforme solicitado.
        </p>
      </div>

      {/* Final Action Button */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button 
          className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl gap-3"
          onClick={handleFinalize}
        >
          <CheckCircle className="w-6 h-6" />
          Concluir Tudo e Enviar
        </Button>
      </div>
    </div>
  );
}
