import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from './TecTypes';

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return (
    <Badge className={config.color}>{config.label}</Badge>
  );
}
