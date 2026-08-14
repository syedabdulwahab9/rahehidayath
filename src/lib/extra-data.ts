/* Data for the Naats, Prophets & Barcode-scanner sections. */

/* ------------------------------------------------------------------ */
/* Naats                                                               */
/* ------------------------------------------------------------------ */

export type Naat = {
  id: string;
  title: string;
  poet: string;
  language: "Arabic" | "Urdu";
  arabic: string;
  transliteration: string;
  translation: string;
};

export const NAATS: Naat[] = [
  {
    id: "tala-al-badru",
    title: "Tala' al-Badru 'Alayna",
    poet: "Sung by the people of Madinah, 622 CE",
    language: "Arabic",
    arabic:
      "طَلَعَ الْبَدْرُ عَلَيْنَا\nمِنْ ثَنِيَّاتِ الْوَدَاعِ\nوَجَبَ الشُّكْرُ عَلَيْنَا\nمَا دَعَا لِلَّهِ دَاعِ",
    transliteration:
      "Tala'al badru 'alayna\nmin thaniyyatil wada'\nwajabash shukru 'alayna\nma da'a lillahi da'",
    translation:
      "The full moon rose over us from the valley of Wada'.\nWe owe it to show gratitude, as long as anyone calls to Allah.",
  },
  {
    id: "qasida-burda",
    title: "Qasida Burda (opening)",
    poet: "Imam al-Busiri",
    language: "Arabic",
    arabic:
      "مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا\nعَلَى حَبِيبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ",
    transliteration:
      "Mawlaya salli wa sallim da'iman abadan\n'ala habibika khayril khalqi kullihimi",
    translation:
      "My Master, send peace and blessings forever\nupon Your beloved, the best of all creation.",
  },
  {
    id: "ya-nabi-salam",
    title: "Ya Nabi Salam 'Alayka",
    poet: "Traditional",
    language: "Arabic",
    arabic:
      "يَا نَبِي سَلَامٌ عَلَيْكَ\nيَا رَسُولْ سَلَامٌ عَلَيْكَ\nيَا حَبِيبْ سَلَامٌ عَلَيْكَ\nصَلَوَاتُ اللهِ عَلَيْكَ",
    transliteration:
      "Ya Nabi salam 'alayka\nYa Rasul salam 'alayka\nYa Habib salam 'alayka\nSalawatullahi 'alayka",
    translation:
      "O Prophet, peace be upon you.\nO Messenger, peace be upon you.\nO Beloved, peace be upon you.\nThe blessings of Allah be upon you.",
  },
  {
    id: "balaghal-ula",
    title: "Balaghal 'Ula bi Kamalihi",
    poet: "Shaykh Sa'di Shirazi",
    language: "Arabic",
    arabic:
      "بَلَغَ الْعُلَا بِكَمَالِهِ\nكَشَفَ الدُّجَى بِجَمَالِهِ\nحَسُنَتْ جَمِيعُ خِصَالِهِ\nصَلُّوا عَلَيْهِ وَآلِهِ",
    transliteration:
      "Balaghal 'ula bi kamalihi\nkashafad duja bi jamalihi\nhasunat jami'u khisalihi\nsallu 'alayhi wa alihi",
    translation:
      "He reached the heights by his perfection,\nhe dispelled the darkness by his beauty.\nBeautiful are all his qualities —\nsend blessings upon him and his family.",
  },
  {
    id: "hasbi-rabbi",
    title: "Hasbi Rabbi Jallallah",
    poet: "Traditional",
    language: "Arabic",
    arabic:
      "حَسْبِي رَبِّي جَلَّ اللهُ\nمَا فِي قَلْبِي غَيْرُ اللهِ\nنُورُ مُحَمَّدْ صَلَّى اللهُ\nلَا إِلَهَ إِلَّا اللهُ",
    transliteration:
      "Hasbi Rabbi jallallah\nma fi qalbi ghayrullah\nnuru Muhammad sallallah\nla ilaha illallah",
    translation:
      "My Lord is sufficient for me, majestic is Allah.\nThere is nothing in my heart but Allah.\nThe light of Muhammad ﷺ.\nThere is no god but Allah.",
  },
  {
    id: "shah-e-madina",
    title: "Shah-e-Madina",
    poet: "Urdu classic",
    language: "Urdu",
    arabic: "شاہِ مدینہ، یثرب کے والی\nسارے نبی تیرے در کے سوالی",
    transliteration: "Shah-e-Madina, Yathrib ke wali\nsare nabi tere dar ke sawali",
    translation:
      "King of Madinah, master of Yathrib —\nevery prophet stands as a petitioner at your door.",
  },
];

