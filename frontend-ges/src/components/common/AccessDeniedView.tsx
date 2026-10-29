import React from 'react';
import { ShieldAlert, History, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AccessDeniedView: React.FC = () => {
  const { setActiveTab, currentUser, logout } = useApp();

  return (
    <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
          Permiso Restringido &bull; RBAC
        </span>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Acceso no autorizado para este perfil
        </h3>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        Usted ha iniciado sesión como <strong className="text-slate-900">{currentUser?.nombre}</strong> con el rol <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{currentUser?.rolLabel}</span>.
        <br /><br />
        De acuerdo a las políticas de seguridad operativa, <strong>únicamente el Personal de Unidades Logísticas y el Administrador General</strong> cuentan con autorización para registrar ingresos y salidas en balanza.
      </p>

      <div className="pt-2 text-xs text-slate-500 font-medium">
        Usted tiene acceso habilitado para:
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setActiveTab('impresion-guia')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ver Guías de Remisión</span>
        </button>

        <button
          onClick={() => setActiveTab('kardex')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <History className="w-3.5 h-3.5" />
          <span>Consultar Historial Kardex</span>
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Cambiar de usuario / Iniciar sesión con otra cuenta &rarr;
        </button>
      </div>
    </div>
  );
};
