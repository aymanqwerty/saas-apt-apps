"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";

/**
 * Render the selected region of `imageSrc` to a JPEG/PNG blob.
 *
 * Cropping happens in the browser so only the final image is uploaded — the
 * original never reaches the server, and the stored file is the one the doctor
 * actually chose to show.
 */
async function renderCrop(
  imageSrc: string,
  area: Area,
  mimeType: string,
): Promise<Blob> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Could not read that image"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process that image");

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not process that image")),
      mimeType,
      0.92,
    );
  });
}

export function ImageCropDialog({
  file,
  aspect,
  title = "Adjust image",
  onCancel,
  onCropped,
}: {
  /** The file the doctor picked; the dialog is open while this is set. */
  file: File | null;
  /** Fixed crop ratio, or undefined to crop freely. */
  aspect?: number;
  title?: string;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<File | null>(null);

  // Derive the preview URL during render rather than in an effect: syncing
  // state in an effect causes cascading renders (and trips our lint rules).
  if (file !== loadedFor) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(file ? URL.createObjectURL(file) : null);
    setLoadedFor(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    setError(null);
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const confirm = async () => {
    if (!file || !objectUrl || !area) return;
    setBusy(true);
    setError(null);
    try {
      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await renderCrop(objectUrl, area, mimeType);
      const extension = mimeType === "image/png" ? "png" : "jpg";
      onCropped(
        new File([blob], `cover.${extension}`, { type: mimeType }),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not process that image",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={Boolean(file)}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Drag to reposition and zoom to choose exactly which part of the
            photo is shown.
          </p>

          <div className="relative h-80 w-full overflow-hidden rounded-lg bg-neutral-900">
            {objectUrl && (
              <Cropper
                image={objectUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                restrictPosition={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="zoom" className="text-sm">
              Zoom
            </Label>
            <input
              id="zoom"
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="flex-1 accent-blue-600"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoom(1);
                setCrop({ x: 0, y: 0 });
              }}
            >
              Reset
            </Button>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" onClick={confirm} disabled={busy || !area}>
              {busy ? "Processing..." : "Use this image"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
