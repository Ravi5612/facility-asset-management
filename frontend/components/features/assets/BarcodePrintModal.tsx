import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Barcode from "react-barcode";
import { Printer } from "lucide-react";

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string; // The asset code e.g. MOU-014
    name: string;
    serialNumber?: string;
  } | null;
}

export function BarcodePrintModal({ isOpen, onClose, asset }: BarcodePrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: white; }
              button { display: none !important; }
            }
            body { font-family: sans-serif; text-align: center; margin: 2rem; }
            .label-container { border: 1px dashed #ccc; padding: 20px; display: inline-block; border-radius: 8px; }
            .meta { margin-top: 10px; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${printRef.current.innerHTML}
            <div class="meta">
              <strong>${asset?.name || ''}</strong><br/>
              S/N: ${asset?.serialNumber || 'N/A'}
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Barcode
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-md my-4 border border-slate-200">
          <div ref={printRef} className="bg-white p-4 rounded-md shadow-sm">
            {/* The Barcode value is the short Asset Code (e.g. MOU-014) */}
            <Barcode value={asset.id} width={2} height={60} fontSize={16} margin={0} />
          </div>
          <div className="mt-4 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-700">{asset.name}</p>
            <p>S/N: {asset.serialNumber || 'N/A'}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
