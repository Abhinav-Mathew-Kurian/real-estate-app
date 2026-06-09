# BUILD.md — Kerala Real Estate Agency Platform

> **For Claude Code.** This is the authoritative build spec. Build **phase by phase, in order**. Do not skip ahead. After each phase: ensure it compiles, lint passes, and the phase's "Done when" checklist is met before moving on. Keep code clean, typed, and modular. Commit at the end of each phase.

---

## 0. Project Overview

A **single-agency** real estate website for a Kerala agency. **Only the agency lists properties** (no public posting). The public browses, discovers, and submits enquiries. **No online payments.** The owner also runs a digital marketing firm that drives traffic here — so **SEO, speed, lead capture, and beautiful UI are first-class.**

Listing types: `SELL_HOME`, `SELL_LAND`, `RENT`, `LEASE`.

**Featured properties:** the agency toggles a property as *Featured* to surface it on the home page. Payment for featuring is handled **offline** — the admin records payment details (payer name, amount, paid date, feature-until date) as CRM fields on the listing. No gateway.

### Non-negotiable principles
- **Simple over clever.** Two roles only: public (no account) and admin/staff (login).
- **Kerala-aware:** land in *cent/acre* (1 cent = 435.6 sqft, 100 cent = 1 acre); district → taluk → village hierarchy; optional Fair Value reference field.
- **Free infra:** OpenStreetMap (not Google Maps), YouTube embeds (no video hosting), Cloudinary free tier.
- **Caching everywhere** it helps (see §11).
- **Accessibility floor:** responsive to mobile, visible keyboard focus, `prefers-reduced-motion` respected.

---

## 1. Tech Stack (use exactly these)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript, `src/` dir) |
| DB / ODM | MongoDB Atlas + Mongoose |
| Auth | NextAuth (Auth.js) v5 — Credentials provider, admin/staff only |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | lucide-react |
| Images | Cloudinary (next-cloudinary) |
| Video | YouTube IFrame embed |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles |
| Routing | OSRM public API |
| Nearby data | Overpass API (OSM) |
| AI | OpenRouter (free/cheap model) via server route |
| Charts | Recharts |
| Validation | Zod |
| Forms | react-hook-form + zod resolver |
| Caching | Next.js cache + `unstable_cache` / `revalidateTag` |
| Hosting | Vercel |

Package manager: **pnpm**. Node 20+.

---

## 2. Design System (encode this before building UI)

**Brief:** A premium Kerala land-and-homes agency. The feeling should be *trustworthy, rooted, lush* — Kerala is "God's Own Country," green and watery. Green is the theme, but avoid the generic "near-black bg + one acid-green accent" AI default. Go for a **warm, natural, daylight green** palette — paddy fields, backwaters, laterite soil — not neon.

### Color tokens (CSS variables in `globals.css`, mapped into Tailwind theme)
```
--forest:    #1B4332   /* deep canopy green — headings, dark text */
--emerald:   #2D6A4F   /* primary brand green — buttons, links */
--leaf:      #40916C   /* hover / secondary green */
--sage:      #95D5B2   /* soft accents, badges, chips */
--mist:      #F1F7F4   /* page background tint (light green-white) */
--cream:     #FBFCF8   /* card background */
--laterite:  #B5651D   /* warm earthy accent — "Featured" badge, sparingly */
--ink:       #14201A   /* near-black green-tinted text */
--muted:     #5B6B63   /* secondary text */
```
- Primary actions: `--emerald`, hover `--leaf`.
- **Featured** uses `--laterite` so it pops against all the green — the one deliberate contrast.
- Backgrounds: `--mist` page, `--cream` cards. Generous whitespace.

### Typography
- **Display:** `Fraunces` (variable serif) — warm, organic. Hero + section headings, used with restraint.
- **Body/UI:** `Inter`.
- **Data:** `Inter` with tabular-nums for prices/stats.
- Clear type scale (hero 3.5–4.5rem desktop; headings 1.5–2.25rem; body 1rem; caption 0.8rem). Load via `next/font/google`.

### Signature element
The **hero**: full-bleed Kerala landscape (backwaters/paddy/coconut) with a soft green gradient scrim, agency name in Fraunces, and a **prominent unified search bar** (type + district + budget) floating over it, with a gentle fade-up parallax on load. One bold moment — keep everything else quiet.

### Motion (Framer Motion, subtle)
- Hero: staggered fade-up headline → search bar on load.
- Cards: fade-up + rise on scroll-into-view (staggered across grid).
- Hover: card lift + image zoom; buttons subtle scale.
- **Respect `prefers-reduced-motion`.**

### UI quality floor
Rounded-2xl cards, soft layered shadows, consistent spacing scale, focus rings in `--emerald`, skeleton loaders, inviting empty states.

---

## 3. Data Model (Mongoose, in `src/models`)

