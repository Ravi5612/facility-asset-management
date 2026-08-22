import { Metadata } from "next";
import { AssetsClientPage } from "@/components/features/assets/AssetsClientPage";
import { assetService } from "@/services/asset.service";

export const metadata: Metadata = {
  title: "My Assets | DR IT GROUP",
};

export default async function SubAdminAssetsPage() {
  const categories = await assetService.getCategories();
  
  // Notice we reuse the exact same AssetsClientPage component that super admin uses!
  // The backend will automatically return only the assets that belong to this sub-admin's departments.
  return <AssetsClientPage initialCategories={categories} hideAddButton={true} />;
}
