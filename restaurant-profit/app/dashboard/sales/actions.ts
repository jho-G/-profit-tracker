"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function sanitizeString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseQuantity(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

function parseSoldAt(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function getOwnerRestaurant(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .eq("role", "owner")
    .single();

  if (profileError || !profile?.restaurant_id) {
    redirect("/login");
  }

  return { user, restaurant_id: profile.restaurant_id };
}

export async function createSale(formData: FormData) {
  const supabase = await createClient();
  const owner = await getOwnerRestaurant(supabase);

  const productId = sanitizeString(formData.get("product_id"));
  const quantityRaw = parseQuantity(formData.get("quantity"));
  const soldAtRaw = parseSoldAt(formData.get("sold_at"));

  if (!productId) {
    redirect("/dashboard/sales?error=missing-product");
  }

  if (quantityRaw === null) {
    redirect("/dashboard/sales?error=invalid-quantity");
  }

  if (quantityRaw <= 0) {
    redirect("/dashboard/sales?error=quantity-must-be-positive");
  }

  if (!soldAtRaw) {
    redirect("/dashboard/sales?error=invalid-sold-at");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, restaurant_id, name, cost_price, selling_price, active")
    .eq("id", productId)
    .eq("restaurant_id", owner.restaurant_id)
    .maybeSingle();

  if (productError || !product) {
    redirect("/dashboard/sales?error=invalid-product");
  }

  if (!product.active) {
    redirect("/dashboard/sales?error=inactive-product");
  }

  const costPrice = Number(product.cost_price);
  const sellingPrice = Number(product.selling_price);
  const quantity = Number(quantityRaw);

  const profit = (sellingPrice - costPrice) * quantity;
  const productName = product.name;

  const { error: insertError } = await supabase.from("sales").insert([
    {
      restaurant_id: owner.restaurant_id,
      product_id: product.id,
      quantity,
      sold_at: soldAtRaw,
      created_by: owner.user.id,
      product_name_snapshot: productName,
      cost_price_snapshot: costPrice,
      selling_price_snapshot: sellingPrice,
      profit,
    },
  ]);

  if (insertError) {
    redirect("/dashboard/sales?error=record-sale-failed");
  }

  revalidatePath("/dashboard/sales");
  redirect("/dashboard/sales");
}
