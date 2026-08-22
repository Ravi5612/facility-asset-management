"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File) => void;
  onRemove?: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  icon = <ImageIcon className="h-6 w-6" />,
  className,
  size = "md",
  shape = "circle",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-2xl",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div 
        className={cn(
          "relative overflow-hidden border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center group hover:border-primary/50 transition-colors shrink-0",
          sizeClasses[size],
          shapeClasses[shape]
        )}
      >
        {value ? (
          <>
            <Image src={value} alt="Upload preview" fill className="object-cover" />
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="text-muted-foreground mb-1">
            {icon}
          </div>
        )}

        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs font-medium z-10">
          <Upload className="h-4 w-4 mb-1" />
          {value ? "Change" : "Upload"}
          <input 
            ref={inputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>
      </div>
      
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
    </div>
  );
}
