import Image from "next/image";
import type { Metadata } from "next";
import { Shield, MapPin, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Sell Kerala — your trusted real estate partner across God's Own Country.",
};

const TEAM = [
  {
    name: "Rajesh Menon",
    role: "Founder & Director",
    bio: "20+ years in Kerala real estate. Deep roots in Ernakulam and Thrissur markets.",
  },
  {
    name: "Priya Nair",
    role: "Head of Sales",
    bio: "Expert in residential properties with a focus on Thiruvananthapuram and Kollam.",
  },
  {
    name: "Suresh Pillai",
    role: "Land & Agricultural Specialist",
    bio: "Specialist in agricultural land, rubber estates, and highland plots across Idukki and Wayanad.",
  },
];

const VALUES = [
  { Icon: Shield, title: "Integrity", desc: "Transparent dealings, honest pricing, no hidden surprises." },
  { Icon: MapPin, title: "Local Knowledge", desc: "We live and breathe Kerala. Every district, every taluk." },
  { Icon: Users, title: "Client-First", desc: "Your goals are our goals. We don't close deals — we build trust." },
  { Icon: Zap, title: "Speed", desc: "Fast responses, quick verifications, efficient closures." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mist pt-28">
      {/* Hero */}
      <section className="relative bg-forest py-20 px-4 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=70"
          alt=""
          fill
          className="object-cover opacity-10"
          aria-hidden="true"
          sizes="100vw"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold text-cream mb-6">About Sell Kerala</h1>
          <p className="text-mist/80 text-lg leading-relaxed">
            We are Kerala&apos;s premier property marketplace — connecting buyers, sellers, and
            renters across God&apos;s Own Country since 2010.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-forest mb-4">Our Story</h2>
              <div className="space-y-4 text-ink/80 leading-relaxed">
                <p>
                  Sell Kerala was born from a simple belief: finding or selling property in Kerala
                  should be transparent, efficient, and fair for everyone involved.
                </p>
                <p>
                  Founded in Ernakulam, we started with a handful of listings and a commitment to
                  honest dealing. Today, we cover all 14 districts with a team of dedicated local
                  experts who know each neighbourhood intimately.
                </p>
                <p>
                  Whether it&apos;s a cozy home in Thrissur, agricultural land in Wayanad, or a
                  commercial plot in Kozhikode — we&apos;ve helped thousands of families and
                  investors find their perfect match.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "2,000+", label: "Properties Listed" },
                { num: "1,500+", label: "Families Served" },
                { num: "14", label: "Districts Covered" },
                { num: "15+", label: "Years Experience" },
              ].map((stat) => (
                <div key={stat.label} className="bg-cream rounded-2xl border border-border p-5 text-center">
                  <div className="font-display text-3xl font-bold text-emerald-brand mb-1">{stat.num}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-cream">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-forest text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl border border-border hover:border-emerald-brand hover:bg-mist/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-sage/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-brand/10 transition-colors">
                  <Icon className="w-6 h-6 text-emerald-brand" />
                </div>
                <h3 className="font-semibold text-forest text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-forest text-center mb-10">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-cream rounded-2xl border border-border p-6 text-center hover:border-emerald-brand/40 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage to-emerald-brand mx-auto mb-4 flex items-center justify-center text-cream text-xl font-bold">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-forest">{member.name}</h3>
                <p className="text-xs text-emerald-brand font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
