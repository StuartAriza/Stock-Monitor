import type { AlertEvent } from "../types";

interface Props {
  events: AlertEvent[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AlertHistory({ events }: Props) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: 20,
    }}>
      <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
        Alert History
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 360, overflowY: "auto" }}>
        {events.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "12px 0" }}>No alerts triggered yet</div>
        )}
        {events.map((evt, i) => (
          <div key={evt.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
            borderRadius: "var(--radius)", animation: `slideIn 0.2s ease-out ${i * 0.03}s both`,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: evt.rule.type === "BELOW_PRICE" ? "var(--red)" : evt.rule.type === "PCT_CHANGE" ? "var(--amber)" : "var(--green)",
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)", minWidth: 48 }}>
              {evt.ticker.symbol}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {evt.message}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>
              {timeAgo(evt.createdAt)}
            </span>
            {evt.discordSent && (
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", opacity: 0.6 }} title="Sent to Discord">
                ⚡
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
