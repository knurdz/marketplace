import { redirect } from "next/navigation";

type MarketRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy /market URLs redirect to the home catalog. */
export default async function MarketRedirect({ searchParams }: MarketRedirectProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim()) {
      query.set(key, value);
    } else if (Array.isArray(value) && value[0]) {
      query.set(key, value[0]);
    }
  }

  const qs = query.toString();
  redirect(qs ? `/?${qs}` : "/");
}
