import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  stockApiProvider: process.env.STOCK_API_PROVIDER || "mock",
  alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY || "",

  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "10000", 10),
  alertCooldownMs: parseInt(process.env.ALERT_COOLDOWN_MS || "300000", 10),

  discord: {
    enabled: process.env.DISCORD_ENABLED === "true",
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || "",
  },
} as const;
