import { HodAssetsClientPage } from "@/components/features/assets/HodAssetsClientPage";
import { assetService } from "@/services/asset.service";

export default async function HodAssetsPage() {
  const assets = await assetService.getDepartmentAssets();
  return <HodAssetsClientPage initialAssets={assets} />;
}
