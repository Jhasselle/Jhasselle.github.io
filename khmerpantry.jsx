import React, { useState, useMemo, useEffect } from "react";

/* =============================================================
   KHMER PANTRY  ·  ម្ហូបខ្មែរ
   Recipes researched from Khmer-language sources:
   choukhmer.wordpress.com, km.wikipedia.org, jongphov.com,
   khmerfoodrecipes.blogspot.com, kampucheathmey.com,
   thmeythmey.com, eangsophalleth.com, and more.
   ============================================================= */

/* ---------- INGREDIENT MASTER LIST ---------- */
/* Each ingredient: id, en (English), km (Khmer), category, aliases */
const INGREDIENTS = {
  // Proteins
  chicken:      { en: "Chicken",        km: "សាច់មាន់",        cat: "Protein",  aliases: ["chicken thigh","chicken breast"] },
  beef:         { en: "Beef",           km: "សាច់គោ",          cat: "Protein",  aliases: ["beef sirloin","beef tenderloin","steak"] },
  pork:         { en: "Pork",           km: "សាច់ជ្រូក",        cat: "Protein",  aliases: ["pork loin","pork shoulder"] },
  pork_belly:   { en: "Pork belly",     km: "សាច់ជ្រូកបីជាន់",  cat: "Protein",  aliases: ["3-layer pork","streaky pork"] },
  pork_ribs:    { en: "Pork ribs",      km: "ឆ្អឹងជំនីជ្រូក",     cat: "Protein",  aliases: ["spare ribs"] },
  fish:         { en: "Fish (firm white)", km: "ត្រី",        cat: "Protein",  aliases: ["snakehead","catfish","tilapia","trei ros","barramundi"] },
  shrimp:       { en: "Shrimp",         km: "បង្គា",            cat: "Protein",  aliases: ["prawn"] },
  egg:          { en: "Egg",            km: "ពងមាន់",          cat: "Protein",  aliases: ["chicken egg","duck egg"] },

  // Khmer aromatics — the heart of "kroeung"
  lemongrass:   { en: "Lemongrass",     km: "ស្លឹកគ្រៃ",         cat: "Aromatic", aliases: ["lemon grass"] },
  galangal:     { en: "Galangal",       km: "រំដេង",            cat: "Aromatic", aliases: ["khmer ginger","blue ginger"] },
  turmeric:     { en: "Fresh turmeric", km: "រមៀត",             cat: "Aromatic", aliases: ["yellow ginger","turmeric root"] },
  kaffir_leaf:  { en: "Kaffir lime leaves", km: "ស្លឹកក្រូចសើច",  cat: "Aromatic", aliases: ["makrut lime leaf"] },
  kaffir_peel:  { en: "Kaffir lime peel", km: "សំបកក្រូចសើច",   cat: "Aromatic", aliases: [] },
  garlic:       { en: "Garlic",         km: "ខ្ទឹមស",            cat: "Aromatic", aliases: [] },
  shallot:      { en: "Shallot",        km: "ខ្ទឹមក្រហម",        cat: "Aromatic", aliases: ["red onion","asian shallot"] },
  ginger:       { en: "Ginger",         km: "ខ្ញី",             cat: "Aromatic", aliases: [] },
  krachai:      { en: "Krachai (finger root)", km: "ខ្ជាយ",     cat: "Aromatic", aliases: ["fingerroot","wild ginger"] },
  chili_fresh:  { en: "Fresh chili",    km: "ម្ទេស",            cat: "Aromatic", aliases: ["bird's eye chili","thai chili"] },
  chili_dried:  { en: "Dried chili",    km: "ម្ទេសក្រៀម",       cat: "Aromatic", aliases: ["chili dry"] },

  // Pantry staples
  fish_sauce:   { en: "Fish sauce",     km: "ទឹកត្រី",           cat: "Pantry",   aliases: ["nuoc mam","tuk trei"] },
  soy_sauce:    { en: "Soy sauce",      km: "ទឹកស៊ីអ៊ីវ",         cat: "Pantry",   aliases: ["light soy"] },
  oyster_sauce: { en: "Oyster sauce",   km: "ប្រេងខ្យង",         cat: "Pantry",   aliases: [] },
  prahok:       { en: "Prahok (fermented fish)", km: "ប្រហុក", cat: "Pantry",   aliases: ["fermented fish paste"] },
  kapi:         { en: "Shrimp paste (kapi)", km: "កាពិ",        cat: "Pantry",   aliases: ["fermented shrimp paste"] },
  tamarind:     { en: "Tamarind",       km: "អំពិលទុំ",         cat: "Pantry",   aliases: ["tamarind paste","ripe tamarind"] },
  coconut_milk: { en: "Coconut milk",   km: "ខ្ទិះដូង",          cat: "Pantry",   aliases: ["coconut cream"] },
  palm_sugar:   { en: "Palm sugar",     km: "ស្ករត្នោត",         cat: "Pantry",   aliases: [] },
  sugar:        { en: "Sugar",          km: "ស្ករស",            cat: "Pantry",   aliases: ["white sugar","granulated sugar"] },
  salt:         { en: "Salt",           km: "អំបិល",            cat: "Pantry",   aliases: [] },
  msg:          { en: "MSG (bicheng)",  km: "ប៊ីចេង",            cat: "Pantry",   aliases: ["accent","aji-no-moto"] },
  oil:          { en: "Cooking oil",    km: "ប្រេងឆា",           cat: "Pantry",   aliases: ["vegetable oil","neutral oil"] },
  pepper:       { en: "Black pepper",   km: "ម្រេច",            cat: "Pantry",   aliases: ["kampot pepper"] },
  cornstarch:   { en: "Cornstarch / soup powder", km: "ម្សៅស៊ុប", cat: "Pantry", aliases: ["potato starch","tapioca flour"] },
  rice:         { en: "Jasmine rice",   km: "បាយ",              cat: "Pantry",   aliases: ["white rice"] },
  rice_powder:  { en: "Roasted rice powder", km: "អង្ករលីង",   cat: "Pantry",   aliases: ["khao kua"] },
  noodles:      { en: "Khmer rice noodles (num banh chok)", km: "នំបញ្ចុក", cat: "Pantry", aliases: ["rice vermicelli","fresh rice noodles"] },
  honey:        { en: "Honey",          km: "ទឹកឃ្មុំ",          cat: "Pantry",   aliases: [] },

  // Veg & herbs
  tomato:       { en: "Tomato",         km: "ប៉េងប៉ោះ",          cat: "Vegetable", aliases: [] },
  cucumber:     { en: "Cucumber",       km: "ត្រសក់",            cat: "Vegetable", aliases: [] },
  lettuce:      { en: "Lettuce",        km: "សាឡាដ",            cat: "Vegetable", aliases: ["salad greens"] },
  onion:        { en: "Onion",          km: "ខ្ទឹមបារាំង",        cat: "Vegetable", aliases: ["yellow onion"] },
  cabbage:      { en: "Cabbage",        km: "ស្ពៃក្ដោប",         cat: "Vegetable", aliases: [] },
  long_beans:   { en: "Long beans",     km: "សណ្ដែកគួរ",         cat: "Vegetable", aliases: ["yard-long beans"] },
  bean_sprouts: { en: "Bean sprouts",   km: "សណ្ដែកបណ្ដុះ",      cat: "Vegetable", aliases: [] },
  morning_glory:{ en: "Morning glory",  km: "ត្រកួន",            cat: "Vegetable", aliases: ["water spinach","ong choy","kang kung"] },
  eggplant_long:{ en: "Long eggplant",  km: "ត្រប់វែង",          cat: "Vegetable", aliases: ["asian eggplant"] },
  eggplant_round:{en: "Round eggplant", km: "ត្រប់ស្រួយ",        cat: "Vegetable", aliases: ["thai eggplant"] },
  green_papaya: { en: "Green papaya",   km: "ល្ហុងខ្ចី",          cat: "Vegetable", aliases: [] },
  pumpkin:      { en: "Pumpkin",        km: "ល្ពៅ",              cat: "Vegetable", aliases: ["winter squash","kabocha"] },
  banana_flower:{ en: "Banana blossom", km: "ត្រួយចេក",          cat: "Vegetable", aliases: ["banana flower"] },
  banana_green: { en: "Green banana",   km: "ចេកខ្ចី",           cat: "Vegetable", aliases: ["unripe banana"] },
  pineapple:    { en: "Pineapple",      km: "ម្នាស់",            cat: "Vegetable", aliases: [] },
  lime:         { en: "Lime",           km: "ក្រូចឆ្មា",         cat: "Vegetable", aliases: ["lemon"] },
  carrot:       { en: "Carrot",         km: "ការ៉ុត",            cat: "Vegetable", aliases: [] },
  bell_pepper:  { en: "Bell pepper",    km: "ម្ទេសប្លោក",         cat: "Vegetable", aliases: ["sweet pepper","capsicum"] },
  taro_stem:    { en: "Taro stem",      km: "ភ្លៅកែប",           cat: "Vegetable", aliases: [] },

  // Herbs & leaves
  cilantro:     { en: "Cilantro",       km: "ជីវ៉ាន់ស៊ុយ",        cat: "Herb",      aliases: ["coriander leaves"] },
  green_onion:  { en: "Green onion",    km: "ស្លឹកខ្ទឹម",         cat: "Herb",      aliases: ["scallions","spring onion"] },
  holy_basil:   { en: "Holy basil",     km: "ម្អម",              cat: "Herb",      aliases: ["khmer basil"] },
  saw_coriander:{ en: "Sawtooth coriander", km: "ជីនាងវង",     cat: "Herb",      aliases: ["culantro","ngo gai"] },
  rice_paddy_herb:{en:"Rice paddy herb",km: "ជីសង្កើច",          cat: "Herb",      aliases: ["ngo om"] },
  moringa_leaf: { en: "Moringa leaves", km: "ស្លឹកម្រុំ",         cat: "Herb",      aliases: [] },
  bitter_leaf:  { en: "Bitter melon leaves", km: "ស្លឹកម្រះ",     cat: "Herb",      aliases: [] },
  basil_leaf:   { en: "Bass leaves",    km: "ស្លឹកបាស",          cat: "Herb",      aliases: ["bai bass"] },

  // Other
  peanut:       { en: "Peanuts",        km: "សណ្ដែកដី",          cat: "Pantry",    aliases: ["roasted peanuts"] },
  peppercorn:   { en: "Peppercorns (whole)", km: "ម្រេចគ្រាប់",   cat: "Pantry",    aliases: ["whole pepper","kampot pepper"] },
  rice_wine:    { en: "Rice wine",      km: "ស្រាស",            cat: "Pantry",    aliases: ["shaoxing wine","cooking wine"] },
  vinegar:      { en: "Vinegar",        km: "ទឹកខ្មេះ",          cat: "Pantry",    aliases: [] },

  // Additional ingredients for expanded recipe set
  mung_bean:    { en: "Mung beans",     km: "សណ្ដែកខៀវ",        cat: "Pantry",    aliases: ["green mung","split mung"] },
  sticky_rice:  { en: "Sticky rice",    km: "បាយដំណើប",         cat: "Pantry",    aliases: ["glutinous rice","sweet rice"] },
  rice_flour:   { en: "Rice flour",     km: "ម្សៅអង្ករ",         cat: "Pantry",    aliases: [] },
  daikon:       { en: "Daikon",         km: "ឆៃថាវ",            cat: "Vegetable", aliases: ["white radish","mooli"] },
  crab:         { en: "Crab",           km: "ក្ដាម",             cat: "Protein",   aliases: ["mud crab","blue crab","whole crab"] },
  squid:        { en: "Squid",          km: "មឹក",              cat: "Protein",   aliases: ["calamari"] },
  bitter_melon: { en: "Bitter melon",   km: "ម្រះ",              cat: "Vegetable", aliases: ["bitter gourd"] },
  green_mango:  { en: "Green mango",    km: "ស្វាយខ្ចី",          cat: "Vegetable", aliases: ["unripe mango"] },
  pandan:       { en: "Pandan leaves",  km: "ស្លឹកតើយ",          cat: "Aromatic",  aliases: ["screwpine"] },
  banana_leaf:  { en: "Banana leaf",    km: "ស្លឹកចេក",           cat: "Pantry",    aliases: [] },
  coconut_water:{ en: "Young coconut water", km: "ទឹកដូងខ្ចី",  cat: "Pantry",    aliases: [] },
  baguette:     { en: "Baguette",       km: "នំប៉័ង",             cat: "Pantry",    aliases: ["french bread","sub roll"] },
  pate:         { en: "Pâté",           km: "ប៉ាតេ",             cat: "Pantry",    aliases: ["liver pate"] },
  butter:       { en: "Butter",         km: "ប៊ឺ",                cat: "Pantry",    aliases: [] },
  potato:       { en: "Potato",         km: "ដំឡូងបារាំង",       cat: "Vegetable", aliases: [] },
  sweet_potato: { en: "Sweet potato",   km: "ដំឡូងជ្វា",          cat: "Vegetable", aliases: ["yam"] },
  mint:         { en: "Mint",           km: "ជី",                cat: "Herb",      aliases: ["spearmint"] },
  dried_shrimp: { en: "Dried shrimp",   km: "បង្គាក្រៀម",         cat: "Pantry",    aliases: [] },
  cardamom:     { en: "Cardamom pods",  km: "កក្ដាស",            cat: "Aromatic",  aliases: ["green cardamom"] },
  cinnamon:     { en: "Cinnamon stick", km: "ឈើឈ្នួន",          cat: "Aromatic",  aliases: [] },
  star_anise:   { en: "Star anise",     km: "ផ្កាឈូក",            cat: "Aromatic",  aliases: [] },
  egg_noodles:  { en: "Egg noodles (mee)", km: "មី",            cat: "Pantry",    aliases: ["yellow noodles"] },
  lort_noodles: { en: "Lort noodles (short rice)", km: "លត",   cat: "Pantry",    aliases: ["short rice noodles","silver needle"] },
  flat_noodles: { en: "Kuy teav noodles (flat rice)", km: "គុយទាវ", cat: "Pantry", aliases: ["flat rice noodles","ho fun"] },
  garlic_chive: { en: "Garlic chives",  km: "ស្លឹកគុយ",           cat: "Herb",      aliases: ["chinese chives"] },
};

