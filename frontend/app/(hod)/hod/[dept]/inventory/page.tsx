import { Metadata } from 'next';
import InventoryClientPage from '@/components/features/hod/InventoryClientPage';

export const metadata: Metadata = {
  title: 'Inventory | DR IT GROUP',
};

export default function InventoryPage() {
  return <InventoryClientPage />;
}