/* ------------------------------------------------------------------ */
/* Prophets — Adam AS to Muhammad ﷺ                                    */
/* ------------------------------------------------------------------ */

export type Prophet = {
  n: number;
  name: string;
  arabic: string;
  bible?: string;
  lineage: string;
  family: string;
  note: string;
};

export const PROPHETS: Prophet[] = [
  { n: 1, name: "Adam", arabic: "آدَم", bible: "Adam", lineage: "Created by Allah, the first human", family: "Wife: Hawwa (Eve). Sons include Habil, Qabil and Shith (Seth).", note: "The first man and the first prophet; father of all humanity." },
  { n: 2, name: "Idris", arabic: "إِدْرِيس", bible: "Enoch", lineage: "Descendant of Shith ibn Adam", family: "From the line of Adam through Shith.", note: "Known for writing, and raised to a high station by Allah." },
  { n: 3, name: "Nuh", arabic: "نُوح", bible: "Noah", lineage: "Nuh ibn Lamak, from the line of Idris", family: "Sons: Sam, Ham, Yafith and Kan'an (who refused to believe).", note: "Called his people for 950 years; saved on the Ark." },
  { n: 4, name: "Hud", arabic: "هُود", bible: "Eber (trad.)", lineage: "From the tribe of 'Ad, descendants of Sam ibn Nuh", family: "Of the Arab tribe of 'Ad.", note: "Sent to the people of 'Ad in Al-Ahqaf." },
  { n: 5, name: "Salih", arabic: "صَالِح", bible: "—", lineage: "From the tribe of Thamud", family: "Of the Arab tribe of Thamud.", note: "Given the she-camel as a sign to his people." },
  { n: 6, name: "Ibrahim", arabic: "إِبْرَاهِيم", bible: "Abraham", lineage: "Ibrahim ibn Azar, of the line of Sam ibn Nuh", family: "Wives: Sarah and Hajar. Sons: Isma'il and Ishaq.", note: "Khalilullah — the friend of Allah; builder of the Ka'bah." },
  { n: 7, name: "Lut", arabic: "لُوط", bible: "Lot", lineage: "Nephew of Ibrahim AS", family: "Son of Haran, brother of Ibrahim AS.", note: "Sent to the people of Sodom." },
  { n: 8, name: "Isma'il", arabic: "إِسْمَاعِيل", bible: "Ishmael", lineage: "Son of Ibrahim AS and Hajar", family: "Father of the Arab tribes; ancestor of the Prophet ﷺ.", note: "Helped raise the walls of the Ka'bah with his father." },
  { n: 9, name: "Ishaq", arabic: "إِسْحَاق", bible: "Isaac", lineage: "Son of Ibrahim AS and Sarah", family: "Sons: Ya'qub and 'Ays.", note: "Ancestor of the prophets of Bani Isra'il." },
  { n: 10, name: "Ya'qub", arabic: "يَعْقُوب", bible: "Jacob / Israel", lineage: "Son of Ishaq AS", family: "Twelve sons, including Yusuf and Binyamin.", note: "Also called Isra'il; father of the twelve tribes." },
  { n: 11, name: "Yusuf", arabic: "يُوسُف", bible: "Joseph", lineage: "Son of Ya'qub AS", family: "Brother of Binyamin; eleven brothers in all.", note: "Given the interpretation of dreams; ruled the treasury of Egypt." },
  { n: 12, name: "Ayyub", arabic: "أَيُّوب", bible: "Job", lineage: "From the descendants of Ishaq AS", family: "Wife: Rahmah (traditional accounts).", note: "The example of patience through severe trial." },
  { n: 13, name: "Shu'ayb", arabic: "شُعَيْب", bible: "Jethro (trad.)", lineage: "Of the people of Madyan", family: "Father-in-law of Musa AS.", note: "Called his people to honest weights and measures." },
  { n: 14, name: "Musa", arabic: "مُوسَىٰ", bible: "Moses", lineage: "Musa ibn 'Imran, of Bani Isra'il", family: "Brother: Harun. Wife: daughter of Shu'ayb AS.", note: "Kalimullah — the one who spoke with Allah; given the Tawrah." },
  { n: 15, name: "Harun", arabic: "هَارُون", bible: "Aaron", lineage: "Son of 'Imran, brother of Musa AS", family: "Elder brother and helper of Musa AS.", note: "Eloquent speaker sent alongside Musa AS to Fir'awn." },
  { n: 16, name: "Dhul-Kifl", arabic: "ذُو الْكِفْل", bible: "Ezekiel (trad.)", lineage: "Of Bani Isra'il", family: "—", note: "Praised in the Qur'an among the patient and the righteous." },
  { n: 17, name: "Dawud", arabic: "دَاوُۥد", bible: "David", lineage: "Of Bani Isra'il, descendant of Yahudha ibn Ya'qub", family: "Son: Sulayman.", note: "Given the Zabur; iron was made soft for him." },
  { n: 18, name: "Sulayman", arabic: "سُلَيْمَان", bible: "Solomon", lineage: "Son of Dawud AS", family: "Inherited prophethood and kingship from his father.", note: "Given command of the wind and understanding of the animals." },
  { n: 19, name: "Ilyas", arabic: "إِلْيَاس", bible: "Elijah", lineage: "Descendant of Harun AS", family: "Of the priestly line of Harun AS.", note: "Called his people away from the worship of Ba'l." },
  { n: 20, name: "Al-Yasa'", arabic: "الْيَسَع", bible: "Elisha", lineage: "Of Bani Isra'il", family: "Successor of Ilyas AS.", note: "Continued the call of Ilyas AS." },
  { n: 21, name: "Yunus", arabic: "يُونُس", bible: "Jonah", lineage: "Yunus ibn Matta, of Bani Isra'il", family: "Sent to the people of Nineveh.", note: "Dhun-Nun — swallowed by the great fish and saved by his du'a." },
  { n: 22, name: "Zakariyya", arabic: "زَكَرِيَّا", bible: "Zechariah", lineage: "Of Bani Isra'il, of the line of Sulayman AS", family: "Wife: from the family of Harun. Son: Yahya.", note: "Guardian of Maryam AS; given a son in old age." },
  { n: 23, name: "Yahya", arabic: "يَحْيَىٰ", bible: "John the Baptist", lineage: "Son of Zakariyya AS", family: "Cousin of 'Isa AS through Maryam's family.", note: "Given wisdom while still a child." },
  { n: 24, name: "'Isa", arabic: "عِيسَىٰ", bible: "Jesus", lineage: "Son of Maryam bint 'Imran, born without a father", family: "Mother: Maryam AS.", note: "Given the Injil; raised to the heavens by Allah." },
  { n: 25, name: "Muhammad ﷺ", arabic: "مُحَمَّد", bible: "—", lineage: "Muhammad ibn 'Abdullah ibn 'Abdul-Muttalib, of the line of Isma'il AS", family: "Wives: Khadijah, Sawdah, 'A'ishah, Hafsah, Zaynab bint Khuzaymah, Umm Salamah, Zaynab bint Jahsh, Juwayriyah, Umm Habibah, Safiyyah, Maymunah. Children: Qasim, 'Abdullah, Ibrahim, Zaynab, Ruqayyah, Umm Kulthum, Fatimah.", note: "Khatam an-Nabiyyin — the final Messenger, a mercy to all the worlds." },
];

