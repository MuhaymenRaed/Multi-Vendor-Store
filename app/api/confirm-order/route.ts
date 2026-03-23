import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");
  const type = searchParams.get("type")?.toLowerCase(); // Standardize to lowercase

  // Validate orderId exists and is a valid UUID
  if (
    !orderId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      orderId,
    )
  ) {
    return NextResponse.redirect(
      new URL("/confirm-order?status=error", request.url),
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS to ensure the update happens
  );

  // 1. Determine target status based on type
  const targetStatus =
    type === "dispute" ? "verified_not_sold" : "verified_sold";
  const redirectStatus = type === "dispute" ? "disputed" : "success";

  // 2. Execute the Update
  // This update will fire our "Magic" PostgreSQL trigger automatically
  const { error } = await supabase
    .from("orders")
    .update({ status: targetStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Database Update Error:", error.message);

    // Fallback: Check if it was already updated (e.g. user clicked twice)
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (currentOrder?.status === targetStatus) {
      return NextResponse.redirect(
        new URL(`/confirm-order?status=${redirectStatus}`, request.url),
      );
    }

    return NextResponse.redirect(
      new URL("/confirm-order?status=error", request.url),
    );
  }

  // 3. Success Redirect
  return NextResponse.redirect(
    new URL(`/confirm-order?status=${redirectStatus}`, request.url),
  );
}
