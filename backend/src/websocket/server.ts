import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger.js";

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    logger.info("WebSocket client connected", { clients: wss?.clients.size });

    ws.on("close", () => {
      logger.info("WebSocket client disconnected", { clients: wss?.clients.size });
    });

    ws.on("error", (err) => {
      logger.error("WebSocket error", { error: String(err) });
    });
  });

  logger.info("WebSocket server initialized");
}

export function broadcast(payload: Record<string, unknown>) {
  if (!wss) return;

  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
