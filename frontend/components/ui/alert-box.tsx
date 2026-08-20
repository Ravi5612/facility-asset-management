import { CheckCircle2, AlertCircle } from "lucide-react";

interface AlertBoxProps {
  message: string;
}

export function SuccessAlert({ message }: AlertBoxProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function ErrorAlert({ message }: AlertBoxProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
