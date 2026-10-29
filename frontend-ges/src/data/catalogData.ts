import suppliersList from './suppliersCatalog.json';

export interface SkuCatalogItem {
  sku: string;
  nombre: string;
  categoria: 'JABA' | 'PALLET' | 'ROLL TAINER' | 'BIN' | 'ACCESORIO';
  unidadMedida: string;
}

export const UULL_CATALOG: SkuCatalogItem[] = [
  { sku: '90100126', nombre: 'JABA NEGRA', categoria: 'JABA', unidadMedida: 'NIU' },
  { sku: '90100128', nombre: 'JABA ROJA', categoria: 'JABA', unidadMedida: 'NIU' },
  { sku: '90100121', nombre: 'PALLET EAN', categoria: 'PALLET', unidadMedida: 'NIU' },
];

export interface SupplierLookupItem {
  ruc: string;
  razonSocial: string;
}

export const SUPPLIERS_CATALOG: SupplierLookupItem[] = suppliersList;

// Quick lookup helper by RUC
export const lookupSupplierByRuc = (rucQuery: string): SupplierLookupItem | undefined => {
  const clean = rucQuery.trim().replace(/\D/g, '');
  if (!clean) return undefined;
  return SUPPLIERS_CATALOG.find((s) => s.ruc === clean);
};

// Normalize text for search (removes diacritics / accents, uppercase)
export const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
};

// Search suppliers by name or RUC with token-based fuzzy matching
export const searchSuppliers = (query: string, limit = 10): SupplierLookupItem[] => {
  const clean = normalizeText(query);
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter(Boolean);

  return SUPPLIERS_CATALOG.filter((s) => {
    const normName = normalizeText(s.razonSocial);
    const normRuc = s.ruc;
    return tokens.every((tok) => normName.includes(tok) || normRuc.includes(tok));
  }).slice(0, limit);
};

// Quick lookup helper by Name (exact or normalized exact)
export const lookupSupplierByName = (nameQuery: string): SupplierLookupItem | undefined => {
  const clean = normalizeText(nameQuery);
  if (!clean) return undefined;
  return SUPPLIERS_CATALOG.find((s) => normalizeText(s.razonSocial) === clean);
};

// Quick lookup helper by SKU
export const lookupSkuByCode = (skuQuery: string): SkuCatalogItem | undefined => {
  const clean = skuQuery.trim().toUpperCase();
  if (!clean) return undefined;
  return UULL_CATALOG.find((item) => item.sku === clean);
};

// Quick lookup helper by Name
export const lookupSkuByName = (nameQuery: string): SkuCatalogItem | undefined => {
  const clean = nameQuery.trim().toUpperCase();
  if (!clean) return undefined;
  return UULL_CATALOG.find((item) => item.nombre.toUpperCase() === clean);
};
