"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
      label: `${"— ".repeat(depth(c.$id))}${c.name}`,
    }));
}

function CreateCategoryForm({ flatCategories }: { flatCategories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    createCategoryFormAction,
    initial,
  );
  useCategoryToast(state);

  const parents = parentOptions(flatCategories);

  return (
    <form
      action={formAction}
      className="mt-10 rounded-md border border-border bg-card px-4 py-5"
    >
      <p className="font-mono text-xs text-accent">create</p>
      <h3 className="mt-1 text-lg font-bold tracking-tight">New category</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="create-name">Name</Label>
          <Input id="create-name" name="name" required maxLength={128} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-slug">Slug (optional)</Label>
          <Input
            id="create-slug"
            name="slug"
            placeholder="auto-generated from name"
            maxLength={128}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-parent">Parent</Label>
          <select
            id="create-parent"
            name="parentId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
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
        <div className="space-y-2">
          <Label htmlFor="create-sort">Sort order</Label>
          <Input
            id="create-sort"
            name="sortOrder"
            type="number"
            defaultValue={0}
          />
        </div>
      </div>

      <Button type="submit" className="mt-4" disabled={pending} size="sm">
        {pending ? "Creating…" : "Create category"}
      </Button>
    </form>
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
        className="rounded-md border border-border bg-card px-4 py-4"
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
                {!confirmDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </Button>
                ) : (
                  <form action={deleteAction} className="inline">
                    <input type="hidden" name="categoryId" value={node.$id} />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={deletePending}
                      >
                        {deletePending ? "Deleting…" : "Confirm delete"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
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
    <>
      <CreateCategoryForm flatCategories={flatCategories} />

      {tree.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          No categories yet. Create one above — storefront filters will read
          from this list once seeded.
        </p>
      ) : (
        <div className="mt-10">
          <p className="font-mono text-xs text-accent">tree</p>
          <h3 className="mt-1 text-lg font-bold tracking-tight">
            All categories
          </h3>
          <CategoryTreeList
            nodes={tree}
            depth={0}
            flatCategories={flatCategories}
          />
        </div>
      )}
    </>
  );
}
