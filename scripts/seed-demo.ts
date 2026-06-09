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
    geo: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number],
    },
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

// ── Demo data ────────────────────────────────────────────────────────────────

const UNSPLASH_HOMES = [
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80",
  "https://images.unsplash.com/photo-1609347744403-2306bebb6cd?w=800&q=80",
  "https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=800&q=80",
];

const UNSPLASH_LAND = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
];

function img(url: string, alt = "Property photo") {
  return { url, publicId: `demo/${url.split("/").pop()?.split("?")[0]}`, alt };
}

const DEMO_LISTINGS = [
  {
    title: "Luxury 4 BHK Villa with Pool in Kakkanad",
    slug: "luxury-4bhk-villa-pool-kakkanad",
    description:
      "A stunning contemporary villa nestled in the heart of Kakkanad's most sought-after residential pocket. The spacious 4-bedroom home features a temperature-controlled swimming pool, landscaped garden, and premium Italian marble flooring throughout.\n\nKakkanad's IT corridor brings convenience right to your doorstep — Infopark and SmartCity are within 10 minutes, making this ideal for working professionals. The neighbourhood is well-served by international schools, hospitals, and a growing retail ecosystem.\n\nAn exceptional investment in one of Kochi's fastest-appreciating corridors, priced fairly against recent comparable sales.",
    type: "SELL_HOME",
    category: "villa",
    status: "published",
    isFeatured: true,
    district: "Ernakulam",
    taluk: "Kanayannur",
    village: "Kakkanad",
    locality: "Infopark Road",
    area: { value: 10, unit: "cent" },
    bedrooms: 4,
    bathrooms: 4,
    furnishing: "fully-furnished",
    facing: "East",
    floors: 2,
    ageYears: 2,
    askingPrice: 18500000,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[0], "Villa front view"), img(UNSPLASH_HOMES[1], "Pool area")],
    highlights: ["Swimming pool", "2-car garage", "Solar panels", "Smart home system", "24×7 security"],
    viewCount: 312,
    enquiryCount: 14,
    geo: { type: "Point", coordinates: [76.3508, 10.0104] },
  },
  {
    title: "3 BHK Sea-Facing Apartment in Calicut",
    slug: "3bhk-sea-facing-apartment-calicut",
    description:
      "Wake up to panoramic Arabian Sea views from this premium 3-bedroom apartment on the 12th floor of Kozhikode's finest residential tower. Open-plan kitchen, floor-to-ceiling windows, and a large balcony create an airy, resort-like feel.\n\nBeach Road is a 5-minute walk, with Calicut's vibrant café culture, fish market, and SM Street just minutes away. The iconic Kozhikode waterfront lifestyle is yours to enjoy year-round.",
    type: "SELL_HOME",
    category: "apartment",
    status: "published",
    isFeatured: true,
    district: "Kozhikode",
    taluk: "Kozhikode",
    village: "Beach",
    locality: "Beach Road",
    area: { value: 1850, unit: "sqft" },
    bedrooms: 3,
    bathrooms: 3,
    furnishing: "semi-furnished",
    facing: "West",
    floors: 12,
    ageYears: 1,
    askingPrice: 9800000,
    isNegotiable: false,
    images: [img(UNSPLASH_HOMES[2], "Sea view from balcony")],
    highlights: ["Sea-facing", "Gym & swimming pool", "Covered parking", "Power backup"],
    viewCount: 245,
    enquiryCount: 9,
    geo: { type: "Point", coordinates: [75.7804, 11.2588] },
  },
  {
    title: "Agricultural Land 2 Acres in Wayanad Coffee Belt",
    slug: "agricultural-land-2-acres-wayanad",
    description:
      "Two pristine acres of fertile red soil in Wayanad's famous coffee and pepper growing belt. The land has an established coffee plantation with about 400 coffee plants at various stages, plus wild pepper vines — generating passive income from day one.\n\nSet amidst rolling hills at 800m elevation, the land enjoys mild climate, reliable rainfall, and is well-suited for organic farming, eco-tourism, or a farmhouse retreat.",
    type: "SELL_LAND",
    category: "agricultural",
    status: "published",
    isFeatured: true,
    district: "Wayanad",
    taluk: "Mananthavady",
    village: "Ambalavayal",
    area: { value: 2, unit: "acre" },
    askingPrice: 4800000,
    isNegotiable: true,
    images: [img(UNSPLASH_LAND[0], "Wayanad coffee estate")],
    highlights: ["Established coffee plantation", "Water source on land", "All-weather road access", "Near eco-tourism zone"],
    viewCount: 189,
    enquiryCount: 7,
    geo: { type: "Point", coordinates: [76.1024, 11.8546] },
  },
  {
    title: "2 BHK House for Rent in Trivandrum Pattom",
    slug: "2bhk-house-rent-trivandrum-pattom",
    description:
      "Well-maintained independent house in Pattom, one of Thiruvananthapuram's most sought-after residential localities. Walking distance to Pattom Junction, medical college, and a host of premium schools.",
    type: "RENT",
    category: "house",
    status: "published",
    isFeatured: false,
    district: "Thiruvananthapuram",
    taluk: "Thiruvananthapuram",
    village: "Pattom",
    area: { value: 1200, unit: "sqft" },
    bedrooms: 2,
    bathrooms: 2,
    furnishing: "unfurnished",
    facing: "South",
    ageYears: 8,
    askingPrice: 0,
    monthlyRent: 18000,
    deposit: 54000,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[3], "House exterior")],
    highlights: ["Two-wheeler parking", "Generator backup", "Quiet lane", "Ground floor"],
    viewCount: 98,
    enquiryCount: 5,
    geo: { type: "Point", coordinates: [76.9466, 8.5241] },
  },
  {
    title: "Residential Plot 8 Cent in Thrissur Ollur",
    slug: "residential-plot-8-cent-thrissur-ollur",
    description:
      "Clear-title 8-cent residential plot in Ollur, Thrissur — a fast-growing corridor connecting Thrissur city to the NH544. Ideal for building your dream home or as a long-term land investment.",
    type: "SELL_LAND",
    category: "plot",
    status: "published",
    isFeatured: false,
    district: "Thrissur",
    taluk: "Thrissur",
    village: "Ollur",
    area: { value: 8, unit: "cent" },
    askingPrice: 3200000,
    pricePerCent: 400000,
    isNegotiable: false,
    images: [img(UNSPLASH_LAND[1], "Plot overview")],
    highlights: ["East-facing road", "Corner plot", "KSEB connection available", "Panchayat approved"],
    viewCount: 134,
    enquiryCount: 6,
    geo: { type: "Point", coordinates: [76.1892, 10.4803] },
  },
  {
    title: "Furnished Studio Apartment for Lease in Kochi Marine Drive",
    slug: "furnished-studio-lease-kochi-marine-drive",
    description:
      "Stylish fully-furnished studio apartment on the 8th floor of a premium high-rise on Marine Drive, Ernakulam. Breathtaking views of the backwaters, modern kitchen, and walking access to MG Road's restaurants and malls.",
    type: "LEASE",
    category: "apartment",
    status: "published",
    isFeatured: true,
    district: "Ernakulam",
    taluk: "Kanayannur",
    village: "Marine Drive",
    locality: "Marine Drive Road",
    area: { value: 650, unit: "sqft" },
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "fully-furnished",
    facing: "West",
    floors: 8,
    ageYears: 5,
    askingPrice: 0,
    monthlyRent: 28000,
    deposit: 168000,
    leaseTermMonths: 24,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[4], "Studio interior")],
    highlights: ["Backwater view", "24×7 security", "High-speed internet", "Gym access"],
    viewCount: 203,
    enquiryCount: 11,
    geo: { type: "Point", coordinates: [76.2673, 9.9816] },
  },
  {
    title: "Heritage Tharavad for Sale in Palakkad",
    slug: "heritage-tharavad-palakkad",
    description:
      "A rare opportunity to own a 120-year-old traditional Kerala tharavad (ancestral home) in pristine condition. Teakwood pillars, handcrafted nalukettu (central courtyard), antique doors and windows — a living piece of Kerala heritage.\n\nSet on 25 cents of land with a productive mango grove, this is perfect for a heritage homestay conversion, high-value residential restoration, or preservation by a heritage lover.",
    type: "SELL_HOME",
    category: "house",
    status: "published",
    isFeatured: true,
    district: "Palakkad",
    taluk: "Palakkad",
    village: "Kalpathy",
    area: { value: 25, unit: "cent" },
    bedrooms: 6,
    bathrooms: 3,
    furnishing: "unfurnished",
    ageYears: 120,
    askingPrice: 12000000,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[1], "Heritage home front")],
    highlights: ["Nalukettu layout", "Teak wood construction", "Mango grove", "Near Kalpathy Ratholsavam heritage zone"],
    viewCount: 421,
    enquiryCount: 18,
    geo: { type: "Point", coordinates: [76.6552, 10.7867] },
  },
  {
    title: "Commercial Space for Rent in Alappuzha Town",
    slug: "commercial-space-rent-alappuzha-town",
    description:
      "Prime ground-floor commercial space at the heart of Alappuzha (Alleppey) town — ideal for a retail showroom, clinic, or office. High footfall area, 30 feet road frontage, and within 500m of the famous Alappuzha beach.",
    type: "RENT",
    category: "commercial",
    status: "published",
    isFeatured: false,
    district: "Alappuzha",
    taluk: "Ambalapuzha",
    village: "Alappuzha",
    locality: "Beach Road",
    area: { value: 800, unit: "sqft" },
    askingPrice: 0,
    monthlyRent: 35000,
    deposit: 210000,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[0], "Commercial space exterior")],
    highlights: ["30ft road frontage", "High footfall", "Toilet facility", "Power backup"],
    viewCount: 87,
    enquiryCount: 4,
    geo: { type: "Point", coordinates: [76.3388, 9.4981] },
  },
  {
    title: "3 BHK Apartment in Kottayam Nagampadam",
    slug: "3bhk-apartment-kottayam-nagampadam",
    description:
      "Spacious 1,450 sqft apartment in a well-maintained residential complex close to Kottayam Medical College. Ideal for families — excellent schools, hospitals, and Kottayam town's famous rubber and spice markets are all within easy reach.",
    type: "SELL_HOME",
    category: "apartment",
    status: "published",
    isFeatured: false,
    district: "Kottayam",
    taluk: "Kottayam",
    village: "Nagampadam",
    area: { value: 1450, unit: "sqft" },
    bedrooms: 3,
    bathrooms: 2,
    furnishing: "semi-furnished",
    facing: "North",
    floors: 4,
    ageYears: 7,
    askingPrice: 7200000,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[2], "Apartment building")],
    highlights: ["Children's play area", "Covered parking", "Rainwater harvesting", "Near medical college"],
    viewCount: 156,
    enquiryCount: 6,
    geo: { type: "Point", coordinates: [76.5222, 9.5916] },
  },
  {
    title: "5 Cent Plot in Kannur Town Near Beach",
    slug: "5-cent-plot-kannur-town-near-beach",
    description:
      "Well-proportioned 5-cent residential plot in Thottada area of Kannur, just 800m from the famous Thottada Beach. Clear patta land with direct road access — ready to build immediately.",
    type: "SELL_LAND",
    category: "plot",
    status: "published",
    isFeatured: false,
    district: "Kannur",
    taluk: "Thalassery",
    village: "Thottada",
    area: { value: 5, unit: "cent" },
    askingPrice: 2750000,
    pricePerCent: 550000,
    isNegotiable: false,
    images: [img(UNSPLASH_LAND[0], "Plot near Kannur beach")],
    highlights: ["800m from beach", "KSEB connection available", "Municipal panchayat approved", "North-east corner"],
    viewCount: 112,
    enquiryCount: 3,
    geo: { type: "Point", coordinates: [75.3698, 11.8745] },
  },
  {
    title: "Independent Villa for Lease in Thrissur Potta",
    slug: "independent-villa-lease-thrissur-potta",
    description:
      "Spacious 4-bedroom independent villa available on 3-year lease in Potta, Thrissur — known for its proximity to the Divine Retreat Centre and excellent connectivity to Chalakudy and Thrissur city.",
    type: "LEASE",
    category: "villa",
    status: "published",
    isFeatured: false,
    district: "Thrissur",
    taluk: "Chalakudy",
    village: "Potta",
    area: { value: 12, unit: "cent" },
    bedrooms: 4,
    bathrooms: 3,
    furnishing: "unfurnished",
    facing: "South",
    floors: 2,
    ageYears: 10,
    askingPrice: 0,
    monthlyRent: 42000,
    deposit: 252000,
    leaseTermMonths: 36,
    isNegotiable: true,
    images: [img(UNSPLASH_HOMES[3], "Villa entrance")],
    highlights: ["Large garden", "Separate outhouse", "Water well", "KSEB connection"],
    viewCount: 74,
    enquiryCount: 2,
    geo: { type: "Point", coordinates: [76.3375, 10.2883] },
  },
  {
    title: "Riverside Land 50 Cent in Pathanamthitta",
    slug: "riverside-land-50-cent-pathanamthitta",
    description:
      "Stunning 50-cent plot along the Pampa River in Ranni, Pathanamthitta — Kerala's pilgrim and eco-tourism hub. The land has direct river frontage, lush riverside vegetation, and is suitable for an eco-resort, riverside homestay, or premium residential development.",
    type: "SELL_LAND",
    category: "agricultural",
    status: "published",
    isFeatured: true,
    district: "Pathanamthitta",
    taluk: "Ranni",
    village: "Ranni",
    locality: "Pampa Riverbank",
    area: { value: 50, unit: "cent" },
    askingPrice: 9500000,
    pricePerCent: 190000,
    isNegotiable: true,
    images: [img(UNSPLASH_LAND[1], "Riverside land Pampa")],
    highlights: ["Pampa river frontage", "Eco-tourism potential", "Near Sabarimala pilgrim route", "Fertile land"],
    viewCount: 287,
    enquiryCount: 12,
    geo: { type: "Point", coordinates: [76.9869, 9.3697] },
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Ensure admin user exists
  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    const passwordHash = await bcrypt.hash("Admin@12345", 12);
    admin = await User.create({
      name: "Site Admin",
      email: "admin@sellkerala.in",
      passwordHash,
      role: "admin",
    });
    console.log("Created admin user: admin@sellkerala.in / Admin@12345");
  }

  let created = 0;
  let skipped = 0;

  for (const data of DEMO_LISTINGS) {
    const existing = await Listing.findOne({ slug: data.slug });
    if (existing) {
      skipped++;
      continue;
    }
    await Listing.create({ ...data, createdBy: admin._id });
    created++;
    console.log(`  ✓ ${data.title}`);
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
