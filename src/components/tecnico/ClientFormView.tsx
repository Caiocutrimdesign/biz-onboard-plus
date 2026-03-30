import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, Phone, MapPin, ChevronLeft, Save, 
  Trash2, Mail, CreditCard, Building, MapPinned, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Technician } from '@/types/tec';
import { Client } from './TecTypes';

interface ClientFormViewProps {
  client: Client | null;
  onSave: (client: Client) => Promise<void>;
  onBack: () => void;
  technicians: Technician[];
}

export function ClientFormView({ client, onSave, onBack, technicians }: ClientFormViewProps) {
  const [form, setForm] = useState<Client>({
    id: client?.id || `client_${Date.now()}`,
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    cpf: client?.cpf || '',
    address: client?.address || '',
    neighborhood: client?.neighborhood || '',
    city: client?.city || '',
    state: client?.state || '',
    cep: client?.cep || '',
    vehicle: client?.vehicle || '',
    vehicleBrand: client?.vehicleBrand || '',
    vehicleModel: client?.vehicleModel || '',
    vehicleYear: client?.vehicleYear || '',
    vehicleColor: client?.vehicleColor || '',
    plate: client?.plate || '',
    renavam: client?.renavam || '',
    technician_id: client?.technician_id || '',
    technician_name: client?.technician_name || '',
  });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const isValid = form.name.trim() && form.phone.trim();

  const handleSave = async () => {
    if (saving) return;
    
    console.log('ClientFormView: Starting save, form data:', form);
    setSaving(true);
    
    try {
      await onSave(form);
      console.log('ClientFormView: Save completed successfully');
    } catch (error: any) {
      console.error('ClientFormView: Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Cadastro do Cliente</h1>
          <p className="text-sm text-muted-foreground">Passo {step} de 2 - {step === 1 ? 'Dados Pessoais' : 'Dados do Veículo'}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-orange-500' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-orange-500' : 'bg-muted'}`} />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {step === 1 && (
            <>
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})}
                      placeholder="NOME COMPLETO"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone/WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: formatPhone(e.target.value)})}
                      placeholder="(99) 99999-9999"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={form.cpf || ''}
                      onChange={(e) => setForm({...form, cpf: formatCPF(e.target.value)})}
                      placeholder="000.000.000-00"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={form.email || ''}
                      onChange={(e) => setForm({...form, email: e.target.value.toLowerCase()})}
                      placeholder="exemplo@email.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-600 font-bold">Responsável pelo Cadastro</label>
                  <Select 
                    value={form.technician_id || ''} 
                    onValueChange={(val) => {
                      const tec = technicians.find(t => t.id === val);
                      setForm({ ...form, technician_id: val, technician_name: tec?.name || '' });
                    }}
                  >
                    <SelectTrigger className="border-orange-200">
                      <SelectValue placeholder="Selecione um técnico (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (Venda Direta)</SelectItem>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Placa do Veículo</label>
                <div className="relative">
                  <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.plate || ''}
                    onChange={(e) => setForm({...form, plate: e.target.value.toUpperCase()})}
                    placeholder="ABC-1234"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo do Veículo</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.vehicleModel || ''}
                    onChange={(e) => setForm({...form, vehicleModel: e.target.value.toUpperCase()})}
                    placeholder="EX: COROLLA"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.address || ''}
                    onChange={(e) => setForm({...form, address: e.target.value.toUpperCase()})}
                    placeholder="Rua, Complemento"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            {step === 1 ? (
              <Button 
                className="flex-1 bg-orange-600" 
                disabled={!isValid} 
                onClick={() => setStep(2)}
              >
                Próximo Passo
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setStep(1)}
                  disabled={saving}
                >
                  Voltar
                </Button>
                <Button 
                  className="flex-1 bg-orange-600" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Finalizar Cadastro
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
