"use client";

import { useState } from "react";

import {
  useBlogCategories,
  useCreateBlogCategory,
  useDeleteBlogCategory,
  useUpdateBlogCategory,
} from "@/features/gallery/hooks/useGallery";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function CategoryManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: categories, isPending } = useBlogCategories();
  const createMutation = useCreateBlogCategory();
  const updateMutation = useUpdateBlogCategory();
  const deleteMutation = useDeleteBlogCategory();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    createMutation.mutate(name, { onSuccess: () => setNewName("") });
  };

  const saveEdit = () => {
    const name = editingName.trim();
    if (!editingId || !name) return;
    updateMutation.mutate(
      { id: editingId, name },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-category">Add a category</Label>
            <div className="flex gap-2">
              <Input
                id="new-category"
                value={newName}
                placeholder="Deliveries"
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    add();
                  }
                }}
              />
              <Button
                type="button"
                onClick={add}
                disabled={createMutation.isPending || !newName.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {isPending ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !categories || categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No categories yet. Posts without one show as “Uncategorized”.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  {editingId === category.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={updateMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">
                        {category.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                      >
                        Rename
                      </Button>
                      {pendingDelete === category.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              deleteMutation.mutate(category.id);
                              setPendingDelete(null);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPendingDelete(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setPendingDelete(category.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="text-muted-foreground text-xs">
            Deleting a category keeps its posts — they simply become
            uncategorized.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
