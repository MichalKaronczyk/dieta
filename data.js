// Domyślny plan — źródło: "Plan Żywieniowy i Treningowy - Redukcja 2400 kcal V2"
// Zmiany robione w aplikacji zapisują się w localStorage i nadpisują ten plik.

const DEFAULT_PLAN = {
  version: 1,
  title: "Redukcja 2400 kcal",
  target: 2400,
  days: [
    {
      id: "mon", name: "Poniedziałek", short: "Pn",
      activity: "Siłownia (FBW)", activityIcon: "🏋️",
      meals: [
        { id: "mon-1", slot: "Śniadanie", name: "Jajecznica z warzywami", items: "4 jajka L, 3 kromki chleba żytniego (90g), 10g masła, 1 duży pomidor", kcal: 600 },
        { id: "mon-2", slot: "Przekąska", name: "Skyr orzechowo-owocowy", items: "Skyr waniliowy (150g), 100g borówek, 20g masła orzechowego", kcal: 300 },
        { id: "mon-3", slot: "Obiad", name: "Kurczak z Air Fryer", items: "250g piersi z kurczaka, 400g ziemniaków, 15g oliwy, 150g mizerii", kcal: 800, note: "Gotuj x2 — porcja na wtorek" },
        { id: "mon-4", slot: "Kolacja", name: "Tortilla z wędliną i serem", items: "2 tortille pełnoziarniste, 100g szynki drobiowej, 60g mozzarelli light, szpinak, sos czosnkowy (skyr)", kcal: 750 },
      ],
    },
    {
      id: "tue", name: "Wtorek", short: "Wt",
      activity: "Bieganie (2–3 km)", activityIcon: "🏃",
      meals: [
        { id: "tue-1", slot: "Śniadanie", name: "Sadzone jajka z szynką", items: "3 jajka L, 50g szynki z piersi indyka, 3 kromki chleba żytniego, 10g masła, ogórek", kcal: 600 },
        { id: "tue-2", slot: "Przekąska", name: "Bananowy budyń proteinowy", items: "Pudding proteinowy (200g), 1 średni banan", kcal: 300 },
        { id: "tue-3", slot: "Obiad", name: "Odgrzany kurczak", items: "Wczorajsza porcja kurczaka z ziemniakami z Air Fryer", kcal: 800, note: "Z poniedziałku" },
        { id: "tue-4", slot: "Kolacja", name: "Domowy burger z chudej wołowiny", items: "1 bułka pełnoziarnista, 150g chudej mielonej wołowiny, plaster cheddara light, sałata, 150g ziemniaków z Air Fryer", kcal: 750 },
      ],
    },
    {
      id: "wed", name: "Środa", short: "Śr",
      activity: "Pływanie (300–400 m)", activityIcon: "🏊",
      meals: [
        { id: "wed-1", slot: "Śniadanie", name: "Jajecznica z łososiem", items: "3 jajka, 50g wędzonego łososia, 2 kromki chleba żytniego, 10g masła, rzodkiewka", kcal: 600 },
        { id: "wed-2", slot: "Przekąska", name: "Chrupiący serek wiejski", items: "Serek wiejski lekki (200g), 1 małe jabłko, 15g orzechów włoskich", kcal: 300 },
        { id: "wed-3", slot: "Obiad", name: "Makaron z indykiem", items: "100g makaronu pełnoziarnistego, 150g mielonego indyka, krojone pomidory, 10g oliwy, 30g mozzarelli light", kcal: 800, note: "Gotuj x2 — porcja na czwartek" },
        { id: "wed-4", slot: "Kolacja", name: "Fit Pinsa z burratą", items: "Pół spodu do pinsy, pół kulki burraty (100g), 50g passaty pomidorowej, rukola, pomidorki cherry", kcal: 750 },
      ],
    },
    {
      id: "thu", name: "Czwartek", short: "Cz",
      activity: "Regeneracja: spacer", activityIcon: "🚶",
      meals: [
        { id: "thu-1", slot: "Śniadanie", name: "Jajka gotowane na miękko", items: "4 jajka, 3 kromki chleba żytniego, 10g masła, szczypiorek", kcal: 600 },
        { id: "thu-2", slot: "Przekąska", name: "Baton i owoc", items: "Baton proteinowy, 1 duża brzoskwinia lub nektarynka", kcal: 300 },
        { id: "thu-3", slot: "Obiad", name: "Odgrzany makaron", items: "Wczorajsza porcja makaronu z indykiem", kcal: 800, note: "Ze środy" },
        { id: "thu-4", slot: "Kolacja", name: "Twarożek z łososiem", items: "4 kromki chleba żytniego, 50g serka kanapkowego light, 100g wędzonego łososia, koper, ogórek", kcal: 750 },
      ],
    },
    {
      id: "fri", name: "Piątek", short: "Pt",
      activity: "Siłownia (FBW)", activityIcon: "🏋️",
      meals: [
        { id: "fri-1", slot: "Śniadanie", name: "Jajka sadzone i warzywa", items: "3 jajka L, 50g szynki z patelni, 3 kromki chleba, 10g masła, papryka", kcal: 600 },
        { id: "fri-2", slot: "Przekąska", name: "Skyr z gorzką czekoladą", items: "Skyr naturalny (150g), 15g gorzkiej czekolady, garść malin", kcal: 300 },
        { id: "fri-3", slot: "Obiad", name: "Łosoś z ryżem i fasolką", items: "150g świeżego łososia z Air Fryer, 100g ryżu basmati, 200g fasolki szparagowej, 10g oliwy", kcal: 800 },
        { id: "fri-4", slot: "Kolacja", name: "Tortilla z kurczakiem", items: "2 tortille pełnoziarniste, 100g piersi kurczaka, 60g żółtego sera light, warzywa, sos jogurtowy", kcal: 750 },
      ],
    },
    {
      id: "sat", name: "Sobota", short: "So",
      activity: "Siatkówka plażowa", activityIcon: "🏐",
      meals: [
        { id: "sat-1", slot: "Śniadanie", name: "Wytrawna jajecznica", items: "4 jajka, 3 kromki chleba, 10g masła, pomidor", kcal: 600 },
        { id: "sat-2", slot: "Przekąska", name: "Bananowy budyń proteinowy", items: "Pudding proteinowy, 1 średni banan", kcal: 300 },
        { id: "sat-3", slot: "Obiad", name: "Polędwiczka wieprzowa", items: "200g polędwiczki z Air Fryer, 400g ziemniaków, 15g oliwy, mix sałat z vinegretem", kcal: 800, note: "Gotuj x2 — porcja na niedzielę" },
        { id: "sat-4", slot: "Kolacja", name: "Fit Pinsa z mozzarellą i szynką", items: "Pół spodu do pinsy, 50g mozzarelli light, 30g szynki dojrzewającej, rukola, pomidorki", kcal: 750 },
      ],
    },
    {
      id: "sun", name: "Niedziela", short: "Nd",
      activity: "Dzień odpoczynku", activityIcon: "😴",
      meals: [
        { id: "sun-1", slot: "Śniadanie", name: "Gotowane jajka z pieczywem", items: "4 jajka, 3 kromki chleba, 10g masła, ogórek", kcal: 600 },
        { id: "sun-2", slot: "Przekąska", name: "Owocowa sałatka", items: "1 jabłko, 1 brzoskwinia, 150g chudego twarogu, łyżeczka miodu", kcal: 300 },
        { id: "sun-3", slot: "Obiad", name: "Odgrzana polędwiczka", items: "Wczorajsza porcja polędwiczki z ziemniakami", kcal: 800, note: "Z soboty" },
        { id: "sun-4", slot: "Kolacja", name: "Domowy burger z wołowiną", items: "1 bułka pełnoziarnista, 150g mielonej chudej wołowiny, plaster sera, warzywa, 150g ziemniaków", kcal: 750 },
      ],
    },
  ],
  shopping: [
    { cat: "Warzywa i owoce", icon: "🥬", items: [
      { id: "s1", name: "Ziemniaki", qty: "1,5 kg" },
      { id: "s2", name: "Pomidory i pomidorki cherry", qty: "5 dużych + 2 garście cherry" },
      { id: "s3", name: "Ogórki", qty: "4 sztuki" },
      { id: "s4", name: "Owoce (banany, jabłka, brzoskwinie, borówki, maliny)", qty: "2 banany, 2 jabłka, 2 brzoskwinie, borówki i maliny" },
      { id: "s5", name: "Warzywa (szpinak, rukola, sałata, papryka, rzodkiewka)", qty: "Mieszanka do sałatek, papryka, pęczek rzodkiewki, szczypior" },
      { id: "s6", name: "Fasolka szparagowa (może być mrożona)", qty: "200 g" },
    ]},
    { cat: "Mięso i ryby", icon: "🍖", items: [
      { id: "s7", name: "Pierś z kurczaka", qty: "350 g" },
      { id: "s8", name: "Mięso mielone z indyka", qty: "150 g" },
      { id: "s9", name: "Mięso mielone z chudej wołowiny", qty: "300 g" },
      { id: "s10", name: "Polędwiczka wieprzowa", qty: "400 g" },
      { id: "s11", name: "Łosoś świeży", qty: "150 g" },
      { id: "s12", name: "Łosoś wędzony", qty: "150 g" },
    ]},
    { cat: "Wędliny", icon: "🥓", items: [
      { id: "s13", name: "Szynka z piersi indyka / kurczaka / dojrzewająca", qty: "200 g łącznie" },
    ]},
    { cat: "Nabiał i jaja", icon: "🥚", items: [
      { id: "s14", name: "Jajka rozmiar L", qty: "30 sztuk" },
      { id: "s15", name: "Skyr (naturalny i waniliowy)", qty: "3 opakowania po 150 g" },
      { id: "s16", name: "Puddingi proteinowe", qty: "3 opakowania po 200 g" },
      { id: "s17", name: "Mozzarella light", qty: "1 opakowanie" },
      { id: "s18", name: "Burrata", qty: "1 opakowanie" },
      { id: "s19", name: "Sery w plastrach (cheddar / żółty light)", qty: "1 opakowanie" },
      { id: "s20", name: "Serek wiejski / twaróg chudy / serek kanapkowy", qty: "1 + 1 kostka + 1" },
      { id: "s21", name: "Masło", qty: "1 kostka" },
    ]},
    { cat: "Pieczywo", icon: "🍞", items: [
      { id: "s22", name: "Chleb żytni", qty: "1 duży bochenek" },
      { id: "s23", name: "Tortille pełnoziarniste", qty: "1 opakowanie (4 szt.)" },
      { id: "s24", name: "Bułki pełnoziarniste (do burgerów)", qty: "2 sztuki" },
      { id: "s25", name: "Spód do pinsy", qty: "1 sztuka (duża)" },
    ]},
    { cat: "Produkty suche i inne", icon: "🫙", items: [
      { id: "s26", name: "Makaron pełnoziarnisty / ryż basmati", qty: "100 g + 100 g" },
      { id: "s27", name: "Baton proteinowy", qty: "1 sztuka" },
      { id: "s28", name: "Gorzka czekolada / orzechy włoskie", qty: "1 tabliczka / 1 mała paczka" },
      { id: "s29", name: "Masło orzechowe", qty: "1 słoik (jeśli nie masz)" },
      { id: "s30", name: "Krojone pomidory / passata", qty: "1 puszka / 1 mała passata" },
      { id: "s31", name: "Oliwa z oliwek / miód", qty: "Jeśli nie masz w domu" },
    ]},
  ],
};
