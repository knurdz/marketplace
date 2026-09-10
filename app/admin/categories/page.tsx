import { CategoriesManager } from "@/components/admin/categories-manager";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { listCategories, listCategoryTree } from "@/lib/services";

export default async function AdminCategoriesPage() {
  const [tree, flat] = await Promise.all([
    listCategoryTree(),
    listCategories({ limit: 100 }),
  ]);

  return (
    <div className="max-w-3xl">
      <PortalPageHeader
        title="Categories"
        description="Create and organize product categories. Nested categories appear under their parent. Deletion is blocked when products or child categories still reference a category."
      />
      <div className="mt-6">
        <CategoriesManager tree={tree} flatCategories={flat} />
      </div>
    </div>
  );
}
