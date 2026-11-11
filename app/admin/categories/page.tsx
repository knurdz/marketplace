import { CategoriesManager } from "@/components/admin/categories-manager";
import { listCategories, listCategoryTree } from "@/lib/services";

export default async function AdminCategoriesPage() {
  const [tree, flat] = await Promise.all([
    listCategoryTree(),
    listCategories({ limit: 100 }),
  ]);

  return (
    <div className="w-full">
      <CategoriesManager tree={tree} flatCategories={flat} />
    </div>
  );
}
