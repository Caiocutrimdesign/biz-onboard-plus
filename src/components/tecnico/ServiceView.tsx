import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, Camera, Phone, MapPin, 
  Trash2, Play, Save, Loader2, Wrench, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Service, PhotoType } from '@/types/tec';
import { SERVICE_TYPE_LABELS } from '@/types/service';
import { StatusBadge } from './StatusBadge';

interface ServiceViewProps {
  service: Partial<Service>;
  onBack: () => void;
  onUpdate: (updates: Partial<Service>) => void;
  onUploadPhoto: (file: File, type: PhotoType) => Promise<string | null>;
  onStartService: () => void;
  onFinalize: () => void;
}

export function ServiceView({ service, onBack, onUpdate, onUploadPhoto, onStartService, onFinalize }: ServiceViewProps) {
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotoType, setCurrentPhotoType] = useState<PhotoType>('antes');

  const handlePhotoClick = (type: PhotoType) => {
    setCurrentPhotoType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(currentPhotoType);
    const url = await onUploadPhoto(file, currentPhotoType);
    setUploading(null);
    
    if (url) {
      const photos = service.photos || [];
      onUpdate({
        photos: [...photos, {
          id: `photo_${Date.now()}`,
          service_id: service.id || '',
          url,
          type: currentPhotoType,
          created_at: new Date().toISOString()
        }]
      });
    }
  };

  const photosByType = (type: PhotoType) => (service.photos || []).filter(p => p.type === type);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Execução do Serviço</h1>
          <p className="text-sm text-muted-foreground">{service.client_name}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-orange-100">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">{SERVICE_TYPE_LABELS[service.type!] || service.type}</h3>
                <StatusBadge status={service.status!} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-muted-foreground">Placa</p>
              <p className="font-bold text-orange-600">{service.plate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{service.client_phone || 'Telefone não inf.'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{service.client_address || 'Endereço não inf.'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-orange-600">
              <Package className="w-4 h-4" />
              <span>{service.vehicle}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Capture Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Relatório Fotográfico</h2>
        
        {/* Antes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Fotos: Antes / Início</h3>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 border-orange-200"
              onClick={() => handlePhotoClick('antes')}
              disabled={uploading === 'antes'}
            >
              {uploading === 'antes' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-orange-600" />}
              Adicionar
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {photosByType('antes').map(photo => (
              <div key={photo.id} className="relative min-w-[100px] h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                <img src={photo.url} alt="Antes" className="w-full h-full object-cover" />
                <button 
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white"
                  onClick={() => onUpdate({ photos: service.photos?.filter(p => p.id !== photo.id) })}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photosByType('antes').length === 0 && (
              <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-muted-foreground">
                <p className="text-[10px]">Nenhuma foto adicionada</p>
              </div>
            )}
          </div>
        </div>

        {/* Durante */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Fotos: Durante / Equipamento</h3>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 border-orange-200"
              onClick={() => handlePhotoClick('durante')}
              disabled={uploading === 'durante'}
            >
              {uploading === 'durante' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-orange-600" />}
              Adicionar
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {photosByType('durante').map(photo => (
              <div key={photo.id} className="relative min-w-[100px] h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                <img src={photo.url} alt="Durante" className="w-full h-full object-cover" />
                <button 
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white"
                  onClick={() => onUpdate({ photos: service.photos?.filter(p => p.id !== photo.id) })}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photosByType('durante').length === 0 && (
              <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-muted-foreground">
                <p className="text-[10px]">Nenhuma foto adicionada</p>
              </div>
            )}
          </div>
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

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6 z-50 flex gap-3">
        {service.status === 'pendente' || service.status === 'designado' ? (
          <Button 
            className="flex-1 h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-2xl gap-3"
            onClick={onStartService}
          >
            <Play className="w-6 h-6" />
            Iniciar Serviço
          </Button>
        ) : (
          <Button 
            className="flex-1 h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl gap-3"
            onClick={onFinalize}
            disabled={photosByType('antes').length === 0}
          >
            <Save className="w-6 h-6" />
            Finalizar Serviço
          </Button>
        )}
      </div>
    </div>
  );
}