/* ---------- RECIPES ---------- */
/* Each recipe lists ingredient ids it requires.
   "optional" ingredients don't count against matching. */
const RECIPES = [
  {
    id: "amok",
    cat: "Curry & Stew",
    km: "អាម៉ុកត្រី",
    rom: "Ahmok Trei",
    en: "Fish Amok",
    blurb: "Cambodia's national dish — silky steamed fish curry, perfumed with kroeung and coconut, traditionally served in a banana-leaf cup.",
    region: "Central Cambodia",
    time: "1 hr",
    serves: 4,
    ingredients: [
      "fish","lemongrass","galangal","turmeric","krachai","kaffir_leaf",
      "garlic","shallot","chili_dried","prahok","coconut_milk","egg",
      "fish_sauce","sugar","salt","cornstarch"
    ],
    optional: ["kapi","peanut"],
    steps: [
      "Skin the fish, fillet, and slice thinly. Set aside.",
      "Pound a kroeung paste from lemongrass, galangal, turmeric, krachai, kaffir lime peel, garlic, shallot and dried chili until very smooth.",
      "In a bowl, combine the fish, kroeung, finely-chopped prahok (or a touch of kapi), the thicker first-press of the coconut milk, beaten egg, fish sauce, sugar, salt, and cornstarch. Stir thoroughly so it tightens up — should be thick, not runny.",
      "Line banana-leaf cups (or small heatproof bowls) with morinda or noni leaves if available. Spoon in the fish mixture.",
      "Steam over rolling water for 15–20 minutes until set and just-firm, like a savoury custard.",
      "Top with a drizzle of reduced coconut cream, slivered kaffir leaf, and red chili. Serve with steamed rice."
    ],
    tip: "The thick first-press of the coconut milk (kati daeum) is non-negotiable — it gives amok its signature gloss."
  },
  {
    id: "loklak",
    cat: "Stir-fry",
    km: "ឡុកឡាក់សាច់គោ",
    rom: "Loc Lac Sach Ko",
    en: "Lok Lak (Shaking Beef)",
    blurb: "Wok-tossed cubes of beef in a glossy oyster-soy glaze, piled over salad and dipped in tangy black-pepper-and-lime sauce.",
    region: "Phnom Penh",
    time: "20 min",
    serves: 2,
    ingredients: [
      "beef","garlic","oyster_sauce","soy_sauce","sugar","salt",
      "cornstarch","oil","pepper","lime","lettuce","tomato",
      "cucumber","onion","fish_sauce"
    ],
    optional: ["egg"],
    steps: [
      "Slice beef into bite-sized cubes (about 1 cm). Marinate with minced garlic, oyster sauce, soy sauce, a pinch of sugar, salt, and a teaspoon of cornstarch slurry. Rest 5–10 min.",
      "Build the bed: layer torn lettuce, sliced tomato, cucumber rounds, and thin onion rings on a plate.",
      "Mix the dipping sauce: cracked black pepper, fresh lime juice, salt and a touch of sugar. Stir.",
      "Get a wok or pan ripping hot. Add oil. Sear the beef in a single layer — don't move it — for ~30 seconds, then toss/shake until just medium-rare. Don't overcook or it goes tough.",
      "Tip the beef over the salad. Serve with rice, the pepper-lime dip, and (optional) a fried egg on top."
    ],
    tip: "High heat, short time. The 'shake' in shaking beef is literal — keep the wok moving."
  },
  {
    id: "korkor",
    cat: "Soup",
    km: "សម្លកកូរ",
    rom: "Samlor Korkor",
    en: "Samlor Korkor (Khmer Country Soup)",
    blurb: "The most quintessentially Khmer dish — a thick, vegetable-laden soup from rural Cambodia, thickened with toasted rice powder.",
    region: "Countrywide",
    time: "1 hr 15 min",
    serves: 6,
    ingredients: [
      "pork_ribs","fish","prahok","lemongrass","galangal","turmeric",
      "kaffir_leaf","garlic","fish_sauce","salt","palm_sugar",
      "rice_powder","green_papaya","pumpkin","eggplant_long",
      "long_beans","banana_green","moringa_leaf","oil"
    ],
    optional: ["chicken","krachai","msg","bitter_leaf","basil_leaf"],
    steps: [
      "Pound a kroeung from lemongrass, galangal, turmeric, garlic, kaffir lime leaf (and krachai if using) until smooth.",
      "Cube the pork ribs and fish into bite-sized pieces. Cube papaya, pumpkin, eggplant, banana into rough chunks; cut long beans into 5 cm lengths.",
      "Heat oil in a heavy pot. Fry the kroeung paste with chopped prahok until deeply fragrant, ~2 min.",
      "Add the meat and toss to coat in the paste. Pour in enough water to cover everything by 2 cm.",
      "Bring to a simmer, then add the harder vegetables (papaya, pumpkin, banana) first. Cook 10 min.",
      "Add the softer vegetables (eggplant, long beans). Season with fish sauce, salt, palm sugar (and MSG if using).",
      "Stir in the toasted rice powder — this thickens the soup and gives it its signature nutty body.",
      "Just before serving, drop in moringa and bass leaves. Cook 1 minute more, then serve over rice."
    ],
    tip: "Use whatever garden vegetables you have — that's the whole point. The soup should be thick enough that a spoon almost stands up."
  },
  {
    id: "char_kreung",
    cat: "Stir-fry",
    km: "ឆាគ្រឿងសាច់គោ",
    rom: "Cha Kroeung Sach Ko",
    en: "Lemongrass Beef Stir-Fry",
    blurb: "Beef seared in a fragrant yellow kroeung paste — a faster, fiercer cousin of amok with a gingery-citrus kick.",
    region: "Countrywide",
    time: "25 min",
    serves: 3,
    ingredients: [
      "beef","lemongrass","galangal","turmeric","kaffir_leaf",
      "garlic","peanut","fish_sauce","sugar","oil","salt","cornstarch"
    ],
    optional: ["chili_fresh","msg","long_beans"],
    steps: [
      "Slice beef thinly across the grain. Toss with a pinch of salt and cornstarch.",
      "Pound the kroeung: lemongrass, galangal, turmeric, garlic, and kaffir lime leaf. Pound for 5+ minutes until it's a smooth, vivid yellow paste.",
      "Pound the peanuts coarsely — keep some texture.",
      "Heat oil in a wok over medium-high. Fry the kroeung until you can smell every herb — about 2 minutes.",
      "Crank heat to high. Add the beef and stir-fry just until the colour changes.",
      "Season with fish sauce, sugar, peanuts. Add a splash of water if it's too dry. Toss in chili and long beans if using.",
      "Serve immediately over rice."
    ],
    tip: "Don't skimp on the pounding. A blender works in a pinch but the texture of mortar-pounded kroeung is unmatched."
  },
  {
    id: "machu_trakuon",
    cat: "Soup",
    km: "សម្លម្ជូរត្រកួន",
    rom: "Samlor Machu Trakuon",
    en: "Sour Soup with Morning Glory",
    blurb: "Bright, tangy weeknight soup — fish poached with morning glory in a tamarind broth perfumed with holy basil.",
    region: "Mekong region",
    time: "30 min",
    serves: 4,
    ingredients: [
      "fish","morning_glory","tamarind","fish_sauce","salt","sugar",
      "garlic","chili_fresh","galangal","holy_basil","saw_coriander","cornstarch"
    ],
    optional: ["msg","shallot"],
    steps: [
      "Soak tamarind pulp in 1/2 cup hot water; mash, then strain to extract a thick juice. Discard solids.",
      "Trim morning glory into 5 cm lengths. Scale and cut the fish into thick rounds.",
      "Pound garlic, galangal, and chili into a coarse paste.",
      "Bring a pot of water (~6 cups) to a boil. Add the fish and simmer ~5 min until ~70% cooked.",
      "Add morning glory and the pounded paste. Pour in the tamarind juice.",
      "Season with fish sauce, salt, sugar, a small pinch of cornstarch. Taste — should be sharp, salty, just a whisper of sweetness.",
      "Off heat, scatter holy basil and sawtooth coriander. Serve immediately."
    ],
    tip: "Don't boil hard once the morning glory's in — you want it bright green and just-wilted."
  },
  {
    id: "prahok_ktis",
    cat: "Dip",
    km: "ប្រហុកខ្ទិះ",
    rom: "Prahok Ktis",
    en: "Prahok Ktis (Coconut Prahok Dip)",
    blurb: "A funky, deeply savoury dip of pork and prahok simmered in coconut cream — eaten with raw vegetables and rice. The flavour of Cambodia in one spoonful.",
    region: "Countrywide",
    time: "30 min",
    serves: 4,
    ingredients: [
      "pork_belly","prahok","palm_sugar","coconut_milk","lemongrass",
      "garlic","chili_dried","oil","cabbage","cucumber","long_beans"
    ],
    optional: ["msg","kaffir_leaf","peanut"],
    steps: [
      "Finely mince the pork belly (or pulse in a food processor).",
      "Chop the prahok very finely until almost a paste. Pound the lemongrass with garlic.",
      "Soak the dried chili in hot water 5 min; mince.",
      "Heat oil in a wok. Fry the lemongrass-garlic paste with the chili until fragrant.",
      "Add the thick first-press coconut cream and palm sugar. Reduce 2 min.",
      "Add the prahok. Cook, stirring, until it loses its raw smell.",
      "Stir in the minced pork. Cook 8–10 min, breaking it up, until the pork is cooked through and the mixture is glossy.",
      "Serve in a bowl with raw cabbage, cucumber rounds, blanched long beans, and steamed rice."
    ],
    tip: "Prahok should be your friend, not your enemy. Cooking it transforms it — fishy raw, deeply umami once simmered."
  },
  {
    id: "bai_sach",
    cat: "Noodles & Rice",
    km: "បាយសាច់ជ្រូក",
    rom: "Bai Sach Chrouk",
    en: "Bai Sach Chrouk (Pork & Rice)",
    blurb: "Cambodia's iconic breakfast: thinly-sliced pork, marinated overnight in coconut and palm sugar, then grilled over coals and served on rice with pickles.",
    region: "Phnom Penh",
    time: "Marinate overnight + 30 min cooking",
    serves: 4,
    ingredients: [
      "pork","garlic","palm_sugar","fish_sauce","soy_sauce",
      "coconut_milk","oil","rice","cucumber","carrot","vinegar"
    ],
    optional: ["honey","pepper","green_onion","egg"],
    steps: [
      "Slice the pork into thin sheets, about 5 mm thick.",
      "Make the marinade: pound garlic, then mix with palm sugar, fish sauce, soy sauce, coconut milk and a touch of honey if you like.",
      "Massage the marinade into the pork. Cover and refrigerate at least 4 hours, ideally overnight.",
      "Make the pickle: shred carrot and slice cucumber, soak in vinegar with a pinch of sugar and salt, 30 min minimum.",
      "Grill the pork over hot charcoal (or a smoking-hot grill pan) for 2–3 min per side, basting with leftover marinade until just-charred and glossy.",
      "Serve sliced pork over hot jasmine rice with the pickles, sliced cucumber, and a small bowl of light chicken broth scattered with green onion. Optional fried egg on top."
    ],
    tip: "Charcoal makes this dish. If grilling indoors, get the pan ripping hot and crack a window."
  },
  {
    id: "num_banh_chok",
    cat: "Noodles & Rice",
    km: "នំបញ្ចុកសម្លរប្រហើរ",
    rom: "Num Banh Chok",
    en: "Num Banh Chok (Khmer Noodles)",
    blurb: "Fresh rice vermicelli ladled with a fragrant fish-coconut curry, eaten cold with mountains of raw vegetables and herbs. Cambodia's most cherished noodle dish.",
    region: "Countrywide",
    time: "1 hr",
    serves: 6,
    ingredients: [
      "fish","noodles","lemongrass","galangal","turmeric","krachai",
      "kaffir_leaf","garlic","prahok","coconut_milk","fish_sauce",
      "salt","sugar","banana_flower","cucumber","bean_sprouts",
      "morning_glory","lime","green_onion"
    ],
    optional: ["msg","chili_fresh","basil_leaf","holy_basil"],
    steps: [
      "Poach the whole fish in water until just cooked through, ~10 min. Lift out, cool slightly, then carefully flake the meat off, discarding skin and bones. Save the poaching liquid.",
      "Pound a deeply-yellow kroeung from lemongrass, galangal, turmeric, krachai, kaffir lime peel, and garlic. Pound finely.",
      "In a heavy pot, bring the fish stock to a simmer. Stir in the kroeung paste and chopped prahok. Simmer 10 min.",
      "Add the flaked fish back. Pour in coconut milk and season with fish sauce, salt, sugar (and MSG if using). Simmer gently — never boil hard or the coconut breaks.",
      "Slice the banana blossom paper-thin and submerge in lime water (it browns fast). Slice cucumber, prepare bean sprouts and morning glory raw.",
      "Rinse the rice noodles in cold water and arrange in nests on each plate. Pile vegetables alongside.",
      "At the table: each diner ladles the warm fish curry over their cold noodles and tops with herbs and a squeeze of lime."
    ],
    tip: "The contrast is the dish — hot soup, cold noodles, raw vegetables. Serve everything separately and let people build their own."
  },
  {
    id: "machu_kreung_ko",
    cat: "Soup",
    km: "សម្លម្ជូរគ្រឿងសាច់គោ",
    rom: "Samlor Machu Kreung Sach Ko",
    en: "Sour Beef & Lemongrass Soup",
    blurb: "A soulful Sunday-lunch soup — beef simmered slowly in a kroeung-and-prahok base, sharpened with kreung fruit or tamarind.",
    region: "Battambang",
    time: "1 hr 30 min",
    serves: 4,
    ingredients: [
      "beef","lemongrass","galangal","turmeric","kaffir_peel","kaffir_leaf",
      "garlic","shallot","chili_dried","prahok","fish_sauce","sugar",
      "tamarind","cornstarch","bell_pepper","salt"
    ],
    optional: ["msg"],
    steps: [
      "Slice beef into thin sheets about two finger-widths long.",
      "Pound the kroeung: lemongrass, galangal, turmeric, dried chili, kaffir peel, garlic, shallot, salt — pound to a fine paste.",
      "In a clean pot, combine beef, kroeung, and finely-minced prahok. Stir over medium heat until the moisture from the meat cooks off and the mix smells deeply fragrant.",
      "Add water to cover by 3–4 cm. Bring to a gentle simmer and cook 45–60 min until the beef is tender.",
      "Add tamarind pulp (strained), torn kaffir leaf, sliced bell pepper. Season with fish sauce, sugar, cornstarch slurry.",
      "Simmer 5 min more. Taste — it should be sour-savoury with the perfume of kroeung."
    ],
    tip: "The slow cook of beef + kroeung + prahok is what builds the depth here. Don't rush."
  },
  {
    id: "cha_khnyei",
    cat: "Stir-fry",
    km: "ឆាខ្ញី",
    rom: "Cha Khnyei",
    en: "Ginger Stir-Fry",
    blurb: "Cambodia's go-to weeknight stir-fry — bright with mountains of fresh ginger. Use whatever protein is in the fridge.",
    region: "Countrywide",
    time: "15 min",
    serves: 3,
    ingredients: [
      "chicken","ginger","garlic","oyster_sauce","fish_sauce","sugar",
      "oil","soy_sauce","green_onion","pepper"
    ],
    optional: ["pork","beef","onion","msg","cornstarch"],
    steps: [
      "Slice the protein thinly. Cut a generous amount of ginger into matchsticks — you want it to be at least a third of the volume of the meat.",
      "Mince the garlic. Cut green onions into 4 cm lengths.",
      "Heat oil in a wok until smoking. Stir-fry the garlic and half the ginger 20 seconds.",
      "Add the meat. Stir-fry until just cooked through.",
      "Season with oyster sauce, fish sauce, soy sauce, a pinch of sugar. Add the rest of the ginger and the green onion.",
      "Toss 30 seconds more. Crack pepper over. Serve over rice."
    ],
    tip: "Ginger is medicine in Khmer cooking — don't be shy with it. The dish should taste boldly of ginger first, then savouriness."
  },
  {
    id: "tuk_kreung",
    cat: "Dip",
    km: "ទឹកគ្រឿង",
    rom: "Tuk Kroeung",
    en: "Tuk Kroeung (Fish & Herb Dip)",
    blurb: "A communal village dish — a thick fish-and-prahok dip eaten with a basket of raw and blanched vegetables. Famously requires 'no fewer than 10 vegetables on the side.'",
    region: "Countrywide",
    time: "40 min",
    serves: 4,
    ingredients: [
      "fish","prahok","lemongrass","galangal","turmeric","kaffir_leaf",
      "garlic","chili_fresh","palm_sugar","lime","peanut","salt",
      "eggplant_round","cucumber","long_beans","banana_flower","morning_glory"
    ],
    optional: ["bell_pepper","msg","cabbage"],
    steps: [
      "Poach the fish in water until just cooked, ~8 min. Lift out, flake off the meat, discard skin and bones.",
      "Pound a kroeung from lemongrass, galangal, turmeric, garlic, kaffir lime leaf, chili and salt — pound very finely.",
      "Pour a little of the fish-poaching water into a bowl with the kroeung. Stir in the chopped prahok and the flaked fish. Mash with a fork until creamy.",
      "Season with palm sugar, fresh lime juice, a sprinkle of crushed peanuts. The dip should be thick, salty-sweet-sour, and intensely savoury.",
      "Arrange a beautiful plate of raw and lightly-blanched vegetables: cucumber, round eggplant (raw, sliced), long beans, banana blossom, morning glory.",
      "Eat by dipping vegetables into the tuk kroeung, with steamed rice on the side."
    ],
    tip: "This is a sharing dish — make a big bowl in the middle of the table and let everyone graze."
  },
  {
    id: "machu_yuon",
    cat: "Soup",
    km: "សម្លម្ជូរយួន",
    rom: "Samlor Machu Yuon",
    en: "Cambodian-Vietnamese Sour Soup",
    blurb: "A fragrant southern Cambodian soup with strong Vietnamese accents — fish, pineapple and tomato in a tamarind broth, finished with mountains of dill and rice paddy herb.",
    region: "Southern provinces",
    time: "30 min",
    serves: 4,
    ingredients: [
      "fish","pineapple","tomato","taro_stem","tamarind","fish_sauce",
      "salt","garlic","saw_coriander","rice_paddy_herb","holy_basil",
      "bell_pepper","cornstarch","oil"
    ],
    optional: ["msg","sugar","green_onion"],
    steps: [
      "Scale and clean the fish, cut into thick rounds.",
      "Cube pineapple (squeeze any extra juice into the pot later). Wedge tomatoes — for very seedy ones, scoop some of the seeds. Slice taro stem on a steep angle into 5 cm pieces.",
      "Heat a film of oil in a pot. Briefly fry the fish on both sides — just enough to firm up the flesh. Splash in fish sauce, turn the fish, then add water to cover.",
      "Add tamarind pulp (mashed in a little hot water and strained), tomato, pineapple, taro stem, sliced bell pepper. Simmer until the taro is tender, ~10 min.",
      "Stir in cornstarch slurry to thicken slightly. Adjust seasoning — should be sharply sour, salty, with a whisper of pineapple sweetness.",
      "Off heat, blanket the surface with chopped saw-leaf coriander, rice paddy herb, and holy basil. Serve at once."
    ],
    tip: "The herb finish is essential — without it, this is just sour soup. With it, it's transcendent."
  },
  {
    id: "saraman",
    cat: "Curry & Stew",
    km: "សារ៉ាម៉ាន់",
    rom: "Saraman",
    en: "Saraman (Cambodian Massaman Curry)",
    blurb: "A slow-simmered beef curry of Indo-Persian origin, brought home through Cham trade routes — perfumed with cardamom, cinnamon and star anise, with peanuts melted into the gravy.",
    region: "Phnom Penh, Cham communities",
    time: "2 hr",
    serves: 6,
    ingredients: [
      "beef","coconut_milk","peanut","chili_dried","lemongrass","galangal",
      "turmeric","cardamom","cinnamon","star_anise","garlic","shallot",
      "fish_sauce","palm_sugar","tamarind","potato","salt","oil"
    ],
    optional: ["msg","kaffir_leaf"],
    steps: [
      "Cube the beef into 3 cm pieces (chuck or shin work best for the long cook).",
      "Toast cardamom pods, cinnamon stick and star anise in a dry pan over medium heat for 1 min until fragrant. Set aside.",
      "Pound a saraman kroeung: dried chilies (soaked and drained), lemongrass, galangal, turmeric, garlic, shallot and salt. Pound to a smooth paste.",
      "Heat oil in a heavy pot. Fry the kroeung over medium heat until very fragrant and a shade darker, ~5 min.",
      "Add the beef. Toss to coat in the paste. Pour in coconut milk and add the toasted whole spices. Top with water to barely cover.",
      "Simmer very gently, partly covered, for 90 min until the beef is fork-tender.",
      "Add cubed potato. Cook 20 min more until soft.",
      "Stir in lightly-crushed roasted peanuts, tamarind pulp, fish sauce and palm sugar. Simmer 10 min more.",
      "Taste — should be rich and sweet-tangy-savoury, with a long warm-spice finish. Serve with jasmine rice."
    ],
    tip: "The whole spices are non-negotiable. Toast them carefully — that's where the perfume comes from."
  },
  {
    id: "cari_khmer",
    cat: "Curry & Stew",
    km: "ការីខ្មែរ",
    rom: "Cari Khmer",
    en: "Khmer Red Curry",
    blurb: "Cambodia's celebratory curry, often cooked for weddings and Pchum Ben — chicken simmered in coconut milk and yellow kroeung with sweet potato, eggplant and basil.",
    region: "Countrywide, festive",
    time: "1 hr",
    serves: 4,
    ingredients: [
      "chicken","coconut_milk","lemongrass","galangal","turmeric","kaffir_leaf",
      "garlic","shallot","chili_dried","fish_sauce","palm_sugar","sweet_potato",
      "eggplant_long","long_beans","peanut","oil","salt"
    ],
    optional: ["bell_pepper","msg","basil_leaf","cornstarch"],
    steps: [
      "Joint the chicken into bite-sized pieces (bone-in is traditional and richer).",
      "Pound a yellow kroeung: lemongrass, galangal, turmeric, garlic, shallot, drained soaked dried chilies. Pound smooth.",
      "Cube sweet potato into 3 cm chunks. Wedge eggplant. Trim long beans into 5 cm lengths.",
      "Heat oil in a heavy pot. Fry the kroeung 3 min until deeply fragrant.",
      "Add the chicken and toss to coat. Pour in the thick first-press coconut milk and bring to a gentle simmer.",
      "Add the thinner second-press coconut milk and water to cover. Simmer 25 min.",
      "Add the sweet potato. Cook 10 min until starting to soften.",
      "Add eggplant, long beans, torn kaffir leaves, and lightly-crushed peanuts. Simmer until vegetables are tender, ~8 min more.",
      "Season with fish sauce, palm sugar, salt. Tear basil leaves over the top just before serving with rice or fresh baguette."
    ],
    tip: "Cambodian cari is milder and sweeter than Thai red curry. The peanuts thicken the sauce subtly."
  },
  {
    id: "kuy_teav",
    cat: "Noodles & Rice",
    km: "គុយទាវភ្នំពេញ",
    rom: "Kuy Teav Phnom Penh",
    en: "Kuy Teav (Phnom Penh Pork Noodle Soup)",
    blurb: "Cambodia's beloved breakfast soup — a long-simmered pork-bone broth ladled over flat rice noodles with sliced pork, shrimp, and the unmistakable umami of dried squid.",
    region: "Phnom Penh",
    time: "3 hr (mostly broth simmer)",
    serves: 6,
    ingredients: [
      "pork_ribs","pork","shrimp","flat_noodles","daikon","onion",
      "garlic","fish_sauce","sugar","salt","pepper","green_onion",
      "garlic_chive","bean_sprouts","lime","chili_fresh","oil"
    ],
    optional: ["squid","dried_shrimp","msg","cilantro"],
    steps: [
      "Make the broth: simmer pork bones in 4 L of water with a halved onion, sliced daikon and a pinch of salt for 2-3 hours, skimming foam regularly. Strain.",
      "Slice the lean pork very thinly across the grain. Peel and devein shrimp.",
      "Make crispy fried garlic: thinly slice garlic, fry in oil over medium-low until golden. Drain on paper. Reserve the garlic oil.",
      "Season the broth with fish sauce, sugar and white pepper. Taste — should be subtly sweet, deeply savoury, never cloudy.",
      "For each bowl: blanch flat rice noodles in boiling water for 30 sec, drain, place in serving bowl.",
      "Quickly poach the pork slices and shrimp in the simmering broth (30 sec each).",
      "Pour hot broth over the noodles. Top with the poached pork, shrimp, bean sprouts, sliced green onion, garlic chive and a heaped spoon of crispy garlic.",
      "Serve with lime wedges, sliced fresh chili, and a drizzle of garlic oil."
    ],
    tip: "Phnom Penh kuy teav is famous for its clear, deep broth — never cloudy. Skim constantly during the simmer."
  },
  {
    id: "lort_cha",
    cat: "Noodles & Rice",
    km: "លតឆា",
    rom: "Lort Cha",
    en: "Lort Cha (Stir-Fried Short Rice Noodles)",
    blurb: "Phnom Penh street food at its best — short, slippery rice noodles wok-fried over screaming heat with beef and bean sprouts, served with a runny fried egg on top.",
    region: "Phnom Penh",
    time: "20 min",
    serves: 2,
    ingredients: [
      "lort_noodles","beef","egg","bean_sprouts","garlic_chive","garlic",
      "oyster_sauce","fish_sauce","soy_sauce","sugar","oil","green_onion","pepper"
    ],
    optional: ["chili_fresh","msg"],
    steps: [
      "Slice beef thinly across the grain. Mince garlic. Cut garlic chives into 4 cm lengths.",
      "Mix the sauce: oyster sauce, fish sauce, soy sauce, sugar, a splash of water.",
      "Heat a wok over the highest possible heat with a generous pour of oil. Stir-fry garlic for 10 seconds until fragrant.",
      "Add the beef and stir-fry until just-coloured, 30 seconds.",
      "Add the lort noodles. Toss vigorously. Pour in the sauce and keep tossing until each noodle is coated.",
      "Add bean sprouts and chive. Toss 30 seconds — they should still have crunch.",
      "Plate immediately. Wipe out the wok, crack an egg in and fry sunny-side-up.",
      "Slide the egg onto the noodles. Crack pepper. Serve with sliced fresh chili."
    ],
    tip: "Lort cha is about wok hei — that smoky char from a screaming-hot pan. Don't crowd the wok and don't wait."
  },
  {
    id: "mee_cha",
    cat: "Noodles & Rice",
    km: "មីឆាគ្រប់មុខ",
    rom: "Mee Cha",
    en: "Mee Cha (Stir-Fried Egg Noodles)",
    blurb: "The everyday Khmer noodle dish — yellow egg noodles tossed with shrimp, pork and whatever vegetables you have, glossed in a sweet-savoury sauce.",
    region: "Countrywide",
    time: "20 min",
    serves: 3,
    ingredients: [
      "egg_noodles","pork","shrimp","egg","bean_sprouts","green_onion",
      "cabbage","garlic","oyster_sauce","fish_sauce","soy_sauce","sugar",
      "oil","pepper"
    ],
    optional: ["chicken","msg","carrot","chili_fresh"],
    steps: [
      "Boil egg noodles for 1 min less than the package says. Drain, rinse with cold water, toss with a teaspoon of oil. Set aside.",
      "Slice pork into thin strips. Peel and devein shrimp. Mince garlic. Slice cabbage thinly.",
      "Heat oil in a wok over high heat. Stir-fry garlic 10 seconds.",
      "Add pork, stir-fry 1 min until cooked. Add shrimp, stir-fry 30 sec.",
      "Push everything to one side. Crack an egg into the empty space and scramble briefly.",
      "Add the noodles. Pour over oyster sauce, fish sauce, soy sauce and a pinch of sugar. Toss vigorously.",
      "Add bean sprouts, cabbage and green onion. Toss 30 sec — vegetables should be just-warmed.",
      "Crack pepper. Serve with sliced chili."
    ],
    tip: "Don't overcook the noodles in step 1 — they'll finish cooking in the wok."
  },
  {
    id: "bobor",
    cat: "Soup",
    km: "បបរសាច់មាន់",
    rom: "Bobor Sach Mouan",
    en: "Bobor (Chicken Rice Porridge)",
    blurb: "Cambodia's universal comfort food, eaten when sick or for breakfast — slowly-cooked rice porridge brightened with ginger, fish sauce, and a heap of crispy fried garlic.",
    region: "Countrywide",
    time: "1 hr 15 min",
    serves: 4,
    ingredients: [
      "rice","chicken","ginger","fish_sauce","salt","sugar","pepper",
      "green_onion","cilantro","garlic","oil","lime"
    ],
    optional: ["msg","bean_sprouts","chili_fresh"],
    steps: [
      "Rinse rice well — about 1 cup for 4 servings. Some cooks dry-roast it briefly for nuttier flavour.",
      "Place the chicken (whole leg quarters or a breast) and rice in a large pot with about 2 L water and several thick slices of ginger.",
      "Bring to a boil, then reduce to the gentlest simmer. Cook 1 hour, stirring occasionally to keep rice from sticking. The grains should be very soft and starting to break.",
      "Lift out the chicken. Shred the meat finely; discard skin and bones.",
      "Make crispy fried garlic: slice garlic thinly, fry slowly in oil until golden, drain on paper.",
      "Season the porridge with fish sauce, salt, sugar and white pepper. Should be loose and silky — add water if too thick.",
      "Ladle into bowls. Top with shredded chicken, lots of fried garlic, sliced green onion, cilantro and fresh ginger matchsticks.",
      "Serve with lime, fish sauce and sliced chili at the table."
    ],
    tip: "Bobor should be eaten very hot. The fried garlic is what makes it Cambodian — don't skip it."
  },
  {
    id: "trei_aing",
    cat: "Grilled",
    km: "ត្រីអាំង",
    rom: "Trei Aing",
    en: "Trei Aing (Grilled Whole Fish)",
    blurb: "A whole river fish stuffed with lemongrass and grilled hard over coals, eaten by hand by wrapping flesh in lettuce with herbs and dipping in tangy tuk trei.",
    region: "Countrywide, riverside",
    time: "30 min + grill time",
    serves: 4,
    ingredients: [
      "fish","lemongrass","kaffir_leaf","garlic","oil","salt",
      "lime","fish_sauce","sugar","chili_fresh","peanut","lettuce","mint","cilantro"
    ],
    optional: ["holy_basil","cucumber","green_onion"],
    steps: [
      "Scale and gut the fish; leave it whole with the head on. Score both sides with 3 diagonal cuts.",
      "Pound 2 stalks of lemongrass and a few kaffir leaves into a coarse paste with garlic and a pinch of salt. Stuff this into the belly cavity.",
      "Rub the fish all over with oil and salt.",
      "Make tuk trei dipping sauce: pound garlic, chili and sugar to a paste. Add lime juice, fish sauce, water. Sprinkle with crushed peanuts.",
      "Grill the fish over hot charcoal — 7-8 min per side for a medium fish — until the skin is crisp and the flesh flakes easily.",
      "Plate with a forest of fresh herbs, butter lettuce leaves, and the dipping sauce.",
      "Eat by tearing flesh, wrapping in lettuce with herbs, and dipping in the sauce."
    ],
    tip: "The skin should char hard. Aim closer to the coals than feels right — the fat under the skin protects the flesh."
  },
  {
    id: "mouan_aing",
    cat: "Grilled",
    km: "មាន់អាំង",
    rom: "Mouan Aing",
    en: "Mouan Aing (Grilled Lemongrass Chicken)",
    blurb: "Chicken bathed overnight in yellow kroeung and coconut milk, then grilled until charred at the edges. The marinade alone is worth the price of admission.",
    region: "Siem Reap, Battambang",
    time: "Marinate overnight + 30 min",
    serves: 4,
    ingredients: [
      "chicken","lemongrass","galangal","turmeric","garlic","shallot",
      "kaffir_leaf","fish_sauce","palm_sugar","coconut_milk","oil","salt"
    ],
    optional: ["honey","msg","chili_dried"],
    steps: [
      "Cut chicken into pieces (bone-in thighs or a whole spatchcocked bird are best).",
      "Pound a kroeung: lemongrass, galangal, turmeric, garlic, shallot, kaffir leaf and salt — pound very smooth.",
      "Mix the kroeung with coconut milk, fish sauce, palm sugar and a splash of oil. This is the marinade.",
      "Massage the marinade deeply into the chicken. Cover and refrigerate overnight (or at least 4 hours).",
      "Bring chicken to room temperature 30 min before grilling.",
      "Grill over medium-hot charcoal, turning often and basting with leftover marinade, until the chicken is cooked through and the skin is mahogany — about 25 min.",
      "Rest 5 min. Eat with rice and pickled vegetables."
    ],
    tip: "Charcoal grilling turns the kroeung into something magical. A pan or oven works, but it won't be the same."
  },
  {
    id: "bok_lhong",
    cat: "Salad",
    km: "បុកល្ហុង",
    rom: "Bok L'Hong",
    en: "Bok L'Hong (Khmer Green Papaya Salad)",
    blurb: "Khmer cousin of som tam, but funkier and earthier — green papaya bruised in the mortar with prahok, dried shrimp, palm sugar and lime.",
    region: "Countrywide",
    time: "15 min",
    serves: 2,
    ingredients: [
      "green_papaya","prahok","garlic","fish_sauce","palm_sugar","lime",
      "chili_fresh","peanut","long_beans","tomato","dried_shrimp","salt"
    ],
    optional: ["msg","carrot"],
    steps: [
      "Peel the green papaya, then shred into long thin strips (a julienne peeler is easiest).",
      "Trim long beans into 4 cm lengths. Halve cherry tomatoes (or wedge a regular tomato).",
      "In a large mortar: pound garlic, chili and palm sugar to a paste. Add long beans and bruise lightly — don't pulverise.",
      "Add chopped prahok and dried shrimp; pound briefly.",
      "Add tomato and tap-pound to release the juice. Stir in lime juice and fish sauce.",
      "Tip in the papaya and crushed peanuts. Use a spoon and pestle to gently bruise and toss in the dressing — don't smash it. It should stay crunchy.",
      "Taste — should be sharply sour, salty, sweet, with a heavy funky base. Adjust. Serve immediately with sticky rice."
    ],
    tip: "Cambodian bok l'hong tastes wilder than its Thai cousin because of prahok. If it tastes 'too much,' you got it right."
  },
  {
    id: "plea_sach_ko",
    cat: "Salad",
    km: "ភ្លាសាច់គោ",
    rom: "Plea Sach Ko",
    en: "Plea Sach Ko (Khmer Beef Salad)",
    blurb: "Cambodia's signature 'cooked-without-cooking' salad — thinly-sliced rare beef bathed in lime juice and tossed with mountains of herbs, lemongrass and roasted peanuts.",
    region: "Countrywide, formal",
    time: "30 min",
    serves: 4,
    ingredients: [
      "beef","lemongrass","lime","fish_sauce","palm_sugar","chili_fresh",
      "kaffir_leaf","mint","saw_coriander","peanut","shallot","lettuce",
      "garlic","prahok","salt"
    ],
    optional: ["msg","cilantro","green_onion"],
    steps: [
      "Slice the beef as thinly as possible across the grain — partially freezing it makes this easier.",
      "Briefly blanch the beef in boiling water for 5-10 seconds, just until the colour starts to change. Drain immediately.",
      "Soak the blanched beef in fresh lime juice for 5 min — the acid 'cooks' it the rest of the way.",
      "Slice lemongrass paper-thin (only the tender bottom 10 cm). Slice shallot thinly. Tear kaffir leaf into thin ribbons.",
      "Make the dressing: pound garlic, chili, palm sugar, salt. Add a touch of finely-minced prahok for depth. Stir in fish sauce and the leftover lime juice from the beef.",
      "In a big bowl, combine beef, lemongrass, shallot, kaffir leaf, mint and sawtooth coriander. Pour over the dressing.",
      "Top with crushed peanuts. Serve over a bed of lettuce — diners wrap bites in the lettuce."
    ],
    tip: "The beef should still look pink in the middle. Use the freshest cut your butcher has."
  },
  {
    id: "nhoam_svay",
    cat: "Salad",
    km: "ញាំស្វាយខ្ចី",
    rom: "Nhoam Svay Khchey",
    en: "Nhoam Svay (Green Mango Salad)",
    blurb: "A puckeringly tart salad of shredded green mango with dried shrimp, peanuts and herbs — Cambodia's answer to the heat of an afternoon.",
    region: "Countrywide",
    time: "15 min",
    serves: 4,
    ingredients: [
      "green_mango","dried_shrimp","fish_sauce","palm_sugar","lime","chili_fresh",
      "peanut","shallot","mint","cilantro","garlic","salt"
    ],
    optional: ["msg","saw_coriander"],
    steps: [
      "Peel and shred the green mangoes into thin strips.",
      "Soak dried shrimp in warm water 10 min to soften, then drain.",
      "Make the dressing: pound garlic and chili, then mix with fish sauce, lime juice, palm sugar and a pinch of salt. Taste — sour first, then salty, then sweet.",
      "Add shredded mango, soaked dried shrimp and thinly-sliced shallot. Toss.",
      "Top with torn mint, cilantro and roasted crushed peanuts. Toss once more and serve immediately."
    ],
    tip: "Use unripe, rock-hard green mangoes — supermarket 'green' mangoes are usually too soft."
  },
  {
    id: "banh_chao",
    cat: "Snack",
    km: "បាញ់ឆែវ",
    rom: "Banh Chao",
    en: "Banh Chao (Khmer Sizzling Crepe)",
    blurb: "Crackling-thin rice flour crepes turned electric-yellow with turmeric, stuffed with pork, shrimp and bean sprouts. Eaten by wrapping pieces in lettuce with herbs.",
    region: "Mekong region",
    time: "1 hr",
    serves: 4,
    ingredients: [
      "rice_flour","coconut_milk","turmeric","salt","pork","shrimp",
      "bean_sprouts","green_onion","garlic","oil","lettuce","mint",
      "cilantro","fish_sauce","sugar","lime","chili_fresh","peanut"
    ],
    optional: ["holy_basil"],
    steps: [
      "Make the batter: whisk 1 cup rice flour, 3/4 cup coconut milk, 3/4 cup water, 1/2 tsp turmeric, a pinch of salt, sliced green onion. Should be very thin, like skim milk. Rest 30 min.",
      "Slice pork thinly. Peel and devein shrimp.",
      "Mix tuk trei dipping sauce: pound garlic, chili, sugar; add lime juice, fish sauce, water, crushed peanuts.",
      "Heat a non-stick pan or seasoned wok screaming hot. Add a teaspoon of oil. Throw in a few slices of pork and a couple of shrimp; stir-fry 1 min.",
      "Pour in a thin ladle of batter, swirling the pan to coat very thinly. Top with bean sprouts on one side.",
      "Cover for 1 min until set, then uncover and let the bottom turn golden-crisp, ~3 min more.",
      "Fold in half and slide onto a plate. Repeat with the rest of the batter.",
      "To eat: tear pieces, wrap in lettuce with mint and cilantro, dip in tuk trei."
    ],
    tip: "Thinner is better. The batter should be loose enough to swirl into a near-paper sheet."
  },
  {
    id: "num_pang",
    cat: "Snack",
    km: "នំប៉័ងប៉ាតេ",
    rom: "Num Pang Pâté",
    en: "Num Pang (Khmer Sandwich)",
    blurb: "Cambodia's beloved baguette sandwich — a French-colonial inheritance reborn with pâté, grilled pork, pickles and chili. Cousin of the bánh mì but its own thing.",
    region: "Phnom Penh",
    time: "20 min (if pickles ready)",
    serves: 2,
    ingredients: [
      "baguette","pate","pork","carrot","daikon","cucumber","cilantro",
      "chili_fresh","soy_sauce","fish_sauce","sugar","vinegar","salt"
    ],
    optional: ["butter","green_onion","pepper"],
    steps: [
      "Make the pickle ahead: shred carrot and daikon into thin strips. Toss with a pinch of salt, leave 10 min, then squeeze out moisture. Mix with vinegar and sugar — pickle for at least 1 hour.",
      "Slice pork thinly, marinate briefly in soy sauce, fish sauce, sugar. Grill or pan-sear until just-charred at the edges.",
      "Slice baguettes lengthwise, leaving a hinge. Lightly toast or warm.",
      "Spread one side with pâté (and butter if using).",
      "Layer in the grilled pork, the pickled vegetables, sliced cucumber, plenty of cilantro and slivered fresh chili.",
      "A quick splash of soy sauce or fish sauce inside before closing. Press, slice, eat."
    ],
    tip: "The bread matters. A proper Cambodian-style baguette is shorter and softer than the French original — find one or use a soft sub roll."
  },
  {
    id: "kho_sach",
    cat: "Curry & Stew",
    km: "សាច់ជ្រូកខ",
    rom: "Sach Chrouk Kho",
    en: "Sach Chrouk Kho (Caramelized Pork & Eggs)",
    blurb: "Tender pork belly braised in young coconut juice and palm sugar until darkly glossy, with whole hard-boiled eggs soaking up the salty-sweet glaze.",
    region: "Southern Cambodia",
    time: "1 hr 30 min",
    serves: 4,
    ingredients: [
      "pork_belly","egg","coconut_water","fish_sauce","soy_sauce","palm_sugar",
      "garlic","shallot","pepper","salt","oil"
    ],
    optional: ["chili_fresh","msg","green_onion"],
    steps: [
      "Cube the pork belly into 4 cm pieces. Hard-boil the eggs and peel.",
      "Render: place pork belly in a heavy pot with a splash of oil. Cook over medium heat, stirring, until the fat renders and the meat is golden, ~10 min.",
      "Add minced garlic and shallot; stir 1 min until fragrant.",
      "Add palm sugar and let it caramelise lightly into the rendered fat — should turn dark amber.",
      "Pour in coconut water (or a mix of coconut water and regular water). Add fish sauce, soy sauce and cracked pepper.",
      "Bring to a simmer, reduce to very low, cover. Braise 60-75 min until the pork is fork-tender.",
      "Add the peeled hard-boiled eggs in the last 20 min, turning every few minutes so they colour evenly.",
      "Reduce the sauce uncovered for the final 5 min until thick and glossy. Serve over rice with steamed greens."
    ],
    tip: "Coconut water is the secret — never just water. The natural sugars deepen the caramel."
  },
  {
    id: "cha_trop",
    cat: "Stir-fry",
    km: "ឆាត្រប់",
    rom: "Cha Trop",
    en: "Cha Trop (Eggplant Stir-Fry)",
    blurb: "Smoky, silken Asian eggplants stir-fried with minced pork in garlic and oyster sauce — fast, comforting, weeknight gold.",
    region: "Countrywide",
    time: "20 min",
    serves: 3,
    ingredients: [
      "eggplant_long","pork","garlic","fish_sauce","soy_sauce","sugar",
      "oyster_sauce","oil","green_onion","pepper"
    ],
    optional: ["holy_basil","chili_fresh","msg"],
    steps: [
      "Cut eggplants on a steep diagonal into 3 cm pieces. Some cooks soak them briefly in salted water to keep them from browning.",
      "Mince pork. Mince garlic. Slice green onion.",
      "Heat oil in a wok over high heat. Fry the eggplant in a single layer, turning, until golden and softened — 4-5 min. Lift out.",
      "Add a touch more oil. Stir-fry garlic 10 sec, add minced pork. Break it up and cook until just done.",
      "Return the eggplant. Add oyster sauce, fish sauce, soy sauce and sugar. Toss to coat.",
      "Add green onion (and torn basil if using). Toss once more. Crack pepper. Serve over rice."
    ],
    tip: "Long Asian eggplants are sweeter and less spongy than globe eggplants — they soak up sauce instead of oil."
  },
  {
    id: "kdam_chaa",
    cat: "Stir-fry",
    km: "ក្ដាមឆាម្រេចខ្មៅ",
    rom: "Kdam Chaa Mereach",
    en: "Kdam Chaa (Kampot Pepper Crab)",
    blurb: "Whole crabs stir-fried with cracked Kampot pepper, butter and garlic — Kep's most famous dish, and one of the great pepper preparations in world cooking.",
    region: "Kep, Kampot coast",
    time: "30 min",
    serves: 4,
    ingredients: [
      "crab","peppercorn","garlic","butter","oyster_sauce","soy_sauce",
      "sugar","oil","green_onion","fish_sauce","salt"
    ],
    optional: ["chili_fresh","msg","onion"],
    steps: [
      "Clean the crabs and chop into halves or quarters (your fishmonger can do this). Crack the claws lightly with the back of a knife so the sauce gets in.",
      "Coarsely crack a generous handful of black peppercorns — Kampot pepper if you can find it. The aroma is the dish.",
      "Mince garlic. Cut green onion into 4 cm lengths.",
      "Heat oil and a knob of butter in a wok over high heat. Fry the cracked pepper for 30 sec — your kitchen will smell phenomenal.",
      "Add garlic, stir 10 sec.",
      "Add the crabs. Stir-fry hard, tossing, for 4-5 min until the shells turn bright orange.",
      "Add oyster sauce, fish sauce, soy sauce, a pinch of sugar and a splash of water. Cover and cook 3 min.",
      "Uncover, toss in green onion. Plate. Eat with bare hands and lots of napkins."
    ],
    tip: "Use the freshest crabs you can find — this dish has nowhere to hide. Frozen crab won't work."
  },
  {
    id: "sankya_lapov",
    cat: "Dessert",
    km: "សង់ខ្យាល្ពៅ",
    rom: "Sangkya Lapov",
    en: "Sankya Lapov (Pumpkin Custard)",
    blurb: "A whole kabocha pumpkin hollowed out and filled with a coconut-palm-sugar custard, then steamed. Sliced into wedges, it's Cambodia's most photogenic dessert.",
    region: "Countrywide, festive",
    time: "1 hr",
    serves: 8,
    ingredients: [
      "pumpkin","egg","coconut_milk","palm_sugar","salt","pandan"
    ],
    optional: ["sugar"],
    steps: [
      "Choose a small kabocha pumpkin (1 kg is ideal). Cut a circular 'lid' off the top, scoop out the seeds and stringy bits. Rinse and pat dry.",
      "Make the custard: in a bowl, whisk together 4 eggs, 1 cup coconut milk, 3/4 cup grated palm sugar (warmed gently to dissolve), pinch of salt.",
      "Strain the custard for silky texture. If you have pandan, blend a leaf with the coconut milk first, then strain — gives a beautiful fragrance.",
      "Pour the custard into the hollow pumpkin, leaving 1 cm of headspace.",
      "Replace the lid (slightly off-set so steam escapes). Place the whole pumpkin in a steamer.",
      "Steam over medium heat for 45-60 min. Test with a toothpick: it should come out clean from the custard, and the pumpkin flesh should be tender.",
      "Cool completely (refrigerate at least 2 hours for best results). Slice into wedges, custard and pumpkin together."
    ],
    tip: "The custard is sturdier than French crème — that's intentional. It needs to hold up when sliced."
  },
  {
    id: "num_ansom",
    cat: "Dessert",
    km: "នំអន្សមចេក",
    rom: "Num Ansom Chek",
    en: "Num Ansom Chek (Banana Sticky Rice Cake)",
    blurb: "Logs of sticky rice and ripe banana wrapped in banana leaves and slowly boiled — eaten especially at Pchum Ben festival to honour ancestors.",
    region: "Countrywide, festive",
    time: "Soak overnight + 4 hr cooking",
    serves: 8,
    ingredients: [
      "sticky_rice","banana_green","banana_leaf","coconut_milk","palm_sugar",
      "salt","mung_bean"
    ],
    optional: ["sugar"],
    steps: [
      "Soak 500 g sticky rice in water overnight. Soak mung beans separately, then steam them.",
      "Drain rice. Mix with steamed mung beans, 1 cup coconut milk, 3 tbsp grated palm sugar, 1 tsp salt. Toss until each grain is coated.",
      "Use ripe but firm bananas — peel them whole.",
      "Pass banana leaves quickly over an open flame to soften them (or microwave 20 sec). Cut into 25 cm wide strips.",
      "Lay 2 leaves crossed. Spoon a thick line of rice on top. Place a whole banana on the rice. Cover with more rice.",
      "Roll up tightly into a log shape, tucking and folding the ends. Tie with kitchen string.",
      "Place the parcels in a deep pot. Cover completely with water. Boil hard for 3-4 hours, topping up the water as needed.",
      "Lift out, cool. Unwrap, slice into rounds. Eat at room temperature."
    ],
    tip: "The slow boil is what makes the rice translucent and gives it that signature chew. Don't rush it."
  }
];

