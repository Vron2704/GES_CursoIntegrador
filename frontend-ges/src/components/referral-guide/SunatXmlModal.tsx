import React from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { GuiaRemisionModel } from '../../types';

interface SunatXmlModalProps {
  guia: GuiaRemisionModel;
  onClose: () => void;
}

export const SunatXmlModal: React.FC<SunatXmlModalProps> = ({ guia, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${guia.numeroGuia}</cbc:ID>
  <cbc:IssueDate>${guia.fechaEmision.split('T')[0]}</cbc:IssueDate>
  <cbc:IssueTime>${new Date(guia.fechaEmision).toTimeString().split(' ')[0]}</cbc:IssueTime>
  <cbc:DespatchAdviceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01">09</cbc:DespatchAdviceTypeCode>
  
  <!-- Firma Digital y Certificado OSE -->
  <cac:Signature>
    <cbc:ID>SPSA-${guia.numeroGuia}</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6">20100070970</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name><![CDATA[SUPERMERCADOS PERUANOS S.A.]]></cbc:Name>
      </cac:PartyName>
    </cac:SignatoryParty>
    <cac:DigitalSignatureAttachment>
      <cac:ExternalReference>
        <cbc:URI>#SignatureSP</cbc:URI>
      </cac:ExternalReference>
    </cac:DigitalSignatureAttachment>
  </cac:Signature>

  <!-- Emisor Remitente -->
  <cac:DespatchSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6">20100070970</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[SUPERMERCADOS PERUANOS S.A.]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DespatchSupplierParty>

  <!-- Destinatario -->
  <cac:DeliveryCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6">${guia.destinatario.ruc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${guia.destinatario.razonSocial}]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DeliveryCustomerParty>

  <!-- Datos de Envio y Transporte -->
  <cac:Shipment>
    <cbc:ID>SUNAT_ENVIO_01</cbc:ID>
    <cbc:HandlingCode listName="Motivo de Traslado">${guia.motivoTraslado.slice(0, 2)}</cbc:HandlingCode>
    <cbc:GrossWeightMeasure unitCode="KGM">${guia.pesoTotalKg}</cbc:GrossWeightMeasure>
    <cbc:TotalTransportHandlingUnitQuantity>${guia.totalBultos}</cbc:TotalTransportHandlingUnitQuantity>
    
    <cac:Delivery>
      <cac:DeliveryAddress>
        <cbc:ID schemeAgencyName="PE:INEI" schemeName="Ubigeos">${guia.puntoLlegada.ubigeo}</cbc:ID>
        <cac:AddressLine>
          <cbc:Line><![CDATA[${guia.puntoLlegada.direccion}]]></cbc:Line>
        </cac:AddressLine>
      </cac:DeliveryAddress>
      <cac:Despatch>
        <cac:DespatchAddress>
          <cbc:ID schemeAgencyName="PE:INEI" schemeName="Ubigeos">${guia.puntoPartida.ubigeo}</cbc:ID>
          <cac:AddressLine>
            <cbc:Line><![CDATA[${guia.puntoPartida.direccion}]]></cbc:Line>
          </cac:AddressLine>
        </cac:DespatchAddress>
      </cac:Despatch>
    </cac:Delivery>

    <cac:TransportHandlingUnit>
      <cac:TransportEquipment>
        <cbc:ID>${guia.vehiculo.placa}</cbc:ID>
      </cac:TransportEquipment>
    </cac:TransportHandlingUnit>
  </cac:Shipment>

  <!-- Items -->
${guia.detalles
  .map(
    (item, index) => `  <cac:DespatchLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:DeliveredQuantity unitCode="${item.unidadMedida}">${item.cantidad}</cbc:DeliveredQuantity>
    <cac:OrderLineReference>
      <cbc:LineID>${item.codigoProducto}</cbc:LineID>
    </cac:OrderLineReference>
    <cac:Item>
      <cbc:Description><![CDATA[${item.descripcionProducto}]]></cbc:Description>
    </cac:Item>
  </cac:DespatchLine>`
  )
  .join('\n')}
</DespatchAdvice>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Estructura XML SUNAT UBL 2.1 &bull; {guia.numeroGuia}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-[11px] text-emerald-400 leading-relaxed">
          <pre>{xmlContent}</pre>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            DigestValue: {guia.hashCdr || 'Vq8K...'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado al portapapeles' : 'Copiar XML'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
