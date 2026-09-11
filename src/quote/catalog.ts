export interface Product {
  sku: string;
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  minQuantity: number;
}

export const catalog: Product[] = [
  {
    sku: 'CONC-200',
    name: "Concreto premezclado f'c 200 kg/cm2",
    description: "Concreto premezclado f'c 200 kg/cm2, revenimiento 14 cm, agregado 3/4\"",
    unit: 'm3',
    unitPrice: 2150,
    minQuantity: 7,
  },
  {
    sku: 'CONC-250',
    name: "Concreto premezclado f'c 250 kg/cm2",
    description: "Concreto premezclado f'c 250 kg/cm2, revenimiento 14 cm, agregado 3/4\"",
    unit: 'm3',
    unitPrice: 2340,
    minQuantity: 7,
  },
  {
    sku: 'CONC-300',
    name: "Concreto premezclado f'c 300 kg/cm2",
    description: "Concreto premezclado f'c 300 kg/cm2, revenimiento 14 cm, agregado 3/4\"",
    unit: 'm3',
    unitPrice: 2580,
    minQuantity: 7,
  },
  {
    sku: 'BOMBEO',
    name: 'Servicio de bombeo',
    description: 'Servicio de bombeo de concreto en obra',
    unit: 'm3',
    unitPrice: 420,
    minQuantity: 7,
  },
];

export function findProduct(input: string): Product | undefined {
  const value = input.trim().toLowerCase();
  const byIndex = Number.parseInt(value, 10);
  if (!Number.isNaN(byIndex) && byIndex >= 1 && byIndex <= catalog.length) {
    return catalog[byIndex - 1];
  }
  return catalog.find(
    (product) =>
      product.sku.toLowerCase() === value ||
      product.name.toLowerCase().includes(value) ||
      value.includes(product.sku.toLowerCase()),
  );
}

export function catalogMenu(currencySymbol: string): string {
  return catalog
    .map(
      (product, index) =>
        `${index + 1}. ${product.name} - ${currencySymbol}${product.unitPrice.toLocaleString('es-MX')} / ${product.unit}`,
    )
    .join('\n');
}
