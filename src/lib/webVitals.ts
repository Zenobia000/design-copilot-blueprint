type Metric = {
  name: string;
  value: number;
  rating?: string;
  id: string;
  navigationType?: string;
};

type ReportHandler = (metric: Metric) => void;

const defaultHandler: ReportHandler = (metric) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(`[web-vitals] ${metric.name}`, metric.value, metric);
    return;
  }
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  });
  const url = "/api/v1/observability/web-vitals";
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
};

export async function initWebVitals(report: ReportHandler = defaultHandler) {
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import("web-vitals");
    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  } catch {
    // web-vitals not installed yet — run `npm i web-vitals` to enable
  }
}
