"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function sanitizeString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePrice(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
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

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const owner = await getOwnerRestaurant(supabase);

  const name = sanitizeString(formData.get("name"));
  const category = sanitizeString(formData.get("category"));
  const description = sanitizeString(formData.get("description"));
  const image_url = sanitizeString(formData.get("image_url"));
  const cost_price = parsePrice(formData.get("cost_price"));
  const selling_price = parsePrice(formData.get("selling_price"));

  if (!name) {
    redirect("/dashboard/products/new?error=name-required");
  }

  if (cost_price === null || selling_price === null) {
    redirect("/dashboard/products/new?error=invalid-price");
  }

  if (cost_price < 0 || selling_price < 0) {
    redirect("/dashboard/products/new?error=negative-price");
  }

  const { error } = await supabase
    .from("products")
    .insert([
      {
        restaurant_id: owner.restaurant_id,
        name,
        category: category || null,
        description: description || null,
        cost_price,
        selling_price,
        image_url: image_url || null,
        active: true,
      },
    ]);

  if (error) {
    redirect(`/dashboard/products/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  redirect("/dashboard?tab=menu");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const owner = await getOwnerRestaurant(supabase);

  const name = sanitizeString(formData.get("name"));
  const category = sanitizeString(formData.get("category"));
  const description = sanitizeString(formData.get("description"));
  const image_url = sanitizeString(formData.get("image_url"));
  const cost_price = parsePrice(formData.get("cost_price"));
  const selling_price = parsePrice(formData.get("selling_price"));

  if (!name) {
    redirect(`/dashboard/products/${productId}/edit?error=name-required`);
  }

  if (cost_price === null || selling_price === null) {
    redirect(`/dashboard/products/${productId}/edit?error=invalid-price`);
  }

  if (cost_price < 0 || selling_price < 0) {
    redirect(`/dashboard/products/${productId}/edit?error=negative-price`);
  }

  const { data: existingProduct, error: existingError } = await supabase
    .from("products")
    .select("id, restaurant_id, cost_price, selling_price")
    .eq("id", productId)
    .eq("restaurant_id", owner.restaurant_id)
    .maybeSingle();

  if (existingError || !existingProduct) {
    redirect(`/dashboard/products/${productId}/edit?error=invalid-product`);
  }

  const costChanged = Number(existingProduct.cost_price) !== Number(cost_price);
  const sellingChanged = Number(existingProduct.selling_price) !== Number(selling_price);

  if (costChanged || sellingChanged) {
    const { error: historyError } = await supabase.from("product_price_history").insert([
      {
        product_id: productId,
        old_cost_price: existingProduct.cost_price,
        old_selling_price: existingProduct.selling_price,
        new_cost_price: cost_price,
        new_selling_price: selling_price,
        changed_by: owner.user.id,
      },
    ]);

    if (historyError) {
      redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(historyError.message)}`);
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      category: category || null,
      description: description || null,
      cost_price,
      selling_price,
      image_url: image_url || null,
    })
    .eq("id", productId)
    .eq("restaurant_id", owner.restaurant_id);

  if (error) {
    redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${productId}/edit`);
  redirect("/dashboard?tab=menu");
}

export async function toggleProductStatus(productId: string, active: boolean) {
  const supabase = await createClient();
  const owner = await getOwnerRestaurant(supabase);

  const { error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", productId)
    .eq("restaurant_id", owner.restaurant_id);

  if (error) {
    redirect(`/dashboard?tab=menu&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  redirect("/dashboard?tab=menu");
}
