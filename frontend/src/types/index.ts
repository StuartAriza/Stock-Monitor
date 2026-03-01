export interface Ticker {
  id: string;
  symbol: string;
  name: string | null;
  active: boolean;
  prices: PriceRecord[];
  rules: AlertRule[];
  _count: { alerts: number };
}

export interface PriceRecord {
  price: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  timestamp: string;
}

export type RuleType = "ABOVE_PRICE" | "BELOW_PRICE" | "PCT_CHANGE" | "VOLUME_SPIKE";

export interface AlertRule {
  id: string;
  tickerId: string;
  type: RuleType;
  threshold: number;
  enabled: boolean;
  ticker?: { symbol: string };
}

export interface AlertEvent {
  id: string;
  tickerId: string;
  ruleId: string;
  message: string;
  priceAtAlert: number;
  discordSent: boolean;
  createdAt: string;
  ticker: { symbol: string };
  rule: { type: RuleType; threshold: number };
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: string;
}

export interface WSMessage {
  type: "price_update" | "alert_triggered";
  data: PriceUpdate | Record<string, unknown>;
}
