"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");

  if (!phone.trim() || !password) {
    setError("Please enter your phone number and password.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Invalid phone number or password.");
      setLoading(false);
      return;
    }

    // Store the Supabase session in the browser.
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      setError("Login succeeded, but the session could not be created.");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  } catch (error) {
    console.error("Login request failed:", error);
    setError("Unable to connect to the server.");
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Liyu Shiro
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Restaurant Profit Tracker
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-stone-900">
                Owner Login
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Sign in to manage your restaurant.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+251911234567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 disabled:bg-stone-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 disabled:bg-stone-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-stone-900 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}