import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "./utils/api";
import { useWebSocket } from "./hooks/useWebSocket";
import { PriceCard } from "./components/PriceCard";
import { AddTickerForm } from "./components/AddTickerForm";
import { AlertRulesPanel } from "./components/AlertRulesPanel";
import { AlertHistory } from "./components/AlertHistory";
import { StatusBar } from "./components/StatusBar";
import type { Ticker, AlertRule, AlertEvent, PriceUpdate, RuleType, WSMessage } from "./types";

type SortKey = "symbol" | "price" | "change";

export default function App() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [history, setHistory] = useState<AlertEvent[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("symbol");
  const [tab, setTab] = useState<"rules" | "history">("rules");

  const loadData = useCallback(async () => {
    const [t, r, h] = await Promise.all([api.getTickers(), api.getRules(), api.getAlertHistory()]);
    setTickers(t);
    setRules(r);
    setHistory(h);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleWS = useCallback((msg: WSMessage) => {
    if (msg.type === "price_update") {
      const data = msg.data as PriceUpdate;
      setPrices((prev) => ({ ...prev, [data.symbol]: data }));
    }
    if (msg.type === "alert_triggered") {
      api.getAlertHistory().then(setHistory).catch(() => {});
    }
  }, []);

  const { connected } = useWebSocket(handleWS);

  const handleAddTicker = async (symbol: string) => {
    await api.addTicker(symbol);
    await loadData();
  };

  const handleRemoveTicker = async (symbol: string) => {
    await api.removeTicker(symbol);
    await loadData();
  };

  const handleCreateRule = async (symbol: string, type: RuleType, threshold: number) => {
    await api.createRule(symbol, type, threshold);
    setRules(await api.getRules());
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    await api.toggleRule(id, enabled);
    setRules(await api.getRules());
  };

  const handleDeleteRule = async (id: string) => {
    await api.deleteRule(id);
    setRules(await api.getRules());
  };

  const sortedTickers = useMemo(() => {
    let filtered = tickers.filter((t) =>
      t.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      (t.name || "").toLowerCase().includes(filter.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol);
      const pa = prices[a.symbol];
      const pb = prices[b.symbol];
      if (sortBy === "price") return (pb?.price ?? 0) - (pa?.price ?? 0);
      if (sortBy === "change") return Math.abs(pb?.changePercent ?? 0) - Math.abs(pa?.changePercent ?? 0);
      return 0;
    });
  }, [tickers, filter, sortBy, prices]);

  const activeRules = rules.filter((r) => r.enabled).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px" }}>
      <header style={{ marginBottom: 8 }}>
        <h1 style={{
          fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: 6, display: "inline-flex",
            alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
            background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
          }}>
            ◆
          </span>
          Stock Monitor
        </h1>
      </header>

      <StatusBar connected={connected} tickerCount={tickers.length} activeRules={activeRules} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter tickers..."
              style={{
                background: "var(--bg-input)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "8px 14px", color: "var(--text-primary)",
                fontSize: "0.82rem", width: 180,
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
            <div style={{ display: "flex", gap: 2, background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: 2 }}>
              {(["symbol", "price", "change"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  style={{
                    padding: "6px 12px", borderRadius: 6, cursor: "pointer",
                    fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em",
                    fontWeight: 500,
                    background: sortBy === key ? "var(--bg-card)" : "transparent",
                    color: sortBy === key ? "var(--text-primary)" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 260 }}>
              <AddTickerForm onAdd={handleAddTicker} />
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}>
            {sortedTickers.map((t) => (
              <PriceCard
                key={t.id}
                symbol={t.symbol}
                name={t.name}
                price={prices[t.symbol] || null}
                rulesCount={t.rules.length}
                alertsCount={t._count.alerts}
                onRemove={handleRemoveTicker}
              />
            ))}
            {sortedTickers.length === 0 && (
              <div style={{
                gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px",
                color: "var(--text-muted)", fontSize: "0.9rem",
              }}>
                {filter ? "No tickers match your filter" : "Add a ticker to get started"}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
          <div style={{ display: "flex", gap: 2, background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: 2 }}>
            {(["rules", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, cursor: "pointer",
                  fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em",
                  fontWeight: 500,
                  background: tab === t ? "var(--bg-card)" : "transparent",
                  color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {t === "rules" ? `Rules (${rules.length})` : `History (${history.length})`}
              </button>
            ))}
          </div>

          {tab === "rules" ? (
            <AlertRulesPanel
              rules={rules}
              symbols={tickers.map((t) => t.symbol)}
              onCreateRule={handleCreateRule}
              onToggleRule={handleToggleRule}
              onDeleteRule={handleDeleteRule}
            />
          ) : (
            <AlertHistory events={history} />
          )}
        </div>
      </div>
    </div>
  );
}
