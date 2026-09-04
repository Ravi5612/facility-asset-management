"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  isCircle?: boolean;
}

export function ImageZoom({ src, alt = "Image", className, isCircle, ...props }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer hover:opacity-80 transition-opacity ${className || ""}`}
        onClick={() => setIsOpen(true)}
        {...props}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center">
          <img
            src={src}
            alt={alt}
            className={`max-w-full max-h-[85vh] shadow-2xl ${
              isCircle ? "w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full object-cover" : "object-contain rounded-md"
            }`}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
