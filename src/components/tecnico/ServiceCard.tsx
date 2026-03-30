import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, Clock, User, Phone, MapPin, Calendar, 
  CheckCircle, Play, XCircle, ChevronLeft, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types/tec';
import { SERVICE_TYPE_LABELS } from '@/types/service';
import { StatusBadge } from './StatusBadge';

export function ServiceCard({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{service.client_name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] py-0 h-4">
                  {SERVICE_TYPE_LABELS[service.type] || service.type}
                </Badge>
                <StatusBadge status={service.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted-foreground mr-1">{service.plate}</span>
            <ChevronLeft className={`w-5 h-5 transition-transform ${expanded ? '-rotate-90' : 'rotate-180'}`} />
          </div>
        </div>

        {expanded && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{service.client_phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{service.client_address || 'Endereço não inf.'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{service.scheduled_date ? new Date(service.scheduled_date).toLocaleDateString() : 'Não agendado'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{service.scheduled_date ? new Date(service.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
