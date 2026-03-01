import { createServer } from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/database.js";
import { logger } from "./utils/logger.js";
import { initWebSocket } from "./websocket/server.js";
import { createStockProvider } from "./services/stock/index.js";
import { startPolling, stopPolling } from "./services/poller.js";

async function main() {
  await prisma.$connect();
  logger.info("Database connected");

  const server = createServer(app);
  initWebSocket(server);

  const provider = createStockProvider();
  logger.info("Stock provider initialized", { provider: config.stockApiProvider });

  startPolling(provider);

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`, { env: config.nodeEnv });
  });

  const shutdown = async () => {
    logger.info("Shutting down...");
    stopPolling();
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.error("Fatal startup error", { error: String(err) });
  process.exit(1);
});
