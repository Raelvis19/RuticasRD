import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: "admin";
}

export const getAdminProfile = cache(async (): Promise<AdminProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .eq("role", "admin")
    .eq("is_active", true)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: user.email ?? "",
    fullName: profile.full_name,
    role: "admin",
  };
});

export async function requireAdmin() {
  const admin = await getAdminProfile();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
