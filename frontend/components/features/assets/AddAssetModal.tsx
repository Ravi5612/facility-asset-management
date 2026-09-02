"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, FolderPlus } from "lucide-react";
import { SuccessAlert, ErrorAlert } from "@/components/ui/alert-box";
import { AssetCategory } from "@/types";
import type { Department } from "@/types";

import {
  AddAssetFormSchema,
  AddAssetFormValues,
  AddCategoryFormSchema,
  AddCategoryFormValues
} from "@/lib/validations/asset";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { assetService } from "@/services/asset.service";
import { departmentService } from "@/services/department.service";
import { Spinner } from "@/components/ui/spinner";


interface AddAssetModalProps {
  allCategories: AssetCategory[];
  onAddCategory: (name: string, prefix: string) => void;
  getNextId: (category: string) => string;
  generatePrefix: (name: string) => string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onSuccessCallback?: () => void;
}

export function AddAssetModal({ allCategories, onAddCategory, getNextId, generatePrefix, isOpen, setIsOpen, onSuccessCallback }: AddAssetModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Add Asset Form
  const {
    register: registerAsset,
    handleSubmit: handleSubmitAsset,
    reset: resetAsset,
    watch: watchAsset,
    setValue: setAssetValue,
    setError: setAssetError,
    formState: { errors: assetErrors },
  } = useForm<AddAssetFormValues>({
    resolver: zodResolver(AddAssetFormSchema),
    defaultValues: { category: "" }
  });

  const selectedFormCat = watchAsset("category");
  const activeCategoryObj = useMemo(() => {
    if (!selectedFormCat) return null;
    const cats = Array.isArray(allCategories) ? allCategories : (allCategories as any)?.data || [];
    return cats.find((c: any) => c.category === selectedFormCat || c.name === selectedFormCat) || null;
  }, [selectedFormCat, allCategories]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const addAssetMutation = useMutation({
    mutationFn: assetService.createAsset,
    onSuccess: () => {
      setSuccess(true);
      resetAsset();
      router.refresh(); // Tells Next.js to re-fetch Server Components
      if (onSuccessCallback) onSuccessCallback(); // Refetch CSR data
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2000);
    },
    onSettled: () => setIsLoading(false)
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: isOpen,
  });

  // Note: departmentId is intentionally left empty for new assets.
  // New assets go into the general company pool (ownerDepartmentId = null on backend).
  // An asset becomes Store's asset only when a department assigns/returns it to Store.

  const onSubmitAsset = (data: AddAssetFormValues) => {
    // Dynamic Custom Fields Validation
    if (activeCategoryObj?.customFields) {
      let hasError = false;
      for (const field of activeCategoryObj.customFields) {
        if (field.required) {
          const val = data.hardwareDetails?.[field.name];
          if (!val || val.toString().trim() === "") {
            setAssetError(`hardwareDetails.${field.name}` as any, {
              type: "manual",
              message: `${field.name} is required`
            });
            hasError = true;
          }
        }
      }
      if (hasError) return;
    }

    setIsLoading(true);
    addAssetMutation.mutate({
      assetName: data.assetName,
      categoryId: data.category,
      departmentId: data.departmentId || "",
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      warrantyExpiry: data.warrantyExpiry,
      notes: data.notes
    });
  };

  // Add Category Form
  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    watch: watchCat,
    setValue: setCatValue,
    formState: { errors: catErrors },
  } = useForm<AddCategoryFormValues>({
    resolver: zodResolver(AddCategoryFormSchema),
  });

  const newCatName = watchCat("categoryName") || "";
  const newCatPrefix = watchCat("prefix") || "";

  const addCategoryMutation = useMutation({
    mutationFn: (data: { name: string; prefix: string }) => assetService.createCategory(data.name, data.prefix),
    onSuccess: (newCat) => {
      setIsAddCatOpen(false);
      resetCat();
      setAssetValue("category", newCat.name, { shouldValidate: true });
      router.refresh();
    }
  });

  const onSubmitCategory = (data: AddCategoryFormValues) => {
    const trimmed = data.categoryName.trim();
    if (!trimmed) return;
    
    if ((Array.isArray(allCategories) ? allCategories : (allCategories as any)?.data || []).some((c: any) => c.category.toLowerCase() === trimmed.toLowerCase())) {
      setCatError("Category already exists!");
      return;
    }
    setCatError(null);

    const prefix = (data.prefix || generatePrefix(trimmed)).trim().toUpperCase();
    
    // Fallback UI callback for immediate visual update if needed
    onAddCategory(trimmed, prefix); 
    
    addCategoryMutation.mutate({ name: trimmed, prefix });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetAsset();
    }}>
      <DialogTrigger
        render={
          <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white gap-2">
            <PlusCircle className="h-4 w-4" /> Add Asset
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Asset</DialogTitle>
          <DialogDescription className="text-base mt-1">ID will be auto-generated based on category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitAsset(onSubmitAsset)} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <div className="flex gap-2">
                <select id="category" disabled={isLoading}
                  {...registerAsset("category")}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select Category</option>
                  {(Array.isArray(allCategories) ? allCategories : (allCategories as any)?.data || []).map((c: any) => (
                    <option key={c.category} value={c.category}>{c.name}{c.isCustom ? " ✦" : ""}</option>
                  ))}
                </select>
                <Dialog open={isAddCatOpen} onOpenChange={(open) => {
                  setIsAddCatOpen(open);
                  if (!open) resetCat();
                }}>
                  <DialogTrigger
                    render={
                      <Button type="button" variant="outline" size="sm"
                        className="shrink-0 px-2 gap-1 text-xs"
                        title="Add new category">
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Add New Category</DialogTitle>
                      <DialogDescription>Create a new asset category. ID prefix will be auto-generated.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Category Name *</Label>
                        <Input placeholder="e.g. Projector, UPS, Printer"
                          {...registerCat("categoryName", {
                            onChange: (e) => {
                              // Automatically generate prefix if the user hasn't typed a custom one
                              setCatValue("prefix", generatePrefix(e.target.value).toUpperCase());
                            }
                          })} />
                        {catErrors.categoryName && <p className="text-xs text-brand-danger">{catErrors.categoryName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>ID Prefix <span className="text-muted-foreground text-xs">(auto-generated, editable)</span></Label>
                        <div className="flex gap-2 items-center">
                          <Input className="font-mono uppercase w-24" maxLength={3} placeholder="PRJ"
                            {...registerCat("prefix", {
                              onChange: (e) => setCatValue("prefix", e.target.value.toUpperCase().slice(0, 3))
                            })} />
                          <p className="text-xs text-muted-foreground">
                            → <span className="font-mono font-semibold">{(newCatPrefix || generatePrefix(newCatName || "XXX"))}-001</span>, <span className="font-mono font-semibold">{(newCatPrefix || generatePrefix(newCatName || "XXX"))}-002</span>…
                          </p>
                        </div>
                        {catErrors.prefix && <p className="text-xs text-brand-danger">{catErrors.prefix.message}</p>}
                      </div>
                      {catError && <ErrorAlert message={catError} />}
                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="ghost" type="button" onClick={() => setIsAddCatOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSubmitCat(onSubmitCategory)} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
                          <FolderPlus className="mr-2 h-4 w-4" /> Create Category
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {assetErrors.category && <p className="text-xs text-brand-danger">{assetErrors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input id="assetName" placeholder="e.g. MacBook Pro M3" disabled={isLoading} {...registerAsset("assetName")} />
              {assetErrors.assetName && <p className="text-xs text-brand-danger">{assetErrors.assetName.message}</p>}
            </div>

            {selectedFormCat && (
              <div className="space-y-2 col-span-2">
                <Label>Auto-Generated Asset ID</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-dashed">
                  <span className="font-mono font-bold text-[var(--brand-primary)] text-base">{getNextId(selectedFormCat)}</span>
                  <span className="text-xs text-muted-foreground">&rarr; This ID will be assigned automatically</span>
                </div>
              </div>
            )}

            {/* We auto-assign the asset to the Store/Inventory department behind the scenes */}
            <div className="hidden space-y-2">
              <Label htmlFor="department">Department *</Label>
              <select id="department" disabled={isLoading}
                {...registerAsset("departmentId")}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select Department</option>
                {departments.map((d: Department) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input id="serialNumber" placeholder="e.g. C02X..." disabled={isLoading} {...registerAsset("serialNumber")} />
              {assetErrors.serialNumber && <p className="text-xs text-brand-danger">{assetErrors.serialNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" type="date" disabled={isLoading} {...registerAsset("purchaseDate")} />
              {assetErrors.purchaseDate && <p className="text-xs text-brand-danger">{assetErrors.purchaseDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
              <Input id="warrantyExpiry" type="date" disabled={isLoading} {...registerAsset("warrantyExpiry")} />
              {assetErrors.warrantyExpiry && <p className="text-xs text-brand-danger">{assetErrors.warrantyExpiry.message}</p>}
            </div>
            {activeCategoryObj?.customFields?.map((field: any) => {
              const err = (assetErrors.hardwareDetails as any)?.[field.name];
              const isWiredWireless = field.name.includes("Wired") || field.name.includes("wired");
              const isBrand = field.name.toLowerCase() === "brand";
              
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={`hw_${field.name}`}>{field.name} {field.required && '*'}</Label>
                  {isWiredWireless ? (
                    <select
                      id={`hw_${field.name}`}
                      disabled={isLoading}
                      className="w-full px-3 py-2 flex h-10 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...registerAsset(`hardwareDetails.${field.name}` as any)}
                    >
                      <option value="">Select Type</option>
                      <option value="Wired">Wired</option>
                      <option value="Wireless">Wireless</option>
                    </select>
                  ) : isBrand ? (
                    <select
                      id={`hw_${field.name}`}
                      disabled={isLoading}
                      className="w-full px-3 py-2 flex h-10 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...registerAsset(`hardwareDetails.${field.name}` as any)}
                    >
                      <option value="">Select Brand</option>
                      <option value="Logitech">Logitech</option>
                      <option value="Razer">Razer</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="HP">HP</option>
                      <option value="Dell">Dell</option>
                      <option value="Lenovo">Lenovo</option>
                      <option value="ASUS">ASUS</option>
                      <option value="Acer">Acer</option>
                      <option value="Corsair">Corsair</option>
                      <option value="SteelSeries">SteelSeries</option>
                      <option value="ZOWIE (BenQ)">ZOWIE (BenQ)</option>
                      <option value="HyperX">HyperX</option>
                      <option value="Cooler Master">Cooler Master</option>
                      <option value="Glorious">Glorious</option>
                      <option value="Redragon">Redragon</option>
                      <option value="Rapoo">Rapoo</option>
                      <option value="Portronics">Portronics</option>
                      <option value="Zebronics">Zebronics</option>
                      <option value="Ant Esports">Ant Esports</option>
                      <option value="Targus">Targus</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <Input 
                      id={`hw_${field.name}`} 
                      placeholder={`Enter ${field.name}`} 
                      disabled={isLoading} 
                      {...registerAsset(`hardwareDetails.${field.name}` as any)} 
                    />
                  )}
                  {err && <p className="text-xs text-brand-danger">{err.message}</p>}
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea id="notes" rows={3} disabled={isLoading} placeholder="Any notes..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...registerAsset("notes")} />
          </div>
          {success && <SuccessAlert message="Asset added successfully!" />}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
              {isLoading ? <><Spinner size="xs" className="mr-2" />Adding...</> : <><PlusCircle className="mr-2 h-4 w-4" />Save Asset</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
