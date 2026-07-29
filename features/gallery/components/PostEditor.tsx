"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { ImageCropDialog } from "@/features/gallery/components/ImageCropDialog";
import { MediaEditor } from "@/features/gallery/components/MediaEditor";
import { RichTextEditor } from "@/features/gallery/components/RichTextEditor";
import {
  useBlogCategories,
  useCreateBlogCategory,
  useCreateGalleryPost,
  useUpdateGalleryPost,
} from "@/features/gallery/hooks/useGallery";
import {
  gallerySchema,
  type GalleryFormValues,
} from "@/features/gallery/validation/gallery_schema";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ApiError, mediaUrl } from "@/shared/services/api/client";
import type { GalleryPayload } from "@/shared/services/api/gallery.service";
import { uploadImage } from "@/shared/services/api/media.service";
import type { GalleryPost } from "@/shared/types/gallery";

/** Covers are shown at 16:9 on both the card and the article. */
export const COVER_ASPECT = 16 / 9;

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";
const TEXTAREA_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3";

function toDefaults(post?: GalleryPost): GalleryFormValues {
  return {
    title: post?.title ?? "",
    introduction: post?.introduction ?? "",
    body: post?.body ?? "",
    cover_image: post?.cover_image ?? "",
    category_id: post?.category_id ?? "",
    display_order:
      post?.display_order === null || post?.display_order === undefined
        ? ""
        : String(post.display_order),
    display_date: post?.display_date ?? "",
    tags: post?.tags?.join(", ") ?? "",
    status: post?.status ?? "DRAFT",
    media:
      post?.media?.map((item) => ({
        type: item.type,
        url: item.url,
        description: item.description ?? "",
      })) ?? [],
  };
}

export function PostEditor({ post }: { post?: GalleryPost }) {
  const isEdit = Boolean(post);
  const router = useRouter();
  const createMutation = useCreateGalleryPost();
  const updateMutation = useUpdateGalleryPost(post?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  const { data: categories } = useBlogCategories();
  const createCategory = useCreateBlogCategory();
  const [newCategory, setNewCategory] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: toDefaults(post),
  });

  const coverImage = useWatch({ control, name: "cover_image" });

  const uploadCover = async (file: File) => {
    setUploadError(null);
    setCoverUploading(true);
    try {
      const { url } = await uploadImage(file);
      setValue("cover_image", url, { shouldDirty: true });
    } catch (error) {
      setUploadError(
        error instanceof ApiError ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setCoverUploading(false);
    }
  };

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    createCategory.mutate(name, {
      onSuccess: (category) => {
        setValue("category_id", category.id, { shouldDirty: true });
        setNewCategory("");
      },
    });
  };

  const onSubmit = (values: GalleryFormValues) => {
    const payload: GalleryPayload = {
      title: values.title,
      introduction: values.introduction,
      body: values.body?.trim() || null,
      cover_image: values.cover_image?.trim() || null,
      category_id: values.category_id || null,
      display_order: values.display_order ? Number(values.display_order) : null,
      display_date: values.display_date || null,
      tags: (values.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      // Drop half-filled rows rather than failing validation on the server.
      media: values.media
        .filter((item) => item.url.trim())
        .map((item) => ({
          type: item.type,
          url: item.url.trim(),
          description: item.description?.trim() || null,
        })),
      status: values.status,
    };
    mutation.mutate(payload, {
      onSuccess: () => router.push("/dashboard/gallery"),
    });
  };

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "Unable to save the post. Please try again."
        : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ------------------------------------------------------- main */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-destructive text-sm">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="introduction">Introduction</Label>
                <textarea
                  id="introduction"
                  rows={3}
                  placeholder="The short teaser shown on the listing card."
                  className={TEXTAREA_CLASS}
                  {...register("introduction")}
                />
                {errors.introduction && (
                  <p className="text-destructive text-sm">
                    {errors.introduction.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Content</Label>
                <Controller
                  control={control}
                  name="body"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      minHeight="min-h-64"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <MediaEditor
                control={control}
                register={register}
                setValue={setValue}
              />
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------- sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Cover photo</Label>
                <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg border">
                  {coverImage ? (
                    <Image
                      src={mediaUrl(coverImage)}
                      alt="Cover"
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                      No cover photo
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setCoverFile(file);
                    event.target.value = "";
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={coverUploading}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverUploading
                      ? "Uploading..."
                      : coverImage
                        ? "Replace"
                        : "Upload cover"}
                  </Button>
                  {coverImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setValue("cover_image", "", { shouldDirty: true })
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {uploadError && (
                  <p className="text-destructive text-xs">{uploadError}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  You choose the crop after picking a photo. Without one,
                  patients see a default image.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  className={SELECT_CLASS}
                  {...register("category_id")}
                >
                  <option value="">Uncategorized</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    placeholder="New category"
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCategory();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCategory}
                    disabled={createCategory.isPending || !newCategory.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className={SELECT_CLASS}
                  {...register("status")}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="display_order">Order</Label>
                <Input
                  id="display_order"
                  inputMode="numeric"
                  placeholder="1"
                  {...register("display_order")}
                />
                {errors.display_order && (
                  <p className="text-destructive text-sm">
                    {errors.display_order.message}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Lower numbers appear first. Blank sorts by date.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="display_date">Date shown</Label>
                <Input
                  id="display_date"
                  type="date"
                  {...register("display_date")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="delivery, high-risk"
                  {...register("tags")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {serverError && (
        <p className="text-destructive text-sm" role="alert">
          {serverError}
        </p>
      )}

      <div className="bg-background sticky bottom-0 flex justify-end gap-2 border-t py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/gallery")}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create post"}
        </Button>
      </div>

      <ImageCropDialog
        file={coverFile}
        aspect={COVER_ASPECT}
        title="Adjust cover photo"
        onCancel={() => setCoverFile(null)}
        onCropped={(cropped) => {
          setCoverFile(null);
          void uploadCover(cropped);
        }}
      />
    </form>
  );
}
