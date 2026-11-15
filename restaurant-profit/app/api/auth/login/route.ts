import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";

  const digits = rawPhone.replace(/[^\d]/g, "");
  if (!digits) return "";

  // Normalize a local 0-prefixed number like 091... to 2519...
  if (digits.startsWith("0")) {
    return `251${digits.slice(1)}`;
  }

  return digits;
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    let emailToAuth = "";
    const isEmail = typeof phone === "string" && phone.includes("@");

    if (isEmail) {
      emailToAuth = phone.trim().toLowerCase();
    } else {
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        return NextResponse.json(
          { error: "Invalid phone number or password." },
          { status: 400 }
        );
      }

      // Lookup restaurant admin / staff profiles by phone without artificial limits
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, phone, role");

      if (profilesError || !profiles?.length) {
        return NextResponse.json(
          { error: "Invalid phone number or password." },
          { status: 401 }
        );
      }

      const profile = profiles.find((row) => normalizePhone(row.phone) === normalizedPhone);

      if (!profile) {
        return NextResponse.json(
          { error: "Invalid phone number or password." },
          { status: 401 }
        );
      }

      // Get the Supabase Auth user email
      const { data: authUser, error: authUserError } =
        await supabaseAdmin.auth.admin.getUserById(profile.id);

      if (authUserError || !authUser.user?.email) {
        return NextResponse.json(
          { error: "Unable to authenticate this account." },
          { status: 500 }
        );
      }

      emailToAuth = authUser.user.email;
    }

    // Verify the password using Supabase Auth (tries raw password and normalized 4-digit password)
    let { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: emailToAuth,
        password,
      });

    if (signInError && typeof password === "string" && password.length < 6) {
      const retry = await supabaseAdmin.auth.signInWithPassword({
        email: emailToAuth,
        password: `${password}_liyu_pin`,
      });
      if (!retry.error && retry.data?.session) {
        signInData = retry.data;
        signInError = null;
      }
    }

    if (signInError || !signInData?.session) {
      return NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: signInData.session,
    });
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}
