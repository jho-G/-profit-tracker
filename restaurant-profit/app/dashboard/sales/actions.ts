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
    redirect("/dashboard?tab=sell&error=missing-product");
  }

  if (quantityRaw === null) {
    redirect("/dashboard?tab=sell&error=invalid-quantity");
  }

  if (quantityRaw <= 0) {
    redirect("/dashboard?tab=sell&error=quantity-must-be-positive");
  }

  if (!soldAtRaw) {
    redirect("/dashboard?tab=sell&error=invalid-sold-at");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, restaurant_id, name, cost_price, selling_price, active")
    .eq("id", productId)
    .eq("restaurant_id", owner.restaurant_id)
    .maybeSingle();

  if (productError || !product) {
    redirect("/dashboard?tab=sell&error=invalid-product");
  }

  if (!product.active) {
    redirect("/dashboard?tab=sell&error=inactive-product");
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
    redirect("/dashboard?tab=sell&error=record-sale-failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sales");
  redirect("/dashboard?tab=sell");
}

export async function updateSale(saleId: string, formData: FormData) {
  const supabase = await createClient();
  const owner = await getOwnerRestaurant(supabase);

  const quantityRaw = parseQuantity(formData.get("quantity"));
  const soldAtRaw = parseSoldAt(formData.get("sold_at"));

  if (quantityRaw === null) {
    redirect(`/dashboard/sales/${saleId}/edit?error=invalid-quantity`);
  }

  if (quantityRaw <= 0) {
    redirect(`/dashboard/sales/${saleId}/edit?error=quantity-must-be-positive`);
  }

  if (!soldAtRaw) {
    redirect(`/dashboard/sales/${saleId}/edit?error=invalid-sold-at`);
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("id, restaurant_id, quantity, sold_at, cost_price_snapshot, selling_price_snapshot")
    .eq("id", saleId)
    .eq("restaurant_id", owner.restaurant_id)
    .maybeSingle();

  if (saleError || !sale) {
    redirect("/dashboard/sales?error=missing-sale");
  }

  const quantity = Number(quantityRaw);
  const costPrice = Number(sale.cost_price_snapshot ?? 0);
  const sellingPrice = Number(sale.selling_price_snapshot ?? 0);
  const updatedProfit = (sellingPrice - costPrice) * quantity;

  const { error: updateError } = await supabase
    .from("sales")
    .update({
      quantity,
      sold_at: soldAtRaw,
      profit: updatedProfit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", saleId)
    .eq("restaurant_id", owner.restaurant_id);

  if (updateError) {
    redirect(`/dashboard/sales/${saleId}/edit?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sales");
  revalidatePath(`/dashboard/sales/${saleId}`);
  redirect("/dashboard/sales");
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  const owner = await getOwnerRestaurant(supabase);

  const { error: deleteError } = await supabase
    .from("sales")
    .delete()
    .eq("id", saleId)
    .eq("restaurant_id", owner.restaurant_id);

  if (deleteError) {
    redirect("/dashboard/sales?error=delete-sale-failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sales");
  redirect("/dashboard/sales");
}
