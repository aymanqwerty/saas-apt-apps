import { z } from "zod";

export const gallerySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  category: z.string().max(100).optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]),
  media: z.array(
    z.object({
      type: z.enum(["image", "youtube", "instagram"]),
      url: z.string().min(1, "URL is required"),
    }),
  ),
});

export type GalleryFormValues = z.infer<typeof gallerySchema>;
