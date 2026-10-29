import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Code,
  Mail,
  List,
  Eye,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReferralGuideImageTemplate } from './ReferralGuideImageTemplate';
import { ReferralGuidePrintView } from './ReferralGuidePrintView';
import { ReferralGuideList } from './ReferralGuideList';
import { SunatXmlModal } from './SunatXmlModal';
import { GuiaRemisionModel } from '../../types';

export const ReferralGuideMainView: React.FC = () => {
  const { guias, selectedGuia, setSelectedGuia, addToast, setActiveTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'print' | 'list'>('print');
  const [templateFormat, setTemplateFormat] = useState<'spsa-manual' | 'sunat-modern'>('spsa-manual');
  const [showXmlModal, setShowXmlModal] = useState(false);

  // Active guide fallback
  const currentGuia: GuiaRemisionModel | null =
    selectedGuia || (guias.length > 0 ? guias[0] : null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    addToast('info', 'Generando Documento', 'Abriendo el cuadro de diálogo para guardar como PDF (Ctrl+P)...');
    window.print();
  };

  const handleSendEmail = () => {
    if (!currentGuia) return;
    addToast(
      'success',
      'Guía Enviada por Correo',
      `Se envió la Guía ${currentGuia.numeroGuia} a ${currentGuia.proveedor?.correo || 'contacto@proveedor.pe'}`
    );
  };

  // Keyboard shortcut Ctrl+P / Cmd+P listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Active Guide Selector */}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#00a651] flex items-center gap-1.5">
              <span>Módulo de Emisión & Impresión</span>
              <span className="font-mono bg-emerald-100 text-[#00a651] px-1.5 py-0.2 rounded text-[9.5px]">
                Ctrl + P
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Guía de Remisión
              {currentGuia && (
                <span className="font-mono text-sm bg-slate-900 text-white px-2.5 py-0.5 rounded-lg border border-slate-700">
                  {currentGuia.numeroGuia}
                </span>
              )}
            </h2>
          </div>

          {/* Guide Quick Switcher */}
          {guias.length > 1 && (
            <div className="hidden lg:block ml-4 pl-4 border-l border-slate-200">
              <select
                value={currentGuia?.idGuia || ''}
                onChange={(e) => {
                  const g = guias.find((item) => item.idGuia === Number(e.target.value));
                  if (g) setSelectedGuia(g);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
              >
                {guias.map((g) => (
                  <option key={g.idGuia} value={g.idGuia}>
                    {g.numeroGuia} - {g.vehiculo?.placa} ({g.destinatario?.razonSocial?.slice(0, 20)}...)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Format Selector & Actions (Print, PDF, XML, List) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Selector: SPSA Manual (image template) vs Sunat Modern */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs mr-1">
            <button
              onClick={() => setTemplateFormat('spsa-manual')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                templateFormat === 'spsa-manual'
                  ? 'bg-[#00a651] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Formato idéntico al documento físico de Supermercados Peruanos SA"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Plantilla SPSA</span>
            </button>
            <button
              onClick={() => setTemplateFormat('sunat-modern')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                templateFormat === 'sunat-modern'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Formato electrónico SUNAT con QR extendido"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formato Electrónico</span>
            </button>
          </div>

          {/* Subtab Switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs mr-1">
            <button
              onClick={() => setActiveSubTab('print')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                activeSubTab === 'print'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Vista Guía</span>
            </button>
            <button
              onClick={() => setActiveSubTab('list')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                activeSubTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3 h-3" />
              <span>Historial</span>
            </button>
          </div>

          {currentGuia && (
            <>
              <button
                type="button"
                onClick={() => setShowXmlModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
                title="Ver estructura XML"
              >
                <Code className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">XML</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
                title="Enviar por correo electrónico"
              >
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Email</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              {/* Main Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-[#00a651] hover:bg-[#008f45] text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                title="Imprimir Guía de Remisión"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {activeSubTab === 'print' ? (
        currentGuia ? (
          <div className="space-y-4">
            <div className="no-print bg-emerald-50 border border-emerald-200/90 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00a651] shrink-0" />
                <span>
                  Guía <strong>{currentGuia.numeroGuia}</strong> lista para impresión con atajo <strong>Ctrl + P</strong>.
                </span>
              </span>

              {/* Fast Workflow Navigation Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('registro-ingreso')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span>+ Nuevo Ingreso</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('registro-salida')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-blue-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span>Despachar Siguiente</span>
                </button>
                <span className="font-mono text-[11px] font-bold text-[#00a651] bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {currentGuia.estado}
                </span>
              </div>
            </div>

            {/* Document Render Area */}
            <div className="flex justify-center overflow-x-auto p-2 sm:p-4 bg-slate-200/70 rounded-3xl border border-slate-300/80 shadow-inner">
              {templateFormat === 'spsa-manual' ? (
                <ReferralGuideImageTemplate guia={currentGuia} />
              ) : (
                <ReferralGuidePrintView guia={currentGuia} />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
            No hay guías de remisión emitidas aún.
          </div>
        )
      ) : (
        <ReferralGuideList
          guias={guias}
          selectedGuia={currentGuia}
          onSelectGuia={(g) => {
            setSelectedGuia(g);
            setActiveSubTab('print');
          }}
        />
      )}

      {/* SUNAT UBL 2.1 XML Modal */}
      {showXmlModal && currentGuia && (
        <SunatXmlModal guia={currentGuia} onClose={() => setShowXmlModal(false)} />
      )}
    </div>
  );
};
