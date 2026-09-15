import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("u") ?? "").toLowerCase().trim();

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ available: false, reason: "3-20 chars, lowercase letters/numbers/underscore only" });
  }

  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();

  return NextResponse.json({ available: !data });
}
