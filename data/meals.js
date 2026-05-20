export const MEAL_DAYS = {
  a: { name: "Day A", subtitle: "Egg-free · dairy-heavy",
    meals: [
      { id: "a1", title: "Breakfast", time: "~07:30", kcal: 720, protein: 38,
        items: [["Havermout","100 g"],["Halfvolle melk","300 ml"],["Pindakaas","2 el / 30 g"],["Banaan","1"],["Honing of suiker","1 el"]],
        notes: "Cook the oats in the milk, not water. Stir in the peanut butter at the end so it melts." },
      { id: "a2", title: "Mid-morning shake", time: "~10:30", kcal: 480, protein: 38,
        items: [["Halfvolle melk","400 ml"],["Whey","~30 g"],["Banaan","1"],["Pindakaas","1 el / 15 g"]],
        notes: "Blend or shake. The fastest 480 kcal of your day." },
      { id: "a3", title: "Lunch", time: "~13:00", kcal: 700, protein: 34,
        items: [["Volkoren brood","4 sneetjes"],["Kaas 30+","3 plakjes"],["Kipfilet/rosbief op brood","4 plakjes"],["Roomboter","ruim"],["Halfvolle melk","300 ml"]],
        notes: "Two sandwiches — one cheese, one meat. Glass of milk on the side." },
      { id: "a4", title: "Afternoon snack", time: "~16:00", kcal: 380, protein: 24,
        items: [["Magere kwark","250 g"],["Havermout (rauw)","30 g"],["Honing","1 el"],["Noten","25 g"]],
        notes: "Stir oats into the kwark — they soften slightly." },
      { id: "a5", title: "Dinner", time: "~19:00", kcal: 700, protein: 38,
        items: [["Pasta (droog)","120 g"],["Rundergehakt","150 g"],["Pastasaus","200 g"],["Geraspte kaas","30 g"],["Olijfolie","1 el"]],
        notes: "Brown the mince, add sauce, serve over pasta with grated cheese." }
    ]
  },
  b: { name: "Day B", subtitle: "Chicken night",
    meals: [
      { id: "b1", title: "Breakfast", time: "~07:30", kcal: 700, protein: 42,
        items: [["Magere kwark","300 g"],["Havermout (rauw)","60 g"],["Halfvolle melk","100 ml"],["Pindakaas","1 el / 15 g"],["Banaan","1"],["Honing","1 el"]],
        notes: "No cooking — stir everything in a bowl. Oats soak up the milk." },
      { id: "b2", title: "Mid-morning", time: "~10:30", kcal: 380, protein: 14,
        items: [["Volkoren brood","2 sneetjes"],["Pindakaas","2 el / 30 g"],["Banaan op brood","1"]],
        notes: "Bread, peanut butter, sliced banana. Easy calories." },
      { id: "b3", title: "Lunch", time: "~13:00", kcal: 680, protein: 36,
        items: [["Volkoren brood","4 sneetjes"],["Kaas 30+","2 plakjes"],["Kipfilet/ham","3 plakjes"],["Kwark met fruit","200 g"],["Halfvolle melk","200 ml"]],
        notes: "Two sandwiches plus kwark on the side." },
      { id: "b4", title: "Afternoon shake", time: "~16:00", kcal: 460, protein: 36,
        items: [["Halfvolle melk","400 ml"],["Whey","~30 g"],["Havermout (rauw)","30 g"],["Pindakaas","1 el / 15 g"]],
        notes: "Blend everything." },
      { id: "b5", title: "Dinner", time: "~19:00", kcal: 780, protein: 45,
        items: [["Kipfilet","180 g"],["Witte rijst (droog)","100 g"],["Groenten","200 g"],["Olijfolie","2 el"],["Sojasaus/knoflook","naar smaak"]],
        notes: "Chicken stir-fry with garlic and soy, lots of olive oil." }
    ]
  },
  c: { name: "Day C", subtitle: "Scrambled eggs + burger night",
    meals: [
      { id: "c1", title: "Breakfast", time: "~07:30", kcal: 750, protein: 35,
        items: [["Eieren (scrambled)","3"],["Volkoren brood","3 sneetjes"],["Roomboter","ruim"],["Kaas 30+","2 plakjes"],["Halfvolle melk","300 ml"]],
        notes: "Scrambled eggs cooked in butter, cheese melted in. Buttered toast on the side." },
      { id: "c2", title: "Mid-morning shake", time: "~10:30", kcal: 480, protein: 38,
        items: [["Halfvolle melk","400 ml"],["Whey","~30 g"],["Banaan","1"],["Pindakaas","1 el / 15 g"]],
        notes: "Workhorse shake." },
      { id: "c3", title: "Lunch", time: "~13:00", kcal: 650, protein: 30,
        items: [["Pasta (droog)","100 g"],["Olijfolie of pesto","2 el"],["Kaas","30 g"],["Magere kwark","200 g"],["Stuk fruit","1"]],
        notes: "Pasta tossed with oil/pesto and cheese. Kwark on the side." },
      { id: "c4", title: "Afternoon snack", time: "~16:00", kcal: 360, protein: 14,
        items: [["Volkoren crackers/brood","3-4"],["Pindakaas","2 el / 30 g"],["Noten","25 g"],["Halfvolle melk","200 ml"]],
        notes: "Snack-style." },
      { id: "c5", title: "Dinner", time: "~19:00", kcal: 800, protein: 40,
        items: [["Runderburger","2 / ~200 g"],["Hamburgerbroodjes","2"],["Kaas 30+","2 plakjes"],["Aardappelpartjes","300 g"],["Olijfolie","2 el"],["Sla/tomaat/saus","naar smaak"]],
        notes: "Cheeseburgers with oven wedges in olive oil." }
    ]
  }
};

export const MEAL_DAY_ORDER = ["a","b","c"];

export const LOW_APP_FOODS = [
  { id: "low1", name: "Power shake", kcal: 850, protein: 45, desc: "500 ml halfvolle melk, 1.5 scoop whey, 60 g havermout, 1 banaan, 2 el pindakaas." },
  { id: "low2", name: "Loaded kwark", kcal: 700, protein: 50, desc: "400 g magere kwark, 1 scoop whey stirred in, 30 g noten, 1 el honing, 30 g havermout." },
  { id: "low3", name: "Bread + PB + milk", kcal: 750, protein: 28, desc: "4 sneetjes volkoren brood, royale pindakaas, 400 ml halfvolle melk." }
];
