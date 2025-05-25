import { FIFOCalculator } from '../dist/fifoCalculator.js';
import { CSVExporter } from '../dist/csvExporter.js';
import { parseNumericFields } from '../dist/utils.js';
import Papa from 'papaparse';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle API endpoint
    if (url.pathname === '/api/calculate' && request.method === 'POST') {
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
              ...corsHeaders
            }
          });
        }
        
        // Parse CSV using PapaParse
        const { data: records, errors } = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          trimHeaders: true,
          transformHeader: (header) => header.trim()
        });

        if (errors && errors.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'Invalid CSV format',
            details: errors[0].message
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
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
              ...corsHeaders
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
              ...corsHeaders
            }
          });
        }

        // Export to CSV
        const exporter = new CSVExporter();
        const csvContent = await exporter.exportToString(calculations);

        // Send the CSV content
        return new Response(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="fifo_calculations.csv"',
            ...corsHeaders
          }
        });

      } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ 
          error: 'Server error',
          details: error instanceof Error ? error.message : 'An unexpected error occurred'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Serve static files
    try {
      // Get the path from the URL
      let path = url.pathname;
      
      // If the path is '/', serve index.html
      if (path === '/') {
        path = '/index.html';
      }

      // Try to fetch the file from the public directory
      const file = await env.ASSETS.fetch(new URL(path, url.origin));
      
      if (file.status === 404) {
        // If the file is not found, try serving index.html (for SPA routing)
        const indexFile = await env.ASSETS.fetch(new URL('/index.html', url.origin));
        return indexFile;
      }

      // Add CORS headers to static file responses
      const response = new Response(file.body, file);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;

    } catch (error) {
      // If there's an error, return a 404 response
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });
    }
  }
}; 