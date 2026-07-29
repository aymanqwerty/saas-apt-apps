import { apiUpload } from "@/shared/services/api/client";

export interface MediaUploadData {
  url: string;
}

export function uploadImage(file: File): Promise<MediaUploadData> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<MediaUploadData>("/media/upload", formData);
}

/** MP4/WebM only, 25 MB ceiling — both enforced server-side too. */
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
export const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm";

export function uploadVideo(file: File): Promise<MediaUploadData> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<MediaUploadData>("/media/upload-video", formData);
}
