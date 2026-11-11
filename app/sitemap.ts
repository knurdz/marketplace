import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/config/app";
import {
  listActiveProducts,
  listCategories,
  listPublicSellers,
} from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl().replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const [categories, products, sellers] = await Promise.all([
    listCategories({ limit: 100 }),
    listActiveProducts({ limit: 100, sort: "newest" }),
    listPublicSellers({ limit: 100 }),
  ]);

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${encodeURIComponent(category.slug)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${encodeURIComponent(product.$id)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const shopEntries: MetadataRoute.Sitemap = sellers.map((seller) => ({
    url: `${baseUrl}/shop/${encodeURIComponent(seller.slug)}`,
    lastModified: seller.$createdAt ? new Date(seller.$createdAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...shopEntries,
    ...productEntries,
  ];
}
