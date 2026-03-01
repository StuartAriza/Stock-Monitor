import { PrismaClient, RuleType } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_TICKERS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
];

async function main() {
  for (const t of SEED_TICKERS) {
    const ticker = await prisma.ticker.upsert({
      where: { symbol: t.symbol },
      update: {},
      create: t,
    });

    await prisma.alertRule.createMany({
      skipDuplicates: true,
      data: [
        { tickerId: ticker.id, type: RuleType.ABOVE_PRICE, threshold: 200 },
        { tickerId: ticker.id, type: RuleType.PCT_CHANGE, threshold: 5 },
      ],
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
