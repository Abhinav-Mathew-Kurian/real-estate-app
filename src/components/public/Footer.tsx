import Link from "next/link";
import { Phone, Mail, MapPin, Share2 } from "lucide-react";

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
  ],
  Districts: [
    { href: "/search?district=Thiruvananthapuram", label: "Trivandrum" },
    { href: "/search?district=Ernakulam", label: "Kochi / Ernakulam" },
    { href: "/search?district=Thrissur", label: "Thrissur" },
    { href: "/search?district=Kozhikode", label: "Kozhikode" },
    { href: "/search?district=Wayanad", label: "Wayanad" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-forest text-mist/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="w-9 h-9 rounded-lg bg-emerald-brand flex items-center justify-center text-cream font-bold text-sm">
                KP
              </span>
              <span className="font-display font-semibold text-xl text-cream">
                Kerala Properties
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-mist/70 mb-6 max-w-xs">
              Your trusted partner for premium real estate across God&rsquo;s Own Country.
              Homes, land, villas, and commercial properties — all in one place.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 hover:text-sage transition-colors"
              >
                <Phone className="w-4 h-4 text-sage" />
                +91 98765 43210
              </a>
              <a
                href="mailto:info@keralaproperties.in"
                className="flex items-center gap-2 hover:text-sage transition-colors"
              >
                <Mail className="w-4 h-4 text-sage" />
                info@keralaproperties.in
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                M.G. Road, Ernakulam, Kerala 682011
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-cream font-semibold text-sm mb-4 uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-sage transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-mist/50">
            &copy; {new Date().getFullYear()} Kerala Properties. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {["Facebook", "Instagram", "YouTube"].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="text-xs px-2.5 py-1 rounded-md border border-white/20 hover:bg-white/10 transition-colors text-mist/60 hover:text-mist"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