export const PROPHET_WIVES = [
  { name: "Khadijah bint Khuwaylid", note: "The first to believe; mother of most of his children." },
  { name: "Sawdah bint Zam'ah", note: "Married after Khadijah RA passed away." },
  { name: "Aishah bint Abu Bakr as-Siddiq", note: "Great scholar and narrator of over 2,000 hadith." },
  { name: "Hafsah bint 'Umar", note: "Kept the first written compilation of the Qur'an." },
  { name: "Zaynab bint Khuzaymah", note: "Called 'Umm al-Masakin' — mother of the poor." },
  { name: "Umm Salamah (Hind bint Abi Umayyah)", note: "Known for her wisdom, especially at Hudaybiyyah." },
  { name: "Zaynab bint Jahsh", note: "Cousin of the Prophet ﷺ; famed for her charity." },
  { name: "Juwayriyah bint al-Harith", note: "Her marriage freed a hundred families of her tribe." },
  { name: "Umm Habibah (Ramlah bint Abi Sufyan)", note: "Emigrated to Abyssinia for her faith." },
  { name: "Safiyyah bint Huyayy", note: "Of the line of Harun AS." },
  { name: "Maymunah bint al-Harith", note: "The last wife he married." },
];

export const PROPHET_CHILDREN = [
  { name: "Qasim ibn Muhammad", note: "Eldest son; passed away in infancy in Makkah." },
  { name: "Zaynab bint Muhammad", note: "Eldest daughter; married Abu al-'As ibn ar-Rabi'." },
  { name: "Ruqayyah bint Muhammad", note: "Married 'Uthman ibn 'Affan RA." },
  { name: "Umm Kulthum bint Muhammad", note: "Married 'Uthman RA after Ruqayyah RA." },
  { name: "Fatimah az-Zahra", note: "Married 'Ali RA; mother of Hasan and Husayn RA." },
  { name: "'Abdullah ibn Muhammad", note: "Also called at-Tayyib and at-Tahir." },
  { name: "Ibrahim ibn Muhammad", note: "Son of Mariyah al-Qibtiyyah; passed away in infancy in Madinah." },
];

