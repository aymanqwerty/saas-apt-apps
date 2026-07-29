"use client";

import Image from "next/image";
import { GripVertical, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

import { ImageCropDialog } from "@/features/gallery/components/ImageCropDialog";
import { RichTextEditor } from "@/features/gallery/components/RichTextEditor";
import type { GalleryFormValues } from "@/features/gallery/validation/gallery_schema";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ApiError, mediaUrl } from "@/shared/services/api/client";
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  uploadImage,
  uploadVideo,
} from "@/shared/services/api/media.service";

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const TYPE_LABELS = {
  image: "Image",
  video: "Video file",
  youtube: "YouTube video",
  instagram: "Instagram link",
} as const;

export function MediaEditor({
  control,
  register,
  setValue,
}: {
  control: Control<GalleryFormValues>;
  register: UseFormRegister<GalleryFormValues>;
  setValue: UseFormSetValue<GalleryFormValues>;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "media",
  });

  // Which row is uploading / awaiting a crop decision.
  const [pendingCrop, setPendingCrop] = useState<{
    index: number;
    file: File;
  } | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const setError = (index: number, message: string | null) =>
    setErrors((current) => {
      const next = { ...current };
      if (message) next[index] = message;
      else delete next[index];
      return next;
    });

  const doUpload = async (
    index: number,
    file: File,
    onUrl: (url: string) => void,
    kind: "image" | "video" = "image",
  ) => {
    setUploadingIndex(index);
    setError(index, null);
    try {
      const { url } =
        kind === "video" ? await uploadVideo(file) : await uploadImage(file);
      onUrl(url);
    } catch (error) {
      setError(
        index,
        error instanceof ApiError ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const pickVideo = (index: number, file: File) => {
    // Checked here as well as server-side so the doctor isn't left waiting on
    // a 25 MB upload that was always going to be rejected.
    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        index,
        `That video is ${(file.size / 1024 / 1024).toFixed(0)} MB. The limit is ` +
          `${MAX_VIDEO_BYTES / 1024 / 1024} MB — trim it, or upload it to YouTube and paste the link.`,
      );
      return;
    }
    void doUpload(
      index,
      file,
      (url) => setValue(`media.${index}.url`, url, { shouldDirty: true }),
      "video",
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>Images, videos &amp; links</Label>
          <p className="text-muted-foreground text-sm">
            Images and videos upload from your device — videos must be MP4 or
            WebM, up to {MAX_VIDEO_BYTES / 1024 / 1024} MB. For anything
            longer, use YouTube. Instagram posts appear as embeds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: "image", url: "", description: "" })}
          >
            Add image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: "video", url: "", description: "" })}
          >
            Add video file
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: "youtube", url: "", description: "" })}
          >
            Add YouTube
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ type: "instagram", url: "", description: "" })
            }
          >
            Add Instagram
          </Button>
        </div>
      </div>

      {fields.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          No media yet.
        </p>
      )}

      {fields.map((field, index) => (
        <MediaRow
          key={field.id}
          index={index}
          control={control}
          register={register}
          isFirst={index === 0}
          isLast={index === fields.length - 1}
          uploading={uploadingIndex === index}
          error={errors[index]}
          onMoveUp={() => move(index, index - 1)}
          onMoveDown={() => move(index, index + 1)}
          onRemove={() => remove(index)}
          onPickFile={(file) => setPendingCrop({ index, file })}
          onPickVideo={(file) => pickVideo(index, file)}
          registerFileInput={(element) => {
            fileInputs.current[index] = element;
          }}
          openFilePicker={() => fileInputs.current[index]?.click()}
        />
      ))}

      <ImageCropDialog
        file={pendingCrop?.file ?? null}
        title="Adjust image"
        onCancel={() => setPendingCrop(null)}
        onCropped={(cropped) => {
          const target = pendingCrop;
          setPendingCrop(null);
          if (!target) return;
          void doUpload(target.index, cropped, (url) =>
            setValue(`media.${target.index}.url`, url, { shouldDirty: true }),
          );
        }}
      />
    </div>
  );
}

function MediaRow({
  index,
  control,
  register,
  isFirst,
  isLast,
  uploading,
  error,
  onMoveUp,
  onMoveDown,
  onRemove,
  onPickFile,
  onPickVideo,
  registerFileInput,
  openFilePicker,
}: {
  index: number;
  control: Control<GalleryFormValues>;
  register: UseFormRegister<GalleryFormValues>;
  isFirst: boolean;
  isLast: boolean;
  uploading: boolean;
  error?: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onPickFile: (file: File) => void;
  onPickVideo: (file: File) => void;
  registerFileInput: (element: HTMLInputElement | null) => void;
  openFilePicker: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <GripVertical className="text-muted-foreground size-4 shrink-0" />
        <select className={SELECT_CLASS} {...register(`media.${index}.type`)}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={isFirst}
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={isLast}
          >
            ↓
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Controller
        control={control}
        name={`media.${index}.type`}
        render={({ field: typeField }) => (
          <Controller
            control={control}
            name={`media.${index}.url`}
            render={({ field: urlField }) =>
              typeField.value === "video" ? (
                <div className="flex flex-col gap-2">
                  {urlField.value ? (
                    <video
                      src={mediaUrl(urlField.value)}
                      controls
                      preload="metadata"
                      className="max-h-64 w-full rounded-lg border bg-black"
                    />
                  ) : (
                    <div className="bg-muted text-muted-foreground flex h-32 items-center justify-center rounded-lg border text-xs">
                      No video
                    </div>
                  )}
                  <input
                    type="file"
                    accept={ACCEPTED_VIDEO_TYPES}
                    className="hidden"
                    ref={registerFileInput}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onPickVideo(file);
                      event.target.value = "";
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={openFilePicker}
                    >
                      {uploading
                        ? "Uploading..."
                        : urlField.value
                          ? "Replace video"
                          : "Upload video"}
                    </Button>
                    {urlField.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => urlField.onChange("")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <input type="hidden" {...register(`media.${index}.url`)} />
                  {error && <p className="text-destructive text-xs">{error}</p>}
                </div>
              ) : typeField.value === "image" ? (
                <div className="flex items-center gap-3">
                  {urlField.value ? (
                    <Image
                      src={mediaUrl(urlField.value)}
                      alt=""
                      width={128}
                      height={80}
                      className="h-20 w-32 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="bg-muted text-muted-foreground flex h-20 w-32 items-center justify-center rounded-lg border text-xs">
                      No image
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={registerFileInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onPickFile(file);
                        event.target.value = "";
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={openFilePicker}
                      >
                        {uploading
                          ? "Uploading..."
                          : urlField.value
                            ? "Replace image"
                            : "Upload image"}
                      </Button>
                      {urlField.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => urlField.onChange("")}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    {/* Holds the uploaded URL; never typed into directly. */}
                    <input type="hidden" {...register(`media.${index}.url`)} />
                    {error && (
                      <p className="text-destructive text-xs">{error}</p>
                    )}
                  </div>
                </div>
              ) : (
                <Input
                  placeholder={
                    typeField.value === "youtube"
                      ? "https://youtu.be/..."
                      : "https://instagram.com/p/..."
                  }
                  value={urlField.value}
                  onChange={urlField.onChange}
                />
              )
            }
          />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Description</Label>
        <Controller
          control={control}
          name={`media.${index}.description`}
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              minHeight="min-h-24"
            />
          )}
        />
      </div>
    </div>
  );
}
