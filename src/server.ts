import express, { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { FIFOCalculator } from './fifoCalculator';
import { CSVExporter } from './csvExporter';
import { CryptoTransaction } from './types';
import { parseNumericFields } from './utils';
import path from 'path';
import fs from 'fs';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API endpoint to handle CSV processing
app.post('/api/calculate', async (req: Request, res: Response) => {
    try {
        const { csv } = req.body;
        
        // Check if CSV data is empty
        if (!csv || csv.trim() === '') {
            return res.status(400).json({ 
                error: 'CSV data is empty',
                details: 'Please provide CSV data to process'
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
            return res.status(400).json({ 
                error: 'Invalid CSV format',
                details: 'The provided data is not in valid CSV format'
            });
        }

        // Check if any records were parsed
        if (!records || records.length === 0) {
            return res.status(400).json({ 
                error: 'No valid records found',
                details: 'The CSV data does not contain any valid records'
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
        const transactions: CryptoTransaction[] = records.map((record: any) => {
            try {
                // Parse numeric fields
                const parsedRecord = parseNumericFields(record, numericFields);
                
                return {
                    date: record.Fecha,
                    type: record.Tipo,
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
            return res.status(400).json({ 
                error: 'No calculations generated',
                details: 'No FIFO calculations could be generated from the provided data'
            });
        }

        // Export to CSV
        const exporter = new CSVExporter('temp_fifo_calculations.csv');
        await exporter.export(calculations);

        // Send the file
        res.download('temp_fifo_calculations.csv', 'fifo_calculations.csv', (err: Error | null) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Clean up the temporary file
            try {
                fs.unlinkSync('temp_fifo_calculations.csv');
            } catch (unlinkError) {
                console.error('Error cleaning up temporary file:', unlinkError);
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
    }
});

// Serve index.html for the root route
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 