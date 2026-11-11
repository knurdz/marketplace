"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { CategoryImage } from "@/components/store/category-image";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { PortalPanel } from "@/components/layout/portal-panel";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/ui/storage-image";
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
  updateCategoryFormAction,
  type CategoryActionState,
} from "@/lib/appwrite/categories-actions";
import type { CategoryTreeNode } from "@/lib/services";
import type { Category } from "@/lib/types";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

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
        depth(a.$id) - depth(b.$id) || a.name.localeCompare(b.name),
    )
    .map((c) => ({
      value: c.$id,
      label: `${"- ".repeat(depth(c.$id))}${c.name}`,
    }));
}

function CategoryImageField({
  id,
  existing,
}: {
  id: string;
  existing?: Pick<Category, "name" | "slug" | "imageFileId"> | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Image</Label>
      <label
        htmlFor={id}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center transition-colors hover:border-muted-foreground/40 hover:bg-muted/25",
        )}
      >
        {previewUrl ? (
          <StorageImage
            src={previewUrl}
            alt=""
            className="absolute inset-0 size-full"
            imgClassName="object-cover"
          />
        ) : existing ? (
          <span className="absolute inset-0">
            <CategoryImage
              name={existing.name}
              slug={existing.slug}
              imageFileId={existing.imageFileId}
              fallbackClassName="bg-muted text-foreground text-2xl"
            />
          </span>
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
              <Upload className="size-4 text-muted-foreground" aria-hidden />
            </span>
            <span className="mt-2 text-sm font-medium text-foreground">
              Choose image or drag here
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, or WebP · up to 2MB
            </span>
          </>
        )}
        {(previewUrl || existing) && (
          <span className="relative z-10 mt-auto rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            Change image
          </span>
        )}
        <input
          id={id}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return file ? URL.createObjectURL(file) : null;
            });
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Optional. Catalog categories keep their default photo until you upload one.
      </p>
    </div>
  );
}

type CategoryFormDrawerProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatCategories: Category[];
  category?: Category | null;
  trigger?: ReactNode;
};

function CategoryFormDrawer({
  mode,
  open,
  onOpenChange,
  flatCategories,
  category,
  trigger,
}: CategoryFormDrawerProps) {
  const formId = useId();
  const action =
    mode === "create" ? createCategoryFormAction : updateCategoryFormAction;
  const [state, formAction, pending] = useActionState(action, initial);
  useCategoryToast(state, () => onOpenChange(false));

  const parents = parentOptions(flatCategories, category?.$id);
  const title = mode === "create" ? "New category" : "Edit category";
  const description =
    mode === "create"
      ? "Add a category sellers can choose when listing. Image is optional."
      : "Update this category. Upload a new image to replace the current one.";

  return (
    <Drawer contained direction="bottom" open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <form
          id={formId}
          action={formAction}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-2"
        >
          {mode === "edit" && category ? (
            <input type="hidden" name="categoryId" value={category.$id} />
          ) : null}
          <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
            <CategoryImageField
              key={`image-${category?.$id ?? "new"}-${open}`}
              id={`${formId}-image`}
              existing={mode === "edit" ? category : null}
            />
            <div className="grid gap-4 content-start">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${formId}-name`}>Name</Label>
                <Input
                  id={`${formId}-name`}
                  name="name"
                  required
                  maxLength={128}
                  defaultValue={category?.name ?? ""}
                  key={`name-${category?.$id ?? "new"}-${open}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${formId}-slug`}>
                  Slug{mode === "create" ? " (optional)" : ""}
                </Label>
                <Input
                  id={`${formId}-slug`}
                  name="slug"
                  placeholder={
                    mode === "create" ? "auto-generated from name" : undefined
                  }
                  maxLength={128}
                  required={mode === "edit"}
                  defaultValue={category?.slug ?? ""}
                  key={`slug-${category?.$id ?? "new"}-${open}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${formId}-parent`}>Parent</Label>
                <select
                  id={`${formId}-parent`}
                  name="parentId"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-none"
                  defaultValue={category?.parentId ?? ""}
                  key={`parent-${category?.$id ?? "new"}-${open}`}
                >
                  <option value="">None (top level)</option>
                  {parents.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
            variant="info"
            size="sm"
            form={formId}
            disabled={pending}
          >
            {pending
              ? mode === "create"
                ? "Creating…"
                : "Saving…"
              : mode === "create"
                ? "Create category"
                : "Save changes"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function CreateCategoryDrawer({
  flatCategories,
}: {
  flatCategories: Category[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <CategoryFormDrawer
      mode="create"
      open={open}
      onOpenChange={setOpen}
      flatCategories={flatCategories}
      trigger={
        <Button size="sm" variant="info">
          <Plus data-icon="inline-start" />
          New category
        </Button>
      }
    />
  );
}

type CategoryRowProps = {
  node: CategoryTreeNode;
  depth: number;
  flatCategories: Category[];
};

function CategoryRow({
  node,
  depth,
  flatCategories,
}: CategoryRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategoryFormAction,
    initial,
  );

  useCategoryToast(deleteState, () => setConfirmDelete(false));

  return (
    <>
      <li
        className="rounded-xl border border-border/80 bg-card px-4 py-4 shadow-none"
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              <CategoryImage
                name={node.name}
                slug={node.slug}
                imageFileId={node.imageFileId}
                fallbackClassName="bg-muted text-foreground"
              />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight">{node.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                /{node.slug}
                {node.parentId
                  ? ` · parent ${node.parentId.slice(0, 8)}…`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="info"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 data-icon="inline-start" />
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
      </li>

      <CategoryFormDrawer
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        flatCategories={flatCategories}
        category={node}
      />

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
      {nodes.map((node) => (
        <CategoryRow
          key={node.$id}
          node={node}
          depth={depth}
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
