/**
 * Additional Ibadah topics that complete the worship curriculum.
 * Same shape as IBADAAT_SECTIONS in islamic-data.ts so both can be merged and
 * rendered by one component. Content is drawn from the Qur'an and the authentic
 * hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah).
 */

export type IbadahItem = { h: string; b: string };
export type IbadahSection = {
  id: string;
  title: string;
  summary: string;
  items: IbadahItem[];
};

export const IBADAAT_EXTRA: IbadahSection[] = [
  {
    id: "wudu",
    title: "Wudu — Ablution",
    summary: "The key to salah: its fard acts, sunnahs, nullifiers and the dua after it.",
    items: [
      {
        h: "Why wudu matters",
        b: "The Prophet ﷺ said: 'Allah does not accept a prayer without purification' (Muslim). Wudu is the gateway to every salah, to touching the mushaf and to tawaf.",
      },
      {
        h: "The fard acts (Hanafi)",
        b: "Four: washing the face once, washing both arms including the elbows, wiping a quarter of the head, and washing both feet including the ankles. In the Shafi'i school, intention and order are also fard — a respected difference of opinion.",
      },
      {
        h: "The sunnah method",
        b: "Bismillah and intention → wash the hands to the wrists ×3 → rinse the mouth ×3 (miswak is sunnah) → sniff water into the nose and blow out ×3 → wash the face ×3 → right arm then left to the elbows ×3 → wipe the whole head once, then the ears → wash the right foot then the left to the ankles ×3.",
      },
      {
        h: "What breaks wudu",
        b: "Anything leaving the front or back passage, flowing blood or pus, vomiting a mouthful, deep sleep while lying down, loss of consciousness, and laughing aloud inside salah (Hanafi).",
      },
      {
        h: "Dua after wudu",
        b: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ — whoever says this, the eight gates of Paradise are opened for him (Muslim).",
      },
      {
        h: "Common mistakes",
        b: "Leaving the heels or the area between the fingers dry, wasting water (the Prophet ﷺ made wudu with roughly one mudd), and washing more than three times.",
      },
    ],
  },
  {
    id: "quran",
    title: "The Qur'an",
    summary: "Adab of recitation, tajweed, memorisation and living by the Book of Allah.",
    items: [
      {
        h: "The status of the Qur'an",
        b: "'Indeed this Qur'an guides to that which is most upright' (17:9). The Prophet ﷺ said: 'The best of you are those who learn the Qur'an and teach it' (Bukhari).",
      },
      {
        h: "Adab of recitation",
        b: "Be in a state of purity to touch the mushaf, sit facing the qiblah if possible, begin with A'udhu billahi min ash-shaytan ir-rajim then Bismillah, recite slowly (tarteel) and reflect on the meaning.",
      },
      {
        h: "Reward of every letter",
        b: "'Whoever reads a letter from the Book of Allah receives a good deed, and each good deed is multiplied by ten. I do not say Alif-Lam-Mim is one letter — Alif is a letter, Lam is a letter, Mim is a letter' (Tirmidhi).",
      },
      {
        h: "A realistic daily plan",
        b: "One page after Fajr and one after Maghrib finishes the Qur'an in roughly a year. Two pages after every farz prayer completes it in a month.",
      },
      {
        h: "Memorisation (hifz)",
        b: "Memorise a small portion daily, always at the same time, always from the same mushaf. Recite the new portion in your salah the same day and revise yesterday's portion before adding anything new.",
      },
      {
        h: "Understanding before speed",
        b: "Pair recitation with a trusted translation and tafsir. The Companions learned ten ayat, acted on them, then moved on.",
      },
    ],
  },
  {
    id: "dua",
    title: "Dua — Supplication",
    summary: "The etiquette, the accepted times and the duas of the Prophet ﷺ.",
    items: [
      {
        h: "Dua is worship",
        b: "The Prophet ﷺ said: 'Dua is worship' (Abu Dawud, Tirmidhi). Allah says: 'Call upon Me; I will respond to you' (40:60).",
      },
      {
        h: "The etiquette of dua",
        b: "Begin with the praise of Allah, send salawat upon the Prophet ﷺ, face the qiblah, raise the hands, ask with certainty of a reply, be persistent, and close again with salawat.",
      },
      {
        h: "Times most likely to be answered",
        b: "The last third of the night, between the adhan and iqamah, in sujood, while fasting until iftar, the final hour of Jumu'ah, during rain, and while travelling.",
      },
      {
        h: "The comprehensive dua",
        b: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ — 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire' (2:201).",
      },
      {
        h: "Dua for distress",
        b: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ — the dua of Yunus ؑ. 'No Muslim supplicates with it except that Allah answers him' (Tirmidhi).",
      },
      {
        h: "Three possible answers",
        b: "The Prophet ﷺ said Allah either gives what was asked, keeps it stored for the Hereafter, or turns away an equal evil (Ahmad). No sincere dua is ever wasted.",
      },
    ],
  },
  {
    id: "dhikr",
    title: "Dhikr — Remembrance",
    summary: "The morning and evening adhkar, tasbeeh after salah and the living heart.",
    items: [
      {
        h: "The living heart",
        b: "'The example of the one who remembers his Lord and the one who does not is like the living and the dead' (Bukhari). 'Verily, in the remembrance of Allah do hearts find rest' (13:28).",
      },
      {
        h: "After every farz salah",
        b: "Astaghfirullah ×3, Allahumma antas-Salam…, then SubhanAllah ×33, Alhamdulillah ×33, Allahu Akbar ×33, completing the hundred with La ilaha illallahu wahdahu la sharika lah… (Muslim).",
      },
      {
        h: "Ayat al-Kursi",
        b: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and Paradise except death (Nasa'i).",
      },
      {
        h: "The two light phrases",
        b: "'Two words light on the tongue, heavy on the scales, beloved to the Most Merciful: SubhanAllahi wa bihamdih, SubhanAllahil-Adheem' (Bukhari).",
      },
      {
        h: "Morning & evening adhkar",
        b: "Recite Ayat al-Kursi, the three Quls ×3, Sayyid al-Istighfar, and 'Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama' ×3 morning and evening.",
      },
      {
        h: "Salawat upon the Prophet ﷺ",
        b: "'Whoever sends one salawat upon me, Allah sends ten blessings upon him' (Muslim). Make it constant, especially on Friday.",
      },
    ],
  },
  {
    id: "akhlaq",
    title: "Islamic Character (Akhlaq)",
    summary: "Truthfulness, mercy, patience, honesty and the manners of the Prophet ﷺ.",
    items: [
      {
        h: "The purpose of the message",
        b: "'I was sent only to perfect noble character' (Bukhari, al-Adab al-Mufrad). Worship without character is incomplete.",
      },
      {
        h: "Heaviest on the scales",
        b: "'Nothing is heavier on the believer's scale on the Day of Judgement than good character' (Tirmidhi).",
      },
      {
        h: "Truthfulness",
        b: "'Truthfulness leads to righteousness, and righteousness leads to Paradise' (Bukhari). A believer may fall into many faults, but never into deliberate lying.",
      },
      {
        h: "Mercy and gentleness",
        b: "'The merciful are shown mercy by the Most Merciful' (Abu Dawud). 'Gentleness is not found in anything except that it beautifies it' (Muslim).",
      },
      {
        h: "Controlling anger",
        b: "'The strong one is not the good wrestler; the strong one is he who controls himself when angry' (Bukhari). Seek refuge in Allah, sit down, and make wudu.",
      },
      {
        h: "The tongue",
        b: "'Whoever believes in Allah and the Last Day, let him speak good or stay silent' (Bukhari). Backbiting is mentioning your brother in a way he dislikes (Muslim).",
      },
    ],
  },
  {
    id: "pillars",
    title: "The Pillars of Islam & Iman",
    summary: "The five pillars, the six articles of faith and the meaning of ihsan.",
    items: [
      {
        h: "The five pillars",
        b: "'Islam is built upon five: testifying that there is no god but Allah and that Muhammad is His Messenger, establishing salah, giving zakat, Hajj to the House, and fasting Ramadan' (Bukhari, Muslim).",
      },
      {
        h: "1. Shahadah",
        b: "La ilaha illallah, Muhammadur Rasulullah — a declaration of pure tawheed and of following the Messenger ﷺ in how Allah is worshipped.",
      },
      {
        h: "2. Salah",
        b: "Five daily prayers, the first matter to be judged on the Day of Resurrection (Tirmidhi).",
      },
      {
        h: "3. Zakat · 4. Sawm · 5. Hajj",
        b: "Zakat: 2.5% of qualifying wealth held for a lunar year. Sawm: fasting the month of Ramadan. Hajj: once in a lifetime for whoever is able.",
      },
      {
        h: "The six articles of Iman",
        b: "Belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree — its good and its bad (Muslim, Hadith Jibril).",
      },
      {
        h: "Ihsan",
        b: "'To worship Allah as though you see Him, and though you do not see Him, He surely sees you' (Muslim).",
      },
    ],
  },
  {
    id: "rights",
    title: "Rights in Islam",
    summary: "The rights of Allah, parents, spouse, children, neighbours and the whole community.",
    items: [
      {
        h: "The right of Allah",
        b: "'The right of Allah upon His servants is that they worship Him and associate nothing with Him' (Bukhari, Muslim).",
      },
      {
        h: "Parents",
        b: "'And your Lord has decreed that you worship none but Him, and to parents good treatment' (17:23). Do not say to them a word of contempt; serve them most of all in their old age.",
      },
      {
        h: "Spouse",
        b: "'The best of you are the best to their families' (Tirmidhi). Kindness, provision, protection of honour and patient companionship are mutual rights.",
      },
      {
        h: "Children",
        b: "A good name, correct aqeedah, teaching the Qur'an and salah, fairness between them, and gentleness. 'He is not one of us who does not show mercy to our young' (Tirmidhi).",
      },
      {
        h: "Neighbours",
        b: "'Jibril kept advising me about the neighbour until I thought he would make him an heir' (Bukhari). This includes non-Muslim neighbours.",
      },
      {
        h: "Rights of the Muslim",
        b: "Six: return the greeting, visit the sick, follow funerals, accept an invitation, reply to the sneezer, and give sincere advice when asked (Muslim).",
      },
    ],
  },
  {
    id: "learning",
    title: "Islamic Learning",
    summary: "Seeking knowledge, its adab, and a path from beginner to steady student.",
    items: [
      {
        h: "An obligation",
        b: "'Seeking knowledge is an obligation upon every Muslim' (Ibn Majah). 'Whoever travels a path seeking knowledge, Allah makes easy for him a path to Paradise' (Muslim).",
      },
      {
        h: "Start with the fard 'ayn",
        b: "Learn first what you personally need: correct aqeedah, purification, salah, then fasting, zakat and the halal of your work.",
      },
      {
        h: "Adab of the student",
        b: "Sincerity for Allah alone, humility before the teacher, acting on what is learned, and asking rather than guessing.",
      },
      {
        h: "Learn from qualified people",
        b: "'This knowledge is religion, so look at whom you take your religion from' (Muslim, introduction). Prefer reliable teachers and verified sources over anonymous posts.",
      },
      {
        h: "A little, constantly",
        b: "'The most beloved deeds to Allah are the most constant, even if few' (Bukhari). Fifteen focused minutes a day outweighs an occasional long session.",
      },
      {
        h: "Differences of opinion",
        b: "On many secondary matters the four schools differ within valid scholarly bounds. Follow a reliable position with respect for others, and never let fiqh differences break the unity of the ummah.",
      },
    ],
  },
  {
    id: "faq",
    title: "Common Questions",
    summary: "Clear, sourced answers to the questions asked most often.",
    items: [
      {
        h: "I missed prayers for years — what now?",
        b: "Repent sincerely and begin making up the missed prayers (qada) gradually alongside the current ones, for example one missed prayer with each daily prayer, until they are complete.",
      },
      {
        h: "Can I pray without a prayer mat?",
        b: "Yes. Any clean surface is valid. 'The earth has been made for me a place of prayer and a means of purification' (Bukhari).",
      },
      {
        h: "How do I pray while travelling?",
        b: "A traveller shortens the four-rak'ah farz prayers to two, and may combine Dhuhr with Asr and Maghrib with Isha according to the position followed.",
      },
      {
        h: "What if I break my fast by mistake?",
        b: "Eating or drinking out of genuine forgetfulness does not break the fast — complete the fast, for 'it was Allah who fed you and gave you drink' (Bukhari).",
      },
      {
        h: "Do women pray during menstruation?",
        b: "No, and those prayers are not made up. Fasts missed are made up later. Dhikr, dua and listening to the Qur'an remain open.",
      },
      {
        h: "How do I calculate my zakat?",
        b: "Total your cash, gold, silver, business goods and receivables held for one lunar year, subtract immediate debts, and if the remainder reaches nisab give 2.5%.",
      },
    ],
  },
];
