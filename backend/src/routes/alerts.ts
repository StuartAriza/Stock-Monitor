import { Router } from "express";
import { prisma } from "../config/database.js";
import { createRuleSchema, toggleRuleSchema } from "../middleware/validation.js";
import { AppError } from "../utils/errors.js";

const router = Router();

router.get("/rules", async (req, res, next) => {
  try {
    const rules = await prisma.alertRule.findMany({
      include: { ticker: { select: { symbol: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(rules);
  } catch (err) {
    next(err);
  }
});

router.post("/rules", async (req, res, next) => {
  try {
    const parsed = createRuleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }

    const ticker = await prisma.ticker.findUnique({ where: { symbol: parsed.data.symbol } });
    if (!ticker) throw new AppError(404, `Ticker ${parsed.data.symbol} not found`);

    const rule = await prisma.alertRule.create({
      data: {
        tickerId: ticker.id,
        type: parsed.data.type,
        threshold: parsed.data.threshold,
      },
      include: { ticker: { select: { symbol: true } } },
    });

    res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
});

router.patch("/rules/:id", async (req, res, next) => {
  try {
    const parsed = toggleRuleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }

    const rule = await prisma.alertRule.update({
      where: { id: req.params.id },
      data: { enabled: parsed.data.enabled },
      include: { ticker: { select: { symbol: true } } },
    });

    res.json(rule);
  } catch (err) {
    next(err);
  }
});

router.delete("/rules/:id", async (req, res, next) => {
  try {
    await prisma.alertRule.delete({ where: { id: req.params.id } });
    res.json({ message: "Rule deleted" });
  } catch (err) {
    next(err);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const symbol = req.query.symbol as string | undefined;

    const where = symbol
      ? { ticker: { symbol: symbol.toUpperCase() } }
      : {};

    const events = await prisma.alertEvent.findMany({
      where,
      include: {
        ticker: { select: { symbol: true } },
        rule: { select: { type: true, threshold: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
});

export default router;
