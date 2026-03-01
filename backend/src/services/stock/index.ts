import { config } from "../../config/env.js";
import { AlphaVantageProvider } from "./alphavantage-provider.js";
import { MockStockProvider } from "./mock-provider.js";
import type { StockProvider } from "./types.js";

export function createStockProvider(): StockProvider {
  if (config.stockApiProvider === "alphavantage") {
    return new AlphaVantageProvider();
  }
  return new MockStockProvider();
}

export type { StockProvider, StockQuote } from "./types.js";
