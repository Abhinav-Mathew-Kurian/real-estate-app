import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin – Kerala Properties" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-mist">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-cream border-b border-border flex items-center px-6">
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session.user?.name}
              </span>
              <span className="text-xs bg-sage/30 text-forest px-2 py-0.5 rounded-full font-medium capitalize">
                {session.user?.role}
              </span>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
