import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("restaurant_id")
      .eq("id", user.id)
      .eq("role", "owner")
      .single();

    if (profileError || !profile?.restaurant_id) {
      return NextResponse.json({ error: "Owner profile not found" }, { status: 403 });
    }

    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const quantity = Number(body.quantity);
    const soldAt = typeof body.soldAt === "string" && body.soldAt ? body.soldAt : new Date().toISOString();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive integer" }, { status: 400 });
    }

    // Verify product and extract pricing snapshots
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, cost_price, selling_price, active")
      .eq("id", productId)
      .eq("restaurant_id", profile.restaurant_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.active) {
      return NextResponse.json({ error: "Product is inactive" }, { status: 400 });
    }

    const costPrice = Number(product.cost_price);
    const sellingPrice = Number(product.selling_price);
    const profit = (sellingPrice - costPrice) * quantity;

    const { data: sale, error: insertError } = await supabase
      .from("sales")
      .insert([
        {
          restaurant_id: profile.restaurant_id,
          product_id: product.id,
          quantity,
          sold_at: soldAt,
          created_by: user.id,
          product_name_snapshot: product.name,
          cost_price_snapshot: costPrice,
          selling_price_snapshot: sellingPrice,
          profit,
        },
      ])
      .select("id, sold_at, product_name_snapshot, quantity, cost_price_snapshot, selling_price_snapshot, profit, restaurant_id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (err) {
    console.error("Fast sale logging error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
