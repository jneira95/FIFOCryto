export class FIFOCalculator {
    constructor(transactions) {
        this.transactions = transactions;
        this.balances = new Map();
        // Sort transactions by date
        this.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    calculate() {
        const calculations = [];
        let operationNumber = 1;
        for (const transaction of this.transactions) {
            if (transaction.type === 'BUY') {
                this.addToBalance(transaction);
            }
            else if (transaction.type === 'SELL') {
                const saleCalculations = this.processSale(transaction, operationNumber);
                calculations.push(...saleCalculations);
                operationNumber += saleCalculations.length;
            }
            else {
                console.warn(`Unknown transaction type: ${transaction.type}`);
            }
        }
        return calculations;
    }
    addToBalance(transaction) {
        const { crypto, amount, unitPrice, date } = transaction;
        if (!this.balances.has(crypto)) {
            this.balances.set(crypto, []);
        }
        this.balances.get(crypto)?.push({
            crypto,
            quantity: amount,
            purchasePrice: unitPrice,
            purchaseDate: date
        });
    }
    processSale(transaction, operationNumber) {
        const { crypto, amount, unitPrice: salePrice, date: saleDate } = transaction;
        const calculations = [];
        let remainingQuantity = amount;
        if (!this.balances.has(crypto)) {
            throw new Error(`No balance found for ${crypto}`);
        }
        const balances = this.balances.get(crypto);
        const newBalances = [];
        for (const balance of balances) {
            if (remainingQuantity <= 0) {
                newBalances.push(balance);
                continue;
            }
            const usedQuantity = Math.min(balance.quantity, remainingQuantity);
            const remainingBalance = balance.quantity - usedQuantity;
            calculations.push({
                operationNumber,
                sellDate: saleDate,
                crypto,
                soldAmount: amount,
                usedBuyAmount: usedQuantity,
                buyDate: balance.purchaseDate,
                buyUnitPrice: balance.purchasePrice,
                buyValue: usedQuantity * balance.purchasePrice,
                sellUnitPrice: salePrice,
                sellValue: usedQuantity * salePrice,
                profitLoss: (salePrice - balance.purchasePrice) * usedQuantity
            });
            remainingQuantity -= usedQuantity;
            if (remainingBalance > 0) {
                newBalances.push({
                    ...balance,
                    quantity: remainingBalance
                });
            }
        }
        this.balances.set(crypto, newBalances);
        return calculations;
    }
}
