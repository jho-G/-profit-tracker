import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    const normalizedPhone = phone?.replace(/\s+/g, "");

    if (!normalizedPhone || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    // Find the owner using the phone stored in profiles.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, phone, role")
      .eq("phone", normalizedPhone)
      .eq("role", "owner")
      .single();

    if (profileError || !profile) {
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
