import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, Camera, Phone, MapPin, 
  Trash2, Play, Save, Loader2, Wrench, Package, CheckCircle, Eye, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Service, PhotoType, ServicePhoto } from '@/types/tec';
import { StatusBadge } from './StatusBadge';

interface ServiceViewProps {
  service: Partial<Service>;
  onBack: () => void;
  onUpdate: (updates: Partial<Service>) => void;
  onUploadPhoto: (file: File, type: PhotoType) => Promise<string | null>;
  onStartService: () => void;
  onFinalize: () => void;
}

function parsePhotos(photos: any): ServicePhoto[] {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function ServiceView({ service, onBack, onUpdate, onUploadPhoto, onStartService, onFinalize }: ServiceViewProps) {
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotoType, setCurrentPhotoType] = useState<PhotoType>('antes');
  
  const isCompleted = service.status === 'concluido' || service.status === 'finalizado';
  const isInProgress = service.status === 'em_andamento';
  const isPending = service.status === 'pendente' || service.status === 'designado';
  
  const photos = parsePhotos(service.photos);

  const handlePhotoClick = (type: PhotoType) => {
    if (isCompleted) return;
    setCurrentPhotoType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadPhoto) return;

    setUploading(currentPhotoType);
    
    try {
      const url = await onUploadPhoto(file, currentPhotoType);
      
      if (url) {
        const newPhoto: ServicePhoto = {
          id: `photo_${Date.now()}`,
          service_id: service.id || '',
          url,
          type: currentPhotoType,
          created_at: new Date().toISOString()
        };
        onUpdate({
          photos: [...photos, newPhoto]
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const photosByType = (type: PhotoType) => photos.filter(p => p.type === type);

  const removePhoto = (photoId: string) => {
    if (isCompleted || !onUpdate) return;
    onUpdate({
      photos: photos.filter(p => p.id !== photoId)
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isCompleted ? 'Detalhes do Serviço' : 'Execução do Serviço'}</h1>
          <p className="text-sm text-muted-foreground">{service.client_name || 'Cliente'}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Wrench className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold">Serviço</h3>
                <StatusBadge status={service.status || 'pendente'} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-muted-foreground">Placa</p>
              <p className="font-bold text-orange-600">{service.plate || '-'}</p>
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
            {service.vehicle && (
              <div className="flex items-center gap-3 text-sm font-bold text-orange-600">
                <Package className="w-4 h-4" />
                <span>{service.vehicle}</span>
              </div>
            )}
            {service.observations && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                <p className="text-sm">{service.observations}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photos Section */}
      {(photos.length > 0 || !isCompleted) && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Image className="w-5 h-5" />
            Relatório Fotográfico
          </h2>
          
          {/* Antes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Fotos: Antes / Início</h3>
              {!isCompleted && (
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
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {photosByType('antes').map(photo => (
                <div key={photo.id} className="relative min-w-[100px] h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={photo.url} alt="Antes" className="w-full h-full object-cover" />
                  {!isCompleted && (
                    <button 
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {photosByType('antes').length === 0 && !isCompleted && (
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-muted-foreground">
                  <p className="text-[10px]">Nenhuma foto adicionada</p>
                </div>
              )}
            </div>
          </div>

          {/* Durante */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Fotos: Durante / Equipamento</h3>
              {!isCompleted && (
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
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {photosByType('durante').map(photo => (
                <div key={photo.id} className="relative min-w-[100px] h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={photo.url} alt="Durante" className="w-full h-full object-cover" />
                  {!isCompleted && (
                    <button 
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {photosByType('durante').length === 0 && !isCompleted && (
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-muted-foreground">
                  <p className="text-[10px]">Nenhuma foto adicionada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* Action Buttons - Only show for non-completed services */}
      {!isCompleted && (
        <div className="fixed bottom-6 left-6 right-6 z-50 flex gap-3">
          {isPending ? (
            <Button 
              className="flex-1 h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-2xl gap-3"
              onClick={onStartService}
            >
              <Play className="w-6 h-6" />
              Iniciar Serviço
            </Button>
          ) : isInProgress ? (
            <Button 
              className="flex-1 h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl gap-3"
              onClick={onFinalize}
            >
              <Save className="w-6 h-6" />
              Finalizar Serviço
            </Button>
          ) : null}
        </div>
      )}

      {/* Completed message */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-bold text-green-700">Serviço Concluído</h3>
            <p className="text-sm text-green-600 mt-1">
              Este serviço foi finalizado em {service.completed_date ? new Date(service.completed_date).toLocaleDateString('pt-BR') : 'data não registrada'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
