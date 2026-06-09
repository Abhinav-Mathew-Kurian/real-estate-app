import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/kerala-properties";

// ── Schemas ─────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "admin" },
});
const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

const ListingSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true, lowercase: true },
    description: String,
    type: String,
    category: String,
    status: { type: String, default: "published" },
    isFeatured: { type: Boolean, default: false },
    district: String,
    taluk: String,
    village: String,
    locality: String,
    address: String,
    geo: { type: { type: String, enum: ["Point"] }, coordinates: [Number] },
    area: { value: Number, unit: String },
    bedrooms: Number,
    bathrooms: Number,
    furnishing: String,
    facing: String,
    floors: Number,
    ageYears: Number,
    askingPrice: Number,
    pricePerCent: Number,
    isNegotiable: Boolean,
    monthlyRent: Number,
    deposit: Number,
    leaseTermMonths: Number,
    images: [{ url: String, publicId: String, alt: String }],
    coverIndex: { type: Number, default: 0 },
    highlights: [String],
    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
ListingSchema.index({ "geo.coordinates": "2dsphere" });
const Listing = mongoose.models.Listing ?? mongoose.model("Listing", ListingSchema);

// ── Image pools ──────────────────────────────────────────────────────────────

const HOMES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
];

const APARTMENTS = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
];

const LAND = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
];

const COMMERCIAL = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
];

function img(url: string, alt = "Property photo") {
  return { url, publicId: `demo/${url.split("/photo-")[1]?.split("?")[0] ?? "img"}`, alt };
}
const h = (i: number) => img(HOMES[i % HOMES.length]);
const ap = (i: number) => img(APARTMENTS[i % APARTMENTS.length]);
const la = (i: number) => img(LAND[i % LAND.length]);
const co = (i: number) => img(COMMERCIAL[i % COMMERCIAL.length]);

// ── Listings ──────────────────────────────────────────────────────────────────

