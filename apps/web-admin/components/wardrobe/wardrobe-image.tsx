import { Shirt } from "lucide-react";
import Image from "next/image";
import type React from "react";

type WardrobeImageProps = {
  src?: string | null;
  alt: string;
  gradient?: string;
  className?: string;
  children?: React.ReactNode;
};

export function WardrobeImage({ src, alt, gradient = "from-ivory-100 to-rose-100", className = "", children }: WardrobeImageProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {src ? <Image src={src} alt={alt} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" unoptimized /> : null}
      <div className="relative z-10 h-full">{children ?? (!src ? <Shirt className="h-10 w-10 text-charcoal/55" aria-hidden="true" /> : null)}</div>
    </div>
  );
}
