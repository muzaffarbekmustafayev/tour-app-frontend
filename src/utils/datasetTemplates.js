/**
 * datasetTemplates.js — datas.md asosidagi barcha tayyor obyektlar andozalari.
 * Admin panelidagi "Obyekt yaratish" studiyasida tezkor avto-to'ldirish (Auto-fill) uchun ishlatiladi.
 */

export const ATTRACTION_TEMPLATES = [
  // Nurota
  {
    name: "Nurota Chashma majmuasi",
    district: "Nurota",
    category: "ziyoratgoh",
    location: { lat: "40.5640", lng: "65.6895" },
    address: "Chashma ko'chasi, Nurota shahri",
    descriptionShort: "Muqaddas shifobaxsh buloq, qadimiy Chilustun masjidi va muqaddas marinka baliqlari hovuzi.",
    description: "Nurota Chashma majmuasi — O'zbekistonning eng qadimiy va tabarruk ziyoratgohlaridan biri. Buloq suvi shifobaxsh minerallarga boy bo'lib, unda muqaddas hisoblangan marinka baliqlari suzib yuradi. Majmua tarkibida IX-XVI asrlarga oid Chilustun va Panjvaxte masjidlari, qadimiy hammom va Nurota o'lkashunoslik muzeyi mavjud.",
    video360: { url: "https://www.youtube.com/watch?v=ZZyBG6UsvoQ", type: "youtube", captioned: true },
    bestSeason: "Bahor va Kuz",
    entryFee: "Bepul / Majmua ochiq",
    phone: "+998 79 522-11-22",
    workingHours: "Har kuni 06:00–21:00",
    atmosphere: { mood: "Sokin va ziyoratbop", soundscape: "Buloq suvining shildirashi va qushlar sayrashi", bestTimeOfDay: "Erta tong", localTip: "Erta tongda tashrif buyuring, baliqlarni ovqatlantirish mumkin emas." },
    peakInfo: { peak: "Juma va yakshanba kunlari 10:00–16:00", quiet: "Ish kunlari erta tong", note: "Ziyorat odoblariga rioya qiling" },
    accessibility: { wheelchairAccessible: true, accessibleParking: true, accessibleToilet: true, audioGuides: true, quietZones: true },
    thingsToSeeAround: [
      { title: "Muqaddas baliqlar hovuzi", description: "Buloq suvi chiqadigan markaziy hovuz", type: "diniy", walkingMinutes: 2 },
      { title: "Nur qal'asi xarobalari", description: "Aleksandr Makedonskiy davri istehkomi", type: "tarix", walkingMinutes: 15 },
      { title: "Hunarmandlar rastasi", description: "Nurota so'zanasi va suvenirlar", type: "bozor", walkingMinutes: 5 }
    ]
  },
  {
    name: "Nur qal'asi (Makedonskiy qal'asi)",
    district: "Nurota",
    category: "tarixiy",
    location: { lat: "40.5678", lng: "65.6912" },
    address: "Tog' etagi, Nurota shahri",
    descriptionShort: "Miloddan avvalgi IV asrda Aleksandr Makedonskiy tomonidan qurilgan qadimiy harbiy istehkom xarobalari.",
    description: "Nur qal'asi — miloddan avvalgi 327-yilda Aleksandr Makedonskiy harbiy yurishlari davrida barpo etilgan yirik mudofaa qo'rg'oni. Tepalikda joylashganligi sababli butun voha va tog' daralarini kuzatish imkonini bergan. Qal'a poyida qadimiy yerosti korizlari joylashgan.",
    video360: { url: "https://www.youtube.com/watch?v=ZZyBG6UsvoQ", type: "youtube", captioned: false },
    bestSeason: "Mart–Iyun, Sentabr–Noyabr",
    entryFee: "Bepul",
    phone: "",
    workingHours: "Kunduzi ochiq",
    atmosphere: { mood: "Qadimiy va sirli", soundscape: "Tog' shamoli", bestTimeOfDay: "Quyosh botishi", localTip: "Tepalikka chiqishda qulay poyabzal kiying, quyosh botishi ajoyib ko'rinadi." },
    accessibility: { accessibleParking: true, audioGuides: true },
    thingsToSeeAround: [
      { title: "Chashma majmuasi", description: "Muqaddas buloq", type: "diniy", walkingMinutes: 12 },
      { title: "Qadimiy korizlar tizimi", description: "Yerosti suv kanallari", type: "tarix", walkingMinutes: 10 }
    ]
  },
  {
    name: "Sarmishsoy qoyatosh suratlari (Petrogliflar)",
    district: "Nurota",
    category: "tabiat",
    location: { lat: "40.4555", lng: "65.4525" },
    address: "Sarmish darasi, Nurota tog' tizmasi",
    descriptionShort: "4000 dan ortiq 7000 yillik qadimiy petrogliflar — ochiq osmon ostidagi jahon ahamiyatiga ega muzey.",
    description: "Sarmishsoy — bronza va tosh davriga oid noyob qoyatosh suratlari galereyasi. Qoyalarda qadimgi odamlar, ov sahnalari, kiyiklar, qoplonlar va diniy ramzlar o'yib ishlangan. UNESCO Umumjahon merosi ro'yxatiga kiritish tavsiya etilgan.",
    video360: { url: "https://www.youtube.com/watch?v=F0m9n8-VvQc", type: "youtube", captioned: false },
    bestSeason: "Aprel–Iyun, Sentabr–Oktabr",
    entryFee: "15 000 so'm / Bepul",
    phone: "+998 79 229-22-22",
    workingHours: "08:00–18:00",
    atmosphere: { mood: "Tabiiy va tarixiy energetika", soundscape: "Soy shildirashi va tog' aks-sadosi", bestTimeOfDay: "Quyosh botishidan oldin", localTip: "Qiya yorug'likda suratlar juda tiniq ko'rinadi." },
    accessibility: { accessibleParking: true, audioGuides: true, quietZones: true, serviceAnimalFriendly: true },
    thingsToSeeAround: [
      { title: "Ov sahnalari petrogliflari", description: "Asosiy qoyatosh suratlari", type: "tarix", walkingMinutes: 10 },
      { title: "Sarmish darasi sharsharasi", description: "Tabiiy sharshara", type: "tabiat", walkingMinutes: 25 }
    ]
  },
  {
    name: "Sentob qadimiy tog' qishlog'i",
    district: "Nurota",
    category: "tabiat",
    location: { lat: "40.5820", lng: "66.0120" },
    address: "Sentob qishlog'i, Nurota tog'lari",
    descriptionShort: "Qadimiy tosh uylar, yong'oqzorlar va qadimiy arab yozuvli qoyalar bilan mashhur UNESCO ekoturizm qishlog'i.",
    description: "Sentob qishlog'i Nurota tog' tizmasi bag'rida, o'ziga xos tosh me'morchiligi, ming yillik yong'oq daraxtlari va musaffo buloqlari bilan mashhur. Qishloqda xalqaro ekoturizm va mehmondo'st oilaviy uylar keng yo'lga qo'yilgan.",
    video360: { url: "https://www.youtube.com/watch?v=F0m9n8-VvQc", type: "youtube", captioned: false },
    bestSeason: "Aprel–Oktabr",
    entryFee: "Bepul",
    phone: "+998 93 312-44-55",
    workingHours: "Har kuni ochiq",
    atmosphere: { mood: "Etnik, osoyishta va xushmanzara", soundscape: "Soy suvi va barglar shitirlashi", bestTimeOfDay: "Kunning ikkinchi yarmi", localTip: "Mahalliy aholining an'anaviy non va pishloqlaridan tatib ko'ring." },
    accessibility: { accessibleParking: true, quietZones: true },
    thingsToSeeAround: [
      { title: "Sentobsoy darasi", description: "Tog' darasi bo'ylab sayr", type: "tabiat", walkingMinutes: 5 },
      { title: "Qadimiy tosh qal'a qoldiqlari", description: "O'rta asr istehkomi", type: "tarix", walkingMinutes: 20 }
    ]
  },

  // Xatirchi
  {
    name: "Polkan baxshi xotira majmuasi",
    district: "Xatirchi",
    category: "madaniy",
    location: { lat: "40.2515", lng: "65.9565" },
    address: "Yangirabot shaharchasi, Xatirchi tumani",
    descriptionShort: "O'zbek xalq dostonchilik san'ati va mashhur baxshi Polkan shoir merosiga bag'ishlangan madaniyat maskani.",
    description: "Xatirchi xalq dostonchiligi va baxshichilik maktabining beshigi hisoblanadi. Majmuada mashhur Polkan baxshi (Po'lkan shoir) haykali, xalq dostonlari zallari va do'mbira san'ati maktabi faoliyat ko'rsatadi.",
    video360: { url: "https://www.youtube.com/watch?v=ZZyBG6UsvoQ", type: "youtube", captioned: true },
    bestSeason: "Bahor, Kuz",
    entryFee: "Bepul",
    phone: "+998 79 542-11-22",
    workingHours: "09:00–18:00",
    atmosphere: { mood: "Baxshiyona, milliy va tantanavor", soundscape: "Do'mbira nag'malari", bestTimeOfDay: "Kechki payt", localTip: "Hafta oxiridagi jonli baxshichilik ijrolarini tinglang." },
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, audioGuides: true },
    thingsToSeeAround: [
      { title: "Baxshichilik maktabi", description: "Yosh baxshilar sinfi", type: "madaniy", walkingMinutes: 2 },
      { title: "Zarafshon daryosi sohili", description: "Daryo bo'yi xiyoboni", type: "tabiat", walkingMinutes: 12 }
    ]
  },
  {
    name: "Sangijumon (Tebranma toshlar) yodgorligi",
    district: "Xatirchi",
    category: "tabiat",
    location: { lat: "40.3345", lng: "66.0820" },
    address: "Sangijumon qishlog'i, Xatirchi",
    descriptionShort: "Tabiat mo'jizasi — bir barmoq turtkisi bilan tebranuvchi ulkan granit xarsangtoshlar va shifobaxsh buloqlar darasi.",
    description: "Sangijumon — Xatirchi tog'laridagi ajoyib geologik mo'jiza. Bir necha tonnalik ulkan granit toshlar tog' cho'qqisida muvozanatda turadi va oddiy turtki bilan tebranadi. Bu yerda shifobaxsh buloq va ziyoratgoh ham joylashgan.",
    video360: { url: "https://www.youtube.com/watch?v=F0m9n8-VvQc", type: "youtube", captioned: false },
    bestSeason: "Aprel–Iyun, Sentabr–Oktabr",
    entryFee: "Bepul",
    phone: "",
    workingHours: "Kunduzi ochiq",
    atmosphere: { mood: "Hayratlanarli, toza tog' havosi", soundscape: "Shabboda va toshlar jaranggi", bestTimeOfDay: "Tushdan so'ng", localTip: "Tebranuvchi toshni o'z qo'lingiz bilan tebratib ko'ring." },
    accessibility: { accessibleParking: true, audioGuides: true, quietZones: true },
    thingsToSeeAround: [
      { title: "Sangijumon soy sharsharasi", description: "Salqin tog' sharsharasi", type: "tabiat", walkingMinutes: 15 },
      { title: "Shifobaxsh ziyorat bulog'i", description: "Tabiiy mineral buloq", type: "diniy", walkingMinutes: 5 }
    ]
  },
  {
    name: "Angidon turizm qishlog'i va sharsharasi",
    district: "Xatirchi",
    category: "tabiat",
    location: { lat: "40.3520", lng: "66.0450" },
    address: "Angidon qishlog'i, Xatirchi tog'lari",
    descriptionShort: "Xatirchining eng go'zal tog' turizm maskanlaridan biri — musaffo havo, sharshara, yong'oqzorlar va milliy mehmondo'stlik.",
    description: "Angidon — Xatirchi tumanining baland tog'li qismidagi mashhur turizm qishlog'i. Go'zal sharsharalari, salqin tog' iqlimi, mevali bog'lari va o'ziga xos selfi maydonlari bilan sayyohlarni o'ziga tortadi.",
    video360: { url: "https://www.youtube.com/watch?v=F0m9n8-VvQc", type: "youtube", captioned: false },
    bestSeason: "May–Oktabr",
    entryFee: "Bepul",
    phone: "+998 90 654-22-11",
    workingHours: "Har kuni ochiq",
    atmosphere: { mood: "Ekoturizm, yashil tabiat va sokinlik", soundscape: "Sharshara shovqini", bestTimeOfDay: "Kun davomida", localTip: "Yozgi jaziramada salqin tog' suvida dam olish uchun ajoyib maskan." },
    accessibility: { accessibleParking: true, quietZones: true },
    thingsToSeeAround: [
      { title: "Angidon sharsharasi", description: "Baland tog' sharsharasi", type: "tabiat", walkingMinutes: 10 },
      { title: "Tog' selfi maydoni", description: "Panoramik fotosessiya", type: "tabiat", walkingMinutes: 2 }
    ]
  },

  // Qiziltepa
  {
    name: "Toshmasjid majmuasi (Vangozi)",
    district: "Qiziltepa",
    category: "tarixiy",
    location: { lat: "40.0072", lng: "64.8472" },
    address: "Vangozi qishlog'i, Qiziltepa tumani",
    descriptionShort: "XVI asrga oid toshdan barpo etilgan noyob masjid, qadimiy baland minora va madrasa majmuasi.",
    description: "Vangozi Toshmasjidi — XVI asrda pishiq tosh va g'ishtdan bunyod etilgan me'moriy durdona. Majmuadagi 24 metrli qadimiy minora o'zining nafis geometrik tosh naqshlari bilan Buxoro me'morchilik maktabining eng yuksak namunalaridan biridir.",
    video360: { url: "https://www.youtube.com/watch?v=vV_X1xR-oO8", type: "youtube", captioned: true },
    bestSeason: "Mart–May, Sentabr–Noyabr",
    entryFee: "Bepul",
    phone: "+998 79 552-11-22",
    workingHours: "Har kuni 08:00–20:00",
    atmosphere: { mood: "Qadimiy qishloq me'morchiligi nafasi", soundscape: "Sokin qishloq sukunati", bestTimeOfDay: "Ertalab yoki quyosh botishi", localTip: "Minoraning tosh naqshlariga alohida e'tibor bering." },
    accessibility: { wheelchairAccessible: true, accessibleParking: true, audioGuides: true, quietZones: true },
    thingsToSeeAround: [
      { title: "Vangozi qadimiy minorasi", description: "XVI asr minorasi", type: "tarix", walkingMinutes: 1 },
      { title: "Qadimiy So'g'd manzilgohi xarobalari", description: "Arxeologik tepalik", type: "tarix", walkingMinutes: 20 }
    ]
  },
  {
    name: "Xoja Boyazid Bistomiy ziyoratgohi va masjidi",
    district: "Qiziltepa",
    category: "ziyoratgoh",
    location: { lat: "40.0185", lng: "64.8555" },
    address: "Bo'ston mahallasi, Qiziltepa",
    descriptionShort: "Mashhur buyuk so'fiy alloma Boyazid Bistomiy (801–875) xotirasiga atalgan tinch va ko'kalamzor muqaddas ziyoratgoh.",
    description: "Tasavvuf ta'limotining buyuk vakili Boyazid Bistomiy xotirasiga atab Bo'ston qishlog'ida barpo etilgan ziyoratgoh. Majmua ko'kalamzorlashtirilgan, asriy daraxtlar, qadimiy hovuz va ayvonli masjiddan iborat.",
    video360: { url: "https://www.youtube.com/watch?v=vV_X1xR-oO8", type: "youtube", captioned: true },
    bestSeason: "Yil bo'yi",
    entryFee: "Bepul",
    phone: "+998 79 552-10-02",
    workingHours: "06:00–21:00",
    atmosphere: { mood: "Sokin va ma'naviy xotirjamlik", soundscape: "Chinor barglari shitirlashi", bestTimeOfDay: "Peshin va asr oralig'i", localTip: "Majmuadagi qadimiy chinorlar soyasida hordiq chiqaring." },
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, brailleSigns: true },
    thingsToSeeAround: [
      { title: "Qiziltepa markaziy istirohat bog'i", description: "Yoshlik bog'i", type: "tabiat", walkingMinutes: 8 },
      { title: "Dehqon bozori", description: "Mevalar va suvenirlar", type: "bozor", walkingMinutes: 10 }
    ]
  },

  // Navoiy shahri
  {
    name: "Alisher Navoiy nomidagi Milliy bog' va Ko'l",
    district: "Navoiy shahri",
    category: "istirohat_bogi",
    location: { lat: "40.0982", lng: "65.3725" },
    address: "Islom Karimov ko'chasi, Navoiy shahri",
    descriptionShort: "Markaziy yirik sun'iy ko'l, favvoralar, dam olish xiyobonlari va madaniy tadbirlar maydoni.",
    description: "Navoiy shahrining markaziy yuragi — Alisher Navoiy nomidagi milliy istirohat bog'i. Katta sun'iy ko'l, qayiqda sayr qilish stansiyalari, yorug'likli musiqiy favvoralar, qahvaxonalar va to'liq to'siqsiz zamonaviy xiyobonlarga ega.",
    video360: { url: "https://www.youtube.com/watch?v=ZZyBG6UsvoQ", type: "youtube", captioned: true },
    bestSeason: "Aprel–Noyabr",
    entryFee: "Bepul",
    phone: "+998 79 223-20-00",
    workingHours: "06:00–24:00",
    atmosphere: { mood: "Zamonaviy, xushhavo va gavjum", soundscape: "Ko'l to'lqini va shahar musiqasi", bestTimeOfDay: "Kechki payt", localTip: "Kechki chiroqlar yoqilganda ko'l bo'yida sayr qilish juda maroqli." },
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, brailleSigns: true },
    thingsToSeeAround: [
      { title: "Viloyat musiqali drama teatri", description: "Teatr saroyi", type: "madaniy", walkingMinutes: 6 },
      { title: "Yoshlar xiyoboni", description: "Xiyobon", type: "tabiat", walkingMinutes: 5 }
    ]
  },
  {
    name: "Navoiy viloyat tarixi va o'lkashunoslik muzeyi",
    district: "Navoiy shahri",
    category: "madaniy",
    location: { lat: "40.1044", lng: "65.3791" },
    address: "Xalqlar do'stligi shoh ko'chasi, Navoiy",
    descriptionShort: "Qizilqum florasi, faunasi, konchilik tarixi, arxeologik topilmalar va petrogliflar nusxalari muzeyi.",
    description: "Viloyatning eng yirik muzeyi. 40 mingdan ortiq eksponat: qadimgi Sarmishsoy petrogliflari nusxalari, antik davr tangalari, Buyuk Ipak yo'li karvon ashyolari, Nurota kashtachiligi va zamonaviy konchilik tarixi ekspozitsiyalari.",
    video360: { url: "https://www.youtube.com/watch?v=ZZyBG6UsvoQ", type: "youtube", captioned: true },
    bestSeason: "Yil bo'yi",
    entryFee: "10 000 so'm / Xorijiy: 25 000 so'm",
    phone: "+998 79 224-15-50",
    workingHours: "09:00–18:00 (Dushanba dam)",
    atmosphere: { mood: "Ilmiy, ma'rifiy va qiziqarli", soundscape: "Muzey sokinligi", bestTimeOfDay: "Kunduzi", localTip: "Petrogliflar va qadimiy numizmatika zalini albatta ko'ring." },
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, audioGuides: true, brailleSigns: true },
    thingsToSeeAround: [
      { title: "G'alaba bog'i", description: "Shahar istirohat bog'i", type: "tabiat", walkingMinutes: 5 },
      { title: "Markaziy amfiteatr", description: "Konsert zali", type: "madaniy", walkingMinutes: 8 }
    ]
  }
];

