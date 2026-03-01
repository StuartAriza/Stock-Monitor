import { Router } from "express";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/errors.js";

const router = Router();

router.get("/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

    const ticker = await prisma.ticker.findUnique({ where: { symbol } });
    if (!ticker) throw new AppError(404, `Ticker ${symbol} not found`);

    const prices = await prisma.priceRecord.findMany({
      where: { tickerId: ticker.id },
      orderBy: { timestamp: "desc" },
      take: limit,
      select: {
        price: true,
        open: true,
        high: true,
        low: true,
        volume: true,
        timestamp: true,
      },
    });

    res.json({
      symbol,
      prices: prices.map((p) => ({
        ...p,
        volume: p.volume ? Number(p.volume) : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
