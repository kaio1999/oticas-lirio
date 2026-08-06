import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isSupabaseConfigured();
  const supabase = createSupabaseServerClient();

  if (!configured || !supabase) {
    return NextResponse.json({
      source: "mock",
      reason: "env ausente (NEXT_PUBLIC_SUPABASE_URL / PUBLISHABLE_KEY)",
      configured,
    });
  }

  const { data, error, count } = await supabase
    .from("products")
    .select("id,name", { count: "exact" })
    .limit(3);

  if (error) {
    return NextResponse.json({
      source: "mock-fallback",
      configured: true,
      error: error.message,
    });
  }

  return NextResponse.json({
    source: "supabase",
    configured: true,
    count,
    sample: data,
  });
}
