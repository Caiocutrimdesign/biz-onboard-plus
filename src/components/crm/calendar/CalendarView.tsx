import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const appointments = [
    {
      id: '1',
      title: 'Reunião com Cliente VIP',
      start: new Date(2026, 2, 28, 10, 0),
      end: new Date(2026, 2, 28, 11, 0),
      type: 'meeting',
      leadName: 'Roberto Costa',
      location: 'Sala de Reunião A',
    },
    {
      id: '2',
      title: 'Apresentação de Proposta',
      start: new Date(2026, 2, 28, 14, 0),
      end: new Date(2026, 2, 28, 15, 30),
      type: 'presentation',
      leadName: 'Fernanda Lima',
      location: 'Videochamada',
    },
    {
      id: '3',
      title: 'Follow-up',
      start: new Date(2026, 2, 29, 9, 0),
      end: new Date(2026, 2, 29, 9, 30),
      type: 'call',
      leadName: 'Lucas Almeida',
    },
    {
      id: '4',
      title: 'Negociar Contrato',
      start: new Date(2026, 2, 30, 11, 0),
      end: new Date(2026, 2, 30, 12, 0),
      type: 'meeting',
      leadName: 'Carla Dias',
      location: 'Escritório do Cliente',
    },
    {
      id: '5',
      title: 'Demo do Produto',
      start: new Date(2026, 2, 31, 15, 0),
      end: new Date(2026, 2, 31, 16, 0),
      type: 'presentation',
      leadName: 'João Mendes',
      location: 'Sala de Reunião B',
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <User className="h-4 w-4" />;
      case 'call':
        return <Video className="h-4 w-4" />;
      case 'presentation':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'call':
        return 'bg-green-100 text-green-700';
      case 'presentation':
        return 'bg-purple-100 text-purple-700';
      case 'follow_up':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return [];
    return appointments.filter(apt => 
      apt.start.getDate() === day.getDate() &&
      apt.start.getMonth() === day.getMonth() &&
      apt.start.getFullYear() === day.getFullYear()
    );
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500">Gerencie suas reuniões e compromissos</p>
        </div>
        <Button className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">{getMonthName(currentDate)}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = day && 
                  day.getDate() === today.getDate() &&
                  day.getMonth() === today.getMonth() &&
                  day.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border border-gray-100 rounded-lg ${
                      day ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-primary' : 'text-gray-700'
                        }`}>
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 rounded truncate ${getTypeColor(apt.type)}`}
                            >
                              {apt.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {apt.title}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayAppointments.length - 2} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Próximos Agendamentos</h3>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(apt.type)}`}>
                      {getTypeIcon(apt.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{apt.title}</p>
                      <p className="text-sm text-gray-500">{apt.leadName}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                          {apt.start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {' '}
                          {apt.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {apt.location && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          <span>{apt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum agendamento próximo</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Horários Rápidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                <Button key={time} variant="outline" className="h-10">
                  {time}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
