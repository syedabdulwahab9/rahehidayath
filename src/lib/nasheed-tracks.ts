/**
 * Playable nasheed / naat library.
 *
 * Every URL below is a direct MP3 on the Internet Archive that was verified to
 * stream end-to-end (HTTP 206 range requests supported), so a track plays in
 * FULL — no 30-second previews, no embeds, no keys, nothing to configure.
 *
 * `lang` drives the language tabs on the Naats page. Urdu naats come first
 * because they are the heart of the section.
 */

export type TrackLang = "Urdu" | "Arabic";

export type NasheedTrack = {
  id: string;
  /** Roman / English title. */
  title: string;
  /** Native script title (Urdu nastaliq or Arabic). */
  native?: string;
  artist: string;
  lang: TrackLang;
  theme: "Naat" | "Salawat" | "Hamd" | "Manqabat" | "Ramadan" | "Madinah";
  /** Direct, full-length MP3. */
  url: string;
};

const ATIF = (file: string) =>
  `https://archive.org/download/atif-aslam-naat-collection/${encodeURIComponent(file)}`;
const BURDA = (file: string) =>
  `https://archive.org/download/Qasida-Burda-Sharif/${encodeURIComponent(file)}`;
const BARAN = (file: string) =>
  `https://archive.org/download/Barane_Rahmat/${encodeURIComponent(file)}`;
const ARAB = (file: string) =>
  `https://archive.org/download/Arab-Ka-Chand/${encodeURIComponent(file)}`;
const SARKAR = (file: string) =>
  `https://archive.org/download/Mere-Sarkar/${encodeURIComponent(file)}`;
const MARHABA = (file: string) =>
  `https://archive.org/download/Marhaba-Naat/${encodeURIComponent(file)}`;
const NASHEED = (file: string) =>
  `https://archive.org/download/nasheedplaylist/${encodeURIComponent(file)}`;

