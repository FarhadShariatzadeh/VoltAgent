const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// --- Typed API helpers ---

export interface DashboardData {
  bill_forecast_dollars: number;
  kwh_used_this_month: number;
  tier1_limit_kwh: number;
  current_rate_period: string;
  current_rate_cents_per_kwh: number;
  vampire_monthly_cost_dollars: number;
  vampire_devices_flagged: number;
}

export interface UsagePoint {
  interval_start: string;
  kwh: number;
}

export interface AlertItem {
  id: number;
  alert_type: string;
  channel: string;
  title: string;
  body: string;
  delivered: boolean;
  read: boolean;
  created_at: string;
}

export interface ChallengeData {
  id: number;
  started_at: string;
  ends_at: string;
  status: string;
  baseline_daily_kwh: number;
  target_daily_kwh: number;
  kwh_saved_total: number;
  dollars_saved_total: number;
  days_on_target: number;
  days_elapsed: number;
  days_remaining: number;
  progress_pct: number;
}

export interface ChallengeDayResult {
  day_number: number;
  date: string;
  actual_kwh: number;
  target_kwh: number;
  met_target: boolean;
  dollars_saved: number;
}

export interface UserSavings {
  kwh_used_this_month: number;
  projected_bill_dollars: number;
  dollars_saved_vs_last_month: number;
  challenges_completed: number;
  total_kwh_saved_all_time: number;
  total_dollars_saved_all_time: number;
}

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardData>("/dashboard/"),
  getUsageHistory: (days = 30) =>
    apiClient.get<UsagePoint[]>(`/dashboard/usage-history?days=${days}`),
};

export const alertsApi = {
  list: (limit = 20) => apiClient.get<AlertItem[]>(`/notifications/?limit=${limit}`),
  markRead: (id: number) => apiClient.post<{ ok: boolean }>(`/notifications/${id}/read`),
};

export const challengeApi = {
  enroll: () => apiClient.post<ChallengeData>("/challenge/enroll"),
  getCurrent: () => apiClient.get<ChallengeData>("/challenge/current"),
  getDayResults: () => apiClient.get<ChallengeDayResult[]>("/challenge/current/days"),
  getHistory: () => apiClient.get<ChallengeData[]>("/challenge/history"),
};

export const analyticsApi = {
  getMySavings: () => apiClient.get<UserSavings>("/analytics/my-savings"),
};
