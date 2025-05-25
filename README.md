# FIFO Crypto Calculator

A web application that calculates FIFO (First In, First Out) cryptocurrency transactions and provides results in both downloadable CSV format and copyable text.

## Features

- Web interface for easy data input
- Calculates FIFO for cryptocurrency transactions
- Handles multiple cryptocurrencies
- Supports CSV input with automatic parsing
- Provides results in both downloadable CSV and copyable text format
- Includes gain/loss calculations
- Modern, responsive UI with dark theme
- Real-time error handling and validation

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm run build && npm start
```

2. Open your browser and navigate to `http://localhost:8080`

3. Input your transaction data in CSV format with the following columns:
   - Fecha (Date in YYYY-MM-DD format)
   - Tipo (Transaction type: Buy/Sell)
   - Cripto (Cryptocurrency symbol)
   - Cantidad (Amount)
   - Precio Unitario (EUR) (Unit price in EUR)

4. Click "Calcular FIFO" to process your transactions

5. View the results and choose to:
   - Copy the CSV content to clipboard
   - Download the results as a CSV file

## CSV Format

Input CSV should have the following format:
```csv
Fecha,Tipo,Cripto,Cantidad,Precio Unitario (EUR)
2023-01-01,Buy,BTC,0.1,30000
2023-02-01,Sell,BTC,0.05,35000
```

## Output Format

The application generates a CSV with the following columns:
- Nº Operación (Operation Number)
- Fecha Venta (Sell Date)
- Cripto (Cryptocurrency)
- Cantidad Vendida (Sold Amount)
- Cantidad Comprada Usada (Used Buy Amount)
- Fecha Compra (Buy Date)
- Precio Compra Unitario (EUR) (Buy Unit Price)
- Valor Compra (EUR) (Buy Value)
- Precio Venta Unitario (EUR) (Sell Unit Price)
- Valor Venta (EUR) (Sell Value)
- Ganancia/Pérdida (EUR) (Gain/Loss)

## Development

To run the application in development mode:
```bash
npm run dev
```

## Error Handling

The application provides clear error messages for:
- Invalid CSV format
- Missing required fields
- Invalid date formats
- Invalid numeric values
- Empty input data

## Technologies Used

- TypeScript
- Node.js
- Express
- CSV Parser
- Modern CSS with CSS Variables
- Responsive Design 