import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ q?: string; cursor?: string }>;
};

/** Legacy Users route — buyers live under /admin/buyers. */
export default async function AdminUsersRedirectPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.cursor?.trim()) qs.set("cursor", params.cursor.trim());
  const suffix = qs.toString();
  redirect(suffix ? `/admin/buyers?${suffix}` : "/admin/buyers");
}