export const CIVIC_SERVICE_TEMPLATES = [
  // Navoiy shahri
  {
    name: "Respublika shoshilinch tez tibbiy yordam markazi (Navoiy filiali)",
    district: "Navoiy shahri",
    category: "kasalxona",
    location: { lat: "40.1085", lng: "65.3815" },
    address: "Ibn Sino ko'chasi 6, Navoiy shahri",
    descriptionShort: "24/7 shoshilinch tez tibbiy yordam, jarrohlik, travmatologiya, reanimatsiya va qabul bo'limi.",
    description: "Viloyatning bosh shoshilinch tibbiy yordam markazi. Sayyohlar va aholiga 24 soat uzluksiz malakali tez tibbiy yordam, diagnostika va statsionar davolash xizmatlari ko'rsatiladi.",
    phone: "103 / +998 79 224-03-03",
    workingHours: "24/7 Uzluksiz",
    emergencyContact: "103",
    accessibility: { wheelchairAccessible: true, accessibleParking: true, accessibleToilet: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Navoiy viloyat IIB (Xavfsiz turizm bo'limi)",
    district: "Navoiy shahri",
    category: "iib",
    location: { lat: "40.1030", lng: "65.3710" },
    address: "Navoiy ko'chasi 7, Navoiy shahri",
    descriptionShort: "Sayyohlar xavfsizligini ta'minlash, xorijiy fuqarolarga ko'mak, yo'qolgan buyumlar va huquqiy yordam.",
    description: "Xavfsiz turizm bo'limi xodimlari chet tillarida erkin muloqot qiladi va sayyohlarga yo'nalish berish, favqulodda vaziyatlarda tezkor huquqiy va xavfsizlik yordami ko'rsatadi.",
    phone: "102 / +998 79 229-22-22",
    workingHours: "24/7 Navbatchilik",
    emergencyContact: "102",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Navoiy xalqaro aeroporti (NVI)",
    district: "Navoiy shahri",
    category: "transport",
    location: { lat: "40.1178", lng: "65.1750" },
    address: "M37 trassasi, Navoiy",
    descriptionShort: "Xalqaro va mahalliy reyslar, VIP/CIP zallari, valyuta ayirboshlash, taksi va avtobus xizmati.",
    description: "Navoiy xalqaro aeroporti xalqaro yo'lovchi va kargo tashuvlarini amalga oshiruvchi zamonaviy havo bandargohi hisoblanadi. Barcha xalqaro inklyuzivlik standartlariga javob beradi.",
    phone: "+998 79 220-40-00",
    workingHours: "24/7 Reyslar jadvali bo'yicha",
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, audioGuides: true, brailleSigns: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Navoiy Markaziy temir yo'l vokzali",
    district: "Navoiy shahri",
    category: "transport",
    location: { lat: "40.1190", lng: "65.3645" },
    address: "Hayot MFY, Vokzal ko'chasi 1",
    descriptionShort: "'Afrosiyob', 'Sharq' tezyurar va xalqaro poyezdlar vokzali, chiptaxona, kutish zali, ona-bola xonasi.",
    description: "Toshkent–Samarqand–Buxoro–Xiva tezyurar poyezdlari to'xtaydigan yirik transport tuguni. Peronlar, kutish zallari va kafelar to'liq to'siqsiz infratuzilmaga ega.",
    phone: "1005 / +998 79 225-12-22",
    workingHours: "24/7 Uzluksiz",
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, brailleSigns: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Navoiy Markaziy dehqon bozori",
    district: "Navoiy shahri",
    category: "bozor",
    location: { lat: "40.1065", lng: "65.3840" },
    address: "G'alaba shoh ko'chasi, 17-mikrorayon",
    descriptionShort: "Yangi meva-sabzavotlar, quruq mevalar, milliy taomlar, hunarmandchilik suvenirlari va ziravorlar.",
    description: "Navoiy shahrining asosiy savdo bozori. Sarxil mevalar, shirin qovun-tarvuzlar, quritilgan mevalar va esdalik sovg'alari xaridi uchun qulay maskan.",
    phone: "+998 79 224-55-66",
    workingHours: "07:00–19:00 (Dushanba sanitariya)",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Korzinka Supermarketi (8-mikrorayon)",
    district: "Navoiy shahri",
    category: "supermarket",
    location: { lat: "40.0995", lng: "65.3740" },
    address: "Islom Karimov shoh ko'chasi 27A, 8-mikrorayon",
    descriptionShort: "Shaharning eng yirik supermarketlaridan biri. Oziq-ovqat, tayyor taomlar, import tovarlar, bankomatlar va valyuta ayirboshlash.",
    description: "Zamonaviy qulay supermarket. Sarxil pishiriqlar, salatlar, ichimliklar, xalqaro to'lov kartalari (Visa, Mastercard) qabul qilinadi, valyuta ayirboshlash shoxobchasi va 24/7 bankomatlar mavjud.",
    phone: "+998 78 140-14-14",
    workingHours: "08:00–24:00",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Istiqlol Savdo Majmuasi (Mega Mall)",
    district: "Navoiy shahri",
    category: "mall",
    location: { lat: "40.1055", lng: "65.3785" },
    address: "Xalqlar do'stligi shoh ko'chasi 20, Navoiy",
    descriptionShort: "Ko'p qavatli savdo majmuasi: kiyim-kechak butiklari, kosmetika, bolalar o'yingohi, fud-kort va kafelar.",
    description: "Zamonaviy ko'ngilochar savdo markazi. Do'konlar, kiyim-kechak brendlari, bolalar o'yin maydoni va xilma-xil taomlar taklif etuvchi fud-kort majmuasi.",
    phone: "+998 79 223-88-99",
    workingHours: "09:00–22:00",
    accessibility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },

  // Nurota
  {
    name: "Nurota tuman tibbiyot birlashmasi (Shoshilinch yordam)",
    district: "Nurota",
    category: "kasalxona",
    location: { lat: "40.5665", lng: "65.6860" },
    address: "U. Yusupov ko'chasi 18, Nurota",
    descriptionShort: "Tuman markaziy shifoxonasi, 24/7 tez tibbiy yordam stansiyasi, dorixona va birinchi tibbiy yordam.",
    description: "Nurota tumani markaziy shifoxonasi va tez yordam bo'limi. 24 soatlik navbatchilik xizmati, travmatologiya va shoshilinch yordam brigadalari mavjud.",
    phone: "103 / +998 79 522-12-03",
    workingHours: "24/7 Uzluksiz",
    emergencyContact: "103",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Nurota tuman IIB (Sayyohlar xavfsizlik posti)",
    district: "Nurota",
    category: "iib",
    location: { lat: "40.5630", lng: "65.6880" },
    address: "Islom Karimov ko'chasi 48, Nurota",
    descriptionShort: "Sayyohlarga yo'l ko'rsatish, jamoat xavfsizligini ta'minlash, 24/7 navbatchilik va huquqiy ko'mak.",
    description: "Chashma majmuasi yonidagi tuman IIB sayyohlar xavfsizlik posti. Ziyoratchilar va xorijiy sayyohlarga yo'nalish berish va xavfsizlikni ta'minlash xizmatlari.",
    phone: "102 / +998 79 522-10-02",
    workingHours: "24/7 Navbatchilik",
    emergencyContact: "102",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Nur Oazis Savdo Majmuasi va Supermarketi",
    district: "Nurota",
    category: "supermarket",
    location: { lat: "40.5642", lng: "65.6905" },
    address: "Chashma ko'chasi 15, Nurota",
    descriptionShort: "Nurota markazidagi universal savdo markazi: oziq-ovqat supermarketi, ichimliklar, sayyohlik tovarlari va 24/7 bankomat.",
    description: "Nurota markazidagi qulay xarid markazi. Oziq-ovqat, shaxsiy gigiyena, sayyohlik anjomlari va bank xizmatlari.",
    phone: "+998 93 430-15-15",
    workingHours: "08:00–22:00",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },

  // Xatirchi
  {
    name: "Xatirchi tuman tibbiyot birlashmasi (Shoshilinch yordam)",
    district: "Xatirchi",
    category: "kasalxona",
    location: { lat: "40.2560", lng: "65.9520" },
    address: "Yangirabot shaharchasi, M. Bobomurodov ko'chasi",
    descriptionShort: "24/7 tez tibbiy yordam, tuman markaziy kasalxonasi, travmatologiya va shoshilinch qabulxona.",
    description: "Xatirchi tumani markaziy shifoxonasi. Jarrohlik, terapiya, bolalar bo'limi va 24/7 tez yordam stansiyasi.",
    phone: "103 / +998 79 542-12-03",
    workingHours: "24/7 Uzluksiz",
    emergencyContact: "103",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Imkon Savdo Markazi va Gipermarketi",
    district: "Xatirchi",
    category: "mall",
    location: { lat: "40.2525", lng: "65.9555" },
    address: "Yangirabot shaharchasi, Mustaqillik ko'chasi",
    descriptionShort: "Xatirchidagi eng yirik savdo majmualaridan biri: oziq-ovqat supermarketi, kiyim-kechak, maishiy tovarlar va bankomat.",
    description: "Xatirchi tuman markazidagi universal savdo markazi. Supermarket, maishiy buyumlar, kiyim do'konlari va qulay xizmatlar.",
    phone: "+998 79 542-30-30",
    workingHours: "08:00–22:00",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },

  // Qiziltepa
  {
    name: "Qiziltepa tuman tibbiyot birlashmasi (Shoshilinch yordam)",
    district: "Qiziltepa",
    category: "kasalxona",
    location: { lat: "40.0165", lng: "64.8510" },
    address: "Shifokorlar ko'chasi 1, Bo'ston MFY, Qiziltepa",
    descriptionShort: "24/7 tez tibbiy yordam, tuman markaziy shifoxonasi, jarrohlik, terapiya va dorixona tarmog'i.",
    description: "Qiziltepa tumani bosh shifoxonasi va shoshilinch tez tibbiy yordam markazi. 24 soatlik xizmat va tezkor statsionar ko'mak.",
    phone: "103 / +998 79 552-12-03",
    workingHours: "24/7 Uzluksiz",
    emergencyContact: "103",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  },
  {
    name: "Bazaar Market Supermarketi",
    district: "Qiziltepa",
    category: "supermarket",
    location: { lat: "40.0192", lng: "64.8545" },
    address: "Bo'ston MFY, O'zbekiston shoh ko'chasi",
    descriptionShort: "Qiziltepa markazidagi zamonaviy supermarket: oziq-ovqat, sarxil ichimliklar, gigiyena tovarlari va bankomat.",
    description: "Qiziltepa shahar markazidagi zamonaviy do'kon. Oziq-ovqat mahsulotlari, ichimliklar, qandolat va kundalik ehtiyoj mollari.",
    phone: "+998 91 333-88-77",
    workingHours: "08:00–23:00",
    accessibility: { wheelchairAccessible: true, accessibleParking: true },
    bestSeason: "Yil bo'yi"
  }
];

export const HOTEL_TEMPLATES = [
  {
    name: "Grand Navoiy Hotel",
    district: "Navoiy shahri",
    city: "Navoiy",
    category: "hotel",
    stars: 4,
    location: { lat: "40.1012", lng: "65.3745" },
    address: "Islom Karimov shoh ko'chasi 24, Navoiy",
    descriptionShort: "Shahar markazidagi biznes va sayyohlik mehmonxonasi. Xalqaro inklyuzivlik standartlariga to'liq javob beradi.",
    description: "Grand Navoiy Hotel — shahar markazida joylashgan premium darajadagi mehmonxona. Unda 40 dan ortiq to'liq jihozlangan shinam xonalar, xalqaro restoran, yopiq basseyn, spa va konferens zallari mavjud. Inklyuzivlik: liftlar, roll-in dush, Brayl yozuvlari va taktil yo'laklar bilan to'liq ta'minlangan.",
    amenities: ["Free WiFi", "Restaurant", "Parking", "Air Conditioning", "Pool", "Gym", "Room Service", "24h Reception", "Halal Food"],
    contact: { phone: "+998 79 224-50-00", email: "info@grandnavoiy.uz", website: "https://grandnavoiy.uz" },
    accessibility: {
      mobility: { wheelchairAccessible: true, accessibleRooms: true, accessibleToilet: true, elevator: true, accessibleParking: true, stepFreeRoute: true },
      visual: { brailleSigns: true, tactilePaving: true, highContrastSignage: true },
      auditory: { hearingAssistance: true, signLanguageStaff: true }
    }
  },
  {
    name: "Nurota Chashma Resort",
    district: "Nurota",
    city: "Nurota",
    category: "resort",
    stars: 4,
    location: { lat: "40.5635", lng: "65.6889" },
    address: "Chashma ko'chasi 7-uy, Nurota",
    descriptionShort: "Chashma majmuasiga 200m masofadagi barcha qulayliklarga ega zamonaviy inklyuziv dam olish maskani.",
    description: "Muqaddas Chashma majmuasiga piyoda 2 daqiqalik masofada joylashgan qulay oromgoh. Mehmonxona shinam xonalar, milliy taomlar restorani, soya-salqin bog' va ziyoratchilar uchun barcha qulayliklar bilan jihozlangan.",
    amenities: ["Free WiFi", "Restaurant", "Parking", "Air Conditioning", "Room Service", "Family Rooms", "Halal Food"],
    contact: { phone: "+998 79 522-15-15", email: "chashma.resort@mail.uz" },
    accessibility: {
      mobility: { wheelchairAccessible: true, accessibleRooms: true, accessibleToilet: true, accessibleParking: true, stepFreeRoute: true },
      visual: { brailleSigns: true, highContrastSignage: true },
      auditory: { hearingAssistance: true }
    }
  },
  {
    name: "Sarmishsoy Eco Lodge",
    district: "Nurota",
    city: "Nurota",
    category: "resort",
    stars: 3,
    location: { lat: "40.4550", lng: "65.4520" },
    address: "Sarmish darasi, Nurota",
    descriptionShort: "Sarmishsoy petrogliflariga yaqin, tog' etagidagi tabiat bilan uyg'un ekologik yog'och kottejlar.",
    description: "Tog' bag'ridagi ekologik kottejlar oromgohi. Tabiat qo'ynida dam olish, otda va piyoda sayohatlar, gulxan atrofidagi kechki dasturlar va toza tog' havosi maskani.",
    amenities: ["Parking", "Restaurant", "Family Rooms", "Halal Food"],
    contact: { phone: "+998 90 500-12-34" },
    accessibility: {
      mobility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true }
    }
  },
  {
    name: "Sentob Yurt & Eco Guesthouse",
    district: "Nurota",
    city: "Sentob",
    category: "guesthouse",
    stars: 3,
    location: { lat: "40.5830", lng: "66.0140" },
    address: "Sentob qishlog'i, Nurota",
    descriptionShort: "Qadimiy tog' qishlog'ida joylashgan milliy mehmondo'stlik maskani, toza havo va eko-turizm qulayliklari.",
    description: "UNESCO tavsiyasidagi Sentob qishlog'ida joylashgan an'anaviy tosh uy va o'tovlar maskani. Mehmonlarga milliy taomlar, qishloq mevalari va tog' sayohatlari gidi xizmatlari taqdim etiladi.",
    amenities: ["Free WiFi", "Parking", "Family Rooms", "Halal Food"],
    contact: { phone: "+998 93 312-44-55" },
    accessibility: {
      mobility: { accessibleParking: true, stepFreeRoute: true }
    }
  },
  {
    name: "To'dako'l Beach & Resort",
    district: "Qiziltepa",
    city: "Qiziltepa",
    category: "resort",
    stars: 4,
    location: { lat: "39.8560", lng: "64.8540" },
    address: "To'dako'l qirg'og'i, Qiziltepa",
    descriptionShort: "Ko'l bo'yidagi premium dam olish majmuasi, qumli plyaj, yozgi kottejlar, suzish havzasi va restoran.",
    description: "To'dako'l sohilidagi eng yirik plyaj va dam olish kompleksi. Ochiq suzish havzalari, yaxtalar, bolalar akvaparki, baliq taomlari restorani va oilaviy kottejlar.",
    amenities: ["Free WiFi", "Restaurant", "Parking", "Pool", "Air Conditioning", "Family Rooms", "Halal Food"],
    contact: { phone: "+998 79 552-40-40" },
    accessibility: {
      mobility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true, stepFreeRoute: true }
    }
  },
  {
    name: "Xatirchi Mehmon Saroyi",
    district: "Xatirchi",
    city: "Yangirabot",
    category: "hotel",
    stars: 3,
    location: { lat: "40.2510", lng: "65.9560" },
    address: "Mustaqillik ko'chasi 12, Yangirabot",
    descriptionShort: "Polkan baxshi majmuasiga yaqin, milliy an'analar va zamonaviy qulayliklarni birlashtirgan maskan.",
    description: "Xatirchi tuman markazidagi qulay mehmonxona. Shinam xonalar, restoran, xavfsiz avtoturargoh va transport xizmatlari.",
    amenities: ["Free WiFi", "Restaurant", "Parking", "Air Conditioning", "Room Service", "24h Reception"],
    contact: { phone: "+998 79 542-15-00" },
    accessibility: {
      mobility: { wheelchairAccessible: true, accessibleToilet: true, accessibleParking: true }
    }
  }
];
