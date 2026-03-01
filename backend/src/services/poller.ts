import { prisma } from "../config/database.js";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { evaluateAlerts } from "./alert-engine.js";
import type { StockProvider, StockQuote } from "./stock/types.js";
import { broadcast } from "../websocket/server.js";

let timer: ReturnType<typeof setInterval> | null = null;

export function startPolling(provider: StockProvider) {
  if (timer) return;

  logger.info("Starting price polling", { intervalMs: config.pollIntervalMs });

  const poll = async () => {
    try {
      const tickers = await prisma.ticker.findMany({ where: { active: true } });
      if (tickers.length === 0) return;

      const symbols = tickers.map((t) => t.symbol);
      const quotes = await provider.fetchBatch(symbols);

      const tickerMap = new Map(tickers.map((t) => [t.symbol, t]));

      for (const quote of quotes) {
        const ticker = tickerMap.get(quote.symbol);
        if (!ticker) continue;

        await prisma.priceRecord.create({
          data: {
            tickerId: ticker.id,
            price: quote.price,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            volume: BigInt(quote.volume),
            timestamp: quote.timestamp,
          },
        });

        broadcast({
          type: "price_update",
          data: {
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            high: quote.high,
            low: quote.low,
            timestamp: quote.timestamp.toISOString(),
          },
        });
      }

      const triggered = await evaluateAlerts(quotes);
      for (const alert of triggered) {
        broadcast({ type: "alert_triggered", data: alert });
      }
    } catch (err) {
      logger.error("Poll cycle failed", { error: String(err) });
    }
  };

  poll();
  timer = setInterval(poll, config.pollIntervalMs);
}

export function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info("Polling stopped");
  }
}
