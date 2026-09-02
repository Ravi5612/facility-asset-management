import { z } from "zod";

export const AssetItemHistorySchema = z.object({
  action: z.string(),
  person: z.string(),
  date: z.string(),
  note: z.string(),
});

export const AssetItemSchema = z.object({
  id: z.string(),
  serialNumber: z.string(),
  purchaseDate: z.string(),
  warrantyExpiry: z.string().nullable(),
  status: z.enum(["Assigned", "Available", "Dump", "Repair"]),
  assignedTo: z.string().nullable(),
  assignedOn: z.string().nullable(),
  dumpedOn: z.string().nullable(),
  repairedOn: z.string().nullable(),
  notes: z.string(),
  history: z.array(AssetItemHistorySchema),
});

export const AssetCategorySchema = z.object({
  category: z.string(),
  name: z.string(),
  prefix: z.string(),
  isCustom: z.boolean().optional(),
  items: z.array(AssetItemSchema),
});

export const AssetCategoryArraySchema = z.array(AssetCategorySchema);

export const AddAssetFormSchema = z.object({
  assetName: z.string().min(2, "Asset name is required"),
  category: z.string().min(1, "Category is required"),
  departmentId: z.string().optional(),
  serialNumber: z.string().min(3, "Serial number is required"),
  purchaseDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  hardwareDetails: z.record(z.any()).optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.purchaseDate && data.warrantyExpiry) {
    const purchase = new Date(data.purchaseDate);
    const warranty = new Date(data.warrantyExpiry);
    if (warranty < purchase) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Warranty expiry cannot be before purchase date",
        path: ["warrantyExpiry"],
      });
    }
  }
});
export type AddAssetFormValues = z.infer<typeof AddAssetFormSchema>;

export const AddCategoryFormSchema = z.object({
  categoryName: z.string().min(2, "Category name is required"),
  prefix: z.string().max(3, "Prefix must be at most 3 characters").optional(),
});
export type AddCategoryFormValues = z.infer<typeof AddCategoryFormSchema>;
