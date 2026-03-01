import { useState } from "react";

interface Props {
  onAdd: (symbol: string) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "10px 14px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  width: "100%",
  transition: "border-color 0.2s",
};

const btnStyle: React.CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "var(--radius)",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "0.85rem",
  transition: "background 0.2s",
  whiteSpace: "nowrap",
};

export function AddTickerForm({ onAdd }: Props) {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError("");
    try {
      await onAdd(symbol.trim().toUpperCase());
      setSymbol("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ticker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="SYMBOL"
          maxLength={10}
          style={inputStyle}
          onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
          onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
        />
        {error && <div style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: 4 }}>{error}</div>}
      </div>
      <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
        {loading ? "..." : "Track"}
      </button>
    </form>
  );
}
