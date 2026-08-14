/** Halal / Haram reference used by the /halal section.
 *  Rulings follow the majority (jumhur) position of the four Sunni schools.
 *  "mushbooh" means doubtful — the source decides the ruling, so it must be verified. */

export type Ruling = "halal" | "haram" | "mushbooh";

export type HalalItem = {
  id: string;
  name: string;
  category: string;
  ruling: Ruling;
  /** Short reason a normal shopper can act on. */
  why: string;
  /** Quran / hadith / fiqh reference where one applies. */
  evidence?: string;
  /** Other names the item hides behind on labels. */
  aka?: string[];
  /** Urdu name and explanation, shown by the per-card language switch. */
  ur?: string;
  urWhy?: string;
};

export const HALAL_CATEGORIES = [
  "Meat & poultry",
  "Seafood",
  "Food additives (E-numbers)",
  "Ingredients",
  "Drinks",
  "Sweets & snacks",
  "Medicine & cosmetics",
  "Money & work",
  "Daily life",
  "Fruits",
  "Vegetables & grains",
  "Dairy & eggs",
  "Birds",
  "Land animals",
  "Insects & small creatures",
] as const;

export const RULING_LABEL: Record<Ruling, string> = {
  halal: "Halal",
  haram: "Haram",
  mushbooh: "Doubtful (mushbooh)",
};