/* ------------------------------------------------------------------ */
/* Barcode origin data                                                 */
/* ------------------------------------------------------------------ */

export type PrefixRange = { from: number; to: number; country: string; code: string };

/** GS1 country prefixes (first three digits of an EAN-13 barcode). */
export const GS1_PREFIXES: PrefixRange[] = [
  { from: 0, to: 19, country: "United States & Canada", code: "US" },
  { from: 30, to: 39, country: "United States", code: "US" },
  { from: 50, to: 59, country: "United States (coupons)", code: "US" },
  { from: 60, to: 139, country: "United States & Canada", code: "US" },
  { from: 300, to: 379, country: "France & Monaco", code: "FR" },
  { from: 380, to: 380, country: "Bulgaria", code: "BG" },
  { from: 383, to: 383, country: "Slovenia", code: "SI" },
  { from: 385, to: 385, country: "Croatia", code: "HR" },
  { from: 387, to: 387, country: "Bosnia & Herzegovina", code: "BA" },
  { from: 389, to: 389, country: "Montenegro", code: "ME" },
  { from: 390, to: 390, country: "Kosovo", code: "XK" },
  { from: 400, to: 440, country: "Germany", code: "DE" },
  { from: 450, to: 459, country: "Japan", code: "JP" },
  { from: 460, to: 469, country: "Russia", code: "RU" },
  { from: 470, to: 470, country: "Kyrgyzstan", code: "KG" },
  { from: 471, to: 471, country: "Taiwan", code: "TW" },
  { from: 474, to: 474, country: "Estonia", code: "EE" },
  { from: 475, to: 475, country: "Latvia", code: "LV" },
  { from: 476, to: 476, country: "Azerbaijan", code: "AZ" },
  { from: 477, to: 477, country: "Lithuania", code: "LT" },
  { from: 478, to: 478, country: "Uzbekistan", code: "UZ" },
  { from: 479, to: 479, country: "Sri Lanka", code: "LK" },
  { from: 480, to: 480, country: "Philippines", code: "PH" },
  { from: 481, to: 481, country: "Belarus", code: "BY" },
  { from: 482, to: 482, country: "Ukraine", code: "UA" },
  { from: 483, to: 483, country: "Turkmenistan", code: "TM" },
  { from: 484, to: 484, country: "Moldova", code: "MD" },
  { from: 485, to: 485, country: "Armenia", code: "AM" },
  { from: 486, to: 486, country: "Georgia", code: "GE" },
  { from: 487, to: 487, country: "Kazakhstan", code: "KZ" },
  { from: 488, to: 488, country: "Tajikistan", code: "TJ" },
  { from: 489, to: 489, country: "Hong Kong", code: "HK" },
  { from: 490, to: 499, country: "Japan", code: "JP" },
  { from: 500, to: 509, country: "United Kingdom", code: "GB" },
  { from: 520, to: 521, country: "Greece", code: "GR" },
  { from: 528, to: 528, country: "Lebanon", code: "LB" },
  { from: 529, to: 529, country: "Cyprus", code: "CY" },
  { from: 530, to: 530, country: "Albania", code: "AL" },
  { from: 531, to: 531, country: "North Macedonia", code: "MK" },
  { from: 535, to: 535, country: "Malta", code: "MT" },
  { from: 539, to: 539, country: "Ireland", code: "IE" },
  { from: 540, to: 549, country: "Belgium & Luxembourg", code: "BE" },
  { from: 560, to: 560, country: "Portugal", code: "PT" },
  { from: 569, to: 569, country: "Iceland", code: "IS" },
  { from: 570, to: 579, country: "Denmark, Faroe Islands & Greenland", code: "DK" },
  { from: 590, to: 590, country: "Poland", code: "PL" },
  { from: 594, to: 594, country: "Romania", code: "RO" },
  { from: 599, to: 599, country: "Hungary", code: "HU" },
  { from: 600, to: 601, country: "South Africa", code: "ZA" },
  { from: 603, to: 603, country: "Ghana", code: "GH" },
  { from: 604, to: 604, country: "Senegal", code: "SN" },
  { from: 608, to: 608, country: "Bahrain", code: "BH" },
  { from: 609, to: 609, country: "Mauritius", code: "MU" },
  { from: 611, to: 611, country: "Morocco", code: "MA" },
  { from: 613, to: 613, country: "Algeria", code: "DZ" },
  { from: 615, to: 615, country: "Nigeria", code: "NG" },
  { from: 616, to: 616, country: "Kenya", code: "KE" },
  { from: 618, to: 618, country: "Ivory Coast", code: "CI" },
  { from: 619, to: 619, country: "Tunisia", code: "TN" },
  { from: 620, to: 620, country: "Tanzania", code: "TZ" },
  { from: 621, to: 621, country: "Syria", code: "SY" },
  { from: 622, to: 622, country: "Egypt", code: "EG" },
  { from: 623, to: 623, country: "Brunei", code: "BN" },
  { from: 624, to: 624, country: "Libya", code: "LY" },
  { from: 625, to: 625, country: "Jordan", code: "JO" },
  { from: 626, to: 626, country: "Iran", code: "IR" },
  { from: 627, to: 627, country: "Kuwait", code: "KW" },
  { from: 628, to: 628, country: "Saudi Arabia", code: "SA" },
  { from: 629, to: 629, country: "United Arab Emirates", code: "AE" },
  { from: 630, to: 630, country: "Qatar", code: "QA" },
  { from: 631, to: 631, country: "Namibia", code: "NA" },
  { from: 640, to: 649, country: "Finland", code: "FI" },
  { from: 690, to: 699, country: "China", code: "CN" },
  { from: 700, to: 709, country: "Norway", code: "NO" },
  { from: 729, to: 729, country: "Israel", code: "IL" },
  { from: 730, to: 739, country: "Sweden", code: "SE" },
  { from: 740, to: 745, country: "Central America", code: "CA-AM" },
  { from: 746, to: 746, country: "Dominican Republic", code: "DO" },
  { from: 750, to: 750, country: "Mexico", code: "MX" },
  { from: 754, to: 755, country: "Canada", code: "CA" },
  { from: 759, to: 759, country: "Venezuela", code: "VE" },
  { from: 760, to: 769, country: "Switzerland & Liechtenstein", code: "CH" },
  { from: 770, to: 771, country: "Colombia", code: "CO" },
  { from: 773, to: 773, country: "Uruguay", code: "UY" },
  { from: 775, to: 775, country: "Peru", code: "PE" },
  { from: 777, to: 777, country: "Bolivia", code: "BO" },
  { from: 778, to: 779, country: "Argentina", code: "AR" },
  { from: 780, to: 780, country: "Chile", code: "CL" },
  { from: 784, to: 784, country: "Paraguay", code: "PY" },
  { from: 786, to: 786, country: "Ecuador", code: "EC" },
  { from: 789, to: 790, country: "Brazil", code: "BR" },
  { from: 800, to: 839, country: "Italy, San Marino & Vatican City", code: "IT" },
  { from: 840, to: 849, country: "Spain & Andorra", code: "ES" },
  { from: 850, to: 850, country: "Cuba", code: "CU" },
  { from: 858, to: 858, country: "Slovakia", code: "SK" },
  { from: 859, to: 859, country: "Czech Republic", code: "CZ" },
  { from: 860, to: 860, country: "Serbia", code: "RS" },
  { from: 865, to: 865, country: "Mongolia", code: "MN" },
  { from: 867, to: 867, country: "North Korea", code: "KP" },
  { from: 868, to: 869, country: "Turkey", code: "TR" },
  { from: 870, to: 879, country: "Netherlands", code: "NL" },
  { from: 880, to: 881, country: "South Korea", code: "KR" },
  { from: 883, to: 883, country: "Myanmar", code: "MM" },
  { from: 884, to: 884, country: "Cambodia", code: "KH" },
  { from: 885, to: 885, country: "Thailand", code: "TH" },
  { from: 888, to: 888, country: "Singapore", code: "SG" },
  { from: 890, to: 890, country: "India", code: "IN" },
  { from: 893, to: 893, country: "Vietnam", code: "VN" },
  { from: 896, to: 896, country: "Pakistan", code: "PK" },
  { from: 899, to: 899, country: "Indonesia", code: "ID" },
  { from: 900, to: 919, country: "Austria", code: "AT" },
  { from: 930, to: 939, country: "Australia", code: "AU" },
  { from: 940, to: 949, country: "New Zealand", code: "NZ" },
  { from: 955, to: 955, country: "Malaysia", code: "MY" },
  { from: 958, to: 958, country: "Macau", code: "MO" },
  { from: 977, to: 977, country: "Serial publication (ISSN)", code: "—" },
  { from: 978, to: 979, country: "Book (ISBN)", code: "—" },
  { from: 980, to: 980, country: "Refund receipt", code: "—" },
  { from: 981, to: 984, country: "Coupon", code: "—" },
  { from: 990, to: 999, country: "Coupon", code: "—" },
];

