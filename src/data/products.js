export const CATALOG_VERSION = "2026.11.atelier";

const RAW_PRODUCTS = [
  // =========================================================================
  // FORME SIGNATURE ATELIER COLLECTION (2D/3D FITTING ROOM & CORE CAPSULE)
  // =========================================================================
  {
    id: "forme-01",
    name: "Heritage Trench Coat",
    slug: "heritage-trench-coat",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "outer",
    style: "coat",
    collection: "Atelier Core",
    price: 18500,
    originalPrice: 21500,
    badge: "SIGNATURE",
    rating: 5.0,
    reviewCount: 64,
    fitLine: "RELAXED FIT | WOMEN",
    primaryColor: "Olive Green",
    colors: [
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 5, S: 12, M: 18, L: 10, XL: 4 },
    images: ["/images/heritage_trench_coat.jpg"],
    description: "Architectural longline trench coat tailored from water-repellent organic cotton gabardine with storm flaps and belted waist.",
    fabric: "100% Organic Cotton Gabardine",
    care: "Dry clean only.",
    fit: "Relaxed tailored overcoat designed to layer over knitwear."
  },
  {
    id: "forme-02",
    name: "Pure Mongolian Camel Cashmere Knit",
    slug: "pure-mongolian-camel-cashmere-knit",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "top",
    style: "knit",
    collection: "Atelier Core",
    price: 14200,
    originalPrice: 16500,
    badge: "BESTSELLER",
    rating: 5.0,
    reviewCount: 88,
    fitLine: "REGULAR FIT | WOMEN",
    primaryColor: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 8, S: 16, M: 22, L: 14, XL: 6 },
    images: ["/images/camel_cashmere_knit.jpg"],
    description: "Soft ribbing, an easy crew neckline, and breathable warmth spun from sustainably combed Mongolian camel and cashmere fibers.",
    fabric: "70% Mongolian Camel Hair, 30% Grade-A Cashmere",
    care: "Hand wash cold or dry clean. Dry flat.",
    fit: "True to size with natural rib elasticity."
  },
  {
    id: "forme-03",
    name: "Camel Pleated Wide-Leg Palazzo Trouser",
    slug: "camel-pleated-wide-leg-palazzo-trouser",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "bottom",
    style: "wide",
    collection: "Atelier Core",
    price: 11500,
    originalPrice: 13500,
    badge: "CORE EDIT",
    rating: 4.9,
    reviewCount: 71,
    fitLine: "WIDE LEG | WOMEN",
    primaryColor: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 7, S: 15, M: 20, L: 12, XL: 5 },
    images: ["/images/women_camel_palazzo.jpg"],
    description: "High-waisted double-pleated palazzo trousers with a fluid wide leg for unhurried days and elevated evening drape.",
    fabric: "100% Virgin Wool Gabardine",
    care: "Dry clean or steam refresh.",
    fit: "High-rise tailored waist with relaxed wide leg."
  },
  {
    id: "forme-04",
    name: "Silk Minimalist Midi Column Dress",
    slug: "silk-minimalist-midi-column-dress",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "dress",
    style: "dress",
    collection: "Atelier Core",
    price: 15900,
    originalPrice: 18200,
    badge: "LIMITED",
    rating: 5.0,
    reviewCount: 45,
    fitLine: "REGULAR FIT | WOMEN",
    primaryColor: "Obsidian Black",
    colors: [
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 6, S: 12, M: 16, L: 9, XL: 4 },
    images: ["/images/couture_silk_dress.jpg"],
    description: "An effortless bias-cut midi column silhouette with understated seam work, ready for wherever the day goes.",
    fabric: "100% Heavy Mulberry Silk Crepe",
    care: "Delicate dry clean.",
    fit: "Skims the frame without clinging."
  },
  {
    id: "forme-05",
    name: "Atelier Studio Silk-Cotton Shirt",
    slug: "atelier-studio-silk-cotton-shirt",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "top",
    style: "shirt",
    collection: "Atelier Core",
    price: 12800,
    originalPrice: 14500,
    badge: "ESSENTIAL",
    rating: 4.9,
    reviewCount: 53,
    fitLine: "RELAXED FIT | WOMEN",
    primaryColor: "Linen White",
    colors: [
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 8, S: 14, M: 19, L: 11, XL: 5 },
    images: ["/images/women_olive_silk_shirt.jpg"],
    description: "A clean button-up tailored from silk-cotton voile with concealed placket and mother-of-pearl buttons.",
    fabric: "75% Organic Cotton, 25% Mulberry Silk",
    care: "Cold hand wash or dry clean.",
    fit: "Relaxed architectural drape."
  },
  {
    id: "forme-06",
    name: "The Modern Tailored Blazer",
    slug: "the-modern-tailored-blazer",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "outer",
    style: "blazer",
    collection: "Atelier Core",
    price: 16800,
    originalPrice: 19500,
    badge: "TAILORED",
    rating: 5.0,
    reviewCount: 38,
    fitLine: "REGULAR FIT | WOMEN",
    primaryColor: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 5, S: 10, M: 14, L: 8, XL: 3 },
    images: ["/images/women_onyx_blazer.jpg"],
    description: "A considered finishing layer with soft canvas shoulders, horn buttons, and an easy single-breasted silhouette.",
    fabric: "100% Merino Suiting Wool",
    care: "Dry clean only.",
    fit: "Structured shoulder with room through the waist."
  },
  {
    id: "forme-07",
    name: "The Essential Atelier Overshirt",
    slug: "the-essential-atelier-overshirt",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "top",
    style: "shirt",
    collection: "Atelier Core",
    price: 11900,
    originalPrice: 13800,
    badge: "CORE EDIT",
    rating: 4.9,
    reviewCount: 62,
    fitLine: "REGULAR FIT | MEN",
    primaryColor: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 6, S: 14, M: 20, L: 15, XL: 6 },
    images: ["/images/men_linen_shirt.jpg"],
    description: "A clean spread collar and relaxed everyday shape crafted from brushed cotton-wool twill.",
    fabric: "80% Organic Cotton, 20% Merino Wool",
    care: "Machine wash cold gentle.",
    fit: "Regular fit with clean layering ease."
  },
  {
    id: "forme-08",
    name: "The Daily Tailored Trouser",
    slug: "the-daily-tailored-trouser",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "bottom",
    style: "trouser",
    collection: "Atelier Core",
    price: 12400,
    originalPrice: 14200,
    badge: "TAILORED",
    rating: 4.9,
    reviewCount: 49,
    fitLine: "REGULAR FIT | MEN",
    primaryColor: "Obsidian Black",
    colors: [
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "28", "30", "32", "34", "36"],
    stockPerSize: { XS: 5, S: 12, M: 18, L: 14, XL: 6, "28": 5, "30": 12, "32": 18, "34": 14, "36": 6 },
    images: ["/images/men_camel_trouser.jpg"],
    description: "A straight leg trouser with a considered, easy finish and crisp front crease.",
    fabric: "100% Combed Cavalry Twill",
    care: "Machine wash cold or dry clean.",
    fit: "Mid-rise straight tailored leg."
  },
  {
    id: "forme-13",
    name: "Junior Everyday Organic Tee",
    slug: "junior-everyday-organic-tee",
    person: "kids",
    gender: "kids",
    category: "Kids' Edit",
    slot: "top",
    style: "tee",
    collection: "Junior Atelier",
    price: 3800,
    originalPrice: 4500,
    badge: "JUNIOR",
    rating: 5.0,
    reviewCount: 29,
    fitLine: "RELAXED FIT | KIDS",
    primaryColor: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5]" }
    ],
    sizes: ["4–5", "6–7", "8–9", "10–11"],
    stockPerSize: { "4–5": 10, "6–7": 16, "8–9": 14, "10–11": 8 },
    images: ["/images/catalog/men_white_tee_flat.jpg"],
    description: "Simple, soft, and durable combed organic cotton tee designed for everyday comfort.",
    fabric: "100% Organic Combed Cotton (220 GSM)",
    care: "Machine wash cold.",
    fit: "Relaxed junior cut."
  },
  {
    id: "forme-14",
    name: "Junior Adventure Chino Shorts",
    slug: "junior-adventure-chino-shorts",
    person: "kids",
    gender: "kids",
    category: "Kids' Edit",
    slot: "bottom",
    style: "shorts",
    collection: "Junior Atelier",
    price: 4400,
    originalPrice: 5200,
    badge: "JUNIOR",
    rating: 4.9,
    reviewCount: 24,
    fitLine: "RELAXED FIT | KIDS",
    primaryColor: "Olive Green",
    colors: [
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["4–5", "6–7", "8–9", "10–11"],
    stockPerSize: { "4–5": 8, "6–7": 15, "8–9": 12, "10–11": 7 },
    images: ["/images/catalog/men_barrel_jeans_flat.jpg"],
    description: "Relaxed pull-on cotton twill shorts with comfort waistband for everyday exploring.",
    fabric: "100% Brushed Cotton Twill",
    care: "Machine wash warm.",
    fit: "Easy knee-length cut."
  },
  // =========================================================================
  // MEN'S COLLECTION: REALISTIC JEANS, T-SHIRTS & SHIRTS (WHITE STUDIO BG)
  // =========================================================================
  {
    id: "men-jeans-01",
    name: "BARREL FIT JEANS",
    slug: "barrel-fit-jeans-light-indigo",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "bottom",
    style: "trouser",
    collection: "Denim Edit 2026",
    price: 7490,
    originalPrice: 8990,
    badge: "NEW ARRIVAL",
    rating: 4.9,
    reviewCount: 42,
    fitLine: "BARREL FIT | MEN",
    primaryColor: "Light Blue",
    colors: [
      { name: "Light Blue", hex: "#8FA9C4", bgClass: "bg-[#8FA9C4]" },
      { name: "Dark Indigo", hex: "#1E2A38", bgClass: "bg-[#1E2A38]" }
    ],
    sizes: ["28", "30", "32", "34", "36"],
    stockPerSize: { "28": 6, "30": 14, "32": 18, "34": 12, "36": 5 },
    images: [
      "/images/catalog/men_barrel_jeans_flat.jpg",
      "/images/catalog/men_model_white_tee_jeans.jpg"
    ],
    description: "Curved barrel silhouette crafted from 13.5oz ring-spun authentic washed cotton denim. Features ergonomic outer seam curvature, vintage whiskering, and branded metal rivet detailing.",
    fabric: "100% Rigid Ring-Spun Cotton Denim (13.5oz)",
    care: "Machine wash cold inside out with similar colors. Line dry.",
    fit: "High-rise waist with relaxed curved barrel leg tapering subtly at the ankle."
  },
  {
    id: "men-jeans-02",
    name: "BAGGY FIT JEANS",
    slug: "baggy-fit-jeans-washed-black",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "bottom",
    style: "wide",
    collection: "Denim Edit 2026",
    price: 6990,
    originalPrice: 7990,
    badge: "BESTSELLER",
    rating: 5.0,
    reviewCount: 58,
    fitLine: "BAGGY FIT | MEN",
    primaryColor: "Washed Black",
    colors: [
      { name: "Washed Black", hex: "#222224", bgClass: "bg-[#222224]" },
      { name: "Vintage Blue", hex: "#4C6B8B", bgClass: "bg-[#4C6B8B]" }
    ],
    sizes: ["28", "30", "32", "34", "36"],
    stockPerSize: { "28": 8, "30": 15, "32": 20, "34": 10, "36": 4 },
    images: [
      "/images/catalog/men_baggy_black_jeans_flat.jpg",
      "/images/catalog/men_model_white_tee_jeans.jpg"
    ],
    description: "Relaxed skater-inspired baggy denim cut with generous volume through the thigh and calf. Mineral enzyme wash gives a soft lived-in drape from day one.",
    fabric: "100% Premium Cotton Denim (13oz)",
    care: "Machine wash cold gentle. Do not tumble dry.",
    fit: "Mid-rise, loose wide cut stacking naturally over sneakers."
  },
  {
    id: "men-jeans-03",
    name: "WIDE LEG JEANS",
    slug: "wide-leg-jeans-vintage-blue",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "bottom",
    style: "wide",
    collection: "Denim Edit 2026",
    price: 6990,
    originalPrice: 8490,
    badge: "POPULAR",
    rating: 4.8,
    reviewCount: 36,
    fitLine: "WIDE LEG FIT | MEN",
    primaryColor: "Classic Wash",
    colors: [
      { name: "Classic Wash", hex: "#5C768D", bgClass: "bg-[#5C768D]" },
      { name: "Dark Indigo", hex: "#1D2834", bgClass: "bg-[#1D2834]" }
    ],
    sizes: ["30", "32", "34", "36"],
    stockPerSize: { "30": 11, "32": 16, "34": 9, "36": 3 },
    images: [
      "/images/catalog/men_model_white_tee_jeans.jpg",
      "/images/catalog/men_barrel_jeans_flat.jpg"
    ],
    description: "Contemporary wide-leg denim engineered with a straight drop from hip to hem. Pairs effortlessly with clean oversized white tees and workwear jackets.",
    fabric: "100% Combed Cotton Denim (12.8oz)",
    care: "Wash cold. Hang dry in shade.",
    fit: "Mid-rise, continuous wide-leg drape."
  },
  {
    id: "men-jeans-04",
    name: "STRAIGHT FIT CARPENTER JEANS",
    slug: "straight-fit-carpenter-jeans",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "bottom",
    style: "trouser",
    collection: "Utility Edit",
    price: 6990,
    originalPrice: 7990,
    badge: "UTILITY",
    rating: 4.9,
    reviewCount: 29,
    fitLine: "STRAIGHT FIT | MEN",
    primaryColor: "Deep Denim Blue",
    colors: [
      { name: "Indigo Workwear", hex: "#273D54", bgClass: "bg-[#273D54]" },
      { name: "Washed Slate", hex: "#4D5D6B", bgClass: "bg-[#4D5D6B]" },
      { name: "Ecru", hex: "#E8E2D8", bgClass: "bg-[#E8E2D8]" }
    ],
    sizes: ["30", "32", "34", "36"],
    stockPerSize: { "30": 10, "32": 14, "34": 8, "36": 4 },
    images: [
      "/images/catalog/men_model_carpenter.jpg",
      "/images/catalog/men_barrel_jeans_flat.jpg"
    ],
    description: "Heritage workwear carpenter jeans equipped with authentic utility pocket detailing, hammer loop, reinforced bar-tacks, and triple-needle chain stitching.",
    fabric: "100% Heavy Duty Cotton Denim (14oz)",
    care: "Machine wash warm with like colors.",
    fit: "Classic straight-leg cut with comfortable room in seat and thigh."
  },
  {
    id: "men-jeans-05",
    name: "BALLOON FIT JEANS",
    slug: "balloon-fit-jeans-raw-indigo",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "bottom",
    style: "trouser",
    collection: "Denim Edit 2026",
    price: 6990,
    originalPrice: 8490,
    badge: "TRENDING",
    rating: 4.9,
    reviewCount: 31,
    fitLine: "BALLOON FIT | MEN",
    primaryColor: "Raw Dark Indigo",
    colors: [
      { name: "Raw Dark Indigo", hex: "#1C2536", bgClass: "bg-[#1C2536]" },
      { name: "Medium Wash", hex: "#476175", bgClass: "bg-[#476175]" }
    ],
    sizes: ["28", "30", "32", "34"],
    stockPerSize: { "28": 5, "30": 12, "32": 15, "34": 7 },
    images: [
      "/images/catalog/men_model_balloon_indigo.jpg",
      "/images/catalog/men_barrel_jeans_flat.jpg"
    ],
    description: "Architectural balloon silhouette featuring an exaggerated rounded volume around the knee and an intentional tapered cuff that neatly frames sneakers.",
    fabric: "100% Ring-Spun Indigo Denim (13.5oz)",
    care: "Cold wash separate first 3 washes to set indigo pigment.",
    fit: "High-rise balloon fit with pronounced taper at the leg opening."
  },
  {
    id: "men-tee-01",
    name: "HEAVYWEIGHT BOXY T-SHIRT",
    slug: "heavyweight-boxy-tshirt-white",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "top",
    style: "tee",
    collection: "Core Essentials",
    price: 3490,
    originalPrice: 4200,
    badge: "CORE EDIT",
    rating: 5.0,
    reviewCount: 84,
    fitLine: "BOXY FIT | MEN",
    primaryColor: "Pure White",
    colors: [
      { name: "Pure White", hex: "#FFFFFF", bgClass: "bg-[#FFFFFF] border border-gray-300" },
      { name: "Washed Black", hex: "#1A1A1A", bgClass: "bg-[#1A1A1A]" }
    ],
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 15, M: 28, L: 24, XL: 10 },
    images: [
      "/images/catalog/men_white_tee_flat.jpg",
      "/images/catalog/men_model_white_tee_jeans.jpg"
    ],
    description: "Engineered from ultra-dense 280 GSM combed organic cotton. Features a thick 1.2-inch ribbed collar that holds shape permanently, dropped shoulders, and a clean boxy torso.",
    fabric: "100% Combed Heavyweight Organic Cotton (280 GSM)",
    care: "Machine wash cold. Reshape and dry flat.",
    fit: "Boxy relaxed cut. True to size for street drape."
  },
  {
    id: "men-tee-02",
    name: "OVERSIZED MINERAL T-SHIRT",
    slug: "oversized-mineral-tshirt-earth-brown",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "top",
    style: "tee",
    collection: "Core Essentials",
    price: 3690,
    originalPrice: 4500,
    badge: "ESSENTIAL",
    rating: 4.8,
    reviewCount: 47,
    fitLine: "OVERSIZED | MEN",
    primaryColor: "Earth Brown",
    colors: [
      { name: "Earth Brown", hex: "#6F5C4D", bgClass: "bg-[#6F5C4D]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" }
    ],
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 8, M: 19, L: 17, XL: 6 },
    images: [
      "/images/catalog/men_model_carpenter.jpg",
      "/images/catalog/men_white_tee_flat.jpg"
    ],
    description: "Washed earth-tone tee pigment-dyed for vintage variation. Cut with drop shoulders, relaxed long sleeves, and buttery soft pre-shrunk cotton jersey.",
    fabric: "100% Ring-Spun Cotton Jersey (240 GSM)",
    care: "Wash cold gentle with mild detergent.",
    fit: "Oversized silhouette with relaxed chest and armholes."
  },
  {
    id: "men-shirt-01",
    name: "RELAXED SAGE LINEN SHIRT",
    slug: "relaxed-sage-linen-shirt",
    person: "men",
    gender: "men",
    category: "Men's Collection",
    slot: "top",
    style: "shirt",
    collection: "Resort Edit",
    price: 5990,
    originalPrice: 7490,
    badge: "RESORT",
    rating: 4.9,
    reviewCount: 39,
    fitLine: "RELAXED FIT | MEN",
    primaryColor: "Sage Green",
    colors: [
      { name: "Sage Green", hex: "#879B84", bgClass: "bg-[#879B84]" },
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5] border border-gray-300" }
    ],
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 7, M: 16, L: 14, XL: 5 },
    images: [
      "/images/catalog/men_model_sage_shirt.jpg",
      "/images/catalog/men_white_tee_flat.jpg"
    ],
    description: "Woven from breathable Normandy flax linen with a smooth enzyme-softened finish. Features natural mother-of-pearl buttons, curved hem, and a structured spread collar.",
    fabric: "100% Pure European Flax Linen",
    care: "Machine wash cold delicate. Warm iron or steam.",
    fit: "Relaxed tailored cut that can be worn tucked or casually untucked."
  },

  // =========================================================================
  // WOMEN'S COLLECTION: REALISTIC JEANS, TROUSERS & SHIRTS (WHITE STUDIO BG)
  // =========================================================================
  {
    id: "women-jeans-01",
    name: "HIGH-RISE WIDE LEG JEANS",
    slug: "high-rise-wide-leg-jeans",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "bottom",
    style: "wide",
    collection: "Denim Edit 2026",
    price: 6990,
    originalPrice: 8490,
    badge: "TRENDING",
    rating: 5.0,
    reviewCount: 63,
    fitLine: "WIDE LEG | WOMEN",
    primaryColor: "Vintage Blue",
    colors: [
      { name: "Vintage Blue", hex: "#4C6B8B", bgClass: "bg-[#4C6B8B]" },
      { name: "Linen Ecru", hex: "#EDE8DF", bgClass: "bg-[#EDE8DF]" }
    ],
    sizes: ["26", "28", "30", "32"],
    stockPerSize: { "26": 9, "28": 18, "30": 15, "32": 6 },
    images: [
      "/images/catalog/women_wide_leg_jeans_flat.jpg",
      "/images/catalog/women_model_jeans_shirt.jpg"
    ],
    description: "Sculpted high-rise waistline contouring smoothly into an effortless wide-leg drape. Premium 100% cotton denim gives structural elegance without sagging.",
    fabric: "100% Premium Cotton Denim (12.5oz)",
    care: "Machine wash cold. Hang dry.",
    fit: "Fitted through high waist and hips, fluid wide leg opening."
  },
  {
    id: "women-jeans-02",
    name: "STRAIGHT LEG VINTAGE JEANS",
    slug: "straight-leg-vintage-jeans",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "bottom",
    style: "trouser",
    collection: "Denim Edit 2026",
    price: 6490,
    originalPrice: 7990,
    badge: "NEW ARRIVAL",
    rating: 4.9,
    reviewCount: 41,
    fitLine: "STRAIGHT FIT | WOMEN",
    primaryColor: "Medium Denim",
    colors: [
      { name: "Medium Denim", hex: "#3F6488", bgClass: "bg-[#3F6488]" },
      { name: "Washed Black", hex: "#222224", bgClass: "bg-[#222224]" }
    ],
    sizes: ["26", "28", "30", "32"],
    stockPerSize: { "26": 8, "28": 16, "30": 12, "32": 5 },
    images: [
      "/images/catalog/women_model_jeans_shirt.jpg",
      "/images/catalog/women_wide_leg_jeans_flat.jpg"
    ],
    description: "The quintessential 90s vintage straight cut with a flattering mid-to-high rise. Engineered with subtle natural fading along the thighs and classic 5-pocket construction.",
    fabric: "99% Cotton, 1% Comfort Elastane (12oz)",
    care: "Wash inside out in cold water.",
    fit: "Classic straight leg from hip to ankle."
  },
  {
    id: "women-pant-01",
    name: "PLEATED TAILORED TROUSERS",
    slug: "pleated-tailored-camel-trousers",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "bottom",
    style: "wide",
    collection: "Tailored Pret",
    price: 7990,
    originalPrice: 9490,
    badge: "BESTSELLER",
    rating: 5.0,
    reviewCount: 77,
    fitLine: "TAILORED WIDE | WOMEN",
    primaryColor: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stockPerSize: { XS: 6, S: 14, M: 18, L: 8 },
    images: [
      "/images/catalog/women_model_camel_trouser.jpg",
      "/images/catalog/women_linen_trousers_flat.jpg"
    ],
    description: "Tailored high-waisted trousers with razor-sharp front pleats and side slash pockets. Fluid suiting twill provides an elegant drape whether worn with heels or flats.",
    fabric: "70% Polyester Suiting Twill, 26% Rayon, 4% Spandex",
    care: "Dry clean or gentle cold machine wash in mesh bag.",
    fit: "High waist fit with sweeping wide-leg puddle hem."
  },
  {
    id: "women-pant-02",
    name: "RELAXED PLEATED LINEN TROUSERS",
    slug: "relaxed-pleated-linen-trousers",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "bottom",
    style: "wide",
    collection: "Linen Capsule",
    price: 6290,
    originalPrice: 7490,
    badge: "LINEN",
    rating: 4.8,
    reviewCount: 33,
    fitLine: "RELAXED FIT | WOMEN",
    primaryColor: "Linen White",
    colors: [
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5] border border-gray-300" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stockPerSize: { XS: 7, S: 13, M: 15, L: 6 },
    images: [
      "/images/catalog/women_linen_trousers_flat.jpg",
      "/images/catalog/women_model_striped_shirt.jpg"
    ],
    description: "Breezy warm-weather trousers tailored from 100% natural European flax linen. Elasticated drawcord waistband with elegant front pleats for all-day effortless comfort.",
    fabric: "100% Pure Washed Flax Linen",
    care: "Cold gentle cycle, air dry flat.",
    fit: "Easy relaxed fit with straight wide leg."
  },
  {
    id: "women-shirt-01",
    name: "OVERSIZED CRISP POPLIN SHIRT",
    slug: "oversized-crisp-poplin-shirt-white",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "top",
    style: "shirt",
    collection: "Core Edit",
    price: 5490,
    originalPrice: 6800,
    badge: "CORE EDIT",
    rating: 5.0,
    reviewCount: 92,
    fitLine: "OVERSIZED | WOMEN",
    primaryColor: "Pure White",
    colors: [
      { name: "Pure White", hex: "#FFFFFF", bgClass: "bg-[#FFFFFF] border border-gray-300" },
      { name: "Sky Blue", hex: "#B0C7DE", bgClass: "bg-[#B0C7DE]" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stockPerSize: { XS: 12, S: 22, M: 25, L: 10 },
    images: [
      "/images/catalog/women_white_shirt_flat.jpg",
      "/images/catalog/women_model_jeans_shirt.jpg"
    ],
    description: "The modern wardrobe foundation. Tailored from high-thread-count 100% organic cotton poplin with clean French cuffs, structured collar, and an airy relaxed volume.",
    fabric: "100% Long-Staple Organic Cotton Poplin (140 GSM)",
    care: "Machine wash cold. Warm steam iron for crisp look.",
    fit: "Deliberately oversized boyfriend cut with curved hemline."
  },
  {
    id: "women-shirt-02",
    name: "STRIPED RELAXED POPLIN SHIRT",
    slug: "striped-relaxed-poplin-shirt",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "top",
    style: "shirt",
    collection: "Core Edit",
    price: 5790,
    originalPrice: 7200,
    badge: "POPULAR",
    rating: 4.9,
    reviewCount: 48,
    fitLine: "RELAXED FIT | WOMEN",
    primaryColor: "Sky Blue Stripe",
    colors: [
      { name: "Sky Blue Stripe", hex: "#8DA9C4", bgClass: "bg-[#8DA9C4]" },
      { name: "Navy Stripe", hex: "#22384D", bgClass: "bg-[#22384D]" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stockPerSize: { XS: 9, S: 17, M: 20, L: 8 },
    images: [
      "/images/catalog/women_model_striped_shirt.jpg",
      "/images/catalog/women_white_shirt_flat.jpg"
    ],
    description: "Chic Parisian blue and white bengal stripe shirt with dropped shoulders, elongated sleeves, and a clean forward point collar. Perfect half-tucked into denim or linen trousers.",
    fabric: "100% Yarn-Dyed Cotton Poplin",
    care: "Machine wash cold with like colors.",
    fit: "Relaxed slouchy drape."
  },
  {
    id: "women-jeans-03",
    name: "BAGGY SLOUCH JEANS",
    slug: "baggy-slouch-jeans-charcoal",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "bottom",
    style: "wide",
    collection: "Denim Edit 2026",
    price: 6790,
    originalPrice: 7990,
    badge: "TRENDING",
    rating: 4.8,
    reviewCount: 28,
    fitLine: "SLOUCH FIT | WOMEN",
    primaryColor: "Washed Charcoal",
    colors: [
      { name: "Washed Charcoal", hex: "#2B2C2E", bgClass: "bg-[#2B2C2E]" },
      { name: "Vintage Blue", hex: "#4C6B8B", bgClass: "bg-[#4C6B8B]" }
    ],
    sizes: ["26", "28", "30", "32"],
    stockPerSize: { "26": 6, "28": 12, "30": 10, "32": 4 },
    images: [
      "/images/catalog/men_baggy_black_jeans_flat.jpg",
      "/images/catalog/women_model_jeans_shirt.jpg"
    ],
    description: "Low-slung relaxed slouch jeans featuring an authentic washed charcoal fade. Wide leg profile that puddles cleanly over heels or sneakers.",
    fabric: "100% Rigid Washed Cotton Denim (13oz)",
    care: "Cold wash inside out. Line dry in shade.",
    fit: "Relaxed slouchy rise with wide straight leg."
  },
  {
    id: "women-tee-01",
    name: "MINIMALIST RIBBED TANK TOP",
    slug: "minimalist-ribbed-tank-top",
    person: "women",
    gender: "women",
    category: "Women's Pret",
    slot: "top",
    style: "tee",
    collection: "Core Essentials",
    price: 2990,
    originalPrice: 3800,
    badge: "ESSENTIAL",
    rating: 4.9,
    reviewCount: 51,
    fitLine: "SLIM FIT | WOMEN",
    primaryColor: "Obsidian Black",
    colors: [
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" },
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5] border border-gray-300" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stockPerSize: { XS: 10, S: 20, M: 22, L: 9 },
    images: [
      "/images/catalog/women_model_camel_trouser.jpg",
      "/images/catalog/women_white_shirt_flat.jpg"
    ],
    description: "Sleek high-neck ribbed tank cut from modal cotton blend with shape-retaining recovery. Ideal for pairing with pleated trousers or layered under unbuttoned poplin shirts.",
    fabric: "95% Cotton Modal Rib, 5% Spandex (220 GSM)",
    care: "Machine wash cold gentle. Lay flat to dry.",
    fit: "Body-skimming slim silhouette with high crew neckline."
  }
];


function buildDefaultSizeChart(p) {
  if (p.person === 'kids') {
    return [
      { size: '4–5', chestMin: 55, chestMax: 59, waistMin: 52, waistMax: 55, length: 44, shoulder: 28 },
      { size: '6–7', chestMin: 60, chestMax: 65, waistMin: 55, waistMax: 58, length: 49, shoulder: 31 },
      { size: '8–9', chestMin: 66, chestMax: 71, waistMin: 58, waistMax: 62, length: 54, shoulder: 34 },
      { size: '10–11', chestMin: 72, chestMax: 78, waistMin: 62, waistMax: 66, length: 59, shoulder: 37 }
    ];
  }
  if (p.person === 'women') {
    return [
      { size: 'XS', chestMin: 80, chestMax: 85, waistMin: 63, waistMax: 68, length: 64, shoulder: 37 },
      { size: 'S',  chestMin: 85, chestMax: 90, waistMin: 68, waistMax: 73, length: 66, shoulder: 38.5 },
      { size: 'M',  chestMin: 90, chestMax: 96, waistMin: 73, waistMax: 79, length: 68, shoulder: 40 },
      { size: 'L',  chestMin: 96, chestMax: 103, waistMin: 79, waistMax: 86, length: 70, shoulder: 41.5 },
      { size: 'XL', chestMin: 103, chestMax: 110, waistMin: 86, waistMax: 94, length: 72, shoulder: 43 }
    ];
  }
  return [
    { size: 'XS', chestMin: 86, chestMax: 91, waistMin: 71, waistMax: 76, length: 68, shoulder: 42 },
    { size: 'S',  chestMin: 91, chestMax: 96, waistMin: 76, waistMax: 81, length: 70, shoulder: 44 },
    { size: 'M',  chestMin: 96, chestMax: 102, waistMin: 81, waistMax: 87, length: 72, shoulder: 46 },
    { size: 'L',  chestMin: 102, chestMax: 108, waistMin: 87, waistMax: 93, length: 74, shoulder: 48 },
    { size: 'XL', chestMin: 108, chestMax: 115, waistMin: 93, waistMax: 100, length: 76, shoulder: 50 }
  ];
}

export const PRODUCTS = RAW_PRODUCTS.map(p => {
  const person = p.person || p.gender || 'women';
  let sizes = Array.isArray(p.sizes) ? [...p.sizes] : (person === 'kids' ? ['4–5', '6–7', '8–9', '10–11'] : ['XS', 'S', 'M', 'L', 'XL']);
  if (person !== 'kids') {
    for (const std of ['XS', 'S', 'M', 'L', 'XL']) {
      if (!sizes.includes(std)) sizes.push(std);
    }
  }
  const stockPerSize = { ...(p.stockPerSize || {}) };
  for (const s of sizes) {
    if (stockPerSize[s] === undefined) stockPerSize[s] = 0;
  }
  const isOversized = /oversized|baggy|wide|relaxed|boxy/i.test(p.name + ' ' + (p.fit || ''));
  const hasStretch = /elastane|spandex|rib|knit|modal/i.test(p.fabric || '') || p.style === 'knit';
  return {
    ...p,
    gender: p.gender || person,
    person,
    sizes,
    stockPerSize,
    color: p.color || p.colors?.[0]?.hex || '#1E2A38',
    colorName: p.colorName || p.colors?.[0]?.name || p.primaryColor || 'Indigo Blue',
    fitType: p.fitType || (isOversized ? 'relaxed' : /slim/i.test(p.fitLine || '') ? 'slim' : 'regular'),
    fitAdjustment: p.fitAdjustment !== undefined ? p.fitAdjustment : (isOversized ? 0.5 : 0),
    hasStretch,
    fitNotes: p.fitNotes || [
      isOversized ? 'Cut with a relaxed, roomy silhouette (+0.5 fit offset)' : 'Tailored true to Atelier standard measurements',
      hasStretch ? 'Natural fabric stretch offers extra comfort ease' : 'Rigid weave — fabric has no stretch'
    ],
    sizeChart: p.sizeChart || buildDefaultSizeChart({ ...p, person })
  };
});

export const CATEGORIES = [
  "All Pieces",
  "Men's Collection",
  "Women's Pret",
  "Jeans",
  "T-Shirts",
  "Shirts"
];

export const COLOR_PALETTE_INFO = {
  olive: {
    name: "Olive Green",
    hex: "#364634",
    rgb: "54, 70, 52",
    role: "Brand Anchor"
  },
  camel: {
    name: "Desert Camel",
    hex: "#C69F6F",
    rgb: "198, 159, 111",
    role: "Warm Neutral"
  },
  black: {
    name: "Obsidian Black",
    hex: "#111315",
    rgb: "17, 19, 21",
    role: "Editorial Black"
  },
  white: {
    name: "Studio Pure White",
    hex: "#FFFFFF",
    rgb: "255, 255, 255",
    role: "Canvas Studio White"
  }
};
