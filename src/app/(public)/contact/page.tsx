import Image from "next/image";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Sell Kerala. We're here to help you find your perfect property.",
};

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@sellkerala.in",
    href: "mailto:info@sellkerala.in",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "M.G. Road, Ernakulam, Kerala 682011",
    href: "https://maps.google.com/?q=MG+Road+Ernakulam",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sat: 9:00 AM – 7:00 PM",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-mist pt-28">
      {/* Hero */}
      <section className="relative bg-forest py-16 px-4 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1920&q=60"
          alt=""
          fill
          className="object-cover opacity-10"
          aria-hidden="true"
          sizes="100vw"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold text-cream mb-4">Contact Us</h1>
          <p className="text-mist/80 text-lg">
            Have a question or want to discuss a property? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-forest mb-6">Get In Touch</h2>
              <div className="space-y-4 mb-8">
                {CONTACT_INFO.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sage/30 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-brand" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-ink font-medium hover:text-emerald-brand transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-ink font-medium">{item.value}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-cream rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-forest mb-2">WhatsApp Us</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For quick queries, reach us directly on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919876543210"}?text=Hello, I have a property enquiry`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:bg-[#20BA5A] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-display text-2xl font-bold text-forest mb-6">Send a Message</h2>
              <div className="bg-cream rounded-2xl border border-border p-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
