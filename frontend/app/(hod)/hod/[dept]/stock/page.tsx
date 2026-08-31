import { HodAssetsClientPage } from "@/components/features/assets/HodAssetsClientPage";
import { assetService } from "@/services/asset.service";

export default async function HodStockPage() {
  const assets = await assetService.getDepartmentAssets("stock");
  return <HodAssetsClientPage initialAssets={assets} isStockView={true} />;
}