export const HALAL_ITEMS: HalalItem[] = [
  /* ---- Meat & poultry ---- */
  { id: "zabiha-beef", name: "Zabiha beef, lamb, goat, camel", category: "Meat & poultry", ruling: "halal", why: "Slaughtered by a Muslim (or a Jew/Christian) with the name of Allah, throat cut, blood drained.", evidence: "Qur'an 5:3–5" },
  { id: "pork", name: "Pork, bacon, ham, lard", category: "Meat & poultry", ruling: "haram", why: "Swine flesh is explicitly forbidden in every form, including fat and derivatives.", evidence: "Qur'an 2:173, 5:3", aka: ["lard", "bacon fat", "pork gelatine"] },
  { id: "non-zabiha", name: "Non-zabiha / machine-slaughtered chicken", category: "Meat & poultry", ruling: "mushbooh", why: "Depends on whether the name of Allah was pronounced and the bird was alive at slaughter. Verify the certifier.", evidence: "Qur'an 6:121" },
  { id: "carrion", name: "Dead animal (carrion), roadkill", category: "Meat & poultry", ruling: "haram", why: "An animal that died without valid slaughter is maytah.", evidence: "Qur'an 5:3" },
  { id: "blood", name: "Blood, blood sausage, black pudding", category: "Meat & poultry", ruling: "haram", why: "Flowing blood is forbidden.", evidence: "Qur'an 6:145" },
  { id: "donkey", name: "Domestic donkey and mule", category: "Meat & poultry", ruling: "haram", why: "Prohibited on the day of Khaybar.", evidence: "Bukhari 4199, Muslim 1936" },
  { id: "predator", name: "Predators with fangs (lion, dog, cat), birds of prey", category: "Meat & poultry", ruling: "haram", why: "Fanged beasts and taloned birds are forbidden.", evidence: "Muslim 1932–1934" },
  { id: "horse", name: "Horse meat", category: "Meat & poultry", ruling: "halal", why: "Permitted by the majority (Hanafis consider it disliked).", evidence: "Bukhari 5520" },
  { id: "rabbit", name: "Rabbit", category: "Meat & poultry", ruling: "halal", why: "The Prophet ﷺ was given rabbit meat and it was accepted.", evidence: "Bukhari 5535" },
  { id: "kosher-meat", name: "Kosher meat", category: "Meat & poultry", ruling: "mushbooh", why: "Slaughter of the People of the Book is permitted in principle, but stunning and the missing tasmiyah make many scholars require caution.", evidence: "Qur'an 5:5" },

  /* ---- Seafood ---- */
  { id: "fish", name: "All fish with scales", category: "Seafood", ruling: "halal", why: "Sea game and its food are made lawful for you.", evidence: "Qur'an 5:96" },
  { id: "prawn", name: "Prawn, shrimp", category: "Seafood", ruling: "halal", why: "Halal by the majority; some Hanafis restrict sea food to fish only." },
  { id: "crab", name: "Crab, lobster, octopus, squid", category: "Seafood", ruling: "mushbooh", why: "Halal for Maliki/Shafi'i/Hanbali schools, not for the Hanafi school. Follow your madhhab." },
  { id: "frog", name: "Frog", category: "Seafood", ruling: "haram", why: "Killing frogs was forbidden, so eating them is not allowed.", evidence: "Abu Dawud 3871" },

  /* ---- Food additives ---- */
  { id: "e120", name: "E120 Carmine / cochineal", category: "Food additives (E-numbers)", ruling: "haram", why: "Red colour made from crushed insects; impermissible for the majority.", aka: ["carminic acid", "natural red 4"] },
  { id: "e441", name: "E441 Gelatine", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Halal only when made from fish or zabiha beef. Most commercial gelatine is porcine.", aka: ["gelatin", "gelatine"] },
  { id: "e471", name: "E471 Mono- and diglycerides of fatty acids", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Halal if plant-derived, haram if from pork fat or non-zabiha tallow." },
  { id: "e472", name: "E472 a–f Esters of fatty acids", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Same source problem as E471 — confirm the fat is vegetable." },
  { id: "e422", name: "E422 Glycerol / glycerine", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Vegetable glycerine is halal; animal glycerine may be from pork.", aka: ["glycerin"] },
  { id: "e631", name: "E631 Disodium inosinate", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Often produced from sardines (halal) but sometimes from pork.", },
  { id: "e904", name: "E904 Shellac", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Resin secreted by the lac insect; scholars differ, widely avoided." },
  { id: "e920", name: "E920 L-cysteine", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Dough conditioner sometimes derived from human hair or duck feathers; synthetic is halal." },
  { id: "e100", name: "E100 Curcumin, E160a carotene, E300 vitamin C", category: "Food additives (E-numbers)", ruling: "halal", why: "Plant or synthetic origin." },
  { id: "e153", name: "E153 Carbon black (vegetable carbon)", category: "Food additives (E-numbers)", ruling: "mushbooh", why: "Halal from plants, doubtful when made from bone char." },

  /* ---- Ingredients ---- */
  { id: "rennet", name: "Animal rennet in cheese", category: "Ingredients", ruling: "mushbooh", why: "Halal when from a zabiha calf or microbial; doubtful otherwise. Look for microbial/vegetarian rennet." },
  { id: "whey", name: "Whey / whey powder", category: "Ingredients", ruling: "mushbooh", why: "Depends on the rennet used to make the cheese it came from." },
  { id: "vanilla-extract", name: "Vanilla extract", category: "Ingredients", ruling: "mushbooh", why: "Standard extract is 35% ethanol. Many scholars permit the trace amount left in baked food; alcohol-free extract removes the doubt." },
  { id: "lecithin", name: "Soy lecithin (E322)", category: "Ingredients", ruling: "halal", why: "Plant-derived emulsifier." },
  { id: "tallow", name: "Tallow, animal shortening", category: "Ingredients", ruling: "mushbooh", why: "Beef tallow is halal only from zabiha animals; often mixed with pork fat." },
  { id: "enzymes", name: "Unspecified 'enzymes'", category: "Ingredients", ruling: "mushbooh", why: "Could be microbial (halal) or animal (verify)." },
  { id: "honey", name: "Honey", category: "Ingredients", ruling: "halal", why: "Explicitly praised as a healing for people.", evidence: "Qur'an 16:69" },
  { id: "vinegar", name: "Vinegar (including wine vinegar)", category: "Ingredients", ruling: "halal", why: "Once wine fully turns to vinegar it is no longer intoxicating; the Prophet ﷺ praised vinegar.", evidence: "Muslim 2051" },

  /* ---- Drinks ---- */
  { id: "khamr", name: "Wine, beer, spirits, any intoxicant", category: "Drinks", ruling: "haram", why: "Every intoxicant is khamr and every khamr is haram — even a small amount.", evidence: "Qur'an 5:90, Muslim 2003" },
  { id: "non-alc-beer", name: "0.0% 'non-alcoholic' beer", category: "Drinks", ruling: "mushbooh", why: "Halal if truly free of intoxicant and not imitating drinking culture; many brands still carry up to 0.5% alcohol." },
  { id: "kombucha", name: "Kombucha", category: "Drinks", ruling: "mushbooh", why: "Fermentation can push alcohol above trace levels — check the batch." },
  { id: "energy-drinks", name: "Energy drinks with taurine", category: "Drinks", ruling: "mushbooh", why: "Synthetic taurine is halal; animal-sourced taurine is not. Most major brands use synthetic." },
  { id: "coffee", name: "Coffee, tea, soft drinks", category: "Drinks", ruling: "halal", why: "No intoxicant and no forbidden ingredient." },

  /* ---- Sweets & snacks ---- */
  { id: "marshmallow", name: "Marshmallows, gummy sweets", category: "Sweets & snacks", ruling: "mushbooh", why: "Almost always contain gelatine — only halal-certified or fish/beef gelatine versions are safe." },
  { id: "choc-liqueur", name: "Chocolate with liqueur filling", category: "Sweets & snacks", ruling: "haram", why: "Contains added alcohol as an intoxicant." },
  { id: "crisps", name: "Flavoured crisps / chips", category: "Sweets & snacks", ruling: "mushbooh", why: "Flavourings may use pork enzymes, non-zabiha chicken fat or E631." },
  { id: "icecream", name: "Ice cream", category: "Sweets & snacks", ruling: "mushbooh", why: "Check for gelatine, E471 and alcohol-based flavours." },

  /* ---- Medicine & cosmetics ---- */
  { id: "gel-capsule", name: "Gelatine capsules in medicine", category: "Medicine & cosmetics", ruling: "mushbooh", why: "Ask for a halal-certified or vegetarian capsule; if no alternative exists, necessity (darura) permits it.", evidence: "Qur'an 2:173" },
  { id: "insulin", name: "Porcine insulin / porcine heparin", category: "Medicine & cosmetics", ruling: "mushbooh", why: "Forbidden in principle, permitted under medical necessity when no alternative exists." },
  { id: "vaccine", name: "Vaccines", category: "Medicine & cosmetics", ruling: "halal", why: "Major fatwa councils permit vaccination; any porcine trace is transformed and covered by necessity." },
  { id: "alcohol-sanitiser", name: "Alcohol hand sanitiser and perfume", category: "Medicine & cosmetics", ruling: "halal", why: "Isopropyl/ethanol used externally is not the drinking khamr and is permitted by the majority for cleaning and scent." },
  { id: "collagen", name: "Collagen supplements", category: "Medicine & cosmetics", ruling: "mushbooh", why: "Usually bovine or porcine; marine collagen is safe." },
  { id: "lipstick", name: "Lipstick and cosmetics with carmine/tallow", category: "Medicine & cosmetics", ruling: "mushbooh", why: "Check for carmine (E120), tallow and pork-derived stearic acid." },

  /* ---- Money & work ---- */
  { id: "riba", name: "Interest (riba) on loans and savings", category: "Money & work", ruling: "haram", why: "Allah has permitted trade and forbidden interest.", evidence: "Qur'an 2:275" },
  { id: "conventional-mortgage", name: "Conventional interest mortgage", category: "Money & work", ruling: "haram", why: "Interest-based debt; use ijara/murabaha home finance instead." },
  { id: "islamic-finance", name: "Murabaha / ijara / musharaka finance", category: "Money & work", ruling: "halal", why: "Profit comes from a real asset and shared risk, not from lending money." },
  { id: "insurance", name: "Conventional insurance", category: "Money & work", ruling: "mushbooh", why: "Contains gharar and riba for many scholars; takaful is the agreed alternative. Compulsory cover is excused." },
  { id: "gambling", name: "Gambling, lottery, betting apps", category: "Money & work", ruling: "haram", why: "Maysir is named alongside khamr as filth of Satan's handiwork.", evidence: "Qur'an 5:90" },
  { id: "crypto-trading", name: "Cryptocurrency trading", category: "Money & work", ruling: "mushbooh", why: "Scholars differ; leveraged and speculative trading is closer to maysir. Avoid margin and interest-bearing staking." },
  { id: "stocks", name: "Shares in a halal business", category: "Money & work", ruling: "halal", why: "Permitted when the company's core activity and debt ratios pass shariah screening." },
  { id: "bribery", name: "Bribery, cheating in trade", category: "Money & work", ruling: "haram", why: "Curse of Allah is upon the one who bribes and the one bribed.", evidence: "Abu Dawud 3580" },
  { id: "selling-alcohol", name: "Working in a job selling alcohol or pork", category: "Money & work", ruling: "haram", why: "Assisting in what is forbidden is itself forbidden.", evidence: "Muslim 1598" },

  /* ---- Daily life ---- */
  { id: "music", name: "Instrumental music", category: "Daily life", ruling: "mushbooh", why: "Majority hold instruments impermissible; a minority permit music free of sin. Vocal nasheed and the daff are agreed upon." },
  { id: "silk-men", name: "Silk and gold for men", category: "Daily life", ruling: "haram", why: "Forbidden for the men of this ummah, permitted for the women.", evidence: "Tirmidhi 1720" },
  { id: "tattoo", name: "Permanent tattoos", category: "Daily life", ruling: "haram", why: "The one who tattoos and the one tattooed are cursed.", evidence: "Bukhari 5937" },
  { id: "smoking", name: "Smoking and vaping", category: "Daily life", ruling: "haram", why: "Proven self-harm; contemporary councils rule it forbidden.", evidence: "Qur'an 2:195" },
  { id: "images", name: "Photography of living beings", category: "Daily life", ruling: "halal", why: "Contemporary majority permit photographs for need and identification; three-dimensional idols remain forbidden." },
  { id: "dogs", name: "Keeping a dog", category: "Daily life", ruling: "mushbooh", why: "Permitted for guarding, farming and hunting; keeping one purely as a house pet reduces reward.", evidence: "Bukhari 5480" },
  { id: "chess", name: "Chess and video games", category: "Daily life", ruling: "mushbooh", why: "Permitted when free of gambling, images of shirk and neglect of salah; disliked or forbidden when they cause either." },
  { id: "free-mixing", name: "Free mixing and khalwa", category: "Daily life", ruling: "haram", why: "Being alone with a non-mahram is forbidden.", evidence: "Bukhari 5233" },
  { id: "backbiting", name: "Backbiting (gheebah)", category: "Daily life", ruling: "haram", why: "Compared in the Qur'an to eating the flesh of your dead brother.", evidence: "Qur'an 49:12" },
  { id: "organ-donation", name: "Organ donation", category: "Daily life", ruling: "mushbooh", why: "Permitted by most contemporary councils to save a life, with conditions; a minority prohibit it." },

  /* ---- Fruits ---- every pure fruit is halal and tayyib ---- */
  { id: "dates", name: "Dates (khajoor)", category: "Fruits", ruling: "halal", ur: "کھجور", why: "The beloved Sunnah fruit; the Prophet ﷺ broke his fast with dates.", urWhy: "پسندیدہ سنت پھل؛ نبی ﷺ کھجور سے افطار فرماتے تھے۔", evidence: "Bukhari 1957" },
  { id: "fig", name: "Fig (anjeer)", category: "Fruits", ruling: "halal", ur: "انجیر", why: "Allah swears by the fig in the Qur'an.", urWhy: "اللہ نے قرآن میں انجیر کی قسم کھائی۔", evidence: "Qur'an 95:1" },
  { id: "olive", name: "Olive (zaitoon)", category: "Fruits", ruling: "halal", ur: "زیتون", why: "A blessed tree praised in the Qur'an.", urWhy: "قرآن میں مبارک درخت قرار پایا۔", evidence: "Qur'an 24:35" },
  { id: "pomegranate", name: "Pomegranate (anaar)", category: "Fruits", ruling: "halal", ur: "انار", why: "Named among the fruits of Paradise.", urWhy: "جنت کے پھلوں میں شمار ہوا۔", evidence: "Qur'an 55:68" },
  { id: "grapes", name: "Grapes (angoor)", category: "Fruits", ruling: "halal", ur: "انگور", why: "A fruit Allah caused to grow for mankind.", urWhy: "اللہ نے انسانوں کے لیے اگایا۔", evidence: "Qur'an 80:28" },
  { id: "banana", name: "Banana (kela)", category: "Fruits", ruling: "halal", ur: "کیلا", why: "Mentioned among the blessings of Paradise (talh mandud).", urWhy: "جنت کی نعمتوں میں ذکر ہوا۔", evidence: "Qur'an 56:29" },
  { id: "apple", name: "Apple (seb)", category: "Fruits", ruling: "halal", ur: "سیب", why: "Pure fruit — halal and wholesome." },
  { id: "mango", name: "Mango (aam)", category: "Fruits", ruling: "halal", ur: "آم", why: "Pure fruit — halal and wholesome." },
  { id: "orange", name: "Orange, tangerine (santra)", category: "Fruits", ruling: "halal", ur: "سنترہ", why: "Pure fruit — halal and wholesome." },
  { id: "watermelon", name: "Watermelon (tarbooz)", category: "Fruits", ruling: "halal", ur: "تربوز", why: "The Prophet ﷺ ate watermelon with fresh dates.", urWhy: "نبی ﷺ نے تربوز تازہ کھجور کے ساتھ کھایا۔", evidence: "Abu Dawud 3835" },
  { id: "melon", name: "Melon (kharbooza)", category: "Fruits", ruling: "halal", ur: "خربوزہ", why: "Pure fruit — halal and wholesome." },
  { id: "pineapple", name: "Pineapple (ananas)", category: "Fruits", ruling: "halal", ur: "انناس", why: "Pure fruit — halal and wholesome." },
  { id: "papaya", name: "Papaya (papeeta)", category: "Fruits", ruling: "halal", ur: "پپیتا", why: "Pure fruit — halal and wholesome." },
  { id: "guava", name: "Guava (amrood)", category: "Fruits", ruling: "halal", ur: "امرود", why: "Pure fruit — halal and wholesome." },
  { id: "pear", name: "Pear (nashpati)", category: "Fruits", ruling: "halal", ur: "ناشپاتی", why: "Pure fruit — halal and wholesome." },
  { id: "peach", name: "Peach (aaru)", category: "Fruits", ruling: "halal", ur: "آڑو", why: "Pure fruit — halal and wholesome." },
  { id: "plum", name: "Plum (aaloo bukhara)", category: "Fruits", ruling: "halal", ur: "آلو بخارا", why: "Pure fruit — halal and wholesome." },
  { id: "apricot", name: "Apricot (khobani)", category: "Fruits", ruling: "halal", ur: "خوبانی", why: "Pure fruit — halal and wholesome." },
  { id: "cherry", name: "Cherry", category: "Fruits", ruling: "halal", ur: "چیری", why: "Pure fruit — halal and wholesome." },
  { id: "strawberry", name: "Strawberry", category: "Fruits", ruling: "halal", ur: "اسٹرابیری", why: "Pure fruit — halal and wholesome." },
  { id: "blueberry", name: "Blueberry, raspberry, blackberry", category: "Fruits", ruling: "halal", ur: "بیریاں", why: "All berries are pure and halal." },
  { id: "kiwi", name: "Kiwi fruit", category: "Fruits", ruling: "halal", ur: "کیوی", why: "Pure fruit — halal and wholesome." },
  { id: "coconut", name: "Coconut (nariyal)", category: "Fruits", ruling: "halal", ur: "ناریل", why: "Pure fruit — halal and wholesome." },
  { id: "lemon", name: "Lemon, lime (leemu)", category: "Fruits", ruling: "halal", ur: "لیموں", why: "Pure fruit — halal and wholesome." },
  { id: "lychee", name: "Lychee", category: "Fruits", ruling: "halal", ur: "لیچی", why: "Pure fruit — halal and wholesome." },
  { id: "jackfruit", name: "Jackfruit (kathal)", category: "Fruits", ruling: "halal", ur: "کٹھل", why: "Pure fruit — halal and wholesome." },
  { id: "durian", name: "Durian", category: "Fruits", ruling: "halal", ur: "ڈورین", why: "Strong smell but pure and halal." },
  { id: "persimmon", name: "Persimmon (japani phal)", category: "Fruits", ruling: "halal", ur: "جاپانی پھل", why: "Pure fruit — halal and wholesome." },
  { id: "mulberry", name: "Mulberry (shahtoot)", category: "Fruits", ruling: "halal", ur: "شہتوت", why: "Pure fruit — halal and wholesome." },
  { id: "avocado", name: "Avocado", category: "Fruits", ruling: "halal", ur: "ایوکاڈو", why: "Pure fruit — halal and wholesome." },
  { id: "quince", name: "Quince (safarjal)", category: "Fruits", ruling: "halal", ur: "بہی / سفرجل", why: "The Prophet ﷺ praised quince for strengthening the heart.", urWhy: "نبی ﷺ نے سفرجل کو دل کے لیے مفید فرمایا۔", evidence: "Ibn Majah 3453" },

  /* ---- Vegetables, grains, nuts & seeds ---- */
  { id: "onion", name: "Onion (pyaaz)", category: "Vegetables & grains", ruling: "halal", ur: "پیاز", why: "Halal; going to the masjid with its smell on the breath is disliked.", urWhy: "حلال؛ مگر بدبو دار حالت میں مسجد جانا مکروہ ہے۔", evidence: "Bukhari 5452" },
  { id: "garlic", name: "Garlic (lehsan)", category: "Vegetables & grains", ruling: "halal", ur: "لہسن", why: "Halal; the Prophet ﷺ disliked only its smell before meeting people.", urWhy: "حلال؛ صرف لوگوں میں جانے سے پہلے اس کی بو مکروہ ہے۔", evidence: "Muslim 564" },
  { id: "ginger", name: "Ginger (adrak)", category: "Vegetables & grains", ruling: "halal", ur: "ادرک", why: "Pure and halal; Paradise's drink is flavoured with ginger.", urWhy: "حلال؛ جنت کا شربت زنجبیل کا ہوگا۔", evidence: "Qur'an 76:17" },
  { id: "tomato", name: "Tomato (tamatar)", category: "Vegetables & grains", ruling: "halal", ur: "ٹماٹر", why: "Pure vegetable — halal." },
  { id: "potato", name: "Potato (aaloo)", category: "Vegetables & grains", ruling: "halal", ur: "آلو", why: "Pure vegetable — halal." },
  { id: "carrot", name: "Carrot (gajar)", category: "Vegetables & grains", ruling: "halal", ur: "گاجر", why: "Pure vegetable — halal." },
  { id: "spinach", name: "Spinach (paalak)", category: "Vegetables & grains", ruling: "halal", ur: "پالک", why: "Pure vegetable — halal." },
  { id: "cabbage", name: "Cabbage (band gobhi)", category: "Vegetables & grains", ruling: "halal", ur: "بند گوبھی", why: "Pure vegetable — halal." },
  { id: "cauliflower", name: "Cauliflower (phool gobhi)", category: "Vegetables & grains", ruling: "halal", ur: "پھول گوبھی", why: "Pure vegetable — halal." },
  { id: "broccoli", name: "Broccoli", category: "Vegetables & grains", ruling: "halal", ur: "بروکلی", why: "Pure vegetable — halal." },
  { id: "peas", name: "Peas (matar)", category: "Vegetables & grains", ruling: "halal", ur: "مٹر", why: "Pure vegetable — halal." },
  { id: "beans", name: "Beans (sem, lobia)", category: "Vegetables & grains", ruling: "halal", ur: "سیم / لوبیا", why: "Pure vegetable — halal." },
  { id: "lentils", name: "Lentils (daal)", category: "Vegetables & grains", ruling: "halal", ur: "دالیں", why: "Pure legume — halal; a staple of the Prophets' simple food." },
  { id: "chickpeas", name: "Chickpeas (chana)", category: "Vegetables & grains", ruling: "halal", ur: "چنا", why: "Pure legume — halal." },
  { id: "okra", name: "Okra (bhindi)", category: "Vegetables & grains", ruling: "halal", ur: "بھنڈی", why: "Pure vegetable — halal." },
  { id: "eggplant", name: "Eggplant (baingan)", category: "Vegetables & grains", ruling: "halal", ur: "بینگن", why: "Pure vegetable — halal." },
  { id: "cucumber", name: "Cucumber (kheera)", category: "Vegetables & grains", ruling: "halal", ur: "کھیرا", why: "The Prophet ﷺ ate cucumber with fresh dates.", urWhy: "نبی ﷺ کھیرا تازہ کھجور کے ساتھ کھاتے تھے۔", evidence: "Muslim 2044" },
  { id: "pumpkin", name: "Pumpkin (kaddu)", category: "Vegetables & grains", ruling: "halal", ur: "کدو", why: "The Prophet ﷺ loved pumpkin and ate it with bread.", urWhy: "نبی ﷺ کو کدو بہت پسند تھا۔", evidence: "Tirmidhi 1849" },
  { id: "radish", name: "Radish (mooli)", category: "Vegetables & grains", ruling: "halal", ur: "مولی", why: "Pure vegetable — halal." },
  { id: "turnip", name: "Turnip (shaljam)", category: "Vegetables & grains", ruling: "halal", ur: "شلجم", why: "Pure vegetable — halal." },
  { id: "beetroot", name: "Beetroot (chuqandar)", category: "Vegetables & grains", ruling: "halal", ur: "چقندر", why: "Pure vegetable — halal." },
  { id: "pepper", name: "Bell pepper, chili (shimla mirch)", category: "Vegetables & grains", ruling: "halal", ur: "شملہ مرچ", why: "Pure vegetable — halal." },
  { id: "corn", name: "Corn, maize (makai)", category: "Vegetables & grains", ruling: "halal", ur: "مکئی", why: "Pure grain — halal." },
  { id: "zucchini", name: "Zucchini, courgette (tori)", category: "Vegetables & grains", ruling: "halal", ur: "توری / زوکینی", why: "Pure vegetable — halal." },
  { id: "mushroom", name: "Mushroom (khumbi)", category: "Vegetables & grains", ruling: "halal", ur: "کھمبی", why: "Truffle and mushroom were described as a cure for the eyes.", urWhy: "کھمبی آنکھوں کے لیے شفا قرار پائی۔", evidence: "Muslim 2049" },
  { id: "wheat", name: "Wheat (gehun)", category: "Vegetables & grains", ruling: "halal", ur: "گندم", why: "Pure grain — halal." },
  { id: "rice", name: "Rice (chawal)", category: "Vegetables & grains", ruling: "halal", ur: "چاول", why: "Pure grain — halal." },
  { id: "barley", name: "Barley (jau)", category: "Vegetables & grains", ruling: "halal", ur: "جو", why: "A Sunnah grain; the Prophet's household often ate barley bread.", urWhy: "سنت غذا؛ نبی ﷺ کے گھر میں جو کی روٹی عام تھی۔", evidence: "Bukhari 5416" },
  { id: "oats", name: "Oats (jae)", category: "Vegetables & grains", ruling: "halal", ur: "جئی", why: "Pure grain — halal." },
  { id: "millet", name: "Millet (bajra)", category: "Vegetables & grains", ruling: "halal", ur: "باجرا", why: "Pure grain — halal." },
  { id: "quinoa", name: "Quinoa", category: "Vegetables & grains", ruling: "halal", ur: "کوینوا", why: "Pure seed — halal." },
  { id: "almonds", name: "Almonds (badam)", category: "Vegetables & grains", ruling: "halal", ur: "بادام", why: "Pure nut — halal." },
  { id: "walnuts", name: "Walnuts (akhrot)", category: "Vegetables & grains", ruling: "halal", ur: "اخروٹ", why: "Pure nut — halal." },
  { id: "pistachios", name: "Pistachios (pista)", category: "Vegetables & grains", ruling: "halal", ur: "پستہ", why: "Pure nut — halal." },
  { id: "cashews", name: "Cashews (kaju)", category: "Vegetables & grains", ruling: "halal", ur: "کاجو", why: "Pure nut — halal." },
  { id: "peanuts", name: "Peanuts (moong phali)", category: "Vegetables & grains", ruling: "halal", ur: "مونگ پھلی", why: "Pure nut — halal." },
  { id: "sesame", name: "Sesame seeds (til)", category: "Vegetables & grains", ruling: "halal", ur: "تل", why: "Pure seed — halal." },

  /* ---- Dairy & eggs ---- */
  { id: "milk", name: "Milk (doodh)", category: "Dairy & eggs", ruling: "halal", ur: "دودھ", why: "Pure milk is named among the rivers of Paradise.", urWhy: "جنت کی نہروں میں خالص دودھ کا ذکر ہے۔", evidence: "Qur'an 47:15" },
  { id: "butter", name: "Butter (makkhan)", category: "Dairy & eggs", ruling: "halal", ur: "مکھن", why: "Halal when made from pure milk without doubtful additives." },
  { id: "ghee", name: "Ghee (desi ghee)", category: "Dairy & eggs", ruling: "halal", ur: "دیسی گھی", why: "Clarified butter from halal milk is pure." },
  { id: "yogurt", name: "Yogurt (dahi)", category: "Dairy & eggs", ruling: "halal", ur: "دہی", why: "Halal; check fruit flavours for gelatine and cochineal." },
  { id: "cheese", name: "Cheese (paneer, processed cheese)", category: "Dairy & eggs", ruling: "mushbooh", ur: "پنیر / چیز", why: "Halal with microbial or vegetarian rennet; verify animal rennet." , aka: ["rennet"]},
  { id: "cream", name: "Cream (malai)", category: "Dairy & eggs", ruling: "halal", ur: "ملائی", why: "Halal from pure milk." },
  { id: "eggs", name: "Chicken eggs (ande)", category: "Dairy & eggs", ruling: "halal", ur: "انڈے", why: "Eggs of halal birds are halal." },
  { id: "duck-eggs", name: "Duck and quail eggs", category: "Dairy & eggs", ruling: "halal", ur: "بطخ اور بٹیر کے انڈے", why: "Eggs of halal birds are halal." },
  { id: "kefir", name: "Kefir", category: "Dairy & eggs", ruling: "mushbooh", ur: "کیفیر", why: "Fermented milk; trace alcohol can rise — check the brand." },

  /* ---- Birds ---- halal birds need valid slaughter; taloned birds of prey are haram ---- */
  { id: "chicken", name: "Chicken (murghi)", category: "Birds", ruling: "halal", ur: "مرغی", why: "Halal with valid zabiha slaughter.", urWhy: "صحیح ذبیحہ کے ساتھ حلال۔" },
  { id: "duck", name: "Duck (batakh)", category: "Birds", ruling: "halal", ur: "بطخ", why: "A grain-eating bird; halal with slaughter." },
  { id: "turkey", name: "Turkey", category: "Birds", ruling: "halal", ur: "ٹرکی", why: "Halal with slaughter." },
  { id: "quail", name: "Quail (batair)", category: "Birds", ruling: "halal", ur: "بٹیر", why: "Sent as food to Bani Isra'il with the mann.", urWhy: "بنی اسرائیل پر من و سلویٰ کے ساتھ اترا۔", evidence: "Qur'an 2:57" },
  { id: "pigeon", name: "Pigeon, dove (kabootar)", category: "Birds", ruling: "halal", ur: "کبوتر", why: "A grain-eating bird; halal with slaughter." },
  { id: "sparrow", name: "Sparrow (chidiya)", category: "Birds", ruling: "halal", ur: "چڑیا", why: "Small grain-eating bird; permitted by the majority with slaughter." },
  { id: "partridge", name: "Partridge, pheasant (teetar)", category: "Birds", ruling: "halal", ur: "تیتر", why: "Game birds; halal with slaughter or hunting by a trained animal.", evidence: "Qur'an 5:4" },
  { id: "goose", name: "Goose, swan", category: "Birds", ruling: "halal", ur: "ہنس", why: "Water birds that eat grain; halal with slaughter." },
  { id: "ostrich", name: "Ostrich (shutar murgh)", category: "Birds", ruling: "halal", ur: "شتر مرغ", why: "Not a bird of prey; halal by the majority with slaughter." },
  { id: "peacock", name: "Peacock (mor)", category: "Birds", ruling: "mushbooh", ur: "مور", why: "Permitted by the majority as it is not taloned; some scholars avoid it." },
  { id: "parrot", name: "Parrot (tota)", category: "Birds", ruling: "halal", ur: "طوطا", why: "Eats grain and fruit, has no talons; permitted by the majority." },
  { id: "eagle", name: "Eagle, hawk, falcon (uqaab, baaz)", category: "Birds", ruling: "haram", ur: "عقاب / باز", why: "Every bird with talons is forbidden.", urWhy: "ہر پنجے والا پرندہ حرام ہے۔", evidence: "Muslim 1934" },
  { id: "owl", name: "Owl (ulloo)", category: "Birds", ruling: "haram", ur: "الو", why: "A taloned night hunter — forbidden.", evidence: "Muslim 1934" },
  { id: "vulture", name: "Vulture, condor (gidh)", category: "Birds", ruling: "haram", ur: "گدھ", why: "Feeds on carrion and hunts with talons — forbidden." },
  { id: "crow", name: "Crow (kauwa)", category: "Birds", ruling: "haram", ur: "کوا", why: "Named among the five harmful creatures that may be killed — not eaten.", urWhy: "پانچ فواسق میں شمار — کھانا حرام۔", evidence: "Bukhari 3315" },
  { id: "bat", name: "Bat (chamgadar)", category: "Birds", ruling: "haram", ur: "چمگادڑ", why: "A fanged night creature — forbidden by the majority." },
  { id: "heron", name: "Heron, stork, crane", category: "Birds", ruling: "mushbooh", ur: "بگلا / سارس", why: "Wading birds with spear-like beaks; scholars differ — follow your madhhab." },

  /* ---- Land animals ---- */
  { id: "cow", name: "Cow, ox (gaaye)", category: "Land animals", ruling: "halal", ur: "گائے", why: "Halal with valid slaughter.", urWhy: "صحیح ذبیحہ کے ساتھ حلال۔" },
  { id: "goat", name: "Goat (bakri)", category: "Land animals", ruling: "halal", ur: "بکری", why: "Halal with valid slaughter." },
  { id: "sheep", name: "Sheep, lamb (bher)", category: "Land animals", ruling: "halal", ur: "بھیڑ", why: "Halal with valid slaughter." },
  { id: "buffalo", name: "Buffalo (bhains)", category: "Land animals", ruling: "halal", ur: "بھینس", why: "Halal with valid slaughter." },
  { id: "camel", name: "Camel (oont)", category: "Land animals", ruling: "halal", ur: "اونٹ", why: "Explicitly permitted; wudu is renewed after eating it.", urWhy: "حلال؛ کھانے کے بعد وضو تجدید کریں۔", evidence: "Muslim 360" },
  { id: "deer", name: "Deer, gazelle, antelope (hiran)", category: "Land animals", ruling: "halal", ur: "ہرن / غزال", why: "Pure game animals — halal.", evidence: "Qur'an 5:96" },
  { id: "zebra", name: "Zebra, wild onager", category: "Land animals", ruling: "halal", ur: "زیبرا / گور خر", why: "The Companions ate wild donkey (onager) with the Prophet's approval.", urWhy: "صحابہ نے گور خر نبی ﷺ کی اجازت سے کھایا۔", evidence: "Bukhari 4218" },
  { id: "giraffe", name: "Giraffe (ziraafa)", category: "Land animals", ruling: "halal", ur: "زرافہ", why: "A grazing animal without fangs; permitted by the majority." },
  { id: "elephant", name: "Elephant (haathi)", category: "Land animals", ruling: "haram", ur: "ہاتھی", why: "Counted among fanged beasts — forbidden by the majority." },
  { id: "lion", name: "Lion, tiger, leopard, wolf (sher)", category: "Land animals", ruling: "haram", ur: "شیر / چیتا / بھیڑیا", why: "Every beast of prey with fangs is forbidden.", urWhy: "ہر ناخن دار درندہ حرام ہے۔", evidence: "Muslim 1932" },
  { id: "fox", name: "Fox (loomri)", category: "Land animals", ruling: "haram", ur: "لومڑی", why: "A fanged predator — forbidden." },
  { id: "bear", name: "Bear (bhalu)", category: "Land animals", ruling: "haram", ur: "بھالو", why: "A fanged predator — forbidden." },
  { id: "monkey", name: "Monkey, ape (bandar)", category: "Land animals", ruling: "haram", ur: "بندر", why: "Forbidden by the majority; its meat is repulsive (khabeeth).", evidence: "Qur'an 7:157" },
  { id: "rat", name: "Rat, mouse (chooha)", category: "Land animals", ruling: "haram", ur: "چوہا", why: "Among the harmful fawasiq — forbidden.", evidence: "Bukhari 3315" },
  { id: "snake", name: "Snake (saanp)", category: "Land animals", ruling: "haram", ur: "سانپ", why: "Harmful and commanded to be killed — not eaten.", evidence: "Bukhari 3297" },
  { id: "scorpion", name: "Scorpion (bichoo)", category: "Land animals", ruling: "haram", ur: "بچھو", why: "Among the harmful creatures — forbidden." },
  { id: "crocodile", name: "Crocodile, alligator (magarmach)", category: "Land animals", ruling: "haram", ur: "مگرمچ", why: "A fanged predator — forbidden." },
  { id: "hyena", name: "Hyena (lakkar bagga)", category: "Land animals", ruling: "mushbooh", ur: "لکڑ بگھا", why: "Eaten by some Arabs and permitted by Hanbalis; avoided by Hanafis." },
  { id: "squirrel", name: "Squirrel (gulahri)", category: "Land animals", ruling: "mushbooh", ur: "گلہری", why: "Scholars differ; many Hanafis permit it as a grazing animal." },
  { id: "lizard", name: "Dhabb lizard (goh)", category: "Land animals", ruling: "halal", ur: "گوہ / چھپکلی", why: "Eaten by the Arabs; the Prophet ﷺ did not eat it but did not forbid it.", urWhy: "نبی ﷺ نے خود نہ کھایا مگر حرام نہ فرمایا۔", evidence: "Bukhari 5391" },
  { id: "turtle", name: "Tortoise, turtle (kachwa)", category: "Land animals", ruling: "mushbooh", ur: "کچوا", why: "Amphibious creature; forbidden for Hanafis, permitted by some others." },
  { id: "hedgehog", name: "Hedgehog (sahi)", category: "Land animals", ruling: "mushbooh", ur: "ساہی / خارپشت", why: "Scholars differ; avoided by the majority." },
  { id: "donkey-pet", name: "Keeping animals kindly", category: "Land animals", ruling: "halal", ur: "جانوروں سے حسن سلوک", why: "Mercy to animals is worship; cruelty to a cat earned a woman Hell.", urWhy: "جانوروں پر رحم عبادت ہے۔", evidence: "Bukhari 2365" },

  /* ---- Insects & small creatures ---- */
  { id: "locust", name: "Locust (tiddi)", category: "Insects & small creatures", ruling: "halal", ur: "ٹڈی", why: "Explicitly permitted: 'Two dead things are halal for us: fish and locusts.'", urWhy: "مچھلی اور ٹڈی حلال قرار پائے۔", evidence: "Ibn Majah 3218" },
  { id: "bee", name: "Honey bee (shehad ki makhi)", category: "Insects & small creatures", ruling: "halal", ur: "شہد کی مکھی", why: "Not eaten, but its honey is a cure; killing it without cause is disliked.", urWhy: "اس کا شہد شفا ہے۔", evidence: "Qur'an 16:69" },
  { id: "ant", name: "Ant (chionti)", category: "Insects & small creatures", ruling: "haram", ur: "چیونٹی", why: "Not food; a Prophet was rebuked for burning an ant colony — do not harm without cause.", urWhy: "کھانا حرام؛ بے وجہ نقصان ممنوع۔", evidence: "Bukhari 3319" },
  { id: "fly", name: "Housefly (makkhi)", category: "Insects & small creatures", ruling: "haram", ur: "مکھی", why: "Not eaten; if it falls in a drink, dip it in — one wing carries the cure.", urWhy: "کھانا حرام؛ ایک پر میں شفا ہے۔", evidence: "Bukhari 3320" },
  { id: "cockroach", name: "Cockroach (tilchatta)", category: "Insects & small creatures", ruling: "haram", ur: "تل چٹا", why: "Filthy (khabeeth) — not eaten." },
  { id: "spider", name: "Spider (makri)", category: "Insects & small creatures", ruling: "haram", ur: "مکڑی", why: "Not eaten; killing it is permitted when harmful." },
  { id: "mosquito", name: "Mosquito (machhar)", category: "Insects & small creatures", ruling: "haram", ur: "مچھر", why: "Not food; Allah cites it as a sign of His power.", urWhy: "اللہ نے اسے اپنی قدرت کی نشانی بنایا۔", evidence: "Qur'an 2:26" },
  { id: "butterfly", name: "Butterfly, moth (titli)", category: "Insects & small creatures", ruling: "haram", ur: "تتلی", why: "Not food; leave it be — insects are not lawful game." },
  { id: "worm", name: "Worms, beetles, maggots (keere)", category: "Insects & small creatures", ruling: "haram", ur: "کیڑے مکوڑے", why: "Filthy and harmful — forbidden as food." },
  { id: "snail", name: "Snail (ghongha)", category: "Insects & small creatures", ruling: "mushbooh", ur: "گھونگھا", why: "Forbidden for Hanafis; some Maliki scholars permit land snails." },
  { id: "silkworm", name: "Silkworm (resham ka keera)", category: "Insects & small creatures", ruling: "halal", ur: "ریشم کا کیڑا", why: "Its silk is halal for women; the worm itself is not food." },

  /* ---- More seafood ---- */
  { id: "salmon", name: "Salmon, tuna, cod, sardine, mackerel", category: "Seafood", ruling: "halal", ur: "سامن / ٹونا وغیرہ", why: "All scaled fish are halal." },
  { id: "trout", name: "Trout, haddock, herring, anchovy", category: "Seafood", ruling: "halal", ur: "ٹراؤٹ وغیرہ", why: "All scaled fish are halal." },
  { id: "catfish", name: "Catfish (singhara)", category: "Seafood", ruling: "halal", ur: "سنگھارا مچھلی", why: "Halal by the majority as a true fish." },
  { id: "eel", name: "Eel (baam machhli)", category: "Seafood", ruling: "mushbooh", ur: "بام مچھلی", why: "Halal for most schools; some Hanafis avoid snake-like sea creatures." },
  { id: "shark", name: "Shark", category: "Seafood", ruling: "halal", ur: "شارک", why: "Counted as a fish by the majority — halal." },
  { id: "whale", name: "Whale", category: "Seafood", ruling: "mushbooh", ur: "وہیل", why: "Scholars differ whether sea mammals count as 'game of the sea'; avoid by caution.", evidence: "Qur'an 5:96" },
  { id: "dolphin", name: "Dolphin", category: "Seafood", ruling: "haram", ur: "ڈولفن", why: "A sea mammal, not a fish; forbidden by the majority." },
  { id: "seal", name: "Seal, walrus", category: "Seafood", ruling: "haram", ur: "مہر دار مچھلی / سیل", why: "Sea predators with fangs — forbidden by the majority." },
  { id: "shellfish", name: "Mussels, oysters, clams, scallops", category: "Seafood", ruling: "mushbooh", ur: "سیپیاں / کستورے", why: "Halal for Maliki/Shafi'i, not Hanafi — same ruling as crab." },
  { id: "jellyfish", name: "Jellyfish", category: "Seafood", ruling: "mushbooh", ur: "جیلی فش", why: "Not a fish; avoided by the majority." },
  { id: "caviar", name: "Caviar (fish eggs)", category: "Seafood", ruling: "halal", ur: "مچھلی کے انڈے", why: "Eggs of halal fish are halal." },
  { id: "sea-urchin", name: "Sea urchin, starfish, sea cucumber", category: "Seafood", ruling: "mushbooh", ur: "سمندری جونک", why: "Not fish; scholars differ — follow your madhhab." },

  /* ---- Branded & everyday foods people actually buy today ---- */
  { id: "oreo", name: "Oreo biscuits (India / EU / UK packs)", category: "Sweets & snacks", ruling: "halal", ur: "اوریو بسکٹ", why: "Indian, UK and EU Oreos are vegetarian: no animal fat, no pork gelatine, no alcohol. Check the pack sold in your country.", aka: ["Oreo cream biscuit"] },
  { id: "oreo-us", name: "Oreo variants with cream cheese / marshmallow filling", category: "Sweets & snacks", ruling: "mushbooh", ur: "اوریو کے خاص فلیور", why: "Limited-edition fillings can contain pork gelatine or animal-derived rennet. Read the label each time." },
  { id: "burger-outlet", name: "Beef burger from a certified halal outlet", category: "Meat & poultry", ruling: "halal", ur: "حلال سرٹیفائیڈ برگر", why: "Patty from zabiha meat, cooked on a pork-free grill, no bacon or alcohol-based sauce." },
  { id: "burger-uncertified", name: "Burger from a non-halal chain (beef/chicken)", category: "Meat & poultry", ruling: "mushbooh", ur: "غیر مصدقہ برگر", why: "The meat is usually not zabiha and the same grill handles bacon. Ask for certification before eating." },
  { id: "burger-pork", name: "Bacon burger, pepperoni burger, pork sausage patty", category: "Meat & poultry", ruling: "haram", ur: "بیکن برگر", why: "Contains pork in the patty or topping — forbidden outright." },
  { id: "mcd-india", name: "McDonald's India chicken & veg items", category: "Meat & poultry", ruling: "halal", ur: "میکڈونلڈ انڈیا", why: "McDonald's India sources halal-certified chicken and serves no pork; separate veg and non-veg lines." },
  { id: "kfc-india", name: "KFC India fried chicken", category: "Meat & poultry", ruling: "halal", ur: "کے ایف سی انڈیا", why: "KFC India uses halal-certified chicken suppliers. Outside India, verify locally." },
  { id: "dominos-cheese", name: "Domino's / Pizza Hut cheese pizza (India)", category: "Sweets & snacks", ruling: "halal", ur: "چیز پیزا", why: "Indian outlets use microbial-rennet cheese and halal chicken toppings; avoid pepperoni and salami." },
  { id: "pepperoni-pizza", name: "Pepperoni / salami / ham pizza", category: "Meat & poultry", ruling: "haram", ur: "پیپرونی پیزا", why: "Pepperoni, salami and ham are pork products." },
  { id: "shawarma", name: "Shawarma, kebab roll, biryani from a halal kitchen", category: "Meat & poultry", ruling: "halal", ur: "شوارما / کباب", why: "Halal when the meat is zabiha and no alcohol or pork enters the sauce." },
  { id: "cadbury-dairymilk", name: "Cadbury Dairy Milk (India)", category: "Sweets & snacks", ruling: "halal", ur: "کیڈبری ڈیری ملک", why: "Indian Dairy Milk is vegetarian — milk solids and cocoa, no gelatine or alcohol flavouring." },
  { id: "kitkat", name: "Nestlé KitKat (India)", category: "Sweets & snacks", ruling: "halal", ur: "کٹ کیٹ", why: "Indian KitKat is vegetarian; some export versions differ, so check the wrapper." },
  { id: "snickers", name: "Snickers, Mars, Bounty, Twix", category: "Sweets & snacks", ruling: "mushbooh", ur: "سنیکرز / مارس", why: "Chocolate is fine, but whey and emulsifiers can be animal-derived and some batches use alcohol-based flavour carriers. Prefer certified packs." },
  { id: "ferrero", name: "Ferrero Rocher, Nutella", category: "Sweets & snacks", ruling: "halal", ur: "فریرو روشے / نیوٹیلا", why: "Plant oils, cocoa, milk and hazelnut — no animal fat or alcohol in the standard recipe." },
  { id: "lindt-liqueur", name: "Liqueur-filled or rum-truffle chocolates", category: "Sweets & snacks", ruling: "haram", ur: "شراب والی چاکلیٹ", why: "Contains actual liquor as filling.", evidence: "Qur'an 5:90" },
  { id: "haribo", name: "Haribo / gummy bears / marshmallows (standard)", category: "Sweets & snacks", ruling: "haram", ur: "جیلی / مارش میلو", why: "Standard gummies and marshmallows use pork gelatine. Only halal- or beef-gelatine-certified versions are permitted.", aka: ["gelatine", "E441"] },
  { id: "haribo-halal", name: "Halal-certified gummies (beef or pectin based)", category: "Sweets & snacks", ruling: "halal", ur: "حلال جیلی", why: "Pectin, starch or zabiha beef gelatine — clearly certified on the pack." },
  { id: "lays", name: "Lay's, Kurkure, Bingo, Pringles (veg flavours, India)", category: "Sweets & snacks", ruling: "halal", ur: "چپس", why: "Potato, oil and spices; Indian packs are marked vegetarian with a green dot." },
  { id: "chips-meat-flavour", name: "Bacon, ham or 'meat-flavour' chips", category: "Sweets & snacks", ruling: "mushbooh", ur: "گوشت کے فلیور والے چپس", why: "Flavouring may come from real pork or non-zabiha meat extract; avoid unless certified." },
  { id: "maggi", name: "Maggi noodles, Yippee, Top Ramen (veg masala)", category: "Ingredients", ruling: "halal", ur: "میگی نوڈلز", why: "Wheat, palm oil and vegetarian masala; chicken variants need halal certification." },
  { id: "cola", name: "Coca-Cola, Pepsi, Sprite, Thums Up", category: "Drinks", ruling: "halal", ur: "کولا مشروبات", why: "Carbonated water, sugar and flavouring — no intoxicant.", aka: ["soft drink"] },
  { id: "icecream-brands", name: "Amul, Kwality Wall's, Baskin-Robbins (veg-marked)", category: "Dairy & eggs", ruling: "halal", ur: "آئس کریم", why: "Green-dot vegetarian ice creams use no gelatine or animal fat; avoid rum-raisin and liqueur flavours." },
  { id: "protein-bar", name: "Protein bars, whey protein powders", category: "Ingredients", ruling: "mushbooh", ur: "پروٹین بار / وہے", why: "Whey may use animal rennet and collagen may be porcine; buy halal-certified sports nutrition." },
  { id: "cheese-rennet", name: "Cheese with unspecified rennet (pizza, burgers, sandwiches)", category: "Dairy & eggs", ruling: "mushbooh", ur: "رینٹ والا پنیر", why: "Halal if rennet is microbial, plant or from zabiha calf; doubtful when unlabelled." },
  { id: "sushi-mirin", name: "Sushi and East-Asian dishes with mirin, sake or rice wine", category: "Ingredients", ruling: "haram", ur: "مرین / سیک", why: "These are alcoholic cooking wines added to the finished dish.", evidence: "Qur'an 5:90" },
  { id: "kimchi-fishsauce", name: "Kimchi, fish sauce, oyster sauce", category: "Ingredients", ruling: "mushbooh", ur: "مچھلی/سیپ کا ساس", why: "Fish sauce is halal; oyster sauce follows the shellfish disagreement, and some blends add rice wine." },
  { id: "worcestershire", name: "Worcestershire sauce, some soy sauces", category: "Ingredients", ruling: "mushbooh", ur: "ورسسٹر شائر ساس", why: "Traditionally brewed with alcohol or anchovy in vinegar; choose naturally brewed alcohol-free versions." },
  { id: "shellac", name: "Shellac / confectioner's glaze on candies and pills", category: "Food additives (E-numbers)", ruling: "mushbooh", ur: "شیلک", why: "Insect resin — permitted by many, avoided by the cautious.", aka: ["E904"] },
];


export const RULING_ORDER: Ruling[] = ["halal", "mushbooh", "haram"];
