import { createObjectCsvWriter } from 'csv-writer';
import { FIFOResult } from './types';
import { formatNumericValue } from './utils';

export class CSVExporter {
  private csvWriter;

  constructor(filePath: string) {
    this.csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
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
      ]
    });
  }

  public async export(calculations: FIFOResult[]): Promise<void> {
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

    await this.csvWriter.writeRecords(formattedCalculations);
  }
} 