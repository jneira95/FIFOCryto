# FIFO Crypto Calculator

This application calculates FIFO (First In, First Out) cryptocurrency transactions and exports the results to a CSV file.

## Features

- Calculates FIFO for cryptocurrency transactions
- Handles multiple cryptocurrencies
- Exports results to CSV with detailed transaction information
- Includes gain/loss calculations

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

1. Modify the transactions array in `src/index.ts` with your actual transaction data
2. Build the project:
```bash
npm run build
```
3. Run the application:
```bash
npm start
```

The application will generate a `fifo_calculations.csv` file with the following columns:
- Nº Operación
- Fecha Venta
- Cripto
- Cantidad Vendida
- Cantidad Comprada Usada
- Fecha Compra
- Precio Compra Unitario (EUR)
- Valor Compra (EUR)
- Precio Venta Unitario (EUR)
- Valor Venta (EUR)
- Ganancia/Pérdida (EUR)

## Transaction Format

Input transactions should follow this format:
```typescript
interface Transaction {
  Fecha: string;              // Date in YYYY-MM-DD format
  Tipo: 'COMPRA' | 'VENTA';   // Transaction type (BUY/SELL)
  Cripto: string;             // Cryptocurrency symbol
  Cantidad: number;           // Amount
  'Precio Unitario (EUR)': number;  // Unit price in EUR
  'Total (EUR)': number;      // Total amount in EUR
  'Comisión (EUR)': number;   // Commission in EUR
  'Neto EUR': number;         // Net amount in EUR
}
```

## Development

To run the application in development mode:
```bash
npm run dev
``` 