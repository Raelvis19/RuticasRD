import type { ReactNode } from "react";
import type { Metadata } from "next";

import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const admin = await requireAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
