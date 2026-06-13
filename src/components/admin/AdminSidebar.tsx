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
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    section: "MANAGE",
    items: [
      { href: "/admin",              label: "Dashboard",   icon: LayoutDashboard, exact: true },
      { href: "/admin/listings",     label: "Listings",    icon: ListFilter,      strictPrefix: true },
      { href: "/admin/listings/new", label: "Add Listing", icon: PlusCircle },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { href: "/admin/leads",     label: "Leads",     icon: Users },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

function isActive(
  pathname: string,
  href: string,
  opts?: { exact?: boolean; strictPrefix?: boolean }
) {
  if (opts?.exact) return pathname === href;
  if (opts?.strictPrefix) {
    return (
      pathname === href ||
      (pathname.startsWith(href + "/") && !pathname.startsWith("/admin/listings/new"))
    );
  }
  return pathname.startsWith(href);
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-[60px] flex items-center px-5 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer" onClick={onNavigate}>
          <div className="w-7 h-7 rounded-lg bg-emerald-brand flex items-center justify-center font-bold text-cream text-xs shrink-0">
            SK
          </div>
          <div className="flex flex-col leading-none">
            <p className="font-display font-bold text-white text-sm leading-none tracking-tight">Sell Kerala</p>
            <p className="text-white/25 text-[9px] mt-0.5 tracking-wider uppercase">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto" aria-label="Admin navigation">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[9px] font-bold text-white/20 tracking-[0.16em] uppercase px-3 mb-2">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(pathname, item.href, {
                  exact: item.exact,
                  strictPrefix: item.strictPrefix,
                });
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                      active
                        ? "bg-white/12 text-white"
                        : "text-white/45 hover:text-white hover:bg-white/6"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-sage" : "text-white/30 group-hover:text-white/60")} />
                      {item.label}
                    </span>
                    {active && <ChevronRight className="w-3 h-3 text-white/30" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/5 space-y-0.5 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white hover:bg-white/6 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 shrink-0" />
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white hover:bg-white/6 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[230px] h-full bg-[#0F1612] shrink-0">
      <SidebarContent />
    </aside>
  );
}
