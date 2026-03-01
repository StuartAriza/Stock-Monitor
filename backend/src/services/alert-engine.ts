import { RuleType } from "@prisma/client";
import { prisma } from "../config/database.js";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { buildAlertEmbed, sendDiscordAlert } from "./discord.js";
import type { StockQuote } from "./stock/types.js";

interface EvaluationResult {
  ruleId: string;
  triggered: boolean;
  message: string;
}

function evaluateRule(
  ruleType: RuleType,
  threshold: number,
  quote: StockQuote,
): { triggered: boolean; message: string } {
  switch (ruleType) {
    case RuleType.ABOVE_PRICE:
      return {
        triggered: quote.price > threshold,
        message: `${quote.symbol} is above $${threshold} — current: $${quote.price.toFixed(2)}`,
      };

    case RuleType.BELOW_PRICE:
      return {
        triggered: quote.price < threshold,
        message: `${quote.symbol} dropped below $${threshold} — current: $${quote.price.toFixed(2)}`,
      };

    case RuleType.PCT_CHANGE:
      return {
        triggered: Math.abs(quote.changePercent) >= threshold,
        message: `${quote.symbol} moved ${quote.changePercent > 0 ? "+" : ""}${quote.changePercent.toFixed(2)}% (threshold: ±${threshold}%)`,
      };

    case RuleType.VOLUME_SPIKE: {
      const avgVolume = 20_000_000;
      const ratio = quote.volume / avgVolume;
      return {
        triggered: ratio >= threshold,
        message: `${quote.symbol} volume spike: ${(ratio).toFixed(1)}x average (threshold: ${threshold}x)`,
      };
    }

    default:
      return { triggered: false, message: "" };
  }
}

async function isInCooldown(ruleId: string): Promise<boolean> {
  const recent = await prisma.alertEvent.findFirst({
    where: {
      ruleId,
      createdAt: { gte: new Date(Date.now() - config.alertCooldownMs) },
    },
    orderBy: { createdAt: "desc" },
  });
  return !!recent;
}

export async function evaluateAlerts(quotes: StockQuote[]): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  const rules = await prisma.alertRule.findMany({
    where: { enabled: true },
    include: { ticker: true },
  });

  for (const rule of rules) {
    const quote = quoteMap.get(rule.ticker.symbol);
    if (!quote) continue;

    const { triggered, message } = evaluateRule(rule.type, rule.threshold, quote);
    if (!triggered) continue;

    const cooldown = await isInCooldown(rule.id);
    if (cooldown) continue;

    const embed = buildAlertEmbed(rule.ticker.symbol, rule.type, rule.threshold, quote.price, message);
    const discordSent = await sendDiscordAlert(embed);

    await prisma.alertEvent.create({
      data: {
        tickerId: rule.tickerId,
        ruleId: rule.id,
        message,
        priceAtAlert: quote.price,
        discordSent,
      },
    });

    logger.info("Alert triggered", { symbol: rule.ticker.symbol, rule: rule.type, message });
    results.push({ ruleId: rule.id, triggered: true, message });
  }

  return results;
}
