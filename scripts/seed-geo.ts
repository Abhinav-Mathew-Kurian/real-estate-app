import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/kerala-properties";

const MasterDataSchema = new mongoose.Schema({
  type: String,
  name: String,
  parent: String,
  district: String,
});
MasterDataSchema.index({ type: 1, name: 1 }, { unique: true });

const MasterData = mongoose.models.MasterData ?? mongoose.model("MasterData", MasterDataSchema);

// All 14 Kerala districts with their taluks
const GEO: Record<string, { taluks: string[]; villages: string[] }> = {
  Thiruvananthapuram: {
    taluks: [
      "Thiruvananthapuram", "Neyyattinkara", "Nedumangad", "Varkala",
      "Kattakada", "Chirayinkeezhu",
    ],
    villages: [
      "Kovalam", "Veli", "Kesavadasapuram", "Pattom", "Kazhakkoottam",
      "Technopark", "Sreekaryam", "Ulloor", "Peroorkada",
    ],
  },
  Kollam: {
    taluks: ["Kollam", "Karunagappally", "Kottarakkara", "Punalur", "Kunnathur", "Pathanapuram"],
    villages: ["Asramam", "Thangassery", "Kadappakada", "Paravur", "Yeroor"],
  },
  Pathanamthitta: {
    taluks: ["Pathanamthitta", "Adoor", "Ranni", "Thiruvalla", "Kozhencherry", "Mallappally"],
    villages: ["Aranmula", "Chengannur", "Pandalam", "Koipuram"],
  },
  Alappuzha: {
    taluks: ["Alappuzha", "Kuttanad", "Mavelikkara", "Ambalappuzha", "Cherthala", "Karthikappally"],
    villages: ["Kumarakom", "Mararikulam", "Muhamma", "Mancompu", "Kavalam"],
  },
  Kottayam: {
    taluks: ["Kottayam", "Changanassery", "Kanjirappally", "Meenachil", "Pala", "Vaikom"],
    villages: ["Kurichy", "Puthuppally", "Ettumanoor", "Erattupetta", "Kuravilangad"],
  },
  Idukki: {
    taluks: ["Devikulam", "Peerumade", "Udumbanchola", "Thodupuzha", "Idukki"],
    villages: ["Munnar", "Thekkady", "Kumily", "Vagamon", "Nedumkandam"],
  },
  Ernakulam: {
    taluks: [
      "Ernakulam", "Kanayannur", "Paravur", "Aluva", "Muvattupuzha",
      "Kochi", "Kothamangalam", "Kunnathunad",
    ],
    villages: [
      "Fort Kochi", "Kakkanad", "Kaloor", "Palarivattom", "Edapally",
      "Aluva", "Angamaly", "Perumbavoor", "Muvattupuzha", "North Paravur",
    ],
  },
  Thrissur: {
    taluks: ["Thrissur", "Chalakudy", "Mukundapuram", "Kodungallur", "Thalappilly"],
    villages: ["Thrissur City", "Guruvayur", "Irinjalakuda", "Chalakudy", "Kodungallur"],
  },
  Palakkad: {
    taluks: ["Palakkad", "Mannarkkad", "Ottapalam", "Alathur", "Chittur", "Pattambi"],
    villages: ["Palakkad City", "Mannarkkad", "Ottapalam", "Shoranur", "Nemmara"],
  },
  Malappuram: {
    taluks: ["Malappuram", "Tirur", "Ponnani", "Perinthalmanna", "Nilambur", "Tiruvali"],
    villages: ["Malappuram City", "Manjeri", "Tirur", "Ponnani", "Nilambur"],
  },
  Kozhikode: {
    taluks: ["Kozhikode", "Vadakara", "Koyilandy", "Thamarassery"],
    villages: [
      "Kozhikode City", "Calicut Beach", "Mukkoola", "Azhinjilam",
      "Feroke", "Vadakara", "Koyilandy",
    ],
  },
  Wayanad: {
    taluks: ["Mananthavady", "Sulthan Bathery", "Vythiri"],
    villages: ["Kalpetta", "Sulthan Bathery", "Mananthavady", "Vythiri", "Ambalavayal"],
  },
  Kannur: {
    taluks: ["Kannur", "Thalassery", "Iritty", "Payyannur", "Koothuparamba"],
    villages: ["Kannur City", "Thalassery", "Payyannur", "Iritty", "Mattannur"],
  },
  Kasaragod: {
    taluks: ["Kasaragod", "Hosdurg", "Vellarikundu"],
    villages: ["Kasaragod City", "Kanhangad", "Nileshwar", "Uppala", "Manjeshwar"],
  },
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  let inserted = 0;

  for (const [district, data] of Object.entries(GEO)) {
    // District
    await MasterData.updateOne(
      { type: "district", name: district },
      { $set: { type: "district", name: district } },
      { upsert: true }
    );
    inserted++;

    // Taluks
    for (const taluk of data.taluks) {
      await MasterData.updateOne(
        { type: "taluk", name: taluk },
        { $set: { type: "taluk", name: taluk, parent: district, district } },
        { upsert: true }
      );
      inserted++;
    }

    // Villages
    for (const village of data.villages) {
      await MasterData.updateOne(
        { type: "village", name: village },
        { $set: { type: "village", name: village, district } },
        { upsert: true }
      );
      inserted++;
    }
  }

  console.log(`✓ Geo seed complete: ${inserted} records upserted`);
  await mongoose.disconnect();
}

main().catch(console.error);
