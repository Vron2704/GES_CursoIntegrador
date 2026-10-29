import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-mono">
      <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
      <span className="font-semibold text-slate-900">{formattedTime}</span>
      <span className="text-slate-400">|</span>
      <span className="capitalize text-slate-600 hidden sm:inline">{formattedDate}</span>
    </div>
  );
};
