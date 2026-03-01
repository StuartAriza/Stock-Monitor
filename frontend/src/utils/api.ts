const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  getTickers: () => request<import("../types").Ticker[]>("/tickers"),
  addTicker: (symbol: string, name?: string) =>
    request("/tickers", { method: "POST", body: JSON.stringify({ symbol, name }) }),
  removeTicker: (symbol: string) =>
    request(`/tickers/${symbol}`, { method: "DELETE" }),
  getRules: () => request<import("../types").AlertRule[]>("/alerts/rules"),
  createRule: (symbol: string, type: string, threshold: number) =>
    request("/alerts/rules", { method: "POST", body: JSON.stringify({ symbol, type, threshold }) }),
  toggleRule: (id: string, enabled: boolean) =>
    request(`/alerts/rules/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  deleteRule: (id: string) =>
    request(`/alerts/rules/${id}`, { method: "DELETE" }),
  getAlertHistory: (limit = 50) => request<import("../types").AlertEvent[]>(`/alerts/history?limit=${limit}`),
};
