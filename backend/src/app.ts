import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import tickerRoutes from "./routes/tickers.js";
import alertRoutes from "./routes/alerts.js";
import priceRoutes from "./routes/prices.js";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/tickers", tickerRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/prices", priceRoutes);

app.use(errorHandler);

export default app;
