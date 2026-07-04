import { NextResponse } from "next/server";

/**
 * Endpoint de santé pour le monitoring d'uptime (§25 du CDC).
 * Volontairement sans dépendance externe : une réponse 200 signifie que le
 * runtime Next.js répond, pas que Supabase/LabelGrid/etc. sont joignables.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "sterkte-records-distributor",
    timestamp: new Date().toISOString(),
  });
}
