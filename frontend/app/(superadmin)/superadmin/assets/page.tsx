import { AssetsClientPage } from "@/components/features/assets/AssetsClientPage";
import { assetService } from "@/services/asset.service";

export default async function AssetsPage() {
  const categories = await assetService.getCategories();
  return <AssetsClientPage initialCategories={categories} />;
}
