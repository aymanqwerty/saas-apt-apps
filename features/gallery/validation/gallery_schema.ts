import { z } from "zod";

export const gallerySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  introduction: z.string().min(1, "Introduction is required"),
  body: z.string().optional(),
  cover_image: z.string().optional(),
  category_id: z.string().optional(),
  // Kept as a string because a cleared number input yields "", which would
  // coerce to 0 and silently pin the post to the top. Converted at submit.
  display_order: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      "Order must be a whole number",
    ),
  display_date: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]),
  media: z.array(
    z.object({
      type: z.enum(["image", "youtube", "instagram"]),
      url: z.string().min(1, "URL is required"),
      description: z.string().max(20_000).optional(),
    }),
  ),
});

export type GalleryFormValues = z.infer<typeof gallerySchema>;