const DEMO_LISTINGS = [
  // ── ERNAKULAM (Kochi) ──────────────────────────────────────────────────────
  {
    title: "Luxury 4 BHK Villa with Pool — Kakkanad, Kochi",
    slug: "luxury-4bhk-villa-pool-kakkanad",
    description: "A stunning contemporary villa in Kakkanad's most sought-after pocket. Temperature-controlled pool, landscaped garden, Italian marble flooring. Minutes from Infopark and SmartCity.",
    type: "SELL_HOME", category: "villa", isFeatured: true,
    district: "Ernakulam", taluk: "Kanayannur", village: "Kakkanad", locality: "Infopark Road",
    area: { value: 10, unit: "cent" }, bedrooms: 4, bathrooms: 4, furnishing: "fully-furnished", facing: "East", floors: 2, ageYears: 2,
    askingPrice: 18500000, isNegotiable: true,
    images: [h(0), h(1)],
    highlights: ["Swimming pool", "2-car garage", "Solar panels", "Smart home", "24×7 security"],
    viewCount: 312, enquiryCount: 14,
    geo: { type: "Point", coordinates: [76.3508, 10.0104] },
  },
  {
    title: "3 BHK Premium Apartment — Marine Drive, Ernakulam",
    slug: "3bhk-apartment-marine-drive-ernakulam",
    description: "Floor-to-ceiling windows with unobstructed backwater views on Marine Drive's most prestigious high-rise. Semi-furnished with modular kitchen. Walking access to MG Road.",
    type: "SELL_HOME", category: "apartment", isFeatured: true,
    district: "Ernakulam", taluk: "Kanayannur", village: "Marine Drive", locality: "Marine Drive Road",
    area: { value: 1650, unit: "sqft" }, bedrooms: 3, bathrooms: 3, furnishing: "semi-furnished", facing: "West", floors: 10, ageYears: 3,
    askingPrice: 12500000, isNegotiable: false,
    images: [ap(0)],
    highlights: ["Backwater view", "Gym & pool", "Covered parking", "24×7 security"],
    viewCount: 289, enquiryCount: 11,
    geo: { type: "Point", coordinates: [76.2673, 9.9816] },
  },
  {
    title: "Furnished Studio Apartment for Lease — Marine Drive",
    slug: "furnished-studio-lease-kochi-marine-drive",
    description: "Stylish fully-furnished studio on the 8th floor. Breathtaking backwater views, modern kitchen. Walking access to MG Road restaurants and malls.",
    type: "LEASE", category: "apartment", isFeatured: true,
    district: "Ernakulam", taluk: "Kanayannur", village: "Marine Drive",
    area: { value: 650, unit: "sqft" }, bedrooms: 1, bathrooms: 1, furnishing: "fully-furnished", facing: "West", floors: 8, ageYears: 5,
    askingPrice: 0, monthlyRent: 28000, deposit: 168000, leaseTermMonths: 24, isNegotiable: true,
    images: [ap(1)],
    highlights: ["Backwater view", "24×7 security", "High-speed internet", "Gym"],
    viewCount: 203, enquiryCount: 11,
    geo: { type: "Point", coordinates: [76.2673, 9.9816] },
  },
  {
    title: "2 BHK Apartment for Rent — Edappally, Kochi",
    slug: "2bhk-rent-edappally-kochi",
    description: "Well-maintained apartment near Lulu Mall and the NH544 flyover. Great connectivity to the entire city. Unfurnished, pet-friendly building.",
    type: "RENT", category: "apartment", isFeatured: false,
    district: "Ernakulam", taluk: "Kanayannur", village: "Edappally",
    area: { value: 1100, unit: "sqft" }, bedrooms: 2, bathrooms: 2, furnishing: "unfurnished", facing: "North", floors: 4, ageYears: 6,
    askingPrice: 0, monthlyRent: 16000, deposit: 48000, isNegotiable: true,
    images: [ap(2)],
    highlights: ["Near Lulu Mall", "Covered parking", "Power backup"],
    viewCount: 145, enquiryCount: 6,
    geo: { type: "Point", coordinates: [76.3117, 10.0268] },
  },

  // ── THIRUVANANTHAPURAM ────────────────────────────────────────────────────
  {
    title: "2 BHK House for Rent — Pattom, Trivandrum",
    slug: "2bhk-house-rent-trivandrum-pattom",
    description: "Well-maintained independent house in Pattom, one of Trivandrum's most sought-after localities. Walking distance to Pattom Junction, medical college, and premium schools.",
    type: "RENT", category: "house", isFeatured: false,
    district: "Thiruvananthapuram", taluk: "Thiruvananthapuram", village: "Pattom",
    area: { value: 1200, unit: "sqft" }, bedrooms: 2, bathrooms: 2, furnishing: "unfurnished", facing: "South", ageYears: 8,
    askingPrice: 0, monthlyRent: 18000, deposit: 54000, isNegotiable: true,
    images: [h(5)],
    highlights: ["Two-wheeler parking", "Generator backup", "Quiet lane", "Ground floor"],
    viewCount: 98, enquiryCount: 5,
    geo: { type: "Point", coordinates: [76.9466, 8.5241] },
  },
  {
    title: "4 BHK Independent House — Kowdiar, Trivandrum",
    slug: "4bhk-independent-house-kowdiar-trivandrum",
    description: "Spacious independent house in Kowdiar — Trivandrum's most prestigious address. Near Raj Bhavan, excellent schools, and Kowdiar shopping area. Full vastu compliance.",
    type: "SELL_HOME", category: "house", isFeatured: true,
    district: "Thiruvananthapuram", taluk: "Thiruvananthapuram", village: "Kowdiar",
    area: { value: 12, unit: "cent" }, bedrooms: 4, bathrooms: 4, furnishing: "semi-furnished", facing: "East", floors: 2, ageYears: 12,
    askingPrice: 14500000, isNegotiable: true,
    images: [h(2), h(3)],
    highlights: ["Near Raj Bhavan", "Large garden", "Double garage", "Vastu compliant"],
    viewCount: 215, enquiryCount: 9,
    geo: { type: "Point", coordinates: [76.9366, 8.5120] },
  },
  {
    title: "10 Cent Residential Plot — Kazhakkoottam, Trivandrum",
    slug: "10cent-plot-kazhakkoottam-trivandrum",
    description: "Prime residential plot near Technopark — ideal for professionals working in Kerala's IT hub. Clear title, east-facing, good road width.",
    type: "SELL_LAND", category: "plot", isFeatured: false,
    district: "Thiruvananthapuram", taluk: "Nedumangad", village: "Kazhakkoottam",
    area: { value: 10, unit: "cent" }, askingPrice: 5500000, pricePerCent: 550000, isNegotiable: false,
    images: [la(0)],
    highlights: ["Near Technopark", "East-facing", "All-weather road", "KSEB available"],
    viewCount: 132, enquiryCount: 5,
    geo: { type: "Point", coordinates: [76.8854, 8.5602] },
  },

  // ── KOZHIKODE ─────────────────────────────────────────────────────────────
  {
    title: "3 BHK Sea-Facing Apartment — Beach Road, Calicut",
    slug: "3bhk-sea-facing-apartment-calicut",
    description: "Panoramic Arabian Sea views from the 12th floor. Open-plan kitchen, floor-to-ceiling windows, large balcony. Beach Road is a 5-minute walk.",
    type: "SELL_HOME", category: "apartment", isFeatured: true,
    district: "Kozhikode", taluk: "Kozhikode", village: "Beach", locality: "Beach Road",
    area: { value: 1850, unit: "sqft" }, bedrooms: 3, bathrooms: 3, furnishing: "semi-furnished", facing: "West", floors: 12, ageYears: 1,
    askingPrice: 9800000, isNegotiable: false,
    images: [ap(0)],
    highlights: ["Sea-facing", "Gym & pool", "Covered parking", "Power backup"],
    viewCount: 245, enquiryCount: 9,
    geo: { type: "Point", coordinates: [75.7804, 11.2588] },
  },
  {
    title: "Commercial Space for Lease — Mavoor Road, Calicut",
    slug: "commercial-space-lease-mavoor-road-calicut",
    description: "Prime commercial space on Calicut's main arterial road. Ground plus first floor, large frontage, suitable for showroom, bank branch or restaurant. High footfall area.",
    type: "LEASE", category: "commercial", isFeatured: false,
    district: "Kozhikode", taluk: "Kozhikode", village: "Nadakkavu", locality: "Mavoor Road",
    area: { value: 2200, unit: "sqft" }, askingPrice: 0, monthlyRent: 80000, deposit: 960000, leaseTermMonths: 36, isNegotiable: true,
    images: [co(0)],
    highlights: ["High footfall", "Large frontage", "Two floors", "Generator backup"],
    viewCount: 98, enquiryCount: 4,
    geo: { type: "Point", coordinates: [75.7804, 11.2508] },
  },
  {
    title: "6 Cent Residential Plot — Beypore, Kozhikode",
    slug: "6cent-plot-beypore-kozhikode",
    description: "Serene residential plot in Beypore — the historic fishing harbour. Excellent connectivity via the Beypore Bridge. Suitable for individual home construction.",
    type: "SELL_LAND", category: "plot", isFeatured: false,
    district: "Kozhikode", taluk: "Kozhikode", village: "Beypore",
    area: { value: 6, unit: "cent" }, askingPrice: 2100000, pricePerCent: 350000, isNegotiable: true,
    images: [la(1)],
    highlights: ["Near Beypore port", "Corner plot", "Road frontage on two sides"],
    viewCount: 87, enquiryCount: 3,
    geo: { type: "Point", coordinates: [75.8147, 11.1751] },
  },

  // ── THRISSUR ──────────────────────────────────────────────────────────────
  {
    title: "Residential Plot 8 Cent — Ollur, Thrissur",
    slug: "residential-plot-8-cent-thrissur-ollur",
    description: "Clear-title 8-cent residential plot in Ollur, Thrissur — a fast-growing corridor near NH544. East-facing corner plot ideal for your dream home.",
    type: "SELL_LAND", category: "plot", isFeatured: false,
    district: "Thrissur", taluk: "Thrissur", village: "Ollur",
    area: { value: 8, unit: "cent" }, askingPrice: 3200000, pricePerCent: 400000, isNegotiable: false,
    images: [la(2)],
    highlights: ["East-facing road", "Corner plot", "KSEB connection", "Panchayat approved"],
    viewCount: 134, enquiryCount: 6,
    geo: { type: "Point", coordinates: [76.1892, 10.4803] },
  },
  {
    title: "Independent Villa for Lease — Potta, Thrissur",
    slug: "independent-villa-lease-thrissur-potta",
    description: "Spacious 4-bedroom independent villa in Potta, near the Divine Retreat Centre. Large garden, separate outhouse, easy access to Chalakudy and Thrissur.",
    type: "LEASE", category: "villa", isFeatured: false,
    district: "Thrissur", taluk: "Chalakudy", village: "Potta",
    area: { value: 12, unit: "cent" }, bedrooms: 4, bathrooms: 3, furnishing: "unfurnished", facing: "South", floors: 2, ageYears: 10,
    askingPrice: 0, monthlyRent: 42000, deposit: 252000, leaseTermMonths: 36, isNegotiable: true,
    images: [h(6)],
    highlights: ["Large garden", "Separate outhouse", "Water well", "KSEB connection"],
    viewCount: 74, enquiryCount: 2,
    geo: { type: "Point", coordinates: [76.3375, 10.2883] },
  },
  {
    title: "3 BHK House for Sale — Guruvayur Road, Thrissur",
    slug: "3bhk-house-guruvayur-road-thrissur",
    description: "Beautiful family home on the main Guruvayur temple road. Ground floor with attached garage. Excellent for pilgrimage homestay or primary residence.",
    type: "SELL_HOME", category: "house", isFeatured: false,
    district: "Thrissur", taluk: "Chavakkad", village: "Guruvayur",
    area: { value: 9, unit: "cent" }, bedrooms: 3, bathrooms: 3, facing: "North", floors: 1, ageYears: 15,
    askingPrice: 7800000, isNegotiable: true,
    images: [h(3)],
    highlights: ["Near Guruvayur temple", "Ground floor", "Garage", "Compound wall"],
    viewCount: 167, enquiryCount: 8,
    geo: { type: "Point", coordinates: [76.0444, 10.5943] },
  },

  // ── WAYANAD ───────────────────────────────────────────────────────────────
  {
    title: "Agricultural Land 2 Acres — Ambalavayal, Wayanad",
    slug: "agricultural-land-2-acres-wayanad",
    description: "Two pristine acres in Wayanad's coffee and pepper belt at 800m elevation. Established coffee plantation (~400 plants) plus wild pepper vines — generating passive income from day one.",
    type: "SELL_LAND", category: "agricultural", isFeatured: true,
    district: "Wayanad", taluk: "Mananthavady", village: "Ambalavayal",
    area: { value: 2, unit: "acre" }, askingPrice: 4800000, isNegotiable: true,
    images: [la(3)],
    highlights: ["Coffee plantation", "Water source", "All-weather road", "Near eco-tourism zone"],
    viewCount: 189, enquiryCount: 7,
    geo: { type: "Point", coordinates: [76.1024, 11.8546] },
  },
  {
    title: "Farmhouse 3 Acres with Homestay — Kalpetta, Wayanad",
    slug: "farmhouse-3-acres-kalpetta-wayanad",
    description: "Running eco-homestay on 3 acres of mixed plantation (rubber, pepper, cardamom). 4 guest cottages, main house, and reception area. Wayanad's booming tourism means 80%+ occupancy.",
    type: "SELL_HOME", category: "villa", isFeatured: true,
    district: "Wayanad", taluk: "Vythiri", village: "Kalpetta",
    area: { value: 3, unit: "acre" }, bedrooms: 6, bathrooms: 6, furnishing: "fully-furnished", ageYears: 8,
    askingPrice: 22000000, isNegotiable: true,
    images: [h(4), la(0)],
    highlights: ["Running homestay business", "4 guest cottages", "Mixed plantation", "80%+ occupancy"],
    viewCount: 341, enquiryCount: 16,
    geo: { type: "Point", coordinates: [76.0817, 11.6072] },
  },

  // ── PALAKKAD ──────────────────────────────────────────────────────────────
  {
    title: "Heritage Tharavad 120 Years Old — Kalpathy, Palakkad",
    slug: "heritage-tharavad-palakkad",
    description: "A rare 120-year-old traditional Kerala tharavad in pristine condition. Teakwood pillars, handcrafted nalukettu courtyard, antique doors. Mango grove on 25 cents. Perfect for heritage homestay conversion.",
    type: "SELL_HOME", category: "house", isFeatured: true,
    district: "Palakkad", taluk: "Palakkad", village: "Kalpathy",
    area: { value: 25, unit: "cent" }, bedrooms: 6, bathrooms: 3, ageYears: 120,
    askingPrice: 12000000, isNegotiable: true,
    images: [h(1), h(5)],
    highlights: ["Nalukettu layout", "Teak construction", "Mango grove", "Near Kalpathy heritage zone"],
    viewCount: 421, enquiryCount: 18,
    geo: { type: "Point", coordinates: [76.6552, 10.7867] },
  },
  {
    title: "5 Acres Paddy Land — Chittur, Palakkad",
    slug: "5-acres-paddy-land-chittur-palakkad",
    description: "Fertile 5-acre paddy land in Chittur, Palakkad's agricultural heartland. Irrigated via canal, all-season cultivation possible. Flat terrain, direct road access, clear patta.",
    type: "SELL_LAND", category: "agricultural", isFeatured: false,
    district: "Palakkad", taluk: "Chittur", village: "Chittur",
    area: { value: 5, unit: "acre" }, askingPrice: 6000000, isNegotiable: true,
    images: [la(1)],
    highlights: ["Canal irrigation", "Flat terrain", "All-season cultivation", "Clear patta"],
    viewCount: 103, enquiryCount: 4,
    geo: { type: "Point", coordinates: [76.7451, 10.6922] },
  },

  // ── ALAPPUZHA ─────────────────────────────────────────────────────────────
  {
    title: "Commercial Space for Rent — Beach Road, Alappuzha",
    slug: "commercial-space-rent-alappuzha-town",
    description: "Prime ground-floor commercial space at the heart of Alappuzha town. 30 feet road frontage, 800 sqft, within 500m of the famous Alappuzha beach and KSRTC stand.",
    type: "RENT", category: "commercial", isFeatured: false,
    district: "Alappuzha", taluk: "Ambalapuzha", village: "Alappuzha", locality: "Beach Road",
    area: { value: 800, unit: "sqft" }, askingPrice: 0, monthlyRent: 35000, deposit: 210000, isNegotiable: true,
    images: [co(1)],
    highlights: ["30ft road frontage", "Near beach", "Power backup"],
    viewCount: 87, enquiryCount: 4,
    geo: { type: "Point", coordinates: [76.3388, 9.4981] },
  },
  {
    title: "Houseboat-Style Villa on Backwaters — Alleppey",
    slug: "backwater-villa-alleppey",
    description: "Unique backwater-facing villa designed in traditional Kerala architecture with modern amenities. Private jetty, open deck, stunning views of the Vembanad lake. Ideal for luxury homestay or personal retreat.",
    type: "SELL_HOME", category: "villa", isFeatured: true,
    district: "Alappuzha", taluk: "Ambalapuzha", village: "Punnamada",
    area: { value: 15, unit: "cent" }, bedrooms: 3, bathrooms: 3, furnishing: "fully-furnished", ageYears: 4,
    askingPrice: 16500000, isNegotiable: false,
    images: [h(0), h(7)],
    highlights: ["Private backwater jetty", "Open deck", "Vembanad lake view", "Traditional Kerala architecture"],
    viewCount: 378, enquiryCount: 15,
    geo: { type: "Point", coordinates: [76.3610, 9.4906] },
  },

  // ── KOTTAYAM ──────────────────────────────────────────────────────────────
  {
    title: "3 BHK Apartment — Nagampadam, Kottayam",
    slug: "3bhk-apartment-kottayam-nagampadam",
    description: "Spacious 1,450 sqft apartment near Kottayam Medical College. Children's play area, rainwater harvesting, 4th floor with good breeze. Excellent schools and hospitals within 2km.",
    type: "SELL_HOME", category: "apartment", isFeatured: false,
    district: "Kottayam", taluk: "Kottayam", village: "Nagampadam",
    area: { value: 1450, unit: "sqft" }, bedrooms: 3, bathrooms: 2, furnishing: "semi-furnished", facing: "North", floors: 4, ageYears: 7,
    askingPrice: 7200000, isNegotiable: true,
    images: [ap(2)],
    highlights: ["Near medical college", "Children's play area", "Covered parking", "Rainwater harvesting"],
    viewCount: 156, enquiryCount: 6,
    geo: { type: "Point", coordinates: [76.5222, 9.5916] },
  },
  {
    title: "Rubber Estate 8 Acres — Changanacherry, Kottayam",
    slug: "rubber-estate-8-acres-changanacherry",
    description: "Producing rubber estate in Changanacherry — Kottayam's rubber capital. Mature trees (15+ years), annual yield of ~2.5 tonnes. Good access road, electricity, and worker quarters included.",
    type: "SELL_LAND", category: "agricultural", isFeatured: false,
    district: "Kottayam", taluk: "Changanacherry", village: "Changanacherry",
    area: { value: 8, unit: "acre" }, askingPrice: 14000000, isNegotiable: true,
    images: [la(0)],
    highlights: ["Producing rubber estate", "Mature trees 15+ yrs", "Worker quarters", "Annual yield 2.5T"],
    viewCount: 142, enquiryCount: 5,
    geo: { type: "Point", coordinates: [76.5362, 9.4458] },
  },

  // ── PATHANAMTHITTA ────────────────────────────────────────────────────────
  {
    title: "Riverside Land 50 Cent — Ranni, Pathanamthitta",
    slug: "riverside-land-50-cent-pathanamthitta",
    description: "Stunning 50-cent plot along the Pampa River in Ranni. Direct river frontage, suitable for eco-resort or riverside homestay. Near the Sabarimala pilgrim route — high tourist season demand.",
    type: "SELL_LAND", category: "agricultural", isFeatured: true,
    district: "Pathanamthitta", taluk: "Ranni", village: "Ranni", locality: "Pampa Riverbank",
    area: { value: 50, unit: "cent" }, askingPrice: 9500000, pricePerCent: 190000, isNegotiable: true,
    images: [la(3)],
    highlights: ["Pampa river frontage", "Eco-tourism potential", "Near Sabarimala route", "Fertile land"],
    viewCount: 287, enquiryCount: 12,
    geo: { type: "Point", coordinates: [76.9869, 9.3697] },
  },

  // ── KANNUR ────────────────────────────────────────────────────────────────
  {
    title: "5 Cent Plot Near Beach — Thottada, Kannur",
    slug: "5-cent-plot-kannur-town-near-beach",
    description: "Well-proportioned 5-cent plot in Thottada, 800m from the famous Thottada Beach. Clear patta land with direct road access — ready to build immediately.",
    type: "SELL_LAND", category: "plot", isFeatured: false,
    district: "Kannur", taluk: "Thalassery", village: "Thottada",
    area: { value: 5, unit: "cent" }, askingPrice: 2750000, pricePerCent: 550000, isNegotiable: false,
    images: [la(2)],
    highlights: ["800m from beach", "KSEB available", "Panchayat approved", "North-east corner"],
    viewCount: 112, enquiryCount: 3,
    geo: { type: "Point", coordinates: [75.3698, 11.8745] },
  },
  {
    title: "3 BHK Villa for Sale — Thalassery, Kannur",
    slug: "3bhk-villa-thalassery-kannur",
    description: "Well-built 3-bedroom villa in the heart of Thalassery — known for its rich cultural heritage and colonial architecture. Near beach, Brennen College, and the famous Thalassery cricket stadium.",
    type: "SELL_HOME", category: "villa", isFeatured: false,
    district: "Kannur", taluk: "Thalassery", village: "Thalassery",
    area: { value: 8, unit: "cent" }, bedrooms: 3, bathrooms: 3, facing: "East", floors: 2, ageYears: 6,
    askingPrice: 8500000, isNegotiable: true,
    images: [h(6)],
    highlights: ["Near beach", "Near Brennen College", "Compound wall", "Garage"],
    viewCount: 95, enquiryCount: 4,
    geo: { type: "Point", coordinates: [75.3696, 11.7483] },
  },

  // ── MALAPPURAM ────────────────────────────────────────────────────────────
  {
    title: "2 Acre Agricultural Land — Tirur, Malappuram",
    slug: "2-acre-agricultural-land-tirur-malappuram",
    description: "Fertile 2-acre agricultural land in Tirur, known for its traditional betel leaf and banana cultivation. Good water table, electricity nearby. Suitable for organic farming or greenhouse project.",
    type: "SELL_LAND", category: "agricultural", isFeatured: false,
    district: "Malappuram", taluk: "Tirur", village: "Tirur",
    area: { value: 2, unit: "acre" }, askingPrice: 3200000, isNegotiable: true,
    images: [la(1)],
    highlights: ["Good water table", "Electricity nearby", "Flat land", "Suitable for organic farming"],
    viewCount: 78, enquiryCount: 3,
    geo: { type: "Point", coordinates: [75.9243, 10.9129] },
  },
  {
    title: "3 BHK House for Rent — Manjeri, Malappuram",
    slug: "3bhk-house-rent-manjeri-malappuram",
    description: "Spacious independent house in Manjeri town near Government Medical College. Ideal for medical students or resident doctors. Close to MES Medical College and all amenities.",
    type: "RENT", category: "house", isFeatured: false,
    district: "Malappuram", taluk: "Ernad", village: "Manjeri",
    area: { value: 1400, unit: "sqft" }, bedrooms: 3, bathrooms: 2, furnishing: "unfurnished", ageYears: 10,
    askingPrice: 0, monthlyRent: 14000, deposit: 42000, isNegotiable: true,
    images: [h(5)],
    highlights: ["Near Medical College", "Two-wheeler parking", "Generator"],
    viewCount: 112, enquiryCount: 5,
    geo: { type: "Point", coordinates: [76.1195, 11.1198] },
  },

  // ── KASARAGOD ─────────────────────────────────────────────────────────────
  {
    title: "Beach-Facing Villa — Bekal, Kasaragod",
    slug: "beach-facing-villa-bekal-kasaragod",
    description: "Premium 3-bedroom villa within walking distance of the iconic Bekal Fort. Lush landscaped garden, open terrace, and partial sea view. Kasaragod's booming tourism corridor.",
    type: "SELL_HOME", category: "villa", isFeatured: true,
    district: "Kasaragod", taluk: "Hosdurg", village: "Bekal",
    area: { value: 14, unit: "cent" }, bedrooms: 3, bathrooms: 3, furnishing: "semi-furnished", facing: "West", floors: 2, ageYears: 4,
    askingPrice: 11500000, isNegotiable: false,
    images: [h(2), h(4)],
    highlights: ["Near Bekal Fort", "Partial sea view", "Landscaped garden", "Open terrace"],
    viewCount: 198, enquiryCount: 8,
    geo: { type: "Point", coordinates: [75.0393, 12.3890] },
  },
  {
    title: "10 Acres Coconut Estate — Kasaragod Town",
    slug: "10-acres-coconut-estate-kasaragod",
    description: "Productive 10-acre coconut estate with mature trees. One of Kasaragod's best producing estates. Worker quarters, well water, electricity. Regular annual income from coconut and copra.",
    type: "SELL_LAND", category: "agricultural", isFeatured: false,
    district: "Kasaragod", taluk: "Kasaragod", village: "Kasaragod",
    area: { value: 10, unit: "acre" }, askingPrice: 18000000, isNegotiable: true,
    images: [la(0)],
    highlights: ["Mature coconut trees", "Worker quarters", "Well water", "Regular income"],
    viewCount: 134, enquiryCount: 5,
    geo: { type: "Point", coordinates: [74.9896, 12.5001] },
  },

  // ── IDUKKI ────────────────────────────────────────────────────────────────
  {
    title: "Tea Estate 5 Acres — Munnar, Idukki",
    slug: "tea-estate-5-acres-munnar-idukki",
    description: "A rare chance to own a 5-acre tea estate in the misty hills of Munnar at 1,600m elevation. The estate has an active tea plucking area with a processing shed. Spectacular mountain views in every direction.",
    type: "SELL_LAND", category: "agricultural", isFeatured: true,
    district: "Idukki", taluk: "Devikulam", village: "Munnar",
    area: { value: 5, unit: "acre" }, askingPrice: 28000000, isNegotiable: false,
    images: [la(3), la(1)],
    highlights: ["Active tea estate", "Processing shed", "Mountain views", "1600m elevation"],
    viewCount: 445, enquiryCount: 20,
    geo: { type: "Point", coordinates: [77.0597, 10.0889] },
  },
  {
    title: "3 BHK Cottage for Rent — Thekkady, Idukki",
    slug: "3bhk-cottage-rent-thekkady-idukki",
    description: "Cosy cottage surrounded by spice gardens at the edge of Periyar Tiger Reserve. 3 bedrooms, open veranda, barbecue area. Perfect for long-term nature lovers or working from Thekkady.",
    type: "RENT", category: "villa", isFeatured: false,
    district: "Idukki", taluk: "Peermedu", village: "Thekkady",
    area: { value: 2500, unit: "sqft" }, bedrooms: 3, bathrooms: 2, furnishing: "fully-furnished", ageYears: 7,
    askingPrice: 0, monthlyRent: 45000, deposit: 135000, isNegotiable: true,
    images: [h(7)],
    highlights: ["Spice garden surroundings", "Near Periyar reserve", "Open veranda", "Barbecue area"],
    viewCount: 178, enquiryCount: 7,
    geo: { type: "Point", coordinates: [77.1629, 9.6100] },
  },

  // ── KOLLAM ────────────────────────────────────────────────────────────────
  {
    title: "4 BHK House for Sale — Kadavoor, Kollam",
    slug: "4bhk-house-kadavoor-kollam",
    description: "Well-constructed double-storey house in Kadavoor, one of Kollam's fastest-growing residential belts. 3km from National Highway, surrounded by good schools and hospitals.",
    type: "SELL_HOME", category: "house", isFeatured: false,
    district: "Kollam", taluk: "Kollam", village: "Kadavoor",
    area: { value: 11, unit: "cent" }, bedrooms: 4, bathrooms: 3, facing: "East", floors: 2, ageYears: 9,
    askingPrice: 8200000, isNegotiable: true,
    images: [h(3), h(0)],
    highlights: ["Double storey", "Near NH", "School proximity", "Compound wall"],
    viewCount: 124, enquiryCount: 5,
    geo: { type: "Point", coordinates: [76.5918, 8.9016] },
  },

  // ── THRISSUR - COMMERCIAL ─────────────────────────────────────────────────
  {
    title: "Office Space for Rent — Round South, Thrissur",
    slug: "office-space-rent-round-south-thrissur",
    description: "Prestigious office space in Thrissur's commercial heart, Round South. 1,800 sqft, 3rd floor, lifts, great natural light. Ideal for corporate office, CA firm or insurance branch.",
    type: "RENT", category: "commercial", isFeatured: false,
    district: "Thrissur", taluk: "Thrissur", village: "Thrissur", locality: "Round South",
    area: { value: 1800, unit: "sqft" }, askingPrice: 0, monthlyRent: 60000, deposit: 360000, isNegotiable: true,
    images: [co(0)],
    highlights: ["Round South location", "Lift access", "Power backup", "Security"],
    viewCount: 91, enquiryCount: 3,
    geo: { type: "Point", coordinates: [76.2144, 10.5276] },
  },

  // ── ERNAKULAM - LAND ──────────────────────────────────────────────────────
  {
    title: "12 Cent Plot Near Metro — Aluva, Ernakulam",
    slug: "12cent-plot-aluva-metro-ernakulam",
    description: "Strategically located 12-cent plot adjacent to Aluva Metro station. North-facing, clear title, ideal for apartment development or commercial building. Rapidly appreciating corridor.",
    type: "SELL_LAND", category: "plot", isFeatured: true,
    district: "Ernakulam", taluk: "Aluva", village: "Aluva",
    area: { value: 12, unit: "cent" }, askingPrice: 9600000, pricePerCent: 800000, isNegotiable: false,
    images: [la(2)],
    highlights: ["Adjacent to Metro station", "Development potential", "North-facing", "Clear title"],
    viewCount: 267, enquiryCount: 10,
    geo: { type: "Point", coordinates: [76.3525, 10.1040] },
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    const passwordHash = await bcrypt.hash("Admin@12345", 12);
    admin = await User.create({
      name: "Site Admin",
      email: "admin@sellkerala.in",
      passwordHash,
      role: "admin",
    });
    console.log("Created admin: admin@sellkerala.in / Admin@12345");
  }

  let created = 0;
  let skipped = 0;

  for (const data of DEMO_LISTINGS) {
    const existing = await Listing.findOne({ slug: data.slug });
    if (existing) { skipped++; continue; }
    await Listing.create({ ...data, createdBy: admin._id });
    created++;
    console.log(`  + ${data.title}`);
  }

  console.log(`\nDone: ${created} created, ${skipped} already existed`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
