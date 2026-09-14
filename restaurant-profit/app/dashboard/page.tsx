import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, restaurant_id")
    .eq("id", user.id)
    .eq("role", "owner")
    .single();

  if (profileError || !profile?.restaurant_id) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Liyu Shiro Dashboard
            </h1>
            <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Authenticated owner profile or restaurant mapping is missing.
            </div>
            <div className="mt-5">
              <LogoutButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", profile.restaurant_id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Liyu Shiro Dashboard
            </h1>
            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Authenticated
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✓ Authentication successful
            </div>

            <div className="rounded-xl bg-stone-100 px-4 py-3">
              <span className="text-sm font-medium text-stone-500">
                Owner:
              </span>
              <p className="mt-1 text-sm text-stone-900">
                {profile.full_name || profile.id}
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 px-4 py-3">
              <span className="text-sm font-medium text-stone-500">
                Restaurant:
              </span>
              <p className="mt-1 text-sm text-stone-900">
                {restaurant?.name || "Unknown restaurant"}
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 px-4 py-3">
              <span className="text-sm font-medium text-stone-500">
                Owner ID:
              </span>
              <p className="mt-1 font-mono text-sm text-stone-900">
                {user.id}
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 px-4 py-3">
              <span className="text-sm font-medium text-stone-500">
                Restaurant ID:
              </span>
              <p className="mt-1 font-mono text-sm text-stone-900">
                {profile.restaurant_id}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/dashboard/products"
                className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Manage Products
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
