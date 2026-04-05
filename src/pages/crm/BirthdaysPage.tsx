import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cake, Calendar, Phone, User, Users, MessageCircle,
  Send, Check, X, ChevronLeft, Filter, Star, Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SuperLayout from '@/components/layout/SuperLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { crmService } from '@/lib/crmService';

type PersonType = 'cliente' | 'funcionario';

interface BirthdayPerson {
  id: string;
  name: string;
  phone: string;
  birthdate: string;
  type: PersonType;
  messageSent: boolean;
  messageSentAt?: string;
}

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Marco' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const DEFAULT_MESSAGE = `Ola {nome}! \n\nA {empresa} parabeniza voce pelos seus {idade} anos! \n\nDesejamos muita saude, felicidade e sucesso!\n\nAtenciosamente,\nEquipe {empresa}`;

export default function BirthdaysPage() {
  const { user } = useAuth();
  const { customers } = useData();
  const [people, setPeople] = useState<BirthdayPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    loadBirthdays();
  }, [customers]);

  const loadBirthdays = async () => {
    setLoading(true);
    
    // Load from DataContext customers
    const sentMessages = JSON.parse(localStorage.getItem('birthday_messages_sent') || '{}');
    
    // Combine clients from DataContext
    const birthdayPeople: BirthdayPerson[] = (customers || [])
      .filter((c: any) => c.birth_date || c.birthdate || c.nascimento)
      .map((c: any) => ({
        id: c.id || `client_${c.phone}`,
        name: c.name || c.full_name || 'Cliente',
        phone: c.phone || '',
        birthdate: c.birth_date || c.birthdate || c.nascimento || '',
        type: 'cliente' as PersonType,
        messageSent: sentMessages[c.id] || sentMessages[c.phone] || false,
        messageSentAt: sentMessages[`${c.id}_at`] || sentMessages[`${c.phone}_at`],
      }));

    // Fetch employees from crm_users
    let employeeBirthdays: BirthdayPerson[] = [];
    try {
      const crmUsers = await crmService.getCRMUsers();
      employeeBirthdays = (crmUsers || [])
        .filter((u: any) => u.birth_date || u.birthdate)
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          phone: u.phone || '',
          birthdate: u.birth_date || u.birthdate || '',
          type: 'funcionario' as PersonType,
          messageSent: sentMessages[u.id] || false,
          messageSentAt: sentMessages[`${u.id}_at`],
        }));
    } catch (e) {
      console.error('Error fetching employee birthdays:', e);
    }

    setPeople([...birthdayPeople, ...employeeBirthdays]);
    setLoading(false);
  };

  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getBirthMonth = (birthdate: string): number => {
    return new Date(birthdate).getMonth() + 1;
  };

  const isToday = (birthdate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthdate);
    return birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth();
  };

  const filteredPeople = useMemo(() => {
    return people
      .filter(p => getBirthMonth(p.birthdate) === selectedMonth)
      .sort((a, b) => {
        // Today's birthday first
        if (isToday(a.birthdate) && !isToday(b.birthdate)) return -1;
        if (!isToday(a.birthdate) && isToday(b.birthdate)) return 1;
        // Then by day of month
        return new Date(a.birthdate).getDate() - new Date(b.birthdate).getDate();
      });
  }, [people, selectedMonth]);

  const todayBirthdays = filteredPeople.filter(p => isToday(p.birthdate));

  const getWhatsAppLink = (phone: string, msg: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(msg);
    return `https://wa.me/55${cleanPhone}?text=${message}`;
  };

  const getMessageWithVariables = (person: BirthdayPerson): string => {
    return message
      .replace(/{nome}/g, person.name)
      .replace(/{idade}/g, calculateAge(person.birthdate).toString())
      .replace(/{empresa}/g, 'Rastremix');
  };

  const sendToAll = async () => {
    setSending(true);
    setSentCount(0);
    
    const sentMessages = JSON.parse(localStorage.getItem('birthday_messages_sent') || '{}');
    
    for (const person of filteredPeople) {
      if (!person.messageSent) {
        const whatsappUrl = getWhatsAppLink(person.phone, getMessageWithVariables(person));
        window.open(whatsappUrl, '_blank');
        
        // Mark as sent
        sentMessages[person.id] = true;
        sentMessages[`${person.id}_at`] = new Date().toISOString();
        
        // Update state
        setPeople(prev => prev.map(p => 
          p.id === person.id 
            ? { ...p, messageSent: true, messageSentAt: new Date().toISOString() }
            : p
        ));
        
        setSentCount(prev => prev + 1);
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    localStorage.setItem('birthday_messages_sent', JSON.stringify(sentMessages));
    setSending(false);
    setShowModal(false);
  };

  const sendIndividual = (person: BirthdayPerson) => {
    const msg = getMessageWithVariables(person);
    const whatsappUrl = getWhatsAppLink(person.phone, msg);
    window.open(whatsappUrl, '_blank');

    // Mark as sent
    const sentMessages = JSON.parse(localStorage.getItem('birthday_messages_sent') || '{}');
    sentMessages[person.id] = true;
    sentMessages[`${person.id}_at`] = new Date().toISOString();
    localStorage.setItem('birthday_messages_sent', JSON.stringify(sentMessages));

    // Update state
    setPeople(prev => prev.map(p => 
      p.id === person.id 
        ? { ...p, messageSent: true, messageSentAt: new Date().toISOString() }
        : p
    ));
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cake className="w-7 h-7 text-red-600" />
              Aniversariantes
            </h1>
            <p className="text-muted-foreground">Gerencie envios de mensagens de aniversario</p>
          </div>
        </div>

        {/* Month Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Filtrar por mes:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto flex-1">
                {MESES.map((mes) => (
                  <button
                    key={mes.value}
                    onClick={() => setSelectedMonth(mes.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedMonth === mes.value
                        ? 'bg-red-600 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {mes.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Cake className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{filteredPeople.length}</p>
                  <p className="text-white/80">Aniversariantes do mes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {filteredPeople.filter(p => p.messageSent).length}
                  </p>
                  <p className="text-white/80">Mensagens enviadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{todayBirthdays.length}</p>
                  <p className="text-white/80">Aniversariantes de hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Birthdays */}
        {todayBirthdays.length > 0 && (
          <Card className="border-red-500 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Star className="w-5 h-5" />
                Aniversariantes de Hoje!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayBirthdays.map((person) => (
                  <motion.div
                    key={person.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-white rounded-xl border-2 border-red-500 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                          <Cake className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-bold">{person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {calculateAge(person.birthdate)} anos
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => sendIndividual(person)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Button */}
        {filteredPeople.length > 0 && (
          <Button
            onClick={() => setShowModal(true)}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Send className="w-5 h-5 mr-2" />
            Enviar mensagem para {filteredPeople.length} aniversariante(s) do mes
          </Button>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lista de Aniversariantes - {MESES.find(m => m.value === selectedMonth)?.label}
              </span>
              <Badge variant="outline">{filteredPeople.length} pessoa(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredPeople.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Cake className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum aniversariante neste mes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      isToday(person.birthdate)
                        ? 'bg-red-50 border-red-200'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        person.type === 'funcionario' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {person.type === 'funcionario' ? (
                          <User className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Users className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{person.name}</p>
                          {isToday(person.birthdate) && (
                            <Badge className="bg-red-600">HOJE</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(person.birthdate)} ({calculateAge(person.birthdate)} anos)
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {person.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {person.messageSent ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Check className="w-3 h-3 mr-1" />
                          Enviado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Pendente
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => sendIndividual(person)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !sending && setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background rounded-2xl shadow-2xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Send className="w-5 h-5 text-green-500" />
                      Enviar Mensagem em Massa
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowModal(false)}
                      disabled={sending}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {filteredPeople.filter(p => !p.messageSent).length} pessoa(s) receberao a mensagem via WhatsApp
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Mensagem:</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3 rounded-xl border min-h-[200px] resize-none text-sm"
                      placeholder="Digite sua mensagem..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Variaveis disponiveis: {'{nome}'}, {'{idade}'}, {'{empresa}'}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {message
                        .replace(/{nome}/g, 'Nome do Cliente')
                        .replace(/{idade}/g, '30')
                        .replace(/{empresa}/g, 'Rastremix')}
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={sending}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={sendToAll}
                    disabled={sending || filteredPeople.filter(p => !p.messageSent).length === 0}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {sending ? (
                      <>
                        Enviando... ({sentCount}/{filteredPeople.filter(p => !p.messageSent).length})
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar para {filteredPeople.filter(p => !p.messageSent).length}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SuperLayout>
  );
}
