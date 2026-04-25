export const dynamic = "force-dynamic";

const processStartedAt = Date.now();

function line(name: string, value: number, labels?: Record<string, string>) {
  const renderedLabels = labels
    ? `{${Object.entries(labels)
        .map(([key, labelValue]) => `${key}="${labelValue.replaceAll('"', '\\"')}"`)
        .join(",")}}`
    : "";

  return `${name}${renderedLabels} ${value}`;
}

export function GET() {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const now = Date.now();
  const lines = [
    "# HELP ai20k_demo_web_up Whether the Next.js web process is serving requests.",
    "# TYPE ai20k_demo_web_up gauge",
    line("ai20k_demo_web_up", 1),
    "# HELP ai20k_demo_web_uptime_seconds Process uptime in seconds.",
    "# TYPE ai20k_demo_web_uptime_seconds gauge",
    line("ai20k_demo_web_uptime_seconds", Math.round(process.uptime())),
    "# HELP ai20k_demo_web_started_at_seconds Unix timestamp when this process module was loaded.",
    "# TYPE ai20k_demo_web_started_at_seconds gauge",
    line("ai20k_demo_web_started_at_seconds", Math.round(processStartedAt / 1000)),
    "# HELP ai20k_demo_web_memory_bytes Process memory usage by kind.",
    "# TYPE ai20k_demo_web_memory_bytes gauge",
    line("ai20k_demo_web_memory_bytes", memory.rss, { kind: "rss" }),
    line("ai20k_demo_web_memory_bytes", memory.heapUsed, { kind: "heap_used" }),
    line("ai20k_demo_web_memory_bytes", memory.heapTotal, { kind: "heap_total" }),
    line("ai20k_demo_web_memory_bytes", memory.external, { kind: "external" }),
    "# HELP ai20k_demo_web_cpu_seconds_total Process CPU time by kind.",
    "# TYPE ai20k_demo_web_cpu_seconds_total counter",
    line("ai20k_demo_web_cpu_seconds_total", cpu.user / 1_000_000, { kind: "user" }),
    line("ai20k_demo_web_cpu_seconds_total", cpu.system / 1_000_000, { kind: "system" }),
    "# HELP ai20k_demo_web_scrape_timestamp_seconds Unix timestamp for this metrics scrape.",
    "# TYPE ai20k_demo_web_scrape_timestamp_seconds gauge",
    line("ai20k_demo_web_scrape_timestamp_seconds", Math.round(now / 1000)),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}
