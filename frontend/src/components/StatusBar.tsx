interface Props {
  connected: boolean;
  tickerCount: number;
  activeRules: number;
}

export function StatusBar({ connected, tickerCount, activeRules }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24, padding: "10px 0",
      borderBottom: "1px solid var(--border)", marginBottom: 24, fontSize: "0.78rem",
      color: "var(--text-muted)", fontFamily: "var(--font-mono)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: connected ? "var(--green)" : "var(--red)",
          boxShadow: connected ? "0 0 8px var(--green)" : "none",
        }} />
        <span>{connected ? "LIVE" : "DISCONNECTED"}</span>
      </div>
      <div>{tickerCount} tickers</div>
      <div>{activeRules} active rules</div>
      <div style={{ marginLeft: "auto", opacity: 0.5 }}>
        {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}
