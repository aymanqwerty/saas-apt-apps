import { apiUpload } from "@/shared/services/api/client";

export interface MediaUploadData {
  url: string;
}

export function uploadImage(file: File): Promise<MediaUploadData> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<MediaUploadData>("/media/upload", formData);
}