export const NASHEED_TRACKS: NasheedTrack[] = [
  /* ---------------- Urdu naats — the classics ---------------- */
  {
    id: "u1",
    title: "Tajdar-e-Haram",
    native: "تاجدارِ حرم",
    artist: "Atif Aslam",
    lang: "Urdu",
    theme: "Naat",
    url: ATIF("Tajdar-e-Haram.mp3"),
  },
  {
    id: "u2",
    title: "Mustafa Jaan-e-Rehmat",
    native: "مصطفیٰ جانِ رحمت",
    artist: "Imam Ahmad Raza Khan (kalam)",
    lang: "Urdu",
    theme: "Salawat",
    url: ATIF("Mustafa Jaan E Rehmat.mp3"),
  },
  {
    id: "u3",
    title: "Ya Nabi Salam Alaika",
    native: "یا نبی سلام علیک",
    artist: "Atif Aslam",
    lang: "Urdu",
    theme: "Salawat",
    url: ATIF("Ya Nabi Salam Alaika.mp3"),
  },
  {
    id: "u4",
    title: "Faslon Ko Takalluf",
    native: "فاصلوں کو تکلف ہے ہم سے اگر",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ATIF(
      "Faslon Ko Takkaluf  Atif Aslam  Ramdan Special Naat  2025  Ai Vocals - Ai-Fi Covers.mp3",
    ),
  },
  {
    id: "u5",
    title: "Ilahi Teri Chokhat Par",
    native: "الٰہی تیری چوکھٹ پر",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Ilahi Teri Chokhat Per.mp3"),
  },
  {
    id: "u6",
    title: "Bekas Pe Karam Kijiye",
    native: "بے کس پہ کرم کیجیے",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ATIF("Bekas Pe Karam Kijiye Sarkar E Madina.mp3"),
  },
  {
    id: "u7",
    title: "Shah-e-Madina",
    native: "شاہِ مدینہ",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Madinah",
    url: ATIF("Shah e Madina.mp3"),
  },
  {
    id: "u8",
    title: "Hasbi Rabbi Jallallah",
    native: "حسبی ربی جل اللہ",
    artist: "Traditional",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Hasbi Rabbi Jallallah.mp3"),
  },
  {
    id: "u9",
    title: "Maula Ya Salli Wa Sallim",
    native: "مولا یا صلِّ وسلِّم",
    artist: "Imam al-Busiri (Burdah)",
    lang: "Urdu",
    theme: "Salawat",
    url: ATIF("Maula Ya Salli Wa Sallim.mp3"),
  },
  {
    id: "u10",
    title: "Main Sadqay Ya Rasool Allah",
    native: "میں صدقے یا رسول اللہ",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ATIF("Main Sadqay Ya Rasool Allah.mp3"),
  },
  {
    id: "u11",
    title: "Ya Muhammad Noor-e-Mujassam",
    native: "یا محمد نورِ مجسم",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ATIF("Ya Muhammad Noor E Mujassam.mp3"),
  },
  {
    id: "u12",
    title: "Madina Yaad Kar Lena",
    native: "مدینہ یاد کر لینا",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Madinah",
    url: ATIF("Madina Yaad Kar Lena.mp3"),
  },
  {
    id: "u13",
    title: "Main Banda-e-Aasi Hoon",
    native: "میں بندۂ عاصی ہوں",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Main Banda E Aasi Hoon.mp3"),
  },
  {
    id: "u14",
    title: "Asma-ul-Husna — The 99 Names",
    native: "اسماء الحسنیٰ",
    artist: "Atif Aslam",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Asma-ul-Husna  The 99 Names.mp3"),
  },
  {
    id: "u15",
    title: "Allah Hu Allah Hu",
    native: "اللہ ھو اللہ ھو",
    artist: "Atif Aslam",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Allah Hu Allah Hu  Atif Aslam  Ramzan 2024  Sarsabz Fertilizer - Sarsabz.mp3"),
  },
  {
    id: "u16",
    title: "Wohi Khuda Hai",
    native: "وہی خدا ہے",
    artist: "Atif Aslam",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Wohi Khuda Hai.mp3"),
  },
  {
    id: "u17",
    title: "Tu Hi Mera Raazdaan",
    native: "تو ہی میرا رازداں",
    artist: "Atif Aslam",
    lang: "Urdu",
    theme: "Hamd",
    url: ATIF("Tu Hi Mera Raazdaan.mp3"),
  },

  /* ---------------- Qasida Burda Sharif album ---------------- */
  {
    id: "u18",
    title: "Qasida Burda Sharif",
    native: "قصیدہ بردہ شریف",
    artist: "Imam al-Busiri",
    lang: "Urdu",
    theme: "Salawat",
    url: BURDA("Qasida Burda Sharif.mp3"),
  },
  {
    id: "u19",
    title: "Allah Humma Salle Ala",
    native: "اللّٰہمَّ صلِّ علیٰ",
    artist: "Traditional",
    lang: "Urdu",
    theme: "Salawat",
    url: BURDA("Allah Humma Salle Ala.mp3"),
  },
  {
    id: "u20",
    title: "Mustafa Jaan-e-Rehmat Pe Lakhon Salam",
    native: "مصطفیٰ جانِ رحمت پہ لاکھوں سلام",
    artist: "Imam Ahmad Raza Khan",
    lang: "Urdu",
    theme: "Salawat",
    url: BURDA("Mustaf Jaan e Rehmat Pay Lakhon Salam.mp3"),
  },
  {
    id: "u21",
    title: "Mera Wird-e-Lab Hai Nabi Nabi",
    native: "میرا وردِ لب ہے نبی نبی",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: BURDA("Mery Wird e Lab Hai Nabi Nabi.mp3"),
  },
  {
    id: "u22",
    title: "Lo Madinay Ki Tajalli Se",
    native: "لو مدینے کی تجلی سے",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Madinah",
    url: BURDA("Lo Madiny Ki Tajjali Sy.mp3"),
  },
  {
    id: "u23",
    title: "Ya Ilahi Har Jaga Teri Ata Ka Saath Ho",
    native: "یا الٰہی ہر جگہ تیری عطا کا ساتھ ہو",
    artist: "Imam Ahmad Raza Khan",
    lang: "Urdu",
    theme: "Hamd",
    url: BURDA("Ya Ilahi Her Jaga Teri Ataa Ka Saath ho.mp3"),
  },
  {
    id: "u24",
    title: "Jaise Mere Sarkar Hain",
    native: "جیسے میرے سرکار ہیں",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: BURDA("Jaisy Mery Sarkar Hain.mp3"),
  },

  /* ---------------- Barān-e-Rahmat (Abida Khanam) ---------------- */
  {
    id: "u25",
    title: "Sheher-e-Madina Kaisa Hai",
    native: "شہرِ مدینہ کیسا ہے",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Madinah",
    url: BARAN("Sheher-e-Madina Kaisa Hai.mp3"),
  },
  {
    id: "u26",
    title: "Ya Shah-e-Umam",
    native: "یا شاہِ امم",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Naat",
    url: BARAN("Ya Shah-e-Umam.mp3"),
  },
  {
    id: "u27",
    title: "Urri Noor Ki Chadar",
    native: "اُڑی نور کی چادر",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Naat",
    url: BARAN("Urri Noor Ki Chadar.mp3"),
  },
  {
    id: "u28",
    title: "Jogan Ki Jholi Bhar De",
    native: "جوگن کی جھولی بھر دے",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Naat",
    url: BARAN("Jogan Ki Jholi Bhar De.mp3"),
  },
  {
    id: "u29",
    title: "Paigham Saba Layi Hai",
    native: "پیغام صبا لائی ہے",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Naat",
    url: BARAN("Paigham Saba Layi Hai.mp3"),
  },
  {
    id: "u30",
    title: "Ramzan Ka Mah-e-Mubarak",
    native: "رمضان کا ماہِ مبارک",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Ramadan",
    url: BARAN("Ramzan Ka Mah-e-Mubarak.mp3"),
  },
  {
    id: "u31",
    title: "Mere Sohniya Madinay Wich",
    native: "میرے سوہنیا مدینے وچ",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Madinah",
    url: BARAN("Mere Sohniya Madinay Wich.mp3"),
  },
  {
    id: "u32",
    title: "Bigri Hui Banti Hai",
    native: "بگڑی ہوئی بنتی ہے",
    artist: "Abida Khanam",
    lang: "Urdu",
    theme: "Naat",
    url: BARAN("Bigri Hui Banti Hai.mp3"),
  },

  /* ---------------- Arab ka Chand ---------------- */
  {
    id: "u33",
    title: "Arab Ka Chand",
    native: "عرب کا چاند",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ARAB("ArabKeChand.mp3"),
  },
  {
    id: "u34",
    title: "Mere Hadi",
    native: "میرے ہادی",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ARAB("MereHadi.mp3"),
  },
  {
    id: "u35",
    title: "Mere Maula",
    native: "میرے مولا",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Hamd",
    url: ARAB("MereMaula.mp3"),
  },
  {
    id: "u36",
    title: "Shan Wale",
    native: "شان والے",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ARAB("ShanWale.mp3"),
  },
  {
    id: "u37",
    title: "Subhan Allah",
    native: "سبحان اللہ",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Hamd",
    url: ARAB("SubhanAllah.mp3"),
  },
  {
    id: "u38",
    title: "Tera Rutba",
    native: "تیرا رتبہ",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ARAB("TeraRutba.mp3"),
  },
  {
    id: "u39",
    title: "Duniya Ke Ay Musafir",
    native: "دنیا کے اے مسافر",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: ARAB("DunyaKeAyMusafir.mp3"),
  },

  /* ---------------- Mere Sarkar ---------------- */
  {
    id: "u40",
    title: "Mere Sarkar Aaye",
    native: "میرے سرکار آئے",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: SARKAR("MereSarkaarAaye.mp3"),
  },
  {
    id: "u41",
    title: "Salle Ala Muhammad",
    native: "صلِّ علیٰ محمد",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Salawat",
    url: SARKAR("SalleAlaMuhammad.mp3"),
  },
  {
    id: "u42",
    title: "Mairaaj Ki Raat",
    native: "معراج کی رات",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: SARKAR("MairaajKiRaat.mp3"),
  },
  {
    id: "u43",
    title: "Mujhe Bhi Ya Rab",
    native: "مجھے بھی یا رب",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Hamd",
    url: SARKAR("MujheBhiYaRab.mp3"),
  },
  {
    id: "u44",
    title: "Nabi Ke Raaste Ki",
    native: "نبی کے راستے کی",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: SARKAR("NabiKeRaasteKi.mp3"),
  },
  {
    id: "u45",
    title: "Walid-e-Muhtaram",
    native: "والدِ محترم",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: SARKAR("WalideMuhtaram.mp3"),
  },

  /* ---------------- Marhaba ---------------- */
  {
    id: "u46",
    title: "Muhammad Muhammad",
    native: "محمد محمد",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("mohammed mohammed.mp3"),
  },
  {
    id: "u47",
    title: "Mustafa Mustafa",
    native: "مصطفیٰ مصطفیٰ",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("mustafa mustafa.mp3"),
  },
  {
    id: "u48",
    title: "Chand Suraj Sitare",
    native: "چاند سورج ستارے",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("chand suraj sitare.mp3"),
  },
  {
    id: "u49",
    title: "Allah Mere Aaqa Ka",
    native: "اللہ میرے آقا کا",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("Allah Mere Aaqa Ka.mp3"),
  },
  {
    id: "u50",
    title: "Zikr Hai Unka",
    native: "ذکر ہے اُن کا",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("Zikar He Unka.mp3"),
  },
  {
    id: "u51",
    title: "Teri Har Ada Hai Pyari",
    native: "تیری ہر ادا ہے پیاری",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("teri har ada he piyaari.mp3"),
  },
  {
    id: "u52",
    title: "Tere Jalwe Bikhre Hain",
    native: "تیرے جلوے بکھرے ہیں",
    artist: "Naat Khawan",
    lang: "Urdu",
    theme: "Naat",
    url: MARHABA("tere jalwe bikhre hen.mp3"),
  },

  /* ---------------- Arabic nasheeds (vocals only) ---------------- */
  {
    id: "a1",
    title: "Ya Abidul Haramain",
    native: "يا عابد الحرمين",
    artist: "Traditional",
    lang: "Arabic",
    theme: "Salawat",
    url: NASHEED("Ya Abidul Haramain.mp3"),
  },
  {
    id: "a2",
    title: "Rasulullah",
    native: "رسول الله",
    artist: "Abu Ali",
    lang: "Arabic",
    theme: "Naat",
    url: NASHEED("Abu Ali - Rasullulah.mp3"),
  },
  {
    id: "a3",
    title: "Qum",
    native: "قم",
    artist: "Abu Ali",
    lang: "Arabic",
    theme: "Hamd",
    url: NASHEED("Abu Ali - Qum.mp3"),
  },
  {
    id: "a4",
    title: "Jaljalat",
    native: "جلجلت",
    artist: "Abu Ali",
    lang: "Arabic",
    theme: "Hamd",
    url: NASHEED("Abu Ali - Jaljalat.mp3"),
  },
  {
    id: "a5",
    title: "Kuntu Maitan",
    native: "كنت ميتا",
    artist: "Abu Ali",
    lang: "Arabic",
    theme: "Hamd",
    url: NASHEED("Abu Ali - Kuntu Maitan.mp3"),
  },
  {
    id: "a6",
    title: "Tala' al-Badru Alayna",
    native: "طلع البدر علينا",
    artist: "Omar Esa (vocals only)",
    lang: "Arabic",
    theme: "Naat",
    url: "https://archive.org/download/yt-2mp-3.info-omar-esa-tala-al-badru-official-nasheed-video-vocals-only-64kbps/%5BYT2mp3.info%5D%20-%20Omar%20Esa%20-%20Tala%20Al%20Badru%20%28Official%20Nasheed%20Video%29%20_%20Vocals%20Only%20%2864kbps%29.mp3",
  },
  {
    id: "a7",
    title: "La ilaha illa Allah",
    native: "لا إله إلا الله",
    artist: "Imam Alimsultanov",
    lang: "Arabic",
    theme: "Hamd",
    url: "https://archive.org/download/lailahe-illallah-imam-alimsultanov-chechnya-vocals/Lailahe_Illallah_-_Imam_Alimsultanov_-_Chechnya_vocals.mp3",
  },
];

export const TRACK_LANGS = ["Urdu", "Arabic"] as const;

export const TRACK_THEMES = [
  "All",
  "Naat",
  "Salawat",
  "Hamd",
  "Madinah",
  "Ramadan",
  "Manqabat",
] as const;
