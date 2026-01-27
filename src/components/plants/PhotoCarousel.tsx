import { Calendar } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Photo {
  id: string;
  storage_path: string | null;
  caption: string | null;
  created_at: Date;
}

interface PhotoCarouselProps {
  photos: Photo[];
}

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  if (photos.length === 0) return null;

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {photos.map((photo, index) => (
          <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <div className="photo-frame aspect-square bg-gradient-to-br from-sage-light/50 to-secondary/20 flex items-center justify-center relative group">
                {photo.storage_path ? (
                  <img
                    src={photo.storage_path}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl">📸</span>
                    <p className="text-xs text-muted-foreground mt-2">Photo #{index + 1}</p>
                  </div>
                )}
                
                {/* Overlay with caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-sm">
                    {photo.caption && <p className="font-medium">{photo.caption}</p>}
                    <p className="text-xs opacity-80 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {photo.created_at.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {photos.length > 1 && (
        <>
          <CarouselPrevious className="-left-4" />
          <CarouselNext className="-right-4" />
        </>
      )}
    </Carousel>
  );
}
