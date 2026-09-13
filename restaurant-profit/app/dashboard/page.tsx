import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Liyu Shiro Dashboard
          </h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✓ Authentication successful
            </div>

            <div className="rounded-xl bg-stone-100 px-4 py-3">
              <span className="text-sm font-medium text-stone-500">
                User ID:
              </span>
              <p className="mt-1 font-mono text-sm text-stone-900">
                {user.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