export type ScanVerdict = "israeli" | "flagged" | "clear" | "unknown";

export type ScanResult = {
  verdict: ScanVerdict;
  code: string;
  country: string;
  countryCode: string;
  prefix: string;
  brand?: string;
  brandNote?: string;
  validChecksum: boolean | null;
  message: string;
};

/** Brand ranges widely listed in consumer boycott campaigns. */
export const FLAGGED_BRANDS: { prefix: string; brand: string; note: string }[] = [
  { prefix: "7290", brand: "Israeli GS1 registration", note: "Registered with GS1 Israel." },
  { prefix: "7296", brand: "Israeli GS1 registration", note: "Registered with GS1 Israel." },
];

const CHECK_TEXT: Record<ScanVerdict, string> = {
  israeli: "This barcode is registered with GS1 Israel (prefix 729). The company that registered the product is based in Israel.",
  flagged: "This barcode belongs to a company registration that consumer campaigns commonly list. Verify with the manufacturer before deciding.",
  clear: "This barcode is not registered with GS1 Israel.",
  unknown: "This prefix is not in the GS1 country table, so the registering country cannot be determined.",
};

export function lookupPrefix(prefix: number): PrefixRange | undefined {
  return GS1_PREFIXES.find((r) => prefix >= r.from && prefix <= r.to);
}

/** EAN-13 / UPC-A modulo-10 check digit validation. */
export function validateChecksum(digits: string): boolean | null {
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length !== 13 && digits.length !== 12 && digits.length !== 8) return null;
  const nums = digits.split("").map(Number);
  const check = nums.pop() as number;
  nums.reverse();
  const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export function analyseBarcode(raw: string): ScanResult | null {
  const code = raw.replace(/\D/g, "");
  if (code.length < 8) return null;

  const normalised = code.length === 12 ? `0${code}` : code;
  const prefixDigits = normalised.slice(0, 3);
  const prefix = Number(prefixDigits);
  const range = lookupPrefix(prefix);
  const flagged = FLAGGED_BRANDS.find((b) => normalised.startsWith(b.prefix));

  const verdict: ScanVerdict = range?.code === "IL" ? "israeli" : flagged ? "flagged" : range ? "clear" : "unknown";

  return {
    verdict,
    code,
    country: range?.country ?? "Unknown",
    countryCode: range?.code ?? "—",
    prefix: prefixDigits,
    ...(flagged ? { brand: flagged.brand, brandNote: flagged.note } : {}),
    validChecksum: validateChecksum(code),
    message: CHECK_TEXT[verdict],
  };
}
