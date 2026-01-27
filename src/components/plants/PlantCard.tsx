import { Link } from "react-router-dom";
import { MapPin, Calendar, Heart, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlantCardProps {
  plant: {
    id: string;
    custom_name: string;
    species_common_name: string | null;
    species_name?: string | null;
    location: string;
    light_type: string;
    proximity_to_window: string;
    photo_url?: string | null;
    last_check_in?: Date | string | null;
    health_status: "thriving" | "good" | "needs_attention";
  };
}

const healthConfig = {
  thriving: {
    label: "Thriving",
    icon: Heart,
    color: "text-secondary-foreground",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/20",
  },
  good: {
    label: "Good",
    icon: Heart,
    color: "text-honey",
    bgColor: "bg-honey/10",
    borderColor: "border-honey/20",
  },
  needs_attention: {
    label: "Needs love",
    icon: AlertTriangle,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
};

const getPlantEmoji = (species: string) => {
  const lower = species.toLowerCase();
  if (lower.includes("monstera")) return "🌿";
  if (lower.includes("fern")) return "🌿";
  if (lower.includes("snake")) return "🌵";
  if (lower.includes("cactus")) return "🌵";
  if (lower.includes("succulent")) return "🪴";
  if (lower.includes("palm")) return "🌴";
  if (lower.includes("pothos")) return "💚";
  if (lower.includes("orchid")) return "🌸";
  return "🌱";
};

export function PlantCard({ plant }: PlantCardProps) {
  const health = healthConfig[plant.health_status];
  const HealthIcon = health.icon;
  const emoji = getPlantEmoji(plant.species_common_name || plant.custom_name || "plant");

  const daysSinceCheckIn = plant.last_check_in
    ? Math.floor((Date.now() - new Date(plant.last_check_in).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link to={`/plant/${plant.id}`}>
      <Card className={cn(
        "plant-card border-0 shadow-sm overflow-hidden cursor-pointer hover:shadow-warm",
        health.borderColor,
        "border-2"
      )}>
        {/* Photo/Placeholder */}
        <div className="aspect-[4/3] bg-gradient-to-br from-sage-light/50 to-secondary/20 flex items-center justify-center relative">
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={plant.custom_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl hover-wiggle">{emoji}</span>
          )}
          
          {/* Health badge overlay */}
          <div className="absolute top-3 right-3">
            <Badge className={cn(health.bgColor, health.color, "border-0 gap-1")}>
              <HealthIcon className="w-3 h-3" />
              {health.label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-display text-xl font-semibold truncate">{plant.custom_name}</h3>
            <p className="text-sm text-muted-foreground truncate italic">
              {plant.species_common_name}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {plant.location}
            </span>
            {daysSinceCheckIn !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {daysSinceCheckIn === 0
                  ? "Today"
                  : daysSinceCheckIn === 1
                  ? "Yesterday"
                  : `${daysSinceCheckIn}d ago`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
