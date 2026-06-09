"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search?type=SELL_HOME", label: "Buy Home" },
  { href: "/search?type=SELL_LAND", label: "Buy Land" },
  { href: "/search?type=RENT", label: "Rent" },
  { href: "/search?type=LEASE", label: "Lease" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/95 backdrop-blur-sm shadow-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Kerala Properties home"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-brand flex items-center justify-center text-cream font-bold text-sm">
            KP
          </span>
          <span
            className={cn(
              "font-display font-semibold text-lg transition-colors",
              scrolled ? "text-forest" : "text-cream"
            )}
          >
            Kerala Properties
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  scrolled
                    ? "text-ink hover:bg-mist hover:text-emerald-brand"
                    : "text-cream/90 hover:text-cream hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-brand hover:bg-leaf text-cream text-sm font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Enquire
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={cn(
            "md:hidden p-2 rounded-lg transition-colors",
            scrolled ? "text-ink hover:bg-mist" : "text-cream hover:bg-white/10"
          )}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream border-t border-border shadow-lg">
          <ul className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-ink text-sm font-medium hover:bg-mist hover:text-emerald-brand transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-4">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-brand hover:bg-leaf text-cream text-sm font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              <Phone className="w-4 h-4" />
              Enquire Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
