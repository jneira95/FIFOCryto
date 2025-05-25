/**
 * Parses a numeric string value, handling both dot and comma as decimal separators
 * @param value The string value to parse
 * @returns The parsed number
 */
export function parseNumericValue(value) {
    if (typeof value !== 'string') {
        throw new Error(`Invalid numeric value: ${value}`);
    }
    // Remove any whitespace
    const trimmedValue = value.trim();
    // Replace comma with dot for parsing
    const normalizedValue = trimmedValue.replace(',', '.');
    const parsedValue = Number(normalizedValue);
    if (isNaN(parsedValue)) {
        throw new Error(`Invalid numeric value: ${value}`);
    }
    return parsedValue;
}
/**
 * Formats a number to use comma as decimal separator
 * @param value The number to format
 * @returns The formatted string
 */
export function formatNumericValue(value) {
    return value.toString().replace('.', ',');
}
/**
 * Parses all numeric fields in a record
 * @param record The record containing numeric fields
 * @param numericFields Array of field names that should be parsed as numbers
 * @returns The record with parsed numeric values
 */
export function parseNumericFields(record, numericFields) {
    const result = {};
    for (const [key, value] of Object.entries(record)) {
        if (numericFields.includes(key)) {
            result[key] = parseNumericValue(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
