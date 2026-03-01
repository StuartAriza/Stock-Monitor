import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import type { StockProvider, StockQuote } from "./types.js";

const BASE_URL = "https://www.alphavantage.co/query";

export class AlphaVantageProvider implements StockProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = config.alphaVantageKey;
    if (!this.apiKey) {
      logger.warn("Alpha Vantage API key not configured");
    }
  }

  async fetchQuote(symbol: string): Promise<StockQuote> {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Alpha Vantage API error: ${res.status}`);
    }

    const data = await res.json();
    const q = data["Global Quote"];

    if (!q || !q["05. price"]) {
      throw new Error(`No quote data for ${symbol}`);
    }

    const price = parseFloat(q["05. price"]);
    const prevClose = parseFloat(q["08. previous close"]);

    return {
      symbol,
      price,
      open: parseFloat(q["02. open"]),
      high: parseFloat(q["03. high"]),
      low: parseFloat(q["04. low"]),
      volume: parseInt(q["06. volume"], 10),
      previousClose: prevClose,
      change: parseFloat(q["09. change"]),
      changePercent: parseFloat(q["10. change percent"]?.replace("%", "") ?? "0"),
      timestamp: new Date(q["07. latest trading day"]),
    };
  }

  async fetchBatch(symbols: string[]): Promise<StockQuote[]> {
    const results: StockQuote[] = [];
    for (const symbol of symbols) {
      try {
        results.push(await this.fetchQuote(symbol));
        await new Promise((r) => setTimeout(r, 250));
      } catch (err) {
        logger.error(`Failed to fetch ${symbol}`, { error: String(err) });
      }
    }
    return results;
  }
}
