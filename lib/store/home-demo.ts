/**
 * Static showcase content for the public homepage. Display-only: these items
 * are not catalog rows and cannot be bought, so they open `/showcase/[id]`
 * rather than `/products/[id]`.
 */

export function unsplashUrl(photoId: string, width = 600): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=70&auto=format&fit=crop`;
}

export type DemoProduct = {
  id: string;
  title: string;
  photoId: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  searchTerm: string;
};

export type HomeListing = DemoProduct & {
  listedBy: string;
};

export type MarketCategory = {
  label: string;
  slug: string;
  photoId: string;
};

export type MarketListing = HomeListing & {
  categorySlug: string;
};

export type DemoSection = {
  id: string;
  title: string;
  products: DemoProduct[];
};

const PRODUCTS = {
  headphones: {
    id: "headphones",
    title: "Wireless over-ear headphones with noise cancelling",
    photoId: "1505740420928-5e560c06d30e",
    price: 24990,
    compareAtPrice: 32990,
    rating: 4.6,
    reviews: 182,
    searchTerm: "headphones",
  },
  watch: {
    id: "watch",
    title: "Minimal analog wristwatch, leather strap",
    photoId: "1523275335684-37898b6baf30",
    price: 12500,
    rating: 4.4,
    reviews: 96,
    searchTerm: "watch",
  },
  sneakers: {
    id: "sneakers",
    title: "Everyday running sneakers, breathable mesh",
    photoId: "1542291026-7eec264c27ff",
    price: 18900,
    compareAtPrice: 22500,
    rating: 4.7,
    reviews: 311,
    searchTerm: "sneakers",
  },
  camera: {
    id: "camera",
    title: "Compact instant film camera",
    photoId: "1526170375885-4d8ecf77b99f",
    price: 29900,
    rating: 4.3,
    reviews: 58,
    searchTerm: "camera",
  },
  sunglasses: {
    id: "sunglasses",
    title: "Polarised sunglasses with UV400 lenses",
    photoId: "1572635196237-14b3f281503f",
    price: 6490,
    compareAtPrice: 8990,
    rating: 4.2,
    reviews: 74,
    searchTerm: "sunglasses",
  },
  jacket: {
    id: "jacket",
    title: "Classic leather biker jacket",
    photoId: "1551028719-00167b16eac5",
    price: 21900,
    compareAtPrice: 54750,
    rating: 4.5,
    reviews: 127,
    searchTerm: "jacket",
  },
  hoodie: {
    id: "hoodie",
    title: "Heavyweight cotton pullover hoodie",
    photoId: "1556821840-3a63f95609a7",
    price: 4990,
    compareAtPrice: 12500,
    rating: 4.6,
    reviews: 240,
    searchTerm: "hoodie",
  },
  graphicTee: {
    id: "graphic-tee",
    title: "Graphic print cotton t-shirt",
    photoId: "1576566588028-4147f3842f27",
    price: 2590,
    compareAtPrice: 6490,
    rating: 4.3,
    reviews: 88,
    searchTerm: "t-shirt",
  },
  teePack: {
    id: "tee-pack",
    title: "Everyday crew-neck tees, pack of 3",
    photoId: "1576871337622-98d48d1cf531",
    price: 3490,
    compareAtPrice: 8790,
    rating: 4.1,
    reviews: 45,
    searchTerm: "t-shirt",
  },
  phone: {
    id: "phone",
    title: "Smartphone 128 GB, dual camera",
    photoId: "1511707171634-5f897ff02aa9",
    price: 89900,
    compareAtPrice: 99900,
    rating: 4.5,
    reviews: 203,
    searchTerm: "phone",
  },
  laptop: {
    id: "laptop",
    title: "13-inch ultrabook laptop, 16 GB RAM",
    photoId: "1496181133206-80ce9b88a853",
    price: 249900,
    rating: 4.7,
    reviews: 132,
    searchTerm: "laptop",
  },
  earbuds: {
    id: "earbuds",
    title: "True wireless earbuds with charging case",
    photoId: "1590658268037-6bf12165a8df",
    price: 9990,
    compareAtPrice: 14990,
    rating: 4.2,
    reviews: 167,
    searchTerm: "earbuds",
  },
  speaker: {
    id: "speaker",
    title: "Portable smart speaker",
    photoId: "1608043152269-423dbba4e7e1",
    price: 15990,
    rating: 4.4,
    reviews: 91,
    searchTerm: "speaker",
  },
  smartwatch: {
    id: "smartwatch",
    title: "Fitness smartwatch with heart-rate tracking",
    photoId: "1546868871-7041f2a55e12",
    price: 19900,
    compareAtPrice: 24900,
    rating: 4.3,
    reviews: 119,
    searchTerm: "smartwatch",
  },
  skincare: {
    id: "skincare",
    title: "Daily hydrating skincare set",
    photoId: "1556228578-8c89e6adf883",
    price: 7490,
    rating: 4.6,
    reviews: 208,
    searchTerm: "skincare",
  },
  cosmetics: {
    id: "cosmetics",
    title: "Makeup brush and palette kit",
    photoId: "1522335789203-aabd1fc54bc9",
    price: 5990,
    compareAtPrice: 7990,
    rating: 4.4,
    reviews: 152,
    searchTerm: "makeup",
  },
  perfume: {
    id: "perfume",
    title: "Eau de parfum, 100 ml",
    photoId: "1541643600914-78b084683601",
    price: 16500,
    rating: 4.5,
    reviews: 77,
    searchTerm: "perfume",
  },
  handbag: {
    id: "handbag",
    title: "Structured leather tote bag",
    photoId: "1584917865442-de89df76afd3",
    price: 23900,
    compareAtPrice: 28900,
    rating: 4.3,
    reviews: 64,
    searchTerm: "bag",
  },
} satisfies Record<string, DemoProduct>;

export const HOME_SECTIONS: DemoSection[] = [
  {
    id: "deals",
    title: "Today's best deals for you",
    products: [
      PRODUCTS.headphones,
      PRODUCTS.watch,
      PRODUCTS.sneakers,
      PRODUCTS.camera,
      PRODUCTS.sunglasses,
    ],
  },
  {
    id: "clothing",
    title: "Up to 60% off on clothing",
    products: [
      PRODUCTS.jacket,
      PRODUCTS.hoodie,
      PRODUCTS.graphicTee,
      PRODUCTS.teePack,
      PRODUCTS.sneakers,
    ],
  },
  {
    id: "electronics",
    title: "Top deals in electronics",
    products: [
      PRODUCTS.phone,
      PRODUCTS.laptop,
      PRODUCTS.earbuds,
      PRODUCTS.speaker,
      PRODUCTS.smartwatch,
    ],
  },
  {
    id: "beauty",
    title: "Best sellers in beauty & accessories",
    products: [
      PRODUCTS.skincare,
      PRODUCTS.cosmetics,
      PRODUCTS.perfume,
      PRODUCTS.handbag,
      PRODUCTS.sunglasses,
    ],
  },
];

/** Homepage “Just listed” grid: same showcase SKUs, framed as people selling. */
export const HOME_LISTINGS: HomeListing[] = [
  { ...PRODUCTS.headphones, listedBy: "Nimal" },
  { ...PRODUCTS.watch, listedBy: "Amaya" },
  { ...PRODUCTS.sneakers, listedBy: "Kasun" },
  { ...PRODUCTS.camera, listedBy: "Dilani" },
  { ...PRODUCTS.hoodie, listedBy: "Ruwan" },
  { ...PRODUCTS.earbuds, listedBy: "Sajith" },
  { ...PRODUCTS.handbag, listedBy: "Tharushi" },
  { ...PRODUCTS.sunglasses, listedBy: "Ishara" },
];

/** Photo category circles on the home browse catalog. */
export const MARKET_CATEGORIES: MarketCategory[] = [
  { label: "Electronics", slug: "electronics", photoId: "1505740420928-5e560c06d30e" },
  { label: "Fashion", slug: "fashion", photoId: "1483985988355-763728e1935b" },
  { label: "Bags", slug: "bags", photoId: "1584917865442-de89df76afd3" },
  { label: "Home", slug: "home", photoId: "1555041469-a586c61ea9bc" },
  { label: "Beauty", slug: "beauty", photoId: "1556228578-8c89e6adf883" },
  { label: "Sport", slug: "sport", photoId: "1542291026-7eec264c27ff" },
  { label: "Gadgets", slug: "gadgets", photoId: "1511707171634-5f897ff02aa9" },
  { label: "Accessories", slug: "accessories", photoId: "1572635196237-14b3f281503f" },
  { label: "Plants", slug: "plants", photoId: "1485955900006-10f4d324d411" },
  { label: "Kitchen", slug: "kitchen", photoId: "1542838132-92c53300491e" },
  { label: "Books", slug: "books", photoId: "1512820798883-7d7eade80a09" },
  { label: "Music", slug: "music", photoId: "1511379938547-c1f69419868d" },
  { label: "Kids", slug: "kids", photoId: "1503454537195-1dcabb73ffb9" },
  { label: "Outdoor", slug: "outdoor", photoId: "1551632811-561732d1e306" },
  { label: "Pets", slug: "pets", photoId: "1587300003388-59208cc962f1" },
  { label: "Art", slug: "art", photoId: "1513364776144-60967b0f800f" },
];

/** Home browse showcase grid: filterable by category / price / sort. */
export const MARKET_LISTINGS: MarketListing[] = [
  { ...PRODUCTS.headphones, listedBy: "Nimal", categorySlug: "electronics" },
  { ...PRODUCTS.watch, listedBy: "Amaya", categorySlug: "accessories" },
  { ...PRODUCTS.sneakers, listedBy: "Kasun", categorySlug: "sport" },
  { ...PRODUCTS.camera, listedBy: "Dilani", categorySlug: "gadgets" },
  { ...PRODUCTS.hoodie, listedBy: "Ruwan", categorySlug: "fashion" },
  { ...PRODUCTS.earbuds, listedBy: "Sajith", categorySlug: "electronics" },
  { ...PRODUCTS.handbag, listedBy: "Tharushi", categorySlug: "bags" },
  { ...PRODUCTS.sunglasses, listedBy: "Ishara", categorySlug: "accessories" },
  { ...PRODUCTS.phone, listedBy: "Chamath", categorySlug: "gadgets" },
  { ...PRODUCTS.laptop, listedBy: "Fathima", categorySlug: "electronics" },
  { ...PRODUCTS.jacket, listedBy: "Lasith", categorySlug: "fashion" },
  { ...PRODUCTS.skincare, listedBy: "Nayana", categorySlug: "beauty" },
  { ...PRODUCTS.speaker, listedBy: "Praveen", categorySlug: "home" },
  { ...PRODUCTS.perfume, listedBy: "Shenali", categorySlug: "beauty" },
  { ...PRODUCTS.graphicTee, listedBy: "Ishan", categorySlug: "fashion" },
  { ...PRODUCTS.smartwatch, listedBy: "Mevan", categorySlug: "gadgets" },
  { ...PRODUCTS.teePack, listedBy: "Harsha", categorySlug: "kids" },
  { ...PRODUCTS.cosmetics, listedBy: "Anuki", categorySlug: "art" },
  { ...PRODUCTS.speaker, listedBy: "Raveen", categorySlug: "music" },
  { ...PRODUCTS.sneakers, listedBy: "Janith", categorySlug: "outdoor" },
];

export type MarketListingSort = "newest" | "price_asc" | "price_desc";

export function filterMarketListings(opts: {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: MarketListingSort;
}): MarketListing[] {
  const category = opts.category?.trim() || null;
  const minPrice = opts.minPrice ?? null;
  const maxPrice = opts.maxPrice ?? null;
  const sort = opts.sort ?? "newest";

  let rows = MARKET_LISTINGS.filter((listing) => {
    if (category && listing.categorySlug !== category) return false;
    if (minPrice != null && listing.price < minPrice) return false;
    if (maxPrice != null && listing.price > maxPrice) return false;
    return true;
  });

  if (sort === "price_asc") {
    rows = [...rows].sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    rows = [...rows].sort((a, b) => b.price - a.price);
  }
  // "newest" keeps the curated MARKET_LISTINGS order

  return rows;
}

export function isMarketCategorySlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return MARKET_CATEGORIES.some((category) => category.slug === slug);
}

const DESCRIPTIONS: Record<string, string> = {
  headphones:
    "Closed-back over-ear headphones with active noise cancelling, soft memory-foam cushions and up to 30 hours of playback on a single charge.",
  watch:
    "A clean, minimal dial on a stainless case, paired with a soft leather strap that suits both office wear and weekends.",
  sneakers:
    "Lightweight running sneakers with a breathable knit upper and a cushioned sole built for daily miles.",
  camera:
    "Point, shoot and print. A compact instant camera with automatic exposure and a built-in flash for photos you can hold right away.",
  sunglasses:
    "Classic frames with polarised UV400 lenses that cut glare on bright days.",
  jacket:
    "A timeless biker silhouette in supple leather with an asymmetric zip, snap lapels and a quilted lining.",
  hoodie:
    "Heavyweight brushed cotton, a roomy hood and a kangaroo pocket. The everyday layer that only gets softer.",
  "graphic-tee":
    "Soft ringspun cotton tee with a bold front print and a relaxed, easy fit.",
  "tee-pack":
    "Three essential crew-neck tees in breathable cotton, cut for a clean everyday fit.",
  phone:
    "A bright edge-to-edge display, a dual camera system and all-day battery life in a slim, durable body.",
  laptop:
    "A thin, light 13-inch ultrabook with 16 GB of memory, fast SSD storage and a battery that lasts the working day.",
  earbuds:
    "True wireless earbuds with a pocketable charging case, touch controls and a secure, comfortable fit.",
  speaker:
    "A portable speaker with rich, room-filling sound, voice assistant support and a splash-resistant finish.",
  smartwatch:
    "Track workouts, heart rate and sleep, and see notifications at a glance on a bright always-on display.",
  skincare:
    "A gentle daily routine: cleanser, hydrating serum and moisturiser, suitable for most skin types.",
  cosmetics:
    "A complete kit of soft synthetic brushes and a versatile palette for everyday and evening looks.",
  perfume:
    "A warm, long-lasting eau de parfum with fresh citrus top notes and a soft woody base.",
  handbag:
    "A structured leather tote with a roomy main compartment, inner zip pocket and sturdy top handles.",
};

const ALL_PRODUCTS: DemoProduct[] = Object.values(PRODUCTS);

export function getDemoProduct(id: string): DemoProduct | null {
  return ALL_PRODUCTS.find((product) => product.id === id) ?? null;
}

export type DemoSellerMeta = {
  listedBy: string;
  sellerRating: number;
  sellerReviews: number;
};

const DEMO_SELLER_RATINGS: Record<string, { rating: number; reviews: number }> = {
  headphones: { rating: 4.9, reviews: 38 },
  watch: { rating: 4.7, reviews: 21 },
  sneakers: { rating: 4.8, reviews: 56 },
  camera: { rating: 4.6, reviews: 14 },
  sunglasses: { rating: 4.5, reviews: 19 },
  jacket: { rating: 4.7, reviews: 27 },
  hoodie: { rating: 4.8, reviews: 44 },
  "graphic-tee": { rating: 4.4, reviews: 16 },
  "tee-pack": { rating: 4.3, reviews: 11 },
  phone: { rating: 4.6, reviews: 33 },
  laptop: { rating: 4.9, reviews: 18 },
  earbuds: { rating: 4.5, reviews: 29 },
  speaker: { rating: 4.4, reviews: 22 },
  smartwatch: { rating: 4.6, reviews: 31 },
  skincare: { rating: 4.8, reviews: 47 },
  cosmetics: { rating: 4.5, reviews: 25 },
  perfume: { rating: 4.7, reviews: 17 },
  handbag: { rating: 4.6, reviews: 20 },
};

/** Person selling this showcase listing (demo data). */
export function getDemoSellerMeta(productId: string): DemoSellerMeta {
  const listedBy =
    HOME_LISTINGS.find((row) => row.id === productId)?.listedBy ??
    MARKET_LISTINGS.find((row) => row.id === productId)?.listedBy ??
    "Community seller";
  const stats = DEMO_SELLER_RATINGS[productId] ?? { rating: 4.6, reviews: 12 };
  return {
    listedBy,
    sellerRating: stats.rating,
    sellerReviews: stats.reviews,
  };
}

export function listDemoProductIds(): string[] {
  return ALL_PRODUCTS.map((product) => product.id);
}

export function demoProductDescription(id: string): string {
  return DESCRIPTIONS[id] ?? "";
}

/** Extra angles for the showcase gallery. First id is the listing photo. */
const EXTRA_PHOTOS: Record<string, string[]> = {
  headphones: ["1484704849700-f032a568e944", "1583394838336-acd977736f90", "1546435770-a3e426bf472b"],
  watch: ["1524805444758-089113d48a6d", "1434056886845-dac89ffe9b56", "1508685096489-7aacd43bd3b1"],
  sneakers: ["1460353581641-37baddab0fa2", "1606107557195-0e29a4b5b4aa", "1595950653106-6c9ebd614d3a"],
  camera: ["1516035069371-29a1b244cc32", "1495707902641-75cac588d2e9", "1452780212940-6f5c0d14d848"],
  sunglasses: ["1511499767150-a48a237f0083", "1473496169904-658ba7c44d8a", "1508296695146-257a814070b4"],
  jacket: ["1521223890158-f9f7c3d5d504", "1487222477894-8943e31ef7b2", "1551028719-00167b16eac5"],
  hoodie: ["1620799140408-edc6dcb6d633", "1556821840-3a63f95609a7", "1578768079052-aa76e52ff62e"],
  "graphic-tee": ["1521572163474-6864f9cf17ab", "1576566588028-4147f3842f27", "1562157873-818bc0726f68"],
  "tee-pack": ["1521572163474-6864f9cf17ab", "1576871337622-98d48d1cf531", "1489987707025-afc232f7ea0f"],
  phone: ["1510557880182-3d4d3cba35a5", "1592899677977-9c10ca588bbd", "1511707171634-5f897ff02aa9"],
  laptop: ["1517336714731-489689fd1ca8", "1498050108023-c5249f4df085", "1496181133206-80ce9b88a853"],
  earbuds: ["1606220945770-b5b6c2c55bf1", "1590658268037-6bf12165a8df", "1588423771073-b9701af588b3"],
  speaker: ["1545454675-3531b543be5d", "1608043152269-423dbba4e7e1", "1558089687-f282ffcbc0d4"],
  smartwatch: ["1579586337278-3befd40fd17a", "1434493789847-2f02dc6ca35d", "1546868871-7041f2a55e12"],
  skincare: ["1570172619644-dfd03ed5d881", "1556228720-195a672e8a03", "1556228578-8c89e6adf883"],
  cosmetics: ["1596462502278-27bfdc403348", "1522335789203-aabd1fc54bc9", "1512496015851-a90fb38ba796"],
  perfume: ["1594035910387-fea47794261f", "1541643600914-78b084683601", "1592945403244-b3fbafd7f539"],
  handbag: ["1590874103328-eac38a683ce7", "1584917865442-de89df76afd3", "1548036328-c9fa89d128fa"],
};

const BULLETS: Record<string, string[]> = {
  headphones: [
    "Closed-back cups with active noise cancelling for commutes and late nights.",
    "Soft memory-foam cushions that stay comfortable for long listening.",
    "About 30 hours of playback on a single charge.",
    "Fold-flat design, so it packs into a bag without a hard case.",
    "Listed by a person in the community, not a brand store.",
  ],
  watch: [
    "Clean minimal dial on a slim stainless case.",
    "Soft leather strap that works for workdays and weekends.",
    "No smart features: just the time, easy to read.",
    "Lightweight enough to wear all day.",
    "From one person, not a brand counter.",
  ],
  sneakers: [
    "Breathable knit upper for warm days and daily walks.",
    "Cushioned sole built for everyday miles, not a race kit.",
    "Light enough to wear from morning errands to evening.",
    "Easy to wipe clean after the road.",
    "Sold by someone nearby, not a chain store.",
  ],
  camera: [
    "Point, shoot, and print a photo you can hold right away.",
    "Automatic exposure, so you do not fiddle with settings.",
    "Built-in flash for indoor shots.",
    "Pocket size for trips and gatherings.",
    "A person's camera, not a shop display model.",
  ],
  sunglasses: [
    "Polarised UV400 lenses that cut glare on bright days.",
    "Classic frames that sit light on the nose.",
    "Useful for driving, the beach, and walking around.",
    "Comes from a person clearing their own things.",
  ],
  jacket: [
    "Biker cut with an asymmetric zip and snap lapels.",
    "Supple leather with a quilted lining.",
    "Worn-in feel rather than a stiff new-shop finish.",
    "A single piece from one person, not a seasonal drop.",
  ],
  hoodie: [
    "Heavyweight brushed cotton that softens with wear.",
    "Roomy hood and a deep kangaroo pocket.",
    "Easy layer for cooler evenings.",
    "From a person in the community, not a label rack.",
  ],
  "graphic-tee": [
    "Soft ringspun cotton with a bold front print.",
    "Relaxed fit for everyday wear.",
    "Holds its shape after a normal wash.",
    "One person's listing, not a brand collection.",
  ],
  "tee-pack": [
    "Three crew-neck tees in breathable cotton.",
    "Plain colours for mixing with what you already own.",
    "Cut for a clean everyday fit.",
    "Bundled by a person, not packed by a warehouse brand.",
  ],
  phone: [
    "Bright edge-to-edge display for photos and messages.",
    "Dual camera for everyday shots.",
    "128 GB of storage and a battery that lasts the day.",
    "Slim body that still feels solid in the hand.",
    "Previously used by a person, not sold as new-in-box retail.",
  ],
  laptop: [
    "Thin 13-inch screen that is easy to carry.",
    "16 GB of memory for classes, work, and browsing.",
    "Fast storage so it wakes up quickly.",
    "Battery that covers a normal working day.",
    "From a person upgrading, not a brand outlet.",
  ],
  earbuds: [
    "True wireless pair with a small charging case.",
    "Touch controls for music and calls.",
    "Secure fit for walks and commutes.",
    "Listed by a person, not a brand kiosk.",
  ],
  speaker: [
    "Room-filling sound from a portable body.",
    "Splash-resistant finish for the kitchen or a picnic.",
    "Easy to pair from a phone.",
    "One person's speaker, not a store demo unit.",
  ],
  smartwatch: [
    "Tracks workouts, heart rate, and sleep.",
    "Shows notifications without pulling out a phone.",
    "Bright display you can read outdoors.",
    "From a person in the community, not a brand boutique.",
  ],
  skincare: [
    "Cleanser, hydrating serum, and moisturiser for a simple daily routine.",
    "Gentle formula suited to most skin types.",
    "Small set, so you can try it before committing.",
    "Passed on by a person, not a beauty counter.",
  ],
  cosmetics: [
    "Soft synthetic brushes plus a versatile everyday palette.",
    "Works for a quick daytime look or an evening one.",
    "Compact enough to keep in a bag.",
    "From a person, not a brand display.",
  ],
  perfume: [
    "100 ml eau de parfum with citrus on top and a soft woody base.",
    "Scent that stays through the day.",
    "One bottle from a person, not a duty-free wall.",
  ],
  handbag: [
    "Structured leather tote with room for a laptop and daily bits.",
    "Inner zip pocket and sturdy top handles.",
    "Carries well on the shoulder.",
    "From a person, not a brand boutique.",
  ],
};

export function demoProductPhotos(product: Pick<DemoProduct, "id" | "photoId">): string[] {
  const extras = EXTRA_PHOTOS[product.id] ?? [];
  return [product.photoId, ...extras.filter((id) => id !== product.photoId)];
}

export function demoProductBullets(id: string): string[] {
  return BULLETS[id] ?? [];
}

/** Other items from the first homepage section that features this product. */
export function relatedDemoProducts(id: string, limit = 5): DemoProduct[] {
  const section = HOME_SECTIONS.find((entry) =>
    entry.products.some((product) => product.id === id),
  );
  const pool = [
    ...(section?.products ?? []),
    ...ALL_PRODUCTS,
  ].filter((product) => product.id !== id);
  return Array.from(new Map(pool.map((p) => [p.id, p])).values()).slice(0, limit);
}

export function formatLkr(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}
