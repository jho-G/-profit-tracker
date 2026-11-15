import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!env[key]) env[key] = val;
      }
    }
  } catch {}
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log("Connecting to Supabase at:", url);

  // 1. Get or create restaurant
  let { data: restaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("id, name")
    .limit(1)
    .maybeSingle();

  if (rErr) {
    console.error("Failed to query restaurants:", rErr.message);
    process.exit(1);
  }

  if (!restaurant) {
    const { data: created, error: cErr } = await supabase
      .from("restaurants")
      .insert({ name: "ልዩ ሽሮ (Liyu Shiro)" })
      .select("id, name")
      .single();
    if (cErr) {
      console.error("Failed to insert restaurant:", cErr.message);
      process.exit(1);
    }
    restaurant = created;
  }

  console.log(`Using restaurant: "${restaurant.name}" (${restaurant.id})`);

  // Dynamically read items
  const menuTs = readFileSync(resolve(__dirname, "../lib/menu-data.ts"), "utf8");
  const regex = /product_name:\s*"([^"]+)",\s*selling_price:\s*([0-9.]+),\s*cost_price:\s*([0-9.]+),\s*category:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*image_url:\s*(null|"[^"]*")/g;
  
  let match;
  let count = 0;
  while ((match = regex.exec(menuTs)) !== null) {
    const [, name, selling_price, cost_price, category, description, raw_img] = match;
    count++;

    const image_url = raw_img === "null" ? null : raw_img.replace(/^"|"$/g, "");

    const payload = {
      restaurant_id: restaurant.id,
      name,
      category,
      selling_price: parseFloat(selling_price),
      cost_price: parseFloat(cost_price),
      description,
      image_url,
      active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "restaurant_id,name" });

    if (error) {
      console.warn(`[WARN] Upsert failed for "${name}":`, error.message);
    } else {
      console.log(`[OK] (${count}/63) ${name} - ${selling_price} ETB`);
    }
  }

  console.log(`Finished processing ${count} items.`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
