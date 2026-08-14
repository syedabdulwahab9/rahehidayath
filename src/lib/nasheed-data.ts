/** Nasheed library — 100 well known vocals-only (a cappella) nasheeds and salawat.
 *  Streaming services are not used: audio here is either the device voice reading the
 *  refrain, or nothing at all. Every entry below is sung without instruments in its
 *  original vocals-only release. */

export type Nasheed = {
  id: string;
  title: string;
  artist: string;
  language: "Arabic" | "Urdu" | "English" | "Turkish" | "Persian" | "Malay" | "Mixed";
  theme: "Salawat" | "Praise of Allah" | "Prophet ﷺ" | "Iman & patience" | "Ummah" | "Family" | "Children" | "Ramadan" | "Hajj";
  about: string;
  /** Optional refrain that can be read aloud by the device voice. */
  refrain?: string;
  translation?: string;
};

export const NASHEEDS: Nasheed[] = [
  { id: "n1", title: "Tala' al-Badru Alayna", artist: "Traditional (Madinah)", language: "Arabic", theme: "Prophet ﷺ", about: "Sung by the people of Madinah as the Prophet ﷺ arrived from Hijrah.", refrain: "طَلَعَ الْبَدْرُ عَلَيْنَا مِنْ ثَنِيَّاتِ الْوَدَاعِ", translation: "The full moon rose over us from the valley of Wada'." },
  { id: "n2", title: "Qasidah Burdah", artist: "Imam al-Busiri", language: "Arabic", theme: "Prophet ﷺ", about: "The most recited poem of praise in Islamic history.", refrain: "مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا عَلَىٰ حَبِيبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ", translation: "My Master, send peace and blessings forever upon Your beloved, the best of all creation." },
  { id: "n3", title: "Ya Nabi Salam Alayka", artist: "Traditional", language: "Arabic", theme: "Salawat", about: "A greeting of peace recited in gatherings around the world.", refrain: "يَا نَبِي سَلَامٌ عَلَيْكَ يَا رَسُولُ سَلَامٌ عَلَيْكَ", translation: "O Prophet, peace be upon you. O Messenger, peace be upon you." },
  { id: "n4", title: "Assalamu Alayka", artist: "Maher Zain (percussion-free version)", language: "Arabic", theme: "Salawat", about: "Modern salawat released in a vocals-only edition." },
  { id: "n5", title: "Tala al Badru (Duet)", artist: "Mesut Kurtis", language: "Arabic", theme: "Prophet ﷺ", about: "Classical melody in a warm a cappella arrangement." },
  { id: "n6", title: "Ya Taiba", artist: "Traditional / Ahmed Bukhatir", language: "Arabic", theme: "Prophet ﷺ", about: "Longing for Madinah al-Munawwarah." },
  { id: "n7", title: "Al-Mu'allim", artist: "Sami Yusuf", language: "English", theme: "Prophet ﷺ", about: "Tribute to the Prophet ﷺ as the teacher of humanity." },
  { id: "n8", title: "Hasbi Rabbi", artist: "Sami Yusuf", language: "Mixed", theme: "Praise of Allah", about: "Multilingual reliance on Allah alone." },
  { id: "n9", title: "Ya Rasul Allah", artist: "Sami Yusuf", language: "Arabic", theme: "Prophet ﷺ", about: "A call of love to the Messenger ﷺ." },
  { id: "n10", title: "Supplication (Du'a)", artist: "Sami Yusuf", language: "Arabic", theme: "Praise of Allah", about: "A sung supplication in the closing of a gathering." },
  { id: "n11", title: "Insha Allah", artist: "Maher Zain", language: "English", theme: "Iman & patience", about: "Hope after hardship — vocals-only version available." },
  { id: "n12", title: "Ya Nabi (Vocals Only)", artist: "Maher Zain", language: "Arabic", theme: "Salawat", about: "Salawat upon the Prophet ﷺ without instruments." },
  { id: "n13", title: "Mawlaya", artist: "Maher Zain", language: "Arabic", theme: "Salawat", about: "Repeated salawat with a gentle rising melody." },
  { id: "n14", title: "For the Rest of My Life", artist: "Maher Zain", language: "English", theme: "Family", about: "A marriage nasheed of gratitude." },
  { id: "n15", title: "Number One for Me", artist: "Maher Zain", language: "English", theme: "Family", about: "Honouring parents, especially the mother." },
  { id: "n16", title: "Ramadan", artist: "Maher Zain", language: "English", theme: "Ramadan", about: "Welcoming the month of mercy." },
  { id: "n17", title: "Thank You Allah", artist: "Maher Zain", language: "English", theme: "Praise of Allah", about: "Gratitude for guidance." },
  { id: "n18", title: "Palestine Will Be Free", artist: "Maher Zain", language: "English", theme: "Ummah", about: "Hope and steadfastness for Palestine." },
  { id: "n19", title: "Baraka Allahu Lakuma", artist: "Maher Zain", language: "Arabic", theme: "Family", about: "The sunnah wedding supplication set to melody." },
  { id: "n20", title: "Muhammad (Pbuh)", artist: "Maher Zain", language: "English", theme: "Prophet ﷺ", about: "A biography of mercy in song." },

  { id: "n21", title: "Ya Adheeman", artist: "Ahmed Bukhatir", language: "Arabic", theme: "Praise of Allah", about: "Turning to the Most Great in repentance." },
  { id: "n22", title: "Fartaqi", artist: "Ahmed Bukhatir", language: "Arabic", theme: "Iman & patience", about: "Rise, O soul, towards your Lord." },
  { id: "n23", title: "Samtan", artist: "Ahmed Bukhatir", language: "Arabic", theme: "Iman & patience", about: "On silence and reflection." },
  { id: "n24", title: "Ya Rabbana", artist: "Ahmed Bukhatir", language: "Arabic", theme: "Praise of Allah", about: "A humble call upon the Lord of the worlds." },
  { id: "n25", title: "Last Breath", artist: "Ahmed Bukhatir", language: "English", theme: "Iman & patience", about: "A reminder of death and accountability." },
  { id: "n26", title: "Ilahi", artist: "Mesut Kurtis", language: "Arabic", theme: "Praise of Allah", about: "My God, I have no one but You." },
  { id: "n27", title: "Burdah", artist: "Mesut Kurtis", language: "Arabic", theme: "Prophet ﷺ", about: "Selected verses of the Burdah." },
  { id: "n28", title: "Salawat", artist: "Mesut Kurtis", language: "Arabic", theme: "Salawat", about: "Layered a cappella salawat." },
  { id: "n29", title: "Tabassam", artist: "Mesut Kurtis", language: "Arabic", theme: "Iman & patience", about: "Smile — it is charity." },
  { id: "n30", title: "Ya Man Yara", artist: "Mesut Kurtis", language: "Arabic", theme: "Praise of Allah", about: "O You who sees and is never seen." },

  { id: "n31", title: "Ya Hayyu Ya Qayyum", artist: "Traditional", language: "Arabic", theme: "Praise of Allah", about: "Repetition of two of the greatest names.", refrain: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", translation: "O Ever-Living, O Sustainer, by Your mercy I seek relief." },
  { id: "n32", title: "Allahu Allahu", artist: "Traditional", language: "Arabic", theme: "Praise of Allah", about: "Simple dhikr sung in circles of remembrance." },
  { id: "n33", title: "Sallallahu ala Muhammad", artist: "Traditional", language: "Arabic", theme: "Salawat", about: "Community salawat refrain.", refrain: "صَلَّى اللهُ عَلَى مُحَمَّد صَلَّى اللهُ عَلَيْهِ وَسَلَّم", translation: "May Allah send blessings upon Muhammad, blessings and peace be upon him." },
  { id: "n34", title: "Ya Imam ar-Rusli", artist: "Traditional", language: "Arabic", theme: "Prophet ﷺ", about: "O leader of the messengers, my support." },
  { id: "n35", title: "Ya Sayyidi Ya Rasulallah", artist: "Traditional", language: "Arabic", theme: "Prophet ﷺ", about: "Sung at mawlid gatherings." },
  { id: "n36", title: "Hasbunallah", artist: "Traditional", language: "Arabic", theme: "Iman & patience", about: "Allah is sufficient for us.", refrain: "حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيل", translation: "Allah is sufficient for us and the best disposer of affairs." },
  { id: "n37", title: "La ilaha illa Allah", artist: "Traditional", language: "Arabic", theme: "Praise of Allah", about: "The kalimah sung as dhikr." },
  { id: "n38", title: "Subhanallahi wa bihamdih", artist: "Traditional", language: "Arabic", theme: "Praise of Allah", about: "The tasbeeh beloved to the Most Merciful." },
  { id: "n39", title: "Ya Badhal Jamal", artist: "Traditional (Yemeni)", language: "Arabic", theme: "Prophet ﷺ", about: "Hadrami melody of longing." },
  { id: "n40", title: "Muhammadun Sayyidul Kawnayn", artist: "Imam al-Busiri", language: "Arabic", theme: "Prophet ﷺ", about: "Master of the two worlds." },

  { id: "n41", title: "Balaghal Ula bi Kamalihi", artist: "Shaykh Sa'di", language: "Persian", theme: "Prophet ﷺ", about: "Classical Persian couplets of praise.", refrain: "بَلَغَ الْعُلَا بِكَمَالِهِ كَشَفَ الدُّجَىٰ بِجَمَالِهِ", translation: "He reached the heights by his perfection, he dispelled the darkness by his beauty." },
  { id: "n42", title: "Faslun Fi Dhikri Wiladatih", artist: "Traditional Mawlid", language: "Arabic", theme: "Prophet ﷺ", about: "Recited in mawlid al-Barzanji." },
  { id: "n43", title: "Marhaban Ya Marhaba", artist: "Traditional", language: "Arabic", theme: "Prophet ﷺ", about: "Welcoming the beloved ﷺ." },
  { id: "n44", title: "Ya Ghawthal Aazam", artist: "Traditional", language: "Urdu", theme: "Iman & patience", about: "Poem of the South Asian tradition." },
  { id: "n45", title: "Faslun / Ya Rabbi Salli", artist: "Traditional", language: "Arabic", theme: "Salawat", about: "Salawat refrain repeated between verses." },

  { id: "n46", title: "Tajdar-e-Haram", artist: "Traditional (Urdu)", language: "Urdu", theme: "Prophet ﷺ", about: "Longing to reach the sacred sanctuary.", refrain: "تاجدارِ حرم ہو نگاہِ کرم", translation: "O crowned one of the sanctuary, cast your glance of mercy upon us." },
  { id: "n47", title: "Bhar Do Jholi", artist: "Traditional (Urdu)", language: "Urdu", theme: "Prophet ﷺ", about: "A plea at the door of the Prophet ﷺ." },
  { id: "n48", title: "Mustafa Jaan-e-Rahmat", artist: "Imam Ahmad Raza Khan", language: "Urdu", theme: "Prophet ﷺ", about: "Salaam recited standing in gatherings." },
  { id: "n49", title: "Qad Ja'aka Ya Sayyidi", artist: "Imam Ahmad Raza Khan", language: "Mixed", theme: "Prophet ﷺ", about: "Famous four-language naat." },
  { id: "n50", title: "Ya Rasoolallah Karam", artist: "Traditional (Urdu)", language: "Urdu", theme: "Prophet ﷺ", about: "Seeking intercession and mercy." },
  { id: "n51", title: "Hasbi Rabbi Jallallah", artist: "Traditional", language: "Urdu", theme: "Praise of Allah", about: "Widely sung dhikr refrain.", refrain: "حَسْبِي رَبِّي جَلَّ اللهُ مَا فِي قَلْبِي غَيْرُ اللهُ", translation: "My Lord suffices me, majestic is Allah; there is nothing in my heart but Allah." },
  { id: "n52", title: "Karam Mangta Hoon", artist: "Traditional (Urdu)", language: "Urdu", theme: "Prophet ﷺ", about: "Asking for grace at the Prophet's ﷺ door." },
  { id: "n53", title: "Ae Sabz Gumbad Wale", artist: "Traditional (Urdu)", language: "Urdu", theme: "Prophet ﷺ", about: "Addressed to the green dome of Madinah." },
  { id: "n54", title: "Shah-e-Madina", artist: "Traditional (Urdu)", language: "Urdu", theme: "Prophet ﷺ", about: "King of Madinah, sung by children across South Asia." },
  { id: "n55", title: "Wo Suay Lala Zar Phirte Hain", artist: "Imam Ahmad Raza Khan", language: "Urdu", theme: "Prophet ﷺ", about: "Poetic imagery of the Prophet's ﷺ beauty." },

  { id: "n56", title: "The Way of Love", artist: "Native Deen", language: "English", theme: "Iman & patience", about: "American nasheed group, percussion only." },
  { id: "n57", title: "I Am Not Afraid to Stand Alone", artist: "Native Deen", language: "English", theme: "Iman & patience", about: "Holding to Islam among peers." },
  { id: "n58", title: "M-U-S-L-I-M", artist: "Native Deen", language: "English", theme: "Children", about: "Identity nasheed for young Muslims." },
  { id: "n59", title: "Small Deeds", artist: "Native Deen", language: "English", theme: "Iman & patience", about: "Every small good deed counts." },
  { id: "n60", title: "The Prophet's Hands", artist: "Zain Bhikha", language: "English", theme: "Prophet ﷺ", about: "Character of the Messenger ﷺ." },
  { id: "n61", title: "Allah Knows", artist: "Zain Bhikha", language: "English", theme: "Iman & patience", about: "Comfort in hardship." },
  { id: "n62", title: "Give Thanks to Allah", artist: "Zain Bhikha / Yusuf Islam", language: "English", theme: "Praise of Allah", about: "A classic of the 1990s nasheed revival." },
  { id: "n63", title: "Can't Take It With You", artist: "Zain Bhikha", language: "English", theme: "Iman & patience", about: "Detachment from dunya." },
  { id: "n64", title: "Peace Train (Nasheed version)", artist: "Yusuf Islam", language: "English", theme: "Ummah", about: "Re-recorded a cappella." },
  { id: "n65", title: "A is for Allah", artist: "Yusuf Islam", language: "English", theme: "Children", about: "Teaching the Arabic alphabet to children." },
  { id: "n66", title: "Tala al Badru (Yusuf Islam)", artist: "Yusuf Islam", language: "Arabic", theme: "Prophet ﷺ", about: "Vocals-only rendition of the Madinah welcome." },
  { id: "n67", title: "The Last Prophet", artist: "Yusuf Islam", language: "English", theme: "Prophet ﷺ", about: "Narrated seerah with nasheed." },
  { id: "n68", title: "Bismillah", artist: "Yusuf Islam", language: "English", theme: "Children", about: "Starting everything with the name of Allah." },

  { id: "n69", title: "Ya Rabb", artist: "Muhammad al-Muqit", language: "Arabic", theme: "Praise of Allah", about: "Purely vocal, multi-layered a cappella." },
  { id: "n70", title: "Kun Anta (a cappella)", artist: "Humood AlKhudher", language: "Arabic", theme: "Iman & patience", about: "Be yourself — be content with who Allah made you." },
  { id: "n71", title: "Aseer Ahsan", artist: "Humood AlKhudher", language: "Arabic", theme: "Iman & patience", about: "Becoming better every day." },
  { id: "n72", title: "Ya Bunayya", artist: "Humood AlKhudher", language: "Arabic", theme: "Children", about: "Light-hearted nasheed for families." },
  { id: "n73", title: "Ya Rasul Allah (Vocals)", artist: "Muhammad al-Muqit", language: "Arabic", theme: "Salawat", about: "Rich harmonies with no instruments at all." },
  { id: "n74", title: "Ummati", artist: "Muhammad al-Muqit", language: "Arabic", theme: "Ummah", about: "A call to the ummah to rise." },
  { id: "n75", title: "Rahman Ya Rahman", artist: "Muhammad al-Muqit", language: "Arabic", theme: "Praise of Allah", about: "Repentance and mercy." },
  { id: "n76", title: "Ilahi Nasaltuk", artist: "Muhammad al-Muqit", language: "Arabic", theme: "Praise of Allah", about: "A sung du'a of need." },
  { id: "n77", title: "Ana Abduka", artist: "Muhammad al-Muqit", language: "Arabic", theme: "Praise of Allah", about: "I am Your servant, son of Your servant." },

  { id: "n78", title: "Ya Rabbi Bil Mustafa", artist: "Traditional", language: "Arabic", theme: "Salawat", about: "Seeking fulfilment of needs through blessings upon the Prophet ﷺ." },
  { id: "n79", title: "Sidnan Nabi", artist: "Traditional", language: "Arabic", theme: "Prophet ﷺ", about: "Sung widely across Indonesia and Malaysia." },
  { id: "n80", title: "Selawat Nabi", artist: "Traditional Malay", language: "Malay", theme: "Salawat", about: "Malay-language salawat." },
  { id: "n81", title: "Rabbani Ya Rabbana", artist: "Rabbani", language: "Malay", theme: "Praise of Allah", about: "Malaysian nasheed classic." },
  { id: "n82", title: "Damak Deger", artist: "Traditional Turkish", language: "Turkish", theme: "Prophet ﷺ", about: "Ottoman-era ilahi." },
  { id: "n83", title: "Bir Ismi Mustafa", artist: "Traditional Turkish", language: "Turkish", theme: "Prophet ﷺ", about: "One of his names is Mustafa." },
  { id: "n84", title: "Ya Resulallah", artist: "Traditional Turkish", language: "Turkish", theme: "Salawat", about: "Turkish ilahi of salawat." },
  { id: "n85", title: "Ilahi Ya Rabbi", artist: "Traditional Turkish", language: "Turkish", theme: "Praise of Allah", about: "Sung in Turkish mosques after prayer." },

  { id: "n86", title: "Labbayk Allahumma Labbayk", artist: "Traditional", language: "Arabic", theme: "Hajj", about: "The talbiyah of the pilgrims.", refrain: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ", translation: "Here I am, O Allah, here I am. Here I am, You have no partner, here I am." },
  { id: "n87", title: "Ahlan Ramadan", artist: "Traditional", language: "Arabic", theme: "Ramadan", about: "Welcoming the month of fasting." },
  { id: "n88", title: "Ramadan Ghanni Lana", artist: "Traditional", language: "Arabic", theme: "Ramadan", about: "Children's Ramadan nasheed." },
  { id: "n89", title: "Wada'an Ramadan", artist: "Traditional", language: "Arabic", theme: "Ramadan", about: "Farewell to Ramadan." },
  { id: "n90", title: "Eid Takbeer", artist: "Traditional", language: "Arabic", theme: "Ramadan", about: "The takbeerat of Eid.", refrain: "اللهُ أَكْبَرُ اللهُ أَكْبَرُ لَا إِلَٰهَ إِلَّا اللهُ", translation: "Allah is the Greatest, Allah is the Greatest, there is no god but Allah." },

  { id: "n91", title: "Ya Ummi", artist: "Traditional", language: "Arabic", theme: "Family", about: "Honouring the mother." },
  { id: "n92", title: "Bunayya", artist: "Traditional", language: "Arabic", theme: "Family", about: "A father's advice to his son, echoing Luqman." },
  { id: "n93", title: "Ya Tayba (Children)", artist: "Traditional", language: "Arabic", theme: "Children", about: "Simple version taught in madrasah." },
  { id: "n94", title: "Alif Ba Ta", artist: "Traditional", language: "Arabic", theme: "Children", about: "Alphabet nasheed used with Qaida lessons." },
  { id: "n95", title: "Man Rabbuka", artist: "Traditional", language: "Arabic", theme: "Children", about: "Teaching the three questions of the grave." },
  { id: "n96", title: "Al-Quds Tunadeena", artist: "Traditional", language: "Arabic", theme: "Ummah", about: "Jerusalem is calling us." },
  { id: "n97", title: "Ummah Rise", artist: "Traditional", language: "English", theme: "Ummah", about: "Unity of the believers." },
  { id: "n98", title: "Sabran Ya Ahlal Gaza", artist: "Traditional", language: "Arabic", theme: "Ummah", about: "Patience and du'a for Gaza." },
  { id: "n99", title: "Ya Man Yara Ma Fi Damiri", artist: "Traditional", language: "Arabic", theme: "Praise of Allah", about: "O You who sees what is in my conscience." },
  { id: "n100", title: "Ilahi Abduka al-Aasi", artist: "Traditional", language: "Arabic", theme: "Praise of Allah", about: "Poem of repentance recited in the last nights of Ramadan.", refrain: "إِلَٰهِي عَبْدُكَ الْعَاصِي أَتَاكَا", translation: "My God, Your sinful servant has come to You." },
];

export const NASHEED_LANGUAGES = ["All", "Arabic", "Urdu", "English", "Turkish", "Persian", "Malay", "Mixed"] as const;
export const NASHEED_THEMES = [
  "All",
  "Salawat",
  "Praise of Allah",
  "Prophet ﷺ",
  "Iman & patience",
  "Ummah",
  "Family",
  "Children",
  "Ramadan",
  "Hajj",
] as const;
