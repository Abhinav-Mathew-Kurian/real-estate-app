import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  Browse: [
    { href: "/search?type=SELL_HOME", label: "Homes for Sale" },
    { href: "/search?type=SELL_LAND", label: "Land for Sale" },
    { href: "/search?type=RENT", label: "Rental Properties" },
    { href: "/search?type=LEASE", label: "Lease Properties" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/search", label: "All Properties" },
  ],
  Districts: [
    { href: "/search?district=Thiruvananthapuram", label: "Trivandrum" },
    { href: "/search?district=Ernakulam", label: "Kochi / Ernakulam" },
    { href: "/search?district=Thrissur", label: "Thrissur" },
    { href: "/search?district=Kozhikode", label: "Kozhikode" },
    { href: "/search?district=Wayanad", label: "Wayanad" },
  ],
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-white/60">
      {/* Top strip */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-display font-bold text-xl tracking-tight mb-1">
              Ready to find your property?
            </p>
            <p className="text-white/50 text-sm">Free consultation · No hidden charges</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/80 text-sm font-medium hover:bg-white/8 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-forest text-sm font-bold hover:bg-white transition-all duration-200 cursor-pointer"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Main links grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-cream font-bold text-xs shrink-0">
                SK
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-base text-white tracking-tight leading-none">
                  Sell Kerala
                </span>
                <span className="text-[10px] text-white/40 leading-none mt-0.5 font-medium">Real Estate</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-white/45 mb-6 max-w-xs">
              Kerala&rsquo;s premier property marketplace — connecting buyers, sellers,
              and renters across God&rsquo;s Own Country since 2010.
            </p>
            <div className="space-y-2.5 text-sm">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-sage/70 shrink-0" />
                +91 98765 43210
              </a>
              <a
                href="mailto:info@sellkerala.in"
                className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-sage/70 shrink-0" />
                info@sellkerala.in
              </a>
              <span className="flex items-start gap-2.5 text-white/50">
                <MapPin className="w-3.5 h-3.5 text-sage/70 mt-0.5 shrink-0" />
                M.G. Road, Ernakulam, Kerala 682011
              </span>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white/80 font-semibold text-xs mb-5 uppercase tracking-[0.15em]">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/45 hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Sell Kerala. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { label: "Facebook", Icon: FacebookIcon, href: "#" },
              { label: "Instagram", Icon: InstagramIcon, href: "#" },
              { label: "YouTube", Icon: YouTubeIcon, href: "#" },
            ].map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/8 hover:border-white/20 transition-all duration-200 cursor-pointer"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
