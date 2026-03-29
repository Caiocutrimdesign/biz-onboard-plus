import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Camera, X, Play, CheckCircle, Save, 
  Clock, MapPin, User, Phone, MapPinHouse, FileText,
  CheckSquare, Square, Image, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  updateService as updateServiceContext, 
  startService as startServiceContext, 
  finishService as finishServiceContext 
} from '@/contexts/ServiceContext';
import type { Service, ChecklistItem, ServiceStatus } from '@/types/service';
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS } from '@/types/service';

interface ServiceDetailPageProps {
  service: Service;
  tecnicoId: string;
  tecnicoName: string;
  onBack: () => void;
  onUpdated: () => void;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { item: 'Equipamento instalado corretamente', concluido: false },
  { item: 'Cliente orientado sobre uso', concluido: false },
  { item: 'Teste de funcionamento realizado', concluido: false },
  { item: 'Equipamento limpo e organizado', concluido: false },
  { item: 'Documentação entregue ao cliente', concluido: false },
];

export default function ServiceDetailPage({ 
  service, 
  tecnicoId, 
  tecnicoName, 
  onBack,
  onUpdated 
}: ServiceDetailPageProps) {
  const [currentService, setCurrentService] = useState<Service>(service);
  const [fotosInicio, setFotosInicio] = useState<string[]>(service.fotos_inicio || []);
  const [fotosFinal, setFotosFinal] = useState<string[]>(service.fotos_final || []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(service.checklist || DEFAULT_CHECKLIST);
  const [observacoes, setObservacoes] = useState(service.observacoes_tecnico || '');
  const [assinatura, setAssinatura] = useState<string>(service.assinatura_cliente || '');
  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localizacaoInicio, setLocalizacaoInicio] = useState<string>('');
  const [localizacaoFim, setLocalizacaoFim] = useState<string>('');
  
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const fileInputInicioRef = useRef<HTMLInputElement>(null);
  const fileInputFinalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service.status === 'pendente' || service.status === 'designado') {
      getLocalizacao(setLocalizacaoInicio);
    }
    if (service.status === 'em_andamento') {
      getLocalizacao(setLocalizacaoFim);
    }
  }, [service.status]);

  const getLocalizacao = (callback: (pos: string) => void) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          callback(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => callback(''),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isInicio: boolean) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (isInicio) {
          setFotosInicio(prev => [...prev, base64]);
        } else {
          setFotosFinal(prev => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeFoto = (index: number, isInicio: boolean) => {
    if (isInicio) {
      setFotosInicio(prev => prev.filter((_, i) => i !== index));
    } else {
      setFotosFinal(prev => prev.filter((_, i) => i !== index));
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && signatureRef.current) {
      setAssinatura(signatureRef.current.toDataURL());
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinatura('');
  };

  const toggleChecklist = (index: number) => {
    setChecklist(prev => prev.map((item, i) => 
      i === index ? { ...item, concluido: !item.concluido } : item
    ));
  };

  const canStart = fotosInicio.length > 0;
  const canFinish = fotosInicio.length > 0 && fotosFinal.length > 0 && assinatura.length > 0 && observacoes.trim().length > 0;

  const handleStartService = () => {
    if (!canStart) return;
    setSaving(true);
    startServiceContext(currentService.id, fotosInicio, localizacaoInicio);
    setCurrentService(prev => ({ ...prev, status: 'em_andamento', fotos_inicio: fotosInicio }));
    onUpdated();
    setSaving(false);
  };

  const handleFinishService = () => {
    if (!canFinish) return;
    setSaving(true);
    finishServiceContext(
      currentService.id, 
      observacoes, 
      tecnicoName,
      fotosFinal,
      [assinatura],
      checklist,
      localizacaoFim || undefined
    );
    setCurrentService(prev => ({ 
      ...prev, 
      status: 'finalizado',
      data_finalizacao: new Date().toISOString()
    }));
    onUpdated();
    setSaving(false);
  };

  const isPendente = currentService.status === 'pendente' || currentService.status === 'designado';
  const isEmAndamento = currentService.status === 'em_andamento';
  const isFinalizado = currentService.status === 'finalizado';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Ordem de Serviço</h1>
            <Badge className={SERVICE_STATUS_COLORS[currentService.status]}>
              {SERVICE_STATUS_LABELS[currentService.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {/* Dados do Cliente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{currentService.cliente_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{currentService.cliente_phone}</span>
            </div>
            {currentService.cliente_address && (
              <div className="flex items-center gap-2">
                <MapPinHouse className="w-4 h-4 text-muted-foreground" />
                <span>{currentService.cliente_address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Serviço */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dados do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{SERVICE_TYPE_LABELS[currentService.tipo_servico as keyof typeof SERVICE_TYPE_LABELS]}</p>
            </div>
            {currentService.descricao && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p>{currentService.descricao}</p>
              </div>
            )}
            {currentService.data_agendamento && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Agendado para: {new Date(currentService.data_agendamento).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {currentService.data_inicio && (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-muted-foreground" />
                <span>Iniciado em: {new Date(currentService.data_inicio).toLocaleString('pt-BR')}</span>
              </div>
            )}
            {currentService.data_finalizacao && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span>Finalizado em: {new Date(currentService.data_finalizacao).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fotos Iniciais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="w-4 h-4" />
              Fotos do Início
              {isPendente && <span className="text-red-500 text-sm">*Obrigatório para iniciar</span>}
              {isEmAndamento && <span className="text-orange-500 text-sm">(Adicionar mais fotos)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fotosInicio.map((foto, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  {(isPendente || isEmAndamento) && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeFoto(index, true)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {(isPendente || isEmAndamento) && (
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputInicioRef}
                  onChange={(e) => handleFileSelect(e, true)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputInicioRef.current?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar Fotos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Iniciar Serviço */}
        {isPendente && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <Button
                onClick={handleStartService}
                disabled={!canStart || saving}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Play className="w-4 h-4 mr-2" />
                {saving ? 'Iniciando...' : 'Iniciar Serviço'}
              </Button>
              {!canStart && (
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Adicione pelo menos 1 foto inicial para iniciar
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Checklist */}
        {isEmAndamento && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleChecklist(index)}
                >
                  {item.concluido ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={item.concluido ? 'line-through text-muted-foreground' : ''}>
                    {item.item}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Fotos Finais */}
        {isEmAndamento && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4" />
                Fotos da Finalização
                <span className="text-red-500 text-sm">*Obrigatório para finalizar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {fotosFinal.map((foto, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeFoto(index, false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputFinalRef}
                  onChange={(e) => handleFileSelect(e, false)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputFinalRef.current?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar Fotos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assinatura Eletrônica */}
        {isEmAndamento && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Assinatura do Cliente
                <span className="text-red-500 text-sm">*Obrigatório para finalizar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-2 border-dashed border-gray-200 rounded-lg bg-white">
                <canvas
                  ref={signatureRef}
                  width={300}
                  height={150}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSignature} className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
              {assinatura && (
                <div className="border rounded-lg p-2 bg-gray-50">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <img src={assinatura} alt="Assinatura" className="h-20 mx-auto" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Observações Finais */}
        {isEmAndamento && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Observações do Técnico
                <span className="text-red-500 text-sm">*Obrigatório para finalizar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva o serviço realizado, observações..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        )}

        {/* Botão Finalizar Serviço */}
        {isEmAndamento && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <div className="text-sm space-y-1">
                <p className={fotosInicio.length > 0 ? 'text-green-600' : 'text-red-500'}>
                  {fotosInicio.length > 0 ? '✓' : '✗'} Fotos Iniciais
                </p>
                <p className={fotosFinal.length > 0 ? 'text-green-600' : 'text-red-500'}>
                  {fotosFinal.length > 0 ? '✓' : '✗'} Fotos Finais
                </p>
                <p className={assinatura.length > 0 ? 'text-green-600' : 'text-red-500'}>
                  {assinatura.length > 0 ? '✓' : '✗'} Assinatura
                </p>
                <p className={observacoes.trim().length > 0 ? 'text-green-600' : 'text-red-500'}>
                  {observacoes.trim().length > 0 ? '✓' : '✗'} Observações
                </p>
              </div>
              <Button
                onClick={handleFinishService}
                disabled={!canFinish || saving}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {saving ? 'Finalizando...' : 'Finalizar Serviço'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dados da Finalização (visualização) */}
        {isFinalizado && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fotos Iniciais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(currentService.fotos_inicio || fotosInicio).map((foto, index) => (
                    <img 
                      key={index} 
                      src={foto} 
                      alt={`Foto ${index + 1}`} 
                      className="w-full aspect-square object-cover rounded-lg" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fotos da Finalização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(currentService.fotos_final || fotosFinal).map((foto, index) => (
                    <img 
                      key={index} 
                      src={foto} 
                      alt={`Foto ${index + 1}`} 
                      className="w-full aspect-square object-cover rounded-lg" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Assinatura do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                {(currentService.assinatura_cliente || assinatura) && (
                  <img 
                    src={currentService.assinatura_cliente || assinatura} 
                    alt="Assinatura" 
                    className="h-24 mx-auto" 
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Observações do Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{currentService.observacoes_tecnico || observacoes}</p>
              </CardContent>
            </Card>

            {currentService.checklist && currentService.checklist.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentService.checklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckSquare className={`w-4 h-4 ${item.concluido ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={item.concluido ? 'line-through text-muted-foreground' : ''}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
