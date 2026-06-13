import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin – Sell Kerala" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const initials = (session.user?.name ?? "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SessionProvider session={session}>
      {/* h-screen + overflow-hidden: sidebar never stretches past viewport */}
      <div className="flex h-screen overflow-hidden bg-[#F0F2EF]">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="h-14 bg-white border-b border-black/[0.07] flex items-center px-5 sm:px-7 gap-3 shrink-0">
            <AdminMobileMenu />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-ink leading-none">{session.user?.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{session.user?.role ?? "admin"}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-cream">{initials}</span>
              </div>
            </div>
          </header>

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
