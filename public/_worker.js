import { FIFOCalculator } from '../src/fifoCalculator';
import { CSVExporter } from '../src/csvExporter';
import { parseNumericFields } from '../src/utils';
import { parse } from 'csv-parse/sync';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests to /api/calculate
    if (request.method !== 'POST' || !request.url.endsWith('/api/calculate')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const { csv } = await request.json();

      // Check if CSV data is empty
      if (!csv || csv.trim() === '') {
        return new Response(JSON.stringify({
          error: 'CSV data is empty',
          details: 'Please provide CSV data to process'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Parse CSV
      let records;
      try {
        records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } catch (parseError) {
        return new Response(JSON.stringify({
          error: 'Invalid CSV format',
          details: 'The provided data is not in valid CSV format'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Check if any records were parsed
      if (!records || records.length === 0) {
        return new Response(JSON.stringify({
          error: 'No valid records found',
          details: 'The CSV data does not contain any valid records'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Define numeric fields
      const numericFields = [
        'Cantidad',
        'Precio Unitario (EUR)',
        'Total (EUR)',
        'Neto EUR'
      ];

      // Convert to CryptoTransaction format
      const transactions = records.map((record) => {
        try {
          // Parse numeric fields
          const parsedRecord = parseNumericFields(record, numericFields);
          
          return {
            date: record.Fecha,
            type: record.Tipo.toUpperCase(), // Convert to uppercase to match expected format
            crypto: record.Cripto,
            amount: parsedRecord['Cantidad'],
            unitPrice: parsedRecord['Precio Unitario (EUR)'],
          };
        } catch (error) {
          throw new Error(`Invalid data in row: ${JSON.stringify(record)} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // Calculate FIFO
      const calculator = new FIFOCalculator(transactions);
      const calculations = calculator.calculate();

      // Check if any calculations were made
      if (calculations.length === 0) {
        return new Response(JSON.stringify({
          error: 'No calculations generated',
          details: 'No FIFO calculations could be generated from the provided data'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Export to CSV
      const exporter = new CSVExporter();
      const csvContent = await exporter.exportToString(calculations);

      // Return the CSV content
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="fifo_calculations.csv"',
          'Access-Control-Allow-Origin': '*',
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Server error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
}; 