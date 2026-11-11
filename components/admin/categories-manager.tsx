"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { PortalPanel } from "@/components/layout/portal-panel";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryFormAction,
  deleteCategoryFormAction,
  reorderCategoriesFormAction,
  updateCategoryFormAction,
  type CategoryActionState,
} from "@/lib/appwrite/categories-actions";
import type { CategoryTreeNode } from "@/lib/services";
import type { Category } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

const initial: CategoryActionState = {};

function useCategoryToast(
  state: CategoryActionState,
  onSuccess?: () => void,
) {
  const lastToast = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }

    if (state.success) {
      const key = `s:${state.success}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success(state.success);
        onSuccess?.();
        router.refresh();
      }
    }
  }, [state, onSuccess, router]);
}

type CategoriesManagerProps = {
  tree: CategoryTreeNode[];
  flatCategories: Category[];
};

function parentOptions(
  flat: Category[],
  excludeId?: string,
): { value: string; label: string }[] {
  const byId = new Map(flat.map((c) => [c.$id, c]));
  const depth = (id: string, seen = new Set<string>()): number => {
    if (seen.has(id)) return 0;
    seen.add(id);
    const cat = byId.get(id);
    if (!cat?.parentId || !byId.has(cat.parentId)) return 0;
    return 1 + depth(cat.parentId, seen);
  };

  return flat
    .filter((c) => c.$id !== excludeId)
    .sort(
      (a, b) =>
        depth(a.$id) - depth(b.$id) ||
        a.sortOrder - b.sortOrder ||
        a.name.localeCompare(b.name),
    )
    .map((c) => ({
      value: c.$id,
      label: `${"- ".repeat(depth(c.$id))}${c.name}`,
    }));
}

function CreateCategoryDrawer({
  flatCategories,
}: {
  flatCategories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createCategoryFormAction,
    initial,
  );
  useCategoryToast(state, () => setOpen(false));

  const parents = parentOptions(flatCategories);

  return (
    <Drawer contained direction="bottom" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New category
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New category</DrawerTitle>
          <DrawerDescription>
            Nested categories appear under their parent on the storefront.
          </DrawerDescription>
        </DrawerHeader>
        <form
          id="create-category-form"
          action={formAction}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-2"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-name">Name</Label>
            <Input id="create-name" name="name" required maxLength={128} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-slug">Slug (optional)</Label>
            <Input
              id="create-slug"
              name="slug"
              placeholder="auto-generated from name"
              maxLength={128}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-parent">Parent</Label>
            <select
              id="create-parent"
              name="parentId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-none"
              defaultValue=""
            >
              <option value="">None (top level)</option>
              {parents.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-sort">Sort order</Label>
            <Input
              id="create-sort"
              name="sortOrder"
              type="number"
              defaultValue={0}
            />
          </div>
        </form>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" size="sm" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
          <Button
            type="submit"
            size="sm"
            form="create-category-form"
            disabled={pending}
          >
            {pending ? "Creating…" : "Create category"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type CategoryRowProps = {
  node: CategoryTreeNode;
  depth: number;
  siblings: CategoryTreeNode[];
  siblingIndex: number;
  flatCategories: Category[];
};

function CategoryRow({
  node,
  depth,
  siblings,
  siblingIndex,
  flatCategories,
}: CategoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [updateState, updateAction, updatePending] = useActionState(
    updateCategoryFormAction,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategoryFormAction,
    initial,
  );
  const [reorderState, reorderAction, reorderPending] = useActionState(
    reorderCategoriesFormAction,
    initial,
  );

  useCategoryToast(updateState, () => setEditing(false));
  useCategoryToast(deleteState, () => setConfirmDelete(false));
  useCategoryToast(reorderState);

  const parents = parentOptions(flatCategories, node.$id);
  const canMoveUp = siblingIndex > 0;
  const canMoveDown = siblingIndex < siblings.length - 1;

  const swapWithSibling = (direction: "up" | "down") => {
    const otherIndex = direction === "up" ? siblingIndex - 1 : siblingIndex + 1;
    const other = siblings[otherIndex];
    if (!other) return;

    const formData = new FormData();
    formData.set(
      "updates",
      JSON.stringify([
        { categoryId: node.$id, sortOrder: other.sortOrder },
        { categoryId: other.$id, sortOrder: node.sortOrder },
      ]),
    );
    reorderAction(formData);
  };

  return (
    <>
      <li
        className="rounded-xl border border-border/80 bg-card px-4 py-4 shadow-none"
        style={{ marginLeft: depth * 16 }}
      >
        {editing ? (
          <form action={updateAction} className="space-y-3">
            <input type="hidden" name="categoryId" value={node.$id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`edit-name-${node.$id}`}>Name</Label>
                <Input
                  id={`edit-name-${node.$id}`}
                  name="name"
                  defaultValue={node.name}
                  required
                  maxLength={128}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`edit-slug-${node.$id}`}>Slug</Label>
                <Input
                  id={`edit-slug-${node.$id}`}
                  name="slug"
                  defaultValue={node.slug}
                  required
                  maxLength={128}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`edit-parent-${node.$id}`}>Parent</Label>
                <select
                  id={`edit-parent-${node.$id}`}
                  name="parentId"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  defaultValue={node.parentId ?? ""}
                >
                  <option value="">None (top level)</option>
                  {parents.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`edit-sort-${node.$id}`}>Sort order</Label>
                <Input
                  id={`edit-sort-${node.$id}`}
                  name="sortOrder"
                  type="number"
                  defaultValue={node.sortOrder}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={updatePending}>
                {updatePending ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold tracking-tight">{node.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  /{node.slug}
                  {node.parentId ? ` · parent ${node.parentId.slice(0, 8)}…` : ""}
                  {` · sort ${node.sortOrder}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canMoveUp || reorderPending}
                  onClick={() => swapWithSibling("up")}
                  aria-label={`Move ${node.name} up`}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canMoveDown || reorderPending}
                  onClick={() => swapWithSibling("down")}
                  aria-label={`Move ${node.name} down`}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
                <ConfirmActionDialog
                  open={confirmDelete}
                  onOpenChange={setConfirmDelete}
                  title="Delete category?"
                  description={`Delete “${node.name}”? This cannot be undone if the category has no products or children.`}
                  confirmLabel="Delete"
                  pendingLabel="Deleting…"
                  confirmVariant="destructive"
                  pending={deletePending}
                  formAction={deleteAction}
                  hiddenFields={{ categoryId: node.$id }}
                />
              </div>
            </div>
          </>
        )}
      </li>

      {node.children.length > 0 ? (
        <CategoryTreeList
          nodes={node.children}
          depth={depth + 1}
          flatCategories={flatCategories}
        />
      ) : null}
    </>
  );
}

function CategoryTreeList({
  nodes,
  depth,
  flatCategories,
}: {
  nodes: CategoryTreeNode[];
  depth: number;
  flatCategories: Category[];
}) {
  return (
    <ul className="mt-3 space-y-3">
      {nodes.map((node, index) => (
        <CategoryRow
          key={node.$id}
          node={node}
          depth={depth}
          siblings={nodes}
          siblingIndex={index}
          flatCategories={flatCategories}
        />
      ))}
    </ul>
  );
}

export function CategoriesManager({
  tree,
  flatCategories,
}: CategoriesManagerProps) {
  return (
    <div className="w-full">
      <PortalPageHeader
        title="Categories"
        description="Organize product categories. Deletion is blocked when products or child categories still reference a category."
        actions={<CreateCategoryDrawer flatCategories={flatCategories} />}
      />

      <PortalPanel className="mt-6">
        <h3 className="text-base font-semibold tracking-tight">All categories</h3>
        {tree.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No categories yet. Use New category to add the first one.
          </p>
        ) : (
          <CategoryTreeList
            nodes={tree}
            depth={0}
            flatCategories={flatCategories}
          />
        )}
      </PortalPanel>
    </div>
  );
}
