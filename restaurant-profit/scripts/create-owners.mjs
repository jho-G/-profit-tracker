import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const rl = readline.createInterface({ input, output });

async function ask(question) {
  return (await rl.question(question)).trim();
}

async function createOwner(label) {
  console.log(`\n--- ${label} ---`);

  const phone = await ask("Phone number (+251...): ");
  const password = await ask("Password: ");
  const fullName = await ask("Full name: ");

  const { data, error } = await supabase.auth.admin.createUser({
    phone,
    password,
    phone_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    throw new Error(`Failed to create ${label}: ${error.message}`);
  }

  console.log(`${label} created: ${data.user.id}`);

  return {
    id: data.user.id,
    phone,
    fullName,
  };
}

async function main() {
  console.log("=================================");
  console.log(" LIYU SHIRO OWNER SETUP");
  console.log("=================================");

  // Create restaurant
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      name: "Liyu Shiro",
    })
    .select()
    .single();

  if (restaurantError) {
    throw new Error(
      `Failed to create restaurant: ${restaurantError.message}`
    );
  }

  console.log(`\nRestaurant created: ${restaurant.name}`);
  console.log(`Restaurant ID: ${restaurant.id}`);

  // Create owners
  const owner1 = await createOwner("Owner 1");
  const owner2 = await createOwner("Owner 2");

  // Create profiles
  const { error: profilesError } = await supabase
    .from("profiles")
    .insert([
      {
        id: owner1.id,
        restaurant_id: restaurant.id,
        full_name: owner1.fullName,
        phone: owner1.phone,
        role: "owner",
      },
      {
        id: owner2.id,
        restaurant_id: restaurant.id,
        full_name: owner2.fullName,
        phone: owner2.phone,
        role: "owner",
      },
    ]);

  if (profilesError) {
    throw new Error(
      `Failed to create profiles: ${profilesError.message}`
    );
  }

  console.log("\n=================================");
  console.log(" SETUP COMPLETE");
  console.log("=================================");
  console.log(`Restaurant: ${restaurant.name}`);
  console.log(`Owner 1: ${owner1.fullName}`);
  console.log(`Owner 2: ${owner2.fullName}`);
  console.log("\nBoth owners share the same restaurant.");
}

main()
  .catch((error) => {
    console.error("\nSETUP FAILED:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });