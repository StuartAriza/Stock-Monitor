import { useState } from "react";
import type { PriceUpdate } from "../types";

interface Props {
  symbol: string;
  name: string | null;
  price: PriceUpdate | null;
  rulesCount: number;
  alertsCount: number;
  onRemove: (symbol: string) => void;
}

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PriceCard({ symbol, name, price, rulesCount, alertsCount, onRemove }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isUp = (price?.change ?? 0) >= 0;
  const changeColor = isUp ? "var(--green)" : "var(--red)";
  const changeBg = isUp ? "var(--green-dim)" : "var(--red-dim)";

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px",
      animation: "fadeIn 0.3s ease-out",
      transition: "border-color 0.2s, background 0.2s",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--border-active)";
      e.currentTarget.style.background = "var(--bg-card-hover)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.background = "var(--bg-card)";
    }}
    >
      {alertsCount > 0 && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--amber)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "0.02em" }}>
            {symbol}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 2 }}>
            {name || symbol}
          </div>
        </div>
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            style={{ color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", padding: "2px 6px", borderRadius: 4 }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            ✕
          </button>
        ) : (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => onRemove(symbol)}
              style={{ color: "var(--red)", cursor: "pointer", fontSize: "0.7rem", padding: "2px 8px", background: "var(--red-dim)", borderRadius: 4 }}
            >
              Remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              style={{ color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem", padding: "2px 8px" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
        {price ? `$${fmt(price.price)}` : <span style={{ color: "var(--text-muted)" }}>—</span>}
      </div>

      {price && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 500, color: changeColor,
            background: changeBg, padding: "2px 8px", borderRadius: 4,
          }}>
            {isUp ? "▲" : "▼"} {fmt(Math.abs(price.change))}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: changeColor,
          }}>
            {isUp ? "+" : ""}{price.changePercent.toFixed(2)}%
          </span>
        </div>
      )}

      <div style={{
        display: "flex", gap: 16, marginTop: 16, paddingTop: 12,
        borderTop: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--text-muted)",
      }}>
        {price && (
          <>
            <div>
              <span style={{ opacity: 0.6 }}>VOL </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{(price.volume / 1_000_000).toFixed(1)}M</span>
            </div>
            <div>
              <span style={{ opacity: 0.6 }}>H </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(price.high)}</span>
            </div>
            <div>
              <span style={{ opacity: 0.6 }}>L </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(price.low)}</span>
            </div>
          </>
        )}
        <div style={{ marginLeft: "auto" }}>
          <span style={{ opacity: 0.6 }}>Rules </span>
          <span style={{ fontFamily: "var(--font-mono)", color: rulesCount > 0 ? "var(--accent)" : "inherit" }}>{rulesCount}</span>
        </div>
      </div>
    </div>
  );
}
