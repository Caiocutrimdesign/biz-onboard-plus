import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gift, Search, Calendar, MessageCircle, Send, Users,
  ChevronLeft, ChevronRight, Loader2, RefreshCw, Cake,
  Star, Heart, Sun
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MENSAGENS_ANIVERSARIO = [
  `🎂 Parabéns, {nome}! 🎂

Que este dia especial seja repleto de alegria, amor e muitas conquistas!

Desejamos que todos os seus sonhos se realizem e que este novo ano de vida traga muita saúde, felicidade e prosperidade.

Você é muito importante para nós! 🥳

Equipe Rastremix - Proteção Veicular`,

  `🌟 Felicitaciones, {nome}! 🌟

Hoje é o SEU dia!

Que Deus abençoe grandiosamente a sua vida, que a alegria esteja sempre presente e que novos horizontes se abram diante de você.

Parabéns por mais um ano de vida! 🎉

Equipe Rastremix - Proteção Veicular`,

  `🎉 Parabéns, {nome}! 🎉

Neste dia tão especial, queremos lembrar o quanto você é especial para nós!

Que este novo ano seja cheio de paz, amor, saúde e muitas vitórias!

Você merece todo o bem do mundo! 🥰

Equipe Rastremix - Proteção Veicular`,

  `✨ Feliz Aniversário, {nome}! ✨

Que este dia seja iluminado por todas as bênçãos do céu!

Desejamos que a cada novo ano, você se torne ainda mais especial em nossa história.

Que Deus vos abençoe! 🙏

Equipe Rastremix - Proteção Veicular`
];

function gerarMensagem(nome: string): string {
  const randomIndex = Math.floor(Math.random() * MENSAGENS_ANIVERSARIO.length);
  return MENSAGENS_ANIVERSARIO[randomIndex].replace('{nome}', nome.split(' ')[0]);
}

function enviarWhatsApp(telefone: string, mensagem: string) {
  const phone = telefone.replace(/\D/g, '');
  const msg = encodeURIComponent(mensagem);
  window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
}

export default function BirthdaysPage() {
  const navigate = useNavigate();
  const { customers: allCustomers, isLoading, refreshCustomers } = useData();
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const birthdayData = useMemo(() => {
    const data: Record<string, any[]> = {};
    
    MESES.forEach((_, index) => {
      data[index] = [];
    });

    allCustomers.forEach((customer: any) => {
      if (!customer.birth_date) return;
      
      const birth = new Date(customer.birth_date);
      const month = birth.getMonth();
      const day = birth.getDate();
      
      data[month].push({
        ...customer,
        birthDay: day,
        birthMonth: month,
        age: new Date().getFullYear() - birth.getFullYear()
      });
    });

    Object.keys(data).forEach(key => {
      data[parseInt(key)].sort((a, b) => a.birthDay - b.birthDay);
    });

    return data;
  }, [allCustomers]);

  const todayBirthdays = useMemo(() => {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();
    
    return birthdayData[month]?.filter(c => c.birthDay === day) || [];
  }, [birthdayData]);

  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const upcoming: any[] = [];

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(currentDay + i);
      const month = checkDate.getMonth();
      const day = checkDate.getDate();
      
      const dayBirthdays = birthdayData[month]?.filter(c => c.birthDay === day) || [];
      dayBirthdays.forEach(b => {
        upcoming.push({
          ...b,
          daysUntil: i,
          upcomingDate: checkDate.toLocaleDateString('pt-BR')
        });
      });
    }

    return upcoming.slice(0, 10);
  }, [birthdayData]);

  const filteredCustomers = useMemo(() => {
    let customers = birthdayData[selectedMonth] || [];
    
    if (search) {
      customers = customers.filter(c => 
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      );
    }
    
    return customers;
  }, [birthdayData, selectedMonth, search]);

  const handleSendMessage = (customer: any) => {
    const mensagem = gerarMensagem(customer.full_name);
    enviarWhatsApp(customer.phone, mensagem);
  };

  const handleSendToAll = () => {
    filteredCustomers.forEach((customer: any) => {
      setSendingTo(customer.id);
      setTimeout(() => {
        handleSendMessage(customer);
        setSendingTo(null);
      }, 1000);
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/admin')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Cake className="w-7 h-7 text-pink-500" />
            Aniversários
          </h1>
          <p className="text-muted-foreground">Gerencie felicitações de aniversário</p>
        </div>
      </div>

      {/* Today's Birthdays */}
      {todayBirthdays.length > 0 && (
        <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-bold text-pink-700">Aniversariantes de Hoje!</h2>
              <Badge className="bg-pink-500">{todayBirthdays.length}</Badge>
            </div>
            <div className="grid gap-3">
              {todayBirthdays.map((b: any) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                      <Cake className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{b.full_name}</p>
                      <p className="text-sm text-muted-foreground">{b.phone}</p>
                      <p className="text-sm text-pink-600 font-medium">
                        🎉 Completando {b.age} anos hoje!
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendMessage(b)}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={sendingTo === b.id}
                  >
                    {sendingTo === b.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Enviar Parabéns
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-orange-500" />
              <h2 className="text-lg font-bold">Próximos Aniversários</h2>
              <Badge variant="outline">{upcomingBirthdays.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingBirthdays.slice(0, 6).map((b: any) => (
                <div
                  key={`${b.id}-${b.daysUntil}`}
                  className="flex items-center gap-3 bg-muted/50 rounded-lg p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.full_name}</p>
                    <p className="text-xs text-muted-foreground">{b.upcomingDate}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {b.daysUntil === 0 ? 'Hoje' : `${b.daysUntil}d`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold min-w-[150px] text-center">
            {MESES[selectedMonth]}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Button onClick={refreshCustomers} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{birthdayData[selectedMonth]?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Aniversariantes</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-pink-500">{todayBirthdays.length}</p>
            <p className="text-sm text-muted-foreground">Hoje</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{upcomingBirthdays.length}</p>
            <p className="text-sm text-muted-foreground">Próximos 30 dias</p>
          </div>
        </Card>
      </div>

      {/* Send to All Button */}
      {filteredCustomers.length > 0 && (
        <Button
          onClick={handleSendToAll}
          className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          disabled={sendingTo !== null}
        >
          {sendingTo ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Enviando mensagens...
            </>
          ) : (
            <>
              <Send className="w-6 h-6 mr-2" />
              Enviar Parabéns para Todos ({filteredCustomers.length})
            </>
          )}
        </Button>
      )}

      {/* Birthday List */}
      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Carregando aniversariantes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum aniversariante encontrado neste mês</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer: any) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  customer.birthDay === new Date().getDate() && selectedMonth === new Date().getMonth()
                    ? 'bg-gradient-to-br from-pink-400 to-purple-500'
                    : 'bg-primary/10'
                }`}>
                  <Cake className={`w-6 h-6 ${
                    customer.birthDay === new Date().getDate() && selectedMonth === new Date().getMonth()
                      ? 'text-white'
                      : 'text-primary'
                  }`} />
                </div>
                <div>
                  <p className="font-bold">{customer.full_name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  <p className="text-sm text-primary font-medium">
                    {customer.birthDay} de {MESES[customer.birthMonth]} • {customer.age} anos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSendMessage(customer)}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={sendingTo === customer.id}
                >
                  {sendingTo === customer.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Preview Modal */}
      <div className="hidden">
        {/* Message preview can be implemented with a Dialog if needed */}
      </div>
    </div>
  );
}
