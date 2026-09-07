import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("*");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Restaurant Profit Tracker
      </h1>

      <pre className="mt-4">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}