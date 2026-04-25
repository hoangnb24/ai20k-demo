export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ok: true,
    service: "ai20k-demo-web",
    uptimeSeconds: Math.round(process.uptime()),
  });
}
