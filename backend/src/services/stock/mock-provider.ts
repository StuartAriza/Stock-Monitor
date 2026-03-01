import type { StockProvider, StockQuote } from "./types.js";

const BASE_PRICES: Record<string, { price: number; name: string }> = {
  AAPL: { price: 189.5, name: "Apple Inc." },
  MSFT: { price: 378.2, name: "Microsoft Corporation" },
  GOOGL: { price: 141.8, name: "Alphabet Inc." },
  TSLA: { price: 248.4, name: "Tesla Inc." },
  NVDA: { price: 475.6, name: "NVIDIA Corporation" },
  AMZN: { price: 178.3, name: "Amazon.com Inc." },
  META: { price: 505.7, name: "Meta Platforms Inc." },
  AMD: { price: 124.9, name: "Advanced Micro Devices" },
  NFLX: { price: 628.5, name: "Netflix Inc." },
  JPM: { price: 198.7, name: "JPMorgan Chase & Co." },
};

const state = new Map<string, { current: number; prevClose: number }>();

function drift(base: number): number {
  const volatility = 0.008;
  const change = (Math.random() - 0.48) * volatility * base;
  return Math.round((base + change) * 100) / 100;
}

function getState(symbol: string) {
  if (!state.has(symbol)) {
    const base = BASE_PRICES[symbol]?.price ?? 100 + Math.random() * 200;
    state.set(symbol, { current: base, prevClose: base * (1 - (Math.random() - 0.5) * 0.02) });
  }
  return state.get(symbol)!;
}

export class MockStockProvider implements StockProvider {
  async fetchQuote(symbol: string): Promise<StockQuote> {
    const s = getState(symbol);
    s.current = drift(s.current);
    const change = s.current - s.prevClose;
    const changePercent = (change / s.prevClose) * 100;

    return {
      symbol,
      price: s.current,
      open: s.prevClose * (1 + (Math.random() - 0.5) * 0.005),
      high: s.current * (1 + Math.random() * 0.01),
      low: s.current * (1 - Math.random() * 0.01),
      volume: Math.floor(10_000_000 + Math.random() * 50_000_000),
      previousClose: s.prevClose,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      timestamp: new Date(),
    };
  }

  async fetchBatch(symbols: string[]): Promise<StockQuote[]> {
    return Promise.all(symbols.map((s) => this.fetchQuote(s)));
  }
}
