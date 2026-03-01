export interface StockQuote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface StockProvider {
  fetchQuote(symbol: string): Promise<StockQuote>;
  fetchBatch(symbols: string[]): Promise<StockQuote[]>;
}
