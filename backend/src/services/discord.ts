import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

export async function sendDiscordAlert(embed: DiscordEmbed): Promise<boolean> {
  if (!config.discord.enabled || !config.discord.webhookUrl) {
    logger.info("Discord alert skipped (disabled)", { title: embed.title });
    return false;
  }

  try {
    const res = await fetch(config.discord.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Stock Monitor",
        embeds: [{ ...embed, timestamp: embed.timestamp ?? new Date().toISOString() }],
      }),
    });

    if (!res.ok) {
      logger.error("Discord webhook failed", { status: res.status });
      return false;
    }

    return true;
  } catch (err) {
    logger.error("Discord webhook error", { error: String(err) });
    return false;
  }
}

export function buildAlertEmbed(
  symbol: string,
  ruleType: string,
  threshold: number,
  currentPrice: number,
  message: string,
): DiscordEmbed {
  const isWarning = ruleType === "BELOW_PRICE" || (ruleType === "PCT_CHANGE" && currentPrice < threshold);
  return {
    title: `🚨 Alert: ${symbol}`,
    description: message,
    color: isWarning ? 0xff4444 : 0x44ff44,
    fields: [
      { name: "Symbol", value: symbol, inline: true },
      { name: "Price", value: `$${currentPrice.toFixed(2)}`, inline: true },
      { name: "Rule", value: `${ruleType} @ ${threshold}`, inline: true },
    ],
  };
}
