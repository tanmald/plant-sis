import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Crown, Sparkles, Leaf, Camera, TrendingUp, LogOut, Settings, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
            <Camera className="w-8 h-8 mx-auto text-honey mb-2" />
            <p className="text-3xl font-bold font-display">{daysSinceJoined}</p>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Card */}
      {profile?.subscription_tier === 'free' && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-honey" />
              AI Identifications
            </CardTitle>
            <CardDescription>
              {aiUsed} of {aiLimit} used this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(aiUsed / aiLimit) * 100} className="h-3" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {aiLimit - aiUsed} remaining
              </span>
              <Button variant="link" className="p-0 h-auto text-primary">
                Upgrade for more →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA */}
      {profile?.subscription_tier === 'free' && (
        <Card className="border-0 shadow-warm gradient-warm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Level up your plant game! 🌟</CardTitle>
            <CardDescription>
              Get unlimited AI identifications and premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-12 rounded-xl shadow-warm">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
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

      {/* Stats Highlight Card */}
      <Card className="border-0 shadow-sm gradient-sage">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="font-handwritten text-2xl text-secondary">
              You've been a plant parent for
            </p>
            <p className="font-display text-4xl font-bold">{daysSinceJoined} days</p>
            <p className="text-muted-foreground">
              {daysSinceJoined > 30 ? "That's dedication! 💪" : "Just getting started! 🌱"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Settings Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start h-12 rounded-xl"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5 mr-3" />
          App Settings
        </Button>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start h-12 rounded-xl text-destructive hover:text-destructive"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>

      {/* Version */}
      <p className="text-center text-sm text-muted-foreground">
        Made with 💚 for plant lovers everywhere
      </p>
    </div>
  )
}
