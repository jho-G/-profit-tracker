import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";

  const digits = rawPhone.replace(/[^\d]/g, "");
  if (!digits) return "";

  // Normalize a local 0-prefixed number like 091... to the E.164-like
  // digits format stored in the live auth/user data: 2519...
  if (digits.startsWith("0")) {
    return `251${digits.slice(1)}`;
  }

  return digits;
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { phone, password } = await request.json();

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    // Find the owner profile by owner role and compare canonical phone digits
    // instead of requiring the phone string to be stored in a single format.
    const { data: ownerProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, phone, role")
      .eq("role", "owner");

    if (profilesError || !ownerProfiles?.length) {
      return NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    const profile = ownerProfiles.find((row) => {
      return normalizePhone(row.phone) === normalizedPhone;
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    // Get the Supabase Auth user.
    const { data: authUser, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authUserError || !authUser.user?.email) {
      return NextResponse.json(
        { error: "Unable to authenticate this account." },
        { status: 500 }
      );
    }

    // Verify the password using Supabase Auth.
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: authUser.user.email,
        password,
      });

    if (signInError || !signInData.session) {
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