### User
`{ name, email (unique), passwordHash, role:'admin'|'staff', phone, createdAt }`

### Listing
```
{
  title, slug (unique, SEO URL), description,
  type: 'SELL_HOME'|'SELL_LAND'|'RENT'|'LEASE',
  category: 'villa'|'apartment'|'house'|'plot'|'commercial'|'agricultural',
  status: 'draft'|'published'|'sold'|'archived',

  // featured (agency-controlled, offline payment)
  isFeatured: boolean,
  feature: { paidBy, amount, paidOn, featureUntil } | null,

  // location
  district, taluk, village, locality, address,
  geo: { type:'Point', coordinates:[lng,lat] },   // 2dsphere index

  // area
  area: { value, unit:'cent'|'acre'|'sqft' },
  bedrooms, bathrooms,            // homes
  furnishing,                     // rent/lease
  facing, floors, ageYears,       // optional

  // pricing
  askingPrice,                    // INR
  pricePerCent,                   // auto for land
  fairValueRef,                   // optional manual INR/cent
  isNegotiable,
  monthlyRent, deposit,           // rent
  leaseTermMonths,                // lease

  // media
  images: [{ url, publicId, alt }],
  coverIndex,
  youtubeUrl,                     // optional

  highlights: [string],

  viewCount, enquiryCount, createdBy (User ref), createdAt, updatedAt
}
```

### Lead (mini-CRM)
```
{ listing (ref), listingTitleSnapshot, name, phone, email?, message,
  source, utm:{source,medium,campaign},
  status:'new'|'contacted'|'closed', createdAt }
```

### AnalyticsEvent
`{ listing(ref)?, type:'view'|'enquiry'|'search', query?, utm?, createdAt }`

### MasterData (Kerala geography)
Seed all 14 districts → taluks → villages. `scripts/seed-geo.ts`. Districts + taluks complete; villages can start as a representative subset, expandable.

---

## 4. Project Structure
```
src/
  app/
    (public)/ page.tsx  search/page.tsx  listing/[slug]/page.tsx  about/page.tsx  contact/page.tsx
    admin/ layout.tsx page.tsx listings/page.tsx listings/new/page.tsx listings/[id]/edit/page.tsx leads/page.tsx analytics/page.tsx
    api/ listings/route.ts listings/[id]/route.ts leads/route.ts ai/search/route.ts ai/describe/route.ts nearby/route.ts route/route.ts
    auth/login/page.tsx
  components/ ui/ public/ admin/
  lib/  models/  scripts/  styles/
```

---

