import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/kerala-properties";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "admin" },
  phone: String,
});

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const email = process.env.ADMIN_EMAIL ?? "admin@keralaproperties.in";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.ADMIN_NAME ?? "Site Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: "admin" });

  console.log(`✓ Admin created: ${email} / ${password}`);
  await mongoose.disconnect();
}

main().catch(console.error);
