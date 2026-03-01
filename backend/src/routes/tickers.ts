import { Router } from "express";
import { prisma } from "../config/database.js";
import { addTickerSchema } from "../middleware/validation.js";
import { AppError } from "../utils/errors.js";

const router = Router();

const jsonSafe = (value: unknown) =>
  JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

router.get("/", async (_req, res, next) => {
  try {
    const tickers = await prisma.ticker.findMany({
      where: { active: true },
      include: {
        prices: { orderBy: { timestamp: "desc" }, take: 1 },
        rules: { select: { id: true, type: true, threshold: true, enabled: true } },
        _count: { select: { alerts: true } },
      },
      orderBy: { symbol: "asc" },
    });
    res.json(jsonSafe(tickers));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = addTickerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }

    const existing = await prisma.ticker.findUnique({ where: { symbol: parsed.data.symbol } });
    if (existing) {
      if (!existing.active) {
        const updated = await prisma.ticker.update({
          where: { id: existing.id },
          data: { active: true },
        });
        return res.json(updated);
      }
      throw new AppError(409, `${parsed.data.symbol} is already tracked`);
    }

    const ticker = await prisma.ticker.create({ data: parsed.data });
    res.status(201).json(ticker);
  } catch (err) {
    next(err);
  }
});

router.delete("/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const ticker = await prisma.ticker.findUnique({ where: { symbol } });
    if (!ticker) throw new AppError(404, `Ticker ${symbol} not found`);

    await prisma.ticker.update({ where: { id: ticker.id }, data: { active: false } });
    res.json({ message: `${symbol} removed` });
  } catch (err) {
    next(err);
  }
});

export default router;
