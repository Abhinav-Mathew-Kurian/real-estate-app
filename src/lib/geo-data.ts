export const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
] as const;

export type KeralaDistrict = (typeof KERALA_DISTRICTS)[number];

export const TALUKS_BY_DISTRICT: Record<string, string[]> = {
  Thiruvananthapuram: [
    "Thiruvananthapuram", "Neyyattinkara", "Nedumangad", "Varkala", "Kattakada", "Chirayinkeezhu",
  ],
  Kollam: ["Kollam", "Karunagappally", "Kottarakkara", "Punalur", "Kunnathur", "Pathanapuram"],
  Pathanamthitta: ["Pathanamthitta", "Adoor", "Ranni", "Thiruvalla", "Kozhencherry", "Mallappally"],
  Alappuzha: ["Alappuzha", "Kuttanad", "Mavelikkara", "Ambalappuzha", "Cherthala", "Karthikappally"],
  Kottayam: ["Kottayam", "Changanassery", "Kanjirappally", "Meenachil", "Pala", "Vaikom"],
  Idukki: ["Devikulam", "Peerumade", "Udumbanchola", "Thodupuzha", "Idukki"],
  Ernakulam: ["Ernakulam", "Kanayannur", "Paravur", "Aluva", "Muvattupuzha", "Kochi", "Kothamangalam", "Kunnathunad"],
  Thrissur: ["Thrissur", "Chalakudy", "Mukundapuram", "Kodungallur", "Thalappilly"],
  Palakkad: ["Palakkad", "Mannarkkad", "Ottapalam", "Alathur", "Chittur", "Pattambi"],
  Malappuram: ["Malappuram", "Tirur", "Ponnani", "Perinthalmanna", "Nilambur", "Tiruvali"],
  Kozhikode: ["Kozhikode", "Vadakara", "Koyilandy", "Thamarassery"],
  Wayanad: ["Mananthavady", "Sulthan Bathery", "Vythiri"],
  Kannur: ["Kannur", "Thalassery", "Iritty", "Payyannur", "Koothuparamba"],
  Kasaragod: ["Kasaragod", "Hosdurg", "Vellarikundu"],
};
