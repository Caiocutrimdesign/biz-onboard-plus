import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, CheckCircle, Camera, 
  Trash2, Save, FileText, Loader2, Pen, X, ImagePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from 'react-signature-canvas';
import { Service, PhotoType } from '@/types/tec';

interface FinalizeViewProps {
  service: Partial<Service>;
  onBack: () => void;
  onSave: (observations: string, signature: string, photos: string[]) => void;
  onUploadPhoto: (file: File, type: PhotoType) => Promise<string | null>;
}

export function FinalizeView({ service, onBack, onSave, onUploadPhoto }: FinalizeViewProps) {
  const [observations, setObservations] = useState('');
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; type: PhotoType }>>([]);
  const sigPad = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearSignature = () => sigPad.current?.clear();

  const handleFinalize = () => {
    if (sigPad.current?.isEmpty()) {
      alert('A assinatura do cliente é obrigatória!');
      return;
    }
    const signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
    const photoUrls = photos.map(p => p.url);
    onSave(observations, signatureData || '', photoUrls);
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading('depois');
    
    try {
      const url = await onUploadPhoto(file, 'depois');
      if (url) {
        const newPhoto = {
          id: `photo_${Date.now()}`,
          url: url,
          type: 'depois' as PhotoType
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const photosFinal = photos;

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
            className="gap-2 border-green-200 text-green-600 hover:bg-green-50"
            onClick={handlePhotoClick}
            disabled={uploading === 'depois'}
          >
            {uploading === 'depois' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            Adicionar Foto
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photosFinal.map(photo => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={photo.url} alt="Final" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white">
                  Depois
                </span>
              </div>
            </div>
          ))}
          {photosFinal.length === 0 && (
            <div className="col-span-3 aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Toque acima para adicionar fotos</p>
              </div>
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
