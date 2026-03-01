import { z } from "zod";

export const addTickerSchema = z.object({
  symbol: z.string().min(1).max(10).transform((s) => s.toUpperCase().trim()),
  name: z.string().optional(),
});

export const createRuleSchema = z.object({
  symbol: z.string().min(1).max(10).transform((s) => s.toUpperCase().trim()),
  type: z.enum(["ABOVE_PRICE", "BELOW_PRICE", "PCT_CHANGE", "VOLUME_SPIKE"]),
  threshold: z.number().positive(),
});

export const toggleRuleSchema = z.object({
  enabled: z.boolean(),
});
