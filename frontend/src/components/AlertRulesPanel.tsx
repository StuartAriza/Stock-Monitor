import { useState } from "react";
import type { AlertRule, RuleType } from "../types";

interface Props {
  rules: AlertRule[];
  symbols: string[];
  onCreateRule: (symbol: string, type: RuleType, threshold: number) => Promise<void>;
  onToggleRule: (id: string, enabled: boolean) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

const RULE_LABELS: Record<RuleType, string> = {
  ABOVE_PRICE: "Above Price",
  BELOW_PRICE: "Below Price",
  PCT_CHANGE: "% Change",
  VOLUME_SPIKE: "Volume Spike",
};

const selectStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
  color: "var(--text-primary)",
  fontSize: "0.82rem",
  cursor: "pointer",
};

const inputSmall: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.82rem",
  width: 100,
};

export function AlertRulesPanel({ rules, symbols, onCreateRule, onToggleRule, onDeleteRule }: Props) {
  const [newRule, setNewRule] = useState({ symbol: "", type: "ABOVE_PRICE" as RuleType, threshold: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.symbol || !newRule.threshold) return;
    await onCreateRule(newRule.symbol, newRule.type, parseFloat(newRule.threshold));
    setNewRule({ symbol: "", type: "ABOVE_PRICE", threshold: "" });
  };

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: 20,
    }}>
      <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
        Alert Rules
      </h3>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <select
          value={newRule.symbol}
          onChange={(e) => setNewRule((p) => ({ ...p, symbol: e.target.value }))}
          style={selectStyle}
        >
          <option value="">Ticker</option>
          {symbols.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={newRule.type}
          onChange={(e) => setNewRule((p) => ({ ...p, type: e.target.value as RuleType }))}
          style={selectStyle}
        >
          {(Object.keys(RULE_LABELS) as RuleType[]).map((t) => (
            <option key={t} value={t}>{RULE_LABELS[t]}</option>
          ))}
        </select>
        <input
          type="number"
          step="any"
          placeholder="Value"
          value={newRule.threshold}
          onChange={(e) => setNewRule((p) => ({ ...p, threshold: e.target.value }))}
          style={inputSmall}
        />
        <button type="submit" style={{
          background: "var(--accent-dim)", color: "var(--accent)", padding: "8px 16px",
          borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 500, fontSize: "0.82rem",
        }}>
          + Add Rule
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rules.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "12px 0" }}>No rules configured</div>
        )}
        {rules.map((rule) => (
          <div key={rule.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
            borderRadius: "var(--radius)", background: "var(--bg-secondary)",
            animation: "slideIn 0.2s ease-out", opacity: rule.enabled ? 1 : 0.4,
            transition: "opacity 0.2s",
          }}>
            <button
              onClick={() => onToggleRule(rule.id, !rule.enabled)}
              style={{
                width: 36, height: 20, borderRadius: 10, cursor: "pointer",
                background: rule.enabled ? "var(--green)" : "var(--border)",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 2, transition: "left 0.2s",
                left: rule.enabled ? 18 : 2,
              }} />
            </button>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--accent)", minWidth: 56 }}>
              {rule.ticker?.symbol}
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              {RULE_LABELS[rule.type]}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
              {rule.type === "PCT_CHANGE" ? `±${rule.threshold}%` : rule.type === "VOLUME_SPIKE" ? `${rule.threshold}×` : `$${rule.threshold}`}
            </span>
            <button
              onClick={() => onDeleteRule(rule.id)}
              style={{ marginLeft: "auto", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", padding: "2px 6px" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
