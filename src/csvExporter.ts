import { FIFOResult } from './types';
import { formatNumericValue } from './utils';

export class CSVExporter {
  private headers = [
    { id: 'operationNumber', title: 'Nº Operación' },
    { id: 'sellDate', title: 'Fecha Venta' },
    { id: 'crypto', title: 'Cripto' },
    { id: 'soldAmount', title: 'Cantidad Vendida' },
    { id: 'usedBuyAmount', title: 'Cantidad Comprada Usada' },
    { id: 'buyDate', title: 'Fecha Compra' },
    { id: 'buyUnitPrice', title: 'Precio Compra Unitario (EUR)' },
    { id: 'buyValue', title: 'Valor Compra (EUR)' },
    { id: 'sellUnitPrice', title: 'Precio Venta Unitario (EUR)' },
    { id: 'sellValue', title: 'Valor Venta (EUR)' },
    { id: 'profitLoss', title: 'Ganancia/Pérdida (EUR)' }
  ];

  public async exportToString(calculations: FIFOResult[]): Promise<string> {
    const formattedCalculations = calculations.map(calc => ({
      ...calc,
      soldAmount: formatNumericValue(calc.soldAmount),
      usedBuyAmount: formatNumericValue(calc.usedBuyAmount),
      buyUnitPrice: formatNumericValue(calc.buyUnitPrice),
      buyValue: formatNumericValue(calc.buyValue),
      sellUnitPrice: formatNumericValue(calc.sellUnitPrice),
      sellValue: formatNumericValue(calc.sellValue),
      profitLoss: formatNumericValue(calc.profitLoss)
    }));

    // Create CSV header
    const headerRow = this.headers.map(h => h.title).join(',');
    
    // Create CSV rows
    const rows = formattedCalculations.map(calc => {
      return this.headers.map(h => {
        const value = calc[h.id as keyof typeof calc];
        // Wrap values in quotes if they contain commas
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',');
    });

    // Combine header and rows
    return [headerRow, ...rows].join('\n');
  }
} 