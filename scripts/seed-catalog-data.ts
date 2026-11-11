/**
 * Showcase product catalog used by seed-demo.ts.
 * Prices in LKR (major units). Photo ids are Unsplash.
 */

export type SeedProduct = {
  key: string;
  title: string;
  description: string;
  price: number;
  categorySlug: string;
  sellerKey: "seller" | "seller2";
  photoIds: string[];
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    key: "headphones",
    title: "Wireless over-ear headphones with noise cancelling",
    description:
      "Closed-back over-ear headphones with active noise cancelling, soft memory-foam cushions and up to 30 hours of playback on a single charge.",
    price: 24990,
    categorySlug: "electronics",
    sellerKey: "seller",
    photoIds: [
      "1505740420928-5e560c06d30e",
      "1484704849700-f032a568e944",
      "1583394838336-acd977736f90",
      "1546435770-a3e426bf472b",
    ],
  },
  {
    key: "laptop",
    title: "13-inch ultrabook laptop, 16 GB RAM",
    description:
      "A thin, light 13-inch ultrabook with 16 GB of memory, fast SSD storage and a battery that lasts the working day.",
    price: 249900,
    categorySlug: "computers",
    sellerKey: "seller",
    photoIds: [
      "1496181133206-80ce9b88a853",
      "1517336714731-489689fd1ca8",
      "1498050108023-c5249f4df085",
    ],
  },
  {
    key: "earbuds",
    title: "True wireless earbuds with charging case",
    description:
      "True wireless earbuds with a pocketable charging case, touch controls and a secure, comfortable fit.",
    price: 9990,
    categorySlug: "electronics",
    sellerKey: "seller",
    photoIds: [
      "1590658268037-6bf12165a8df",
      "1606220945770-b5b6c2c55bf1",
      "1598488035139-bdbb2231ce04",
    ],
  },
  {
    key: "phone",
    title: "Smartphone 128 GB, dual camera",
    description:
      "A bright edge-to-edge display, a dual camera system and all-day battery life in a slim, durable body.",
    price: 89900,
    categorySlug: "phones",
    sellerKey: "seller",
    photoIds: [
      "1511707171634-5f897ff02aa9",
      "1510557880182-3d4d3cba35a5",
      "1592899677977-9c10ca588bbd",
    ],
  },
  {
    key: "camera",
    title: "Compact instant film camera",
    description:
      "Point, shoot and print. A compact instant camera with automatic exposure and a built-in flash for photos you can hold right away.",
    price: 29900,
    categorySlug: "electronics",
    sellerKey: "seller",
    photoIds: [
      "1526170375885-4d8ecf77b99f",
      "1516035069371-29a1b244cc32",
      "1495707902641-75cac588d2e9",
      "1452780212940-6f5c0d14d848",
    ],
  },
  {
    key: "speaker",
    title: "Portable smart speaker",
    description:
      "A portable speaker with rich, room-filling sound, voice assistant support and a splash-resistant finish.",
    price: 15990,
    categorySlug: "home",
    sellerKey: "seller",
    photoIds: [
      "1608043152269-423dbba4e7e1",
      "1545454675-3531b543be5d",
      "1546435770-a3e426bf472b",
    ],
  },
  {
    key: "smartwatch",
    title: "Fitness smartwatch with heart-rate tracking",
    description:
      "Track workouts, heart rate and sleep, and see notifications at a glance on a bright always-on display.",
    price: 19900,
    categorySlug: "jewelry",
    sellerKey: "seller",
    photoIds: [
      "1546868871-7041f2a55e12",
      "1579586337278-3befd40fd17a",
      "1434493789847-2f02dc6ca35d",
    ],
  },
  {
    key: "sneakers",
    title: "Everyday running sneakers, breathable mesh",
    description:
      "Lightweight running sneakers with a breathable knit upper and a cushioned sole built for daily miles.",
    price: 18900,
    categorySlug: "shoes",
    sellerKey: "seller",
    photoIds: [
      "1542291026-7eec264c27ff",
      "1460353581641-37baddab0fa2",
      "1606107557195-0e29a4b5b4aa",
      "1595950653106-6c9ebd614d3a",
    ],
  },
  {
    key: "sunglasses",
    title: "Polarised sunglasses with UV400 lenses",
    description:
      "Classic frames with polarised UV400 lenses that cut glare on bright days.",
    price: 6490,
    categorySlug: "accessories",
    sellerKey: "seller",
    photoIds: [
      "1572635196237-14b3f281503f",
      "1511499767150-a48a237f0083",
      "1473496169904-658ba7c44d8a",
      "1508296695146-257a814070b4",
    ],
  },
  {
    key: "watch",
    title: "Minimal analog wristwatch, leather strap",
    description:
      "A clean, minimal dial on a stainless case, paired with a soft leather strap that suits both office wear and weekends.",
    price: 12500,
    categorySlug: "jewelry",
    sellerKey: "seller2",
    photoIds: [
      "1523275335684-37898b6baf30",
      "1524805444758-089113d48a6d",
      "1434056886845-dac89ffe9b56",
      "1508685096489-7aacd43bd3b1",
    ],
  },
  {
    key: "jacket",
    title: "Classic leather biker jacket",
    description:
      "A timeless biker silhouette in supple leather with an asymmetric zip, snap lapels and a quilted lining.",
    price: 21900,
    categorySlug: "fashion",
    sellerKey: "seller2",
    photoIds: [
      "1551028719-00167b16eac5",
      "1521223890158-f9f7c3d5d504",
      "1487222477894-8943e31ef7b2",
    ],
  },
  {
    key: "hoodie",
    title: "Heavyweight cotton pullover hoodie",
    description:
      "Heavyweight brushed cotton, a roomy hood and a kangaroo pocket. The everyday layer that only gets softer.",
    price: 4990,
    categorySlug: "fashion",
    sellerKey: "seller2",
    photoIds: [
      "1556821840-3a63f95609a7",
      "1620799140408-edc6dcb6d633",
      "1578768079052-aa76e52ff62e",
    ],
  },
  {
    key: "graphic-tee",
    title: "Graphic print cotton t-shirt",
    description:
      "Soft ringspun cotton tee with a bold front print and a relaxed, easy fit.",
    price: 2590,
    categorySlug: "fashion",
    sellerKey: "seller2",
    photoIds: [
      "1576566588028-4147f3842f27",
      "1521572163474-6864f9cf17ab",
      "1562157873-818bc0726f68",
    ],
  },
  {
    key: "tee-pack",
    title: "Everyday crew-neck tees, pack of 3",
    description:
      "Three essential crew-neck tees in breathable cotton, cut for a clean everyday fit.",
    price: 3490,
    categorySlug: "fashion",
    sellerKey: "seller2",
    photoIds: [
      "1576871337622-98d48d1cf531",
      "1521572163474-6864f9cf17ab",
      "1489987707025-afc232f7ea0f",
    ],
  },
  {
    key: "handbag",
    title: "Structured leather tote bag",
    description:
      "A structured leather tote with a roomy main compartment, inner zip pocket and sturdy top handles.",
    price: 23900,
    categorySlug: "bags",
    sellerKey: "seller2",
    photoIds: [
      "1584917865442-de89df76afd3",
      "1590874103328-eac38a683ce7",
      "1548036328-c9fa89d128fa",
    ],
  },
  {
    key: "skincare",
    title: "Daily hydrating skincare set",
    description:
      "A gentle daily routine: cleanser, hydrating serum and moisturiser, suitable for most skin types.",
    price: 7490,
    categorySlug: "beauty",
    sellerKey: "seller2",
    photoIds: [
      "1556228578-8c89e6adf883",
      "1570172619644-dfd03ed5d881",
      "1556228720-195a672e8a03",
    ],
  },
  {
    key: "perfume",
    title: "Eau de parfum, 100 ml",
    description:
      "A warm, long-lasting eau de parfum with fresh citrus top notes and a soft woody base.",
    price: 16500,
    categorySlug: "beauty",
    sellerKey: "seller2",
    photoIds: [
      "1541643600914-78b084683601",
      "1594035910387-fea47794261f",
      "1592945403244-b3fbafd7f539",
    ],
  },
  {
    key: "cosmetics",
    title: "Makeup brush and palette kit",
    description:
      "A complete kit of soft synthetic brushes and a versatile palette for everyday and evening looks.",
    price: 5990,
    categorySlug: "beauty",
    sellerKey: "seller2",
    photoIds: [
      "1522335789203-aabd1fc54bc9",
      "1596462502278-27bfdc403348",
      "1512496015851-a90fb38ba796",
    ],
  },
];

export function seedProductId(key: string): string {
  return `seed_${key}`.slice(0, 36);
}

export function seedImageFileId(productKey: string, index: number): string {
  return `seedimg-${productKey}-${index}`.slice(0, 64);
}
