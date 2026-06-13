"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search?type=SELL_HOME", label: "Buy" },
  { href: "/search?type=RENT", label: "Rent" },
  { href: "/search?type=SELL_LAND", label: "Land" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed z-50 transition-all duration-300",
        /* floating pill — offset from edges */
        "top-4 left-4 right-4 rounded-2xl",
        transparent
          ? "bg-black/25 backdrop-blur-xl border border-white/10 shadow-none"
          : "bg-white/95 backdrop-blur-xl border border-border/30 shadow-[0_4px_32px_rgba(0,0,0,0.10)]"
      )}
    >
      <nav className="px-5 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          aria-label="Sell Kerala"
        >
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all",
            transparent
              ? "bg-white/15 text-white border border-white/20"
              : "bg-forest text-cream"
          )}>
            SK
          </div>
          <span className={cn(
            "font-display font-bold text-base transition-colors leading-none tracking-tight",
            transparent ? "text-white" : "text-forest"
          )}>
            Sell Kerala
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                  transparent
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-ink/70 hover:text-forest hover:bg-mist"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/contact"
            className={cn(
              "text-sm font-medium transition-colors duration-200 cursor-pointer",
              transparent ? "text-white/70 hover:text-white" : "text-ink/60 hover:text-forest"
            )}
          >
            Contact
          </Link>
          <Link
            href="/contact"
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
              transparent
                ? "bg-white text-forest hover:bg-cream"
                : "bg-forest text-cream hover:bg-emerald-brand shadow-sm"
            )}
          >
            Free Consult
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "md:hidden p-2 rounded-xl transition-colors cursor-pointer",
            transparent ? "text-white hover:bg-white/10" : "text-ink hover:bg-mist"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className={cn(
          "md:hidden border-t rounded-b-2xl overflow-hidden",
          transparent ? "border-white/10 bg-black/60 backdrop-blur-xl" : "border-border/20 bg-white"
        )}>
          <ul className="px-4 py-3 space-y-0.5">
            {[...navLinks, { href: "/contact", label: "Contact" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                    transparent
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-ink hover:bg-mist hover:text-forest"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-4 pt-1">
            <Link
              href="/contact"
              className="flex items-center justify-center w-full py-3 rounded-xl bg-forest hover:bg-emerald-brand text-cream text-sm font-semibold transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Free Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
