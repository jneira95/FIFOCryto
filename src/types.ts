export interface CryptoTransaction {
  date: string;
  type: 'BUY' | 'SELL';
  crypto: string;
  amount: number;
  unitPrice: number;
}

export interface FIFOResult {
  operationNumber: number;
  sellDate: string;
  crypto: string;
  soldAmount: number;
  usedBuyAmount: number;
  buyDate: string;
  buyUnitPrice: number;
  buyValue: number;
  sellUnitPrice: number;
  sellValue: number;
  profitLoss: number;
}

export interface CryptoBalance {
  crypto: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
} 