/* =============================================================
   MATCHING ENGINE
   ============================================================= */
function computeMatches(recipes, pantrySet) {
  return recipes.map(r => {
    const required = r.ingredients;
    const have = required.filter(i => pantrySet.has(i));
    const missing = required.filter(i => !pantrySet.has(i));
    return {
      ...r,
      haveCount: have.length,
      missingCount: missing.length,
      totalCount: required.length,
      missingIds: missing,
      haveIds: have,
      pct: required.length === 0 ? 0 : have.length / required.length
    };
  });
}

/* =============================================================
   COMPONENT
   ============================================================= */
export default function App() {
  const [activeTab, setActiveTab] = useState("pantry"); // "pantry" | "all"
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pantry, setPantry] = useState(new Set());
  const [search, setSearch] = useState("");
  const [showNearMatches, setShowNearMatches] = useState(true);
  const [openRecipeId, setOpenRecipeId] = useState(null);

  /* inject fonts once */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Hanuman:wght@400;700&family=Moul&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const togglePantry = (id) => {
    setPantry(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const matches = useMemo(() => {
    const arr = computeMatches(RECIPES, pantry);
    arr.sort((a,b) => {
      if (b.haveCount !== a.haveCount) return b.haveCount - a.haveCount;
      return a.missingCount - b.missingCount;
    });
    return arr;
  }, [pantry]);

  /* Bucket recipes by reachability:
     ready    = have everything
     close    = missing 1-2 ingredients
     stretch  = missing 3-5 ingredients (still worth showing the path)
     The toggle expands/collapses the close+stretch buckets. */
  const buckets = useMemo(() => {
    const ready   = matches.filter(m => m.missingCount === 0);
    const close   = matches.filter(m => m.missingCount > 0 && m.missingCount <= 2);
    const stretch = matches
      .filter(m => m.missingCount >= 3 && m.missingCount <= 5 && m.haveCount >= 4)
      .slice(0, 6);
    return { ready, close, stretch };
  }, [matches]);

  const completeCount = buckets.ready.length;
  const nearCount = buckets.close.length;
  const stretchCount = buckets.stretch.length;

  /* group ingredient tiles by category */
  const ingredientsByCat = useMemo(() => {
    const cats = {};
    Object.entries(INGREDIENTS).forEach(([id, ing]) => {
      if (!cats[ing.cat]) cats[ing.cat] = [];
      cats[ing.cat].push({ id, ...ing });
    });
    return cats;
  }, []);

  /* search filter */
  const searchHits = useMemo(() => {
    if (!search.trim()) return null;
    const s = search.trim().toLowerCase();
    return Object.entries(INGREDIENTS).filter(([id, ing]) => {
      if (id.includes(s)) return true;
      if (ing.en.toLowerCase().includes(s)) return true;
      if (ing.km.includes(s)) return true;
      return ing.aliases.some(a => a.toLowerCase().includes(s));
    }).slice(0, 8);
  }, [search]);

  return (
    <div className="khmer-pantry-root">
      <style>{`
        :root {
          --cream: #F4E9D0;
          --paper: #FBF5E2;
          --ink: #2A2014;
          --turmeric: #C97D1F;
          --turmeric-deep: #A66518;
          --leaf: #4F6B3A;
          --leaf-deep: #364827;
          --lacquer: #9B3120;
          --palm: #8C5A28;
          --shadow: rgba(60, 40, 20, 0.12);
          --rule: #C9B68A;
        }
        .khmer-pantry-root {
          font-family: 'Lora', Georgia, serif;
          background: var(--cream);
          color: var(--ink);
          min-height: 100vh;
          background-image:
            radial-gradient(circle at 20% 10%, rgba(201,125,31,0.08), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(79,107,58,0.08), transparent 40%);
        }
        .khmer-pantry-root::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.08 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          opacity: 0.7;
          mix-blend-mode: multiply;
          z-index: 1;
        }
        .kp-wrap {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
          padding: 28px 18px 80px;
          z-index: 2;
        }

        /* HEADER */
        .kp-header {
          text-align: center;
          padding: 18px 0 28px;
          border-bottom: 1px double var(--rule);
          margin-bottom: 28px;
        }
        .kp-eyebrow {
          font-family: 'Moul', 'Hanuman', serif;
          font-size: 13px;
          letter-spacing: 0.18em;
          color: var(--turmeric-deep);
          text-transform: uppercase;
        }
        .kp-title-km {
          font-family: 'Hanuman', serif;
          font-weight: 700;
          font-size: 42px;
          line-height: 1.1;
          color: var(--ink);
          margin: 6px 0 2px;
        }
        .kp-title-en {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 26px;
          color: var(--leaf-deep);
          letter-spacing: 0.02em;
        }
        .kp-tagline {
          font-family: 'Cormorant Garamond', serif;
          margin-top: 14px;
          font-size: 16px;
          color: rgba(42,32,20,0.7);
          line-height: 1.5;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .kp-orn {
          color: var(--turmeric);
          font-size: 14px;
          letter-spacing: 0.5em;
          margin: 8px 0 4px;
        }

        /* SECTION HEADERS */
        .kp-section-h {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 28px;
          color: var(--ink);
          margin: 0 0 4px;
          letter-spacing: 0.01em;
        }
        .kp-section-h .kh {
          font-family: 'Hanuman', serif;
          font-weight: 700;
          color: var(--turmeric-deep);
          margin-right: 8px;
          font-size: 24px;
        }
        .kp-section-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: rgba(42,32,20,0.6);
          font-size: 15px;
          margin-bottom: 16px;
        }

        /* SEARCH BOX */
        .kp-search-row {
          position: relative;
          margin-bottom: 18px;
        }
        .kp-search {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 2px;
          font-family: 'Lora', serif;
          font-size: 15px;
          color: var(--ink);
          outline: none;
          transition: border-color .2s;
          box-sizing: border-box;
        }
        .kp-search:focus { border-color: var(--turmeric); }
        .kp-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--turmeric-deep);
          font-size: 16px;
        }
        .kp-search-results {
          margin-top: 6px;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 2px;
          overflow: hidden;
        }
        .kp-search-result {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          transition: background .15s;
          border-bottom: 1px solid rgba(201,182,138,0.4);
        }
        .kp-search-result:last-child { border-bottom: none; }
        .kp-search-result:hover { background: rgba(201,125,31,0.08); }
        .kp-search-result .km {
          font-family: 'Hanuman', serif;
          color: var(--turmeric-deep);
          font-size: 13px;
        }

        /* CHIPS */
        .kp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .kp-chip {
          background: var(--paper);
          border: 1px solid var(--rule);
          padding: 7px 12px 7px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-family: 'Lora', serif;
          color: var(--ink);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all .15s;
          line-height: 1;
        }
        .kp-chip:hover {
          border-color: var(--turmeric);
          background: rgba(201,125,31,0.1);
        }
        .kp-chip.on {
          background: var(--leaf);
          color: var(--paper);
          border-color: var(--leaf-deep);
          font-weight: 500;
        }
        .kp-chip.on .km { color: rgba(251,245,226,0.75); }
        .kp-chip .km {
          font-family: 'Hanuman', serif;
          font-size: 12px;
          color: var(--turmeric-deep);
        }
        .kp-chip-x {
          margin-left: 4px;
          font-size: 14px;
          color: rgba(251,245,226,0.85);
        }

        /* CATEGORY GROUPS */
        .kp-cat {
          margin-bottom: 22px;
        }
        .kp-cat-label {
          font-family: 'Cormorant Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 12px;
          color: var(--leaf-deep);
          margin-bottom: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kp-cat-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--rule);
        }

        /* PANTRY HEADER */
        .kp-pantry-status {
          padding: 14px 16px;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-left: 4px solid var(--turmeric);
          margin-bottom: 22px;
          font-size: 14px;
        }
        .kp-pantry-status strong {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          color: var(--turmeric-deep);
          font-size: 18px;
          letter-spacing: 0.01em;
        }
        .kp-pantry-status .reset {
          float: right;
          background: none;
          border: none;
          color: var(--lacquer);
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        /* TOGGLE */
        .kp-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          margin: 16px 0 4px;
          font-style: italic;
          color: rgba(42,32,20,0.75);
          cursor: pointer;
          user-select: none;
        }
        .kp-toggle-switch {
          width: 36px;
          height: 20px;
          background: var(--rule);
          border-radius: 999px;
          position: relative;
          transition: background .2s;
        }
        .kp-toggle-switch::after {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          background: var(--paper);
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: left .2s;
        }
        .kp-toggle.on .kp-toggle-switch {
          background: var(--leaf);
        }
        .kp-toggle.on .kp-toggle-switch::after {
          left: 18px;
        }

        /* DIVIDER ORNAMENT */
        .kp-divider {
          text-align: center;
          margin: 36px 0 26px;
          color: var(--turmeric);
          font-size: 15px;
          letter-spacing: 0.5em;
          padding-left: 0.5em;
        }

        /* TAB NAVIGATION */
        .kp-tabs {
          display: flex;
          gap: 0;
          margin: 0 0 28px;
          border-bottom: 1px solid var(--rule);
          position: relative;
        }
        .kp-tab {
          flex: 1;
          background: none;
          border: none;
          padding: 14px 0 12px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-style: italic;
          color: rgba(42,32,20,0.5);
          cursor: pointer;
          position: relative;
          transition: color .2s;
          letter-spacing: 0.02em;
        }
        .kp-tab:hover {
          color: var(--ink);
        }
        .kp-tab.active {
          color: var(--ink);
          font-weight: 600;
          font-style: normal;
        }
        .kp-tab.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 25%;
          right: 25%;
          height: 3px;
          background: var(--turmeric);
        }
        .kp-tab-km {
          font-family: 'Hanuman', serif;
          font-size: 13px;
          color: var(--turmeric-deep);
          display: block;
          margin-top: 2px;
          font-weight: 400;
          font-style: normal;
        }

        /* CATEGORY FILTER */
        .kp-cat-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 18px 0 22px;
        }
        .kp-cat-pill {
          background: var(--paper);
          border: 1px solid var(--rule);
          padding: 7px 14px;
          font-size: 13px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: var(--ink);
          cursor: pointer;
          border-radius: 999px;
          transition: all .15s;
        }
        .kp-cat-pill:hover {
          border-color: var(--turmeric);
        }
        .kp-cat-pill.on {
          background: var(--turmeric);
          color: var(--paper);
          border-color: var(--turmeric-deep);
          font-style: normal;
          font-weight: 500;
        }

        /* CARD CATEGORY BADGE */
        .kp-cat-badge {
          display: inline-block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 12px;
          color: var(--leaf-deep);
          letter-spacing: 0.04em;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        /* BUCKET SECTIONS */
        .kp-bucket-h {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 19px;
          color: var(--ink);
          margin: 28px 0 14px;
          letter-spacing: 0.005em;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--rule);
        }
        .kp-bucket-h:first-of-type { margin-top: 14px; }
        .kp-bucket-h .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .kp-bucket-h .dot.ready { background: var(--leaf); }
        .kp-bucket-h .dot.close { background: var(--turmeric); }
        .kp-bucket-h .dot.stretch { background: var(--palm); opacity: 0.7; }
        .kp-bucket-h .count {
          margin-left: auto;
          font-style: italic;
          font-size: 13px;
          color: rgba(42,32,20,0.5);
          font-weight: 400;
        }
        .kp-card.stretch {
          border-left: 5px solid var(--palm);
        }
        .kp-card.stretch .kp-badge.miss {
          background: var(--palm);
        }

        /* RECIPE CARDS */
        .kp-results-meta {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: rgba(42,32,20,0.6);
          margin-bottom: 14px;
        }
        .kp-card {
          background: var(--paper);
          border: 1px solid var(--rule);
          margin-bottom: 18px;
          padding: 22px 20px 20px;
          position: relative;
          cursor: pointer;
          transition: transform .15s, box-shadow .15s;
        }
        .kp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--shadow);
        }
        .kp-card.complete {
          border-left: 5px solid var(--leaf);
        }
        .kp-card.near {
          border-left: 5px solid var(--turmeric);
        }
        .kp-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }
        .kp-card-km {
          font-family: 'Hanuman', serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--ink);
          line-height: 1.1;
        }
        .kp-card-rom {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--turmeric-deep);
          margin-top: 2px;
        }
        .kp-card-en {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 22px;
          margin-top: 3px;
          color: var(--ink);
          letter-spacing: 0.005em;
        }
        .kp-badge {
          flex-shrink: 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          padding: 4px 11px;
          font-size: 13px;
          background: var(--leaf);
          color: var(--paper);
          border-radius: 999px;
          white-space: nowrap;
        }
        .kp-badge.miss {
          background: var(--turmeric);
        }
        .kp-card-blurb {
          font-size: 14px;
          line-height: 1.55;
          color: rgba(42,32,20,0.85);
          margin: 12px 0 14px;
        }
        .kp-card-meta {
          display: flex;
          gap: 16px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 13px;
          color: rgba(42,32,20,0.65);
          padding-top: 12px;
          border-top: 1px dashed var(--rule);
        }
        .kp-card-meta span::before {
          content: "·";
          margin-right: 14px;
          color: var(--turmeric);
        }
        .kp-card-meta span:first-child::before { content: ""; margin: 0; }
        .kp-card-missing {
          margin-top: 10px;
          font-size: 13px;
          font-style: italic;
          color: var(--lacquer);
        }
        .kp-card-missing strong {
          font-style: normal;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
        }

        /* DETAIL VIEW (expanded recipe) */
        .kp-detail {
          background: var(--paper);
          border: 1px solid var(--rule);
          padding: 26px 22px 24px;
          margin-bottom: 18px;
          position: relative;
        }
        .kp-detail-close {
          position: absolute;
          top: 14px;
          right: 16px;
          background: none;
          border: none;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--lacquer);
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .kp-detail-km {
          font-family: 'Hanuman', serif;
          font-size: 30px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.05;
        }
        .kp-detail-rom {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: var(--turmeric-deep);
          font-size: 17px;
          margin-top: 4px;
        }
        .kp-detail-en {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--ink);
          margin-top: 6px;
        }
        .kp-detail-blurb {
          font-style: italic;
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          color: rgba(42,32,20,0.8);
          margin: 14px 0 16px;
          padding-left: 14px;
          border-left: 3px solid var(--turmeric);
          line-height: 1.5;
        }
        .kp-detail-info {
          display: flex;
          gap: 18px;
          font-size: 13px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: rgba(42,32,20,0.7);
          margin-bottom: 22px;
          padding-bottom: 14px;
          border-bottom: 1px double var(--rule);
        }
        .kp-detail-info b {
          font-style: normal;
          color: var(--ink);
          margin-right: 4px;
        }
        .kp-h3 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 22px;
          margin: 22px 0 12px;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kp-h3::before {
          content: "❋";
          color: var(--turmeric);
          font-size: 14px;
        }
        .kp-ing-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .kp-ing-list li {
          padding: 8px 0;
          border-bottom: 1px dotted var(--rule);
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-size: 15px;
        }
        .kp-ing-list li:last-child { border-bottom: none; }
        .kp-ing-list .check {
          width: 18px;
          color: var(--leaf);
          font-weight: bold;
          flex-shrink: 0;
        }
        .kp-ing-list .miss-x {
          color: var(--lacquer);
          font-weight: bold;
        }
        .kp-ing-list .em {
          font-family: 'Hanuman', serif;
          color: rgba(42,32,20,0.5);
          font-size: 13px;
          margin-left: 6px;
        }
        .kp-ing-list .en-name {
          flex: 1;
        }
        .kp-ing-list .miss-tag {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 12px;
          color: var(--lacquer);
        }
        .kp-ing-list .opt-tag {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 12px;
          color: rgba(42,32,20,0.5);
        }
        .kp-steps {
          list-style: none;
          counter-reset: step;
          padding: 0;
          margin: 0;
        }
        .kp-steps li {
          counter-increment: step;
          padding: 12px 0 12px 44px;
          position: relative;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(42,32,20,0.92);
          border-bottom: 1px dotted rgba(201,182,138,0.6);
        }
        .kp-steps li:last-child { border-bottom: none; }
        .kp-steps li::before {
          content: counter(step);
          position: absolute;
          left: 0;
          top: 12px;
          width: 30px;
          height: 30px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          color: var(--paper);
          background: var(--turmeric);
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
        }
        .kp-tip {
          margin-top: 22px;
          padding: 14px 16px;
          background: rgba(79,107,58,0.08);
          border-left: 3px solid var(--leaf);
          font-style: italic;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: var(--leaf-deep);
          line-height: 1.5;
        }
        .kp-tip strong {
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.05em;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--leaf-deep);
          margin-right: 8px;
        }

        /* EMPTY STATE */
        .kp-empty {
          text-align: center;
          padding: 50px 20px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 17px;
          color: rgba(42,32,20,0.6);
          line-height: 1.6;
        }
        .kp-empty .big {
          font-size: 38px;
          color: var(--turmeric);
          letter-spacing: 0.4em;
          padding-left: 0.4em;
          display: block;
          margin-bottom: 14px;
        }

        /* FOOTER */
        .kp-foot {
          text-align: center;
          margin-top: 60px;
          padding-top: 24px;
          border-top: 1px double var(--rule);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 13px;
          color: rgba(42,32,20,0.5);
        }
      `}</style>

      <div className="kp-wrap">

        {/* HEADER */}
        <header className="kp-header">
          <div className="kp-orn">❋ ✦ ❋</div>
          <div className="kp-eyebrow">A Khmer Cookbook</div>
          <h1 className="kp-title-km">ម្ហូបខ្មែរ</h1>
          <div className="kp-title-en">Khmer Pantry</div>
          <p className="kp-tagline">
            Tell us what's in your kitchen, and we'll tell you which Cambodian dishes you can cook tonight — drawn from authentic recipes in Khmer cooking traditions.
          </p>
        </header>

        {/* TAB NAVIGATION */}
        <div className="kp-tabs">
          <button
            className={`kp-tab ${activeTab === "pantry" ? "active" : ""}`}
            onClick={() => { setActiveTab("pantry"); setOpenRecipeId(null); }}
          >
            By Pantry
            <span className="kp-tab-km">តាមគ្រឿងផ្សំ</span>
          </button>
          <button
            className={`kp-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => { setActiveTab("all"); setOpenRecipeId(null); }}
          >
            All Recipes
            <span className="kp-tab-km">មុខម្ហូបទាំងអស់</span>
          </button>
        </div>

        {activeTab === "pantry" && <>

        {/* PANTRY SECTION */}
        <section>
          <h2 className="kp-section-h"><span className="kh">១.</span>Your Pantry</h2>
          <div className="kp-section-sub">Tap any ingredient to add it. Search for anything we don't show.</div>

          {/* status bar */}
          <div className="kp-pantry-status">
            <strong>{pantry.size}</strong>
            {pantry.size === 1 ? " ingredient" : " ingredients"} selected
            {pantry.size > 0 && (
              <button className="reset" onClick={() => setPantry(new Set())}>clear all</button>
            )}
          </div>

          {/* search */}
          <div className="kp-search-row">
            <span className="kp-search-icon">⌕</span>
            <input
              className="kp-search"
              placeholder="Search ingredients (e.g. tamarind, ខ្ទឹម, lemongrass)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {searchHits && searchHits.length > 0 && (
              <div className="kp-search-results">
                {searchHits.map(([id, ing]) => (
                  <div
                    key={id}
                    className="kp-search-result"
                    onClick={() => { togglePantry(id); setSearch(""); }}
                  >
                    <span>
                      {pantry.has(id) ? "✓ " : "+ "}{ing.en}
                    </span>
                    <span className="km">{ing.km}</span>
                  </div>
                ))}
              </div>
            )}
            {search.trim() && searchHits && searchHits.length === 0 && (
              <div className="kp-search-results">
                <div className="kp-search-result" style={{cursor:'default', color:'rgba(42,32,20,0.5)', fontStyle:'italic'}}>
                  No ingredient matches that.
                </div>
              </div>
            )}
          </div>

          {/* selected pantry chips */}
          {pantry.size > 0 && (
            <>
              <div className="kp-cat-label">In your kitchen</div>
              <div className="kp-chips">
                {Array.from(pantry).map(id => {
                  const ing = INGREDIENTS[id];
                  if (!ing) return null;
                  return (
                    <span key={id} className="kp-chip on" onClick={() => togglePantry(id)}>
                      {ing.en}
                      <span className="kp-chip-x">✕</span>
                    </span>
                  );
                })}
              </div>
            </>
          )}

          {/* category-grouped ingredients */}
          {["Protein","Aromatic","Pantry","Vegetable","Herb"].map(cat => (
            ingredientsByCat[cat] && (
              <div key={cat} className="kp-cat">
                <div className="kp-cat-label">{
                  cat === "Aromatic" ? "Aromatics · The Kroeung" :
                  cat === "Pantry" ? "Pantry & Sauces" :
                  cat === "Herb" ? "Fresh Herbs" :
                  cat + "s"
                }</div>
                <div className="kp-chips">
                  {ingredientsByCat[cat].map(ing => (
                    <span
                      key={ing.id}
                      className={`kp-chip ${pantry.has(ing.id) ? "on" : ""}`}
                      onClick={() => togglePantry(ing.id)}
                    >
                      {ing.en}
                      <span className="km">{ing.km}</span>
                    </span>
                  ))}
                </div>
              </div>
            )
          ))}
        </section>

        <div className="kp-divider">❋ ✦ ❋</div>

        {/* RECIPES SECTION */}
        <section>
          <h2 className="kp-section-h"><span className="kh">២.</span>What You Can Cook</h2>
          <div className="kp-section-sub">
            {pantry.size === 0
              ? "Add a few ingredients above to see what's possible."
              : `From ${pantry.size} ingredient${pantry.size===1?"":"s"}.`}
          </div>

          {/* toggle - only meaningful if there are close/stretch dishes */}
          {pantry.size > 0 && (nearCount > 0 || stretchCount > 0) && (
            <div className={`kp-toggle ${showNearMatches ? "on" : ""}`} onClick={() => setShowNearMatches(!showNearMatches)}>
              <div className="kp-toggle-switch" />
              <span>Show dishes I'm close to making</span>
            </div>
          )}

          {pantry.size > 0 && (
            <div className="kp-results-meta">
              {completeCount > 0 && <>{completeCount} ready · </>}
              {nearCount > 0 && <>{nearCount} almost there · </>}
              {stretchCount > 0 && <>{stretchCount} within reach</>}
              {completeCount === 0 && nearCount === 0 && stretchCount === 0 && (
                <>Nothing close yet — Khmer dishes lean on the kroeung. Try adding lemongrass, garlic, kaffir lime leaves, and a protein.</>
              )}
            </div>
          )}

          {/* recipe list */}
          {pantry.size === 0 ? (
            <div className="kp-empty">
              <span className="big">❋ ✦ ❋</span>
              Twelve dishes await. <br />
              Cambodian cooking starts with a few essentials: <br />
              lemongrass, galangal, fish sauce, garlic.
            </div>
          ) : (() => {

            const renderRecipe = (r) => {
              const isOpen = openRecipeId === r.id;
              const isComplete = r.missingCount === 0;
              const cardClass = isComplete ? "complete" : (r.missingCount <= 2 ? "near" : "stretch");

              if (isOpen) {
                return (
                  <div key={r.id} className="kp-detail">
                    <button className="kp-detail-close" onClick={() => setOpenRecipeId(null)}>✕ close</button>
                    <div className="kp-detail-km">{r.km}</div>
                    <div className="kp-detail-rom">{r.rom}</div>
                    <div className="kp-detail-en">{r.en}</div>
                    <div className="kp-detail-blurb">{r.blurb}</div>
                    <div className="kp-detail-info">
                      <span><b>Region</b> {r.region}</span>
                      <span><b>Time</b> {r.time}</span>
                      <span><b>Serves</b> {r.serves}</span>
                    </div>

                    <div className="kp-h3">Ingredients</div>
                    <ul className="kp-ing-list">
                      {r.ingredients.map(id => {
                        const ing = INGREDIENTS[id];
                        const have = pantry.has(id);
                        return (
                          <li key={id}>
                            <span className={have ? "check" : "miss-x check"}>{have ? "✓" : "✕"}</span>
                            <span className="en-name">
                              {ing?.en || id}
                              <span className="em">{ing?.km}</span>
                            </span>
                            {!have && <span className="miss-tag">need</span>}
                          </li>
                        );
                      })}
                      {r.optional && r.optional.length > 0 && r.optional.map(id => {
                        const ing = INGREDIENTS[id];
                        return (
                          <li key={id} style={{opacity:0.6}}>
                            <span className="check">○</span>
                            <span className="en-name">
                              {ing?.en || id}
                              <span className="em">{ing?.km}</span>
                            </span>
                            <span className="opt-tag">optional</span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="kp-h3">Method</div>
                    <ol className="kp-steps">
                      {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>

                    {r.tip && (
                      <div className="kp-tip">
                        <strong>Khmer Tip</strong>{r.tip}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={r.id}
                  className={`kp-card ${cardClass}`}
                  onClick={() => setOpenRecipeId(r.id)}
                >
                  <div className="kp-card-top">
                    <div>
                      <div className="kp-card-km">{r.km}</div>
                      <div className="kp-card-rom">{r.rom}</div>
                      <div className="kp-card-en">{r.en}</div>
                    </div>
                    <span className={`kp-badge ${isComplete ? "" : "miss"}`}>
                      {isComplete ? "Have all" : `Missing ${r.missingCount}`}
                    </span>
                  </div>
                  <div className="kp-card-blurb">{r.blurb}</div>
                  {!isComplete && r.missingIds.length > 0 && (
                    <div className="kp-card-missing">
                      <strong>Need:</strong>{" "}
                      {r.missingIds.slice(0,4).map(id => INGREDIENTS[id]?.en || id).join(", ")}
                      {r.missingIds.length > 4 && `, +${r.missingIds.length - 4} more`}
                    </div>
                  )}
                  <div className="kp-card-meta">
                    <span>{r.region}</span>
                    <span>{r.time}</span>
                    <span>Serves {r.serves}</span>
                  </div>
                </div>
              );
            };

            const sections = [];
            if (buckets.ready.length > 0) {
              sections.push(
                <div key="ready">
                  <div className="kp-bucket-h">
                    <span className="dot ready" />
                    Ready to cook tonight
                    <span className="count">{buckets.ready.length}</span>
                  </div>
                  {buckets.ready.map(renderRecipe)}
                </div>
              );
            }
            if (showNearMatches && buckets.close.length > 0) {
              sections.push(
                <div key="close">
                  <div className="kp-bucket-h">
                    <span className="dot close" />
                    Almost there — missing just 1 or 2
                    <span className="count">{buckets.close.length}</span>
                  </div>
                  {buckets.close.map(renderRecipe)}
                </div>
              );
            }
            if (showNearMatches && buckets.stretch.length > 0) {
              sections.push(
                <div key="stretch">
                  <div className="kp-bucket-h">
                    <span className="dot stretch" />
                    Worth a stop at the market
                    <span className="count">{buckets.stretch.length}</span>
                  </div>
                  {buckets.stretch.map(renderRecipe)}
                </div>
              );
            }

            if (sections.length === 0) {
              return (
                <div className="kp-empty">
                  <span className="big">⌭</span>
                  Nothing close yet. <br />
                  Khmer dishes lean on the kroeung — try lemongrass, garlic,<br/>kaffir lime leaves, and a protein.
                </div>
              );
            }

            return sections;
          })()}
        </section>

        </>}

        {activeTab === "all" && (
          <section>
            <h2 className="kp-section-h"><span className="kh">❋</span>The Cookbook</h2>
            <div className="kp-section-sub">All {RECIPES.length} dishes, sortable by category.</div>

            {(() => {
              const cats = ["All", ...Array.from(new Set(RECIPES.map(r => r.cat || "Other")))];
              return (
                <div className="kp-cat-filter">
                  {cats.map(c => (
                    <span
                      key={c}
                      className={`kp-cat-pill ${categoryFilter === c ? "on" : ""}`}
                      onClick={() => setCategoryFilter(c)}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              );
            })()}

            {(() => {
              const filtered = categoryFilter === "All"
                ? RECIPES
                : RECIPES.filter(r => r.cat === categoryFilter);

              if (filtered.length === 0) {
                return <div className="kp-empty">Nothing in that category.</div>;
              }

              return filtered.map(r => {
                const isOpen = openRecipeId === r.id;
                if (isOpen) {
                  return (
                    <div key={r.id} className="kp-detail">
                      <button className="kp-detail-close" onClick={() => setOpenRecipeId(null)}>✕ close</button>
                      <div className="kp-cat-badge">{r.cat}</div>
                      <div className="kp-detail-km">{r.km}</div>
                      <div className="kp-detail-rom">{r.rom}</div>
                      <div className="kp-detail-en">{r.en}</div>
                      <div className="kp-detail-blurb">{r.blurb}</div>
                      <div className="kp-detail-info">
                        <span><b>Region</b> {r.region}</span>
                        <span><b>Time</b> {r.time}</span>
                        <span><b>Serves</b> {r.serves}</span>
                      </div>

                      <div className="kp-h3">Ingredients</div>
                      <ul className="kp-ing-list">
                        {r.ingredients.map(id => {
                          const ing = INGREDIENTS[id];
                          const have = pantry.has(id);
                          return (
                            <li key={id}>
                              <span className={have ? "check" : "miss-x check"}>{have ? "✓" : "·"}</span>
                              <span className="en-name">
                                {ing?.en || id}
                                <span className="em">{ing?.km}</span>
                              </span>
                            </li>
                          );
                        })}
                        {r.optional && r.optional.length > 0 && r.optional.map(id => {
                          const ing = INGREDIENTS[id];
                          return (
                            <li key={id} style={{opacity:0.6}}>
                              <span className="check">○</span>
                              <span className="en-name">
                                {ing?.en || id}
                                <span className="em">{ing?.km}</span>
                              </span>
                              <span className="opt-tag">optional</span>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="kp-h3">Method</div>
                      <ol className="kp-steps">
                        {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>

                      {r.tip && (
                        <div className="kp-tip">
                          <strong>Khmer Tip</strong>{r.tip}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={r.id}
                    className="kp-card complete"
                    onClick={() => setOpenRecipeId(r.id)}
                  >
                    <div className="kp-card-top">
                      <div>
                        <div className="kp-cat-badge">{r.cat}</div>
                        <div className="kp-card-km">{r.km}</div>
                        <div className="kp-card-rom">{r.rom}</div>
                        <div className="kp-card-en">{r.en}</div>
                      </div>
                    </div>
                    <div className="kp-card-blurb">{r.blurb}</div>
                    <div className="kp-card-meta">
                      <span>{r.region}</span>
                      <span>{r.time}</span>
                      <span>Serves {r.serves}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </section>
        )}

        <div className="kp-foot">
          ❋ Recipes drawn from Khmer cooking sources, including choukhmer, jongphov,
          khmerfoodrecipes, kampucheathmey, thmeythmey, and km.wikipedia. ❋
        </div>
      </div>
    </div>
  );
}
