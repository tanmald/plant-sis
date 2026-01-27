import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Crown, Sparkles, Leaf, TrendingUp, LogOut, Bell, Shield, FileText, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { useUserProfile } from '@/hooks/useUserProfile'
import { getPlantTitle, IDENTITY_OPTIONS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const SUBSCRIPTION_TIERS = {
  free: { name: 'Seedling 🌱', color: 'bg-secondary', aiLimit: 5 },
  pro: { name: 'Grower 🌿', color: 'bg-primary', aiLimit: 50 },
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { profile, updateIdentityPreference } = useUserProfile()
  const [editIdentityOpen, setEditIdentityOpen] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<string>('')

  // Fetch plants count
  const { data: plantsCount = 0 } = useQuery({
    queryKey: ['plants-count', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const { count } = await supabase
        .from('plants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      return count || 0
    },
    enabled: !!user,
  })

  // Fetch check-ins count this month
  const { data: checkInsCount = 0 } = useQuery({
    queryKey: ['check-ins-count', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_date', startOfMonth.toISOString())
      return count || 0
    },
    enabled: !!user,
  })

  const handleSignOut = async () => {
    const plantTitle = getPlantTitle(profile?.identity_preference)
    await signOut()
    toast.success(`See you later, ${plantTitle}! 👋`)
    navigate('/auth')
  }

  const handleSaveIdentity = async () => {
    try {
      await updateIdentityPreference(selectedIdentity)
      const newTitle = getPlantTitle(selectedIdentity as any)
      toast.success(`Updated! We'll call you ${newTitle} now 💚`)
      setEditIdentityOpen(false)
    } catch (error) {
      toast.error('Failed to update preference. Try again?')
    }
  }

  const tier = SUBSCRIPTION_TIERS[(profile?.subscription_tier as keyof typeof SUBSCRIPTION_TIERS) || 'free']
  const aiUsed = profile?.ai_ids_used_this_month || 0
  const aiLimit = tier.aiLimit
  const daysSinceJoined = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const plantTitle = getPlantTitle(profile?.identity_preference)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center shadow-warm-lg">
          <User className="w-12 h-12 text-primary-foreground" />
        </div>

        <div>
          <h1 className="font-display text-3xl">
            {profile?.display_name || user?.email?.split('@')[0] || plantTitle}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {/* Subscription Badge */}
        <Badge className={`${tier.color} text-white px-4 py-1.5 text-sm`}>
          <Crown className="w-4 h-4 mr-2" />
          {tier.name}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="pt-6">
            <Leaf className="w-8 h-8 mx-auto text-secondary mb-2" />
            <p className="text-3xl font-bold font-display">{plantsCount}</p>
            <p className="text-xs text-muted-foreground">Plants</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="pt-6">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold font-display">{checkInsCount}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="pt-6">
            <Sparkles className="w-8 h-8 mx-auto text-honey mb-2" />
            <p className="text-3xl font-bold font-display">{daysSinceJoined}</p>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Card */}
      {profile?.subscription_tier === 'free' && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-honey/10 to-accent/10">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-honey" />
                <span className="font-semibold">AI Identifications</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {aiUsed}/{aiLimit} used
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-honey h-2 rounded-full transition-all"
                style={{ width: `${(aiUsed / aiLimit) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro for unlimited AI identifications! ✨
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA */}
      {profile?.subscription_tier === 'free' && (
        <div className="card-solid overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-glow-purple via-glow-pink to-glow-blue opacity-90" />
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="font-black text-2xl">Level Up Your Plant Game</h2>
            </div>
            <p className="mb-5 opacity-95 font-medium">
              Get unlimited plants, AI-powered recommendations, and exclusive features
            </p>
            <button className="w-full bg-white text-glow-purple font-black py-3 px-6 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all active:scale-95">
              Upgrade to Pro ✨
            </button>
          </div>
        </div>
      )}

      {/* Identity Preference Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1">Identity Preference</h3>
              <p className="text-sm text-muted-foreground">
                We call you: <span className="font-handwritten text-primary">
                  {getPlantTitle(profile?.identity_preference)}
                </span>
              </p>
            </div>
            <Dialog open={editIdentityOpen} onOpenChange={setEditIdentityOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIdentity(profile?.identity_preference || 'prefer-not-to-say')}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Identity Preference</DialogTitle>
                  <DialogDescription>
                    Choose how you'd like to be addressed throughout the app
                  </DialogDescription>
                </DialogHeader>
                <RadioGroup
                  value={selectedIdentity}
                  onValueChange={setSelectedIdentity}
                  className="space-y-3 py-4"
                >
                  {IDENTITY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                        selectedIdentity === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedIdentity(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={`profile-${option.value}`} />
                      <Label htmlFor={`profile-${option.value}`} className="flex-1 cursor-pointer">
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          We'll call you: {option.title}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditIdentityOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveIdentity}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Settings</h2>

        <button className="w-full card-bento flex items-center gap-4 text-left hover:shadow-warm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Notifications</div>
            <div className="text-sm text-muted-foreground">Manage your alerts</div>
          </div>
        </button>

        <button className="w-full card-bento flex items-center gap-4 text-left hover:shadow-warm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Privacy Policy</div>
            <div className="text-sm text-muted-foreground">How we protect your data</div>
          </div>
        </button>

        <button className="w-full card-bento flex items-center gap-4 text-left hover:shadow-warm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Terms of Service</div>
            <div className="text-sm text-muted-foreground">Legal stuff</div>
          </div>
        </button>
      </div>

      {/* Sign Out */}
      <Button onClick={handleSignOut} variant="outline" className="w-full gap-2">
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>

      {/* Version */}
      <p className="text-center text-sm text-muted-foreground">
        PlantSis v1.0.0 • Made with 💚
      </p>
    </div>
  )
}
