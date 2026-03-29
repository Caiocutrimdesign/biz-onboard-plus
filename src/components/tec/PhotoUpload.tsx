import { useState, useRef } from 'react';
import { Camera, X, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PhotoType } from '@/types/tec';

interface PhotoUploadProps {
  onPhotoUpload: (photo: { url: string; type: PhotoType }, file: File) => void;
  existingPhotos?: Array<{ url: string; type: PhotoType }>;
  serviceId?: string;
}

export default function PhotoUpload({ onPhotoUpload, existingPhotos = [] }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PhotoType>('antes');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoTypes: { value: PhotoType; label: string; color: string }[] = [
    { value: 'antes', label: 'Antes', color: 'bg-red-500' },
    { value: 'durante', label: 'Durante', color: 'bg-yellow-500' },
    { value: 'depois', label: 'Depois', color: 'bg-green-500' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!previewUrl || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    onPhotoUpload({ url: previewUrl, type: selectedType }, file);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (url: string) => {
    // TODO: Implement remove from storage
    console.log('Remove photo:', url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Camera className="w-4 h-4" />
          <span>Fotos do Servico</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {existingPhotos.length} foto(s)
        </span>
      </div>

      {/* Photo Type Selector */}
      <div className="flex gap-2">
        {photoTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setSelectedType(type.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              selectedType === type.value
                ? `${type.color} text-white`
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      {previewUrl ? (
        <div className="relative border rounded-xl overflow-hidden bg-white">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setPreviewUrl(null)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${
                selectedType === 'antes' ? 'bg-red-500' :
                selectedType === 'durante' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span className="text-sm font-medium capitalize">{selectedType}</span>
            </div>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
              size="sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Toque para tirar foto ou escolher da galeria
          </p>
        </div>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Fotos Adicionadas</p>
          <div className="grid grid-cols-3 gap-2">
            {existingPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.url}
                  alt={`${photo.type} ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <div className="absolute bottom-1 left-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    photo.type === 'antes' ? 'bg-red-500 text-white' :
                    photo.type === 'durante' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {photo.type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.url)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
