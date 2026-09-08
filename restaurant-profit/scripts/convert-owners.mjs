import { createClient } from "@supabase/supabase-js";

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

const owners = [
  {
    id: "4586c23b-77e8-4eb2-9ac0-e0df4c3c6c21",
    email: "owner1@liyushiro.local",
  },
  {
    id: "0b1dd6ca-bc75-4dde-9d54-b342db57e6e6",
    email: "owner2@liyushiro.local",
  },
];

async function main() {
  console.log("Converting Liyu Shiro owners...\n");

  for (const owner of owners) {
    const { data, error } =
      await supabase.auth.admin.updateUserById(owner.id, {
        email: owner.email,
        email_confirm: true,
      });

    if (error) {
      throw new Error(
        `Failed to update ${owner.id}: ${error.message}`
      );
    }

    console.log(`✓ Converted: ${owner.email}`);
    console.log(`  User ID: ${data.user.id}`);
    console.log(`  Phone: ${data.user.phone}`);
    console.log("");
  }

  console.log("=================================");
  console.log("CONVERSION COMPLETE");
  console.log("=================================");
}

main().catch((error) => {
  console.error("\nCONVERSION FAILED:");
  console.error(error.message);
  process.exitCode = 1;
});
