import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin – Sell Kerala" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="flex min-h-screen bg-[#F4F6F5]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="h-14 bg-cream/90 backdrop-blur border-b border-border flex items-center px-6 gap-4 sticky top-0 z-10">
            <div className="flex-1" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest/12 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-forest">{initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-ink leading-none">{session.user?.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                  {session.user?.role ?? "admin"}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
