"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListFilter,
  Users,
  BarChart3,
  LogOut,
  Home,
  PlusCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    section: "MANAGE",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/listings", label: "Listings", icon: ListFilter, strictPrefix: true },
      { href: "/admin/listings/new", label: "Add Listing", icon: PlusCircle },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Users },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, opts?: { exact?: boolean; strictPrefix?: boolean }) {
    if (opts?.exact) return pathname === href;
    if (opts?.strictPrefix) {
      return (
        pathname === href ||
        (pathname.startsWith(href + "/") && !pathname.startsWith("/admin/listings/new"))
      );
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-forest shrink-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-brand flex items-center justify-center font-bold text-cream text-sm tracking-tight shrink-0">
            SK
          </span>
          <div>
            <p className="font-display font-bold text-cream text-sm leading-none">Sell Kerala</p>
            <p className="text-cream/35 text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-5 space-y-5 overflow-y-auto" aria-label="Admin navigation">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[9px] font-bold text-cream/25 tracking-[0.14em] uppercase px-3 mb-1.5">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(item.href, {
                  exact: item.exact,
                  strictPrefix: item.strictPrefix,
                });
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "bg-emerald-brand text-cream"
                        : "text-cream/55 hover:text-cream hover:bg-white/8"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-3 border-t border-white/8 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/55 hover:text-cream hover:bg-white/8 transition-all"
        >
          <Home className="w-4 h-4 shrink-0" />
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/55 hover:text-cream hover:bg-white/8 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