## 5. Conventions
- TypeScript strict; no `any` unless justified.
- Server Components by default; `"use client"` only for maps, forms, motion.
- Zod validation on client **and** server (API routes).
- Money as INR number; `formatINR()` util with lakh/crore display (₹45,00,000 → "₹45 Lakh"); `Intl.NumberFormat('en-IN')`.
- `lib/units.ts`: centToSqft, acreToCent, toggles.
- Unique slugs from title + short id.
- Env in `.env.example`: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CLOUDINARY_*`, `OPENROUTER_API_KEY`, `NEXT_PUBLIC_SITE_URL`.

---

## PHASES

### Phase 1 — Foundation
- Init Next.js 14 (TS, App Router, Tailwind, `src/`, pnpm). Install §1 deps. Init shadcn/ui.
- Design tokens (§2) in `globals.css` + Tailwind theme; load Fraunces + Inter via `next/font`.
- `lib/db.ts` cached Mongoose connection; define all models (§3).
- NextAuth v5 Credentials; `role` in session; `middleware.ts` guards `/admin/*`.
- Seed: one admin user + `seed-geo.ts`.
- Base layout: public Navbar + Footer; admin shell with sidebar.
- Utils: `formatINR`, `units.ts`, `slugify`.
**Done when:** app runs, admin logs in, `/admin` protected, tokens/fonts visible, DB connects, geo seed works.

### Phase 2 — Admin: Listings core
- `ListingForm` (rhf + zod), type-aware fields (land → cent + fair value; rent → rent/deposit/furnishing; home → beds/baths).
- Cloudinary multi-image upload (reorder, cover, alt) via signed upload.
- YouTube URL field (validate + preview).
- Auto-compute `pricePerCent`.
- **Featured controls:** toggle + offline-payment CRM fields (paidBy, amount, paidOn, featureUntil).
- Lifecycle: Save draft / Publish / Mark sold / Archive.
- `/admin/listings` table: filter by type/status, search, edit, feature badge.
- `api/listings` CRUD — admin-guarded, zod-validated.
**Done when:** admin creates/edits/publishes each of the 4 types with images + video, toggles featured with payment info, persists.

### Phase 3 — Public: Browse, Home, Detail
- **Home** (showcase — make it excellent per §2): hero with floating SearchBar + staggered load; **Featured** grid (laterite badge); browse-by-type tiles; browse-by-district; "why us" trust strip; recent listings with scroll-reveal; strong footer.
- **ListingCard:** cover (zoom on hover), formatted price, area cent/sqft, location, type chip, featured badge, lift-on-hover.
- **Search** `/search`: filter sidebar (type, district→taluk, price, area, beds, category), sort, results grid.
- **Detail** `/listing/[slug]`: gallery + lightbox, YouTube embed, specs, price block (fair-value compare if present), highlights, map placeholder, enquiry CTA placeholder. Increment viewCount. SEO metadata + JSON-LD `RealEstateListing`.
**Done when:** polished home, working search/filter, rich detail page, mobile responsive, strong Lighthouse.

### Phase 4 — Maps
- `MapView` (react-leaflet + OSM), SSR-safe via dynamic import.
- Detail: property marker. Search: **split list/map**, hover ↔ marker highlight, "search this area" on pan. Custom green pins. Cluster if many.
**Done when:** markers render on detail + search, no SSR/window errors, performant.

### Phase 5 — Nearby + Routing
- `api/nearby`: proxy **Overpass**, query hospital/school/college/bank/bus/supermarket/worship within radius around geo. **Cache aggressively** (§11).
- `NearbyPanel` on detail: grouped amenities + distance, icons, nearest-first.
- `api/route`: proxy **OSRM** for distance/duration + optional polyline.
**Done when:** detail shows real nearby amenities with distances, cached for instant repeat loads.

### Phase 6 — Lead capture (conversion engine)
- `EnquiryForm` on every listing (name, phone, email?, message; pre-fills listing; no login; zod; clear states).
- **WhatsApp** (`wa.me`) + **Call** buttons, prominent on mobile.
- Capture **UTM** on landing (cookie), attach to lead + analytics.
- `api/leads`: create lead, increment enquiryCount, log event.
- **Admin Leads CRM** `/admin/leads`: table, source listing, UTM/campaign, status (`new`→`contacted`→`closed`), filter, newest first.
**Done when:** enquiry creates a lead in admin with source + campaign; WhatsApp/call work on mobile.

### Phase 7 — AI layer
- `api/ai/search`: NL query → OpenRouter → strict JSON (type, district, budget, bedrooms, needsNearby[]); safe-parse; run DB query; post-filter via cached Overpass when needsNearby present. NL search box on home/search.
- `api/ai/describe`: fields → clean description + neighbourhood insight; "Generate description" button in admin form.
- Graceful fallback to keyword search if AI unavailable.
**Done when:** plain-English query returns sensible results; admin one-click generates a description.

### Phase 8 — Analytics, SEO, caching, polish, deploy
- **Admin analytics** (Recharts): enquiries/views over time, conversion rate, **leads by source/campaign**, top-viewed, by district/type, **search-trend report** (searched but not in inventory).
- **SEO:** metadata, OG/Twitter, `sitemap.ts` (published listings), `robots.ts`, JSON-LD, semantic headings, alt text, fast hero LCP.
- **Caching pass** per §11.
- **A11y + polish:** keyboard nav, focus, reduced-motion, skeletons, empty/error states, 404/500, favicon, loading.tsx.
- Deploy to **Vercel**; document env in README.
**Done when:** dashboards show real data, SEO complete, fast, caching verified, deployed.

---

## 11. Caching Strategy (apply throughout; finalize Phase 8)
- **Public pages** (home, detail): ISR `revalidate` (~300s); on-demand `revalidateTag('listings')` / `revalidateTag('listing:'+slug)` when admin edits.
- **Listing queries:** wrap reads in `unstable_cache`, tagged; bust on create/update/publish.
- **Overpass nearby:** cache per `listingId+radius`, long revalidate (~7 days) in a `cache` collection or `unstable_cache`.
- **OSRM:** cache by rounded from/to coords.
- **Images:** `next/image` / next-cloudinary with `sizes` + blur placeholders; CDN.
- **AI:** optionally cache identical NL queries briefly.
- **Fonts:** `next/font` self-hosted, immutable headers.
- **Mongoose:** `.lean()`, select needed fields, indexes on slug/status/type/district/isFeatured + `2dsphere` on geo.

---

## 12. Seed / Demo Data
`scripts/seed-demo.ts`: ~12 realistic Kerala listings across all 4 types and several districts (Trivandrum, Kochi, Thrissur, Kozhikode, Wayanad), 2–3 featured, placeholder Cloudinary images, a sample YouTube URL — so the home page looks alive immediately.

---

## 13. README deliverable
Final `README.md`: setup, env vars, seeding, creating admin, running, deploying, and where each major feature lives.

---

*Build in order. Keep it clean, typed, and simple. The home page and the lead flow must feel excellent — spend the design budget there.*