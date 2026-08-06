import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminProfile } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin | Óticas Lírio",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getAdminProfile();

  return (
    <div className="min-h-screen bg-[#f3f1ed] text-ink">
      {profile ? <AdminHeader profile={profile} /> : null}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
