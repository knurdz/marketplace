import { CategoriesManager } from "@/components/admin/categories-manager";
import { listCategories, listCategoryTree } from "@/lib/services";

export default async function AdminCategoriesPage() {
  const [tree, flat] = await Promise.all([
    listCategoryTree(),
    listCategories({ limit: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Categories</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Create and organize product categories. Nested categories appear under
        their parent. Deletion is blocked when products or child categories
        still reference a category.
      </p>

      <CategoriesManager tree={tree} flatCategories={flat} />
    </div>
  );
}
