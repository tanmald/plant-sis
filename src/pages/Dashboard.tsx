import { useState } from "react";
import { Plus, Leaf, Search, Droplets, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlantCard } from "@/components/plants/PlantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePlants } from "@/hooks/usePlants";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getPlantTitle } from "@/lib/utils";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { data: plants = [], isLoading, error, refetch } = usePlants();
  const { profile } = useUserProfile();
  const plantTitle = getPlantTitle(profile?.identity_preference);

  // Fetch check-ins count this month
  const { data: checkInsCount = 0 } = useQuery({
    queryKey: ['check-ins-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_date', startOfMonth.toISOString());
      return count || 0;
    },
    enabled: !!user,
  });

  const filteredPlants = plants.filter(
    (plant) =>
      plant.custom_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plant.species_common_name && plant.species_common_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const plantsNeedingAttention = plants.filter((p) => p.health_status === "needs_attention").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce-gentle">🌱</div>
          <p className="text-muted-foreground font-handwritten text-xl">Loading your garden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Oops! Something went wrong"
        description="We couldn't load your plants. Try refreshing!"
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Hey there, {plantTitle}! 🌿
        </h1>
        <p className="text-muted-foreground text-lg">
          <span className="font-handwritten text-xl text-secondary">
            {plants.length} plant {plants.length === 1 ? "baby" : "babies"}
          </span>{" "}
          thriving under your care
          {plantsNeedingAttention > 0 && (
            <span className="text-accent ml-2">
              ({plantsNeedingAttention} need{plantsNeedingAttention === 1 ? "s" : ""} some love 💕)
            </span>
          )}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{plants.length}</p>
              <p className="text-xs text-muted-foreground">Total Plants</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{plantsNeedingAttention}</p>
              <p className="text-xs text-muted-foreground">Need Water</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-honey/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-honey" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{checkInsCount}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <p className="text-2xl font-bold font-display">3</p>
              <p className="text-xs text-muted-foreground">AI IDs Left</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search your plant babies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-2xl text-base"
        />
      </div>

      {/* Plants Grid */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No plants yet?"
          description="Let's fix that, bestie 🌱"
          action={
            <Button asChild className="rounded-xl shadow-warm">
              <Link to="/add-plant">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Plant
              </Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Search}
          title="No matches found"
          description="Try searching for something else!"
        />
      )}
    </div>
  );
}
