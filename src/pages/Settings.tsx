import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  User as UserIcon,
  Trash2,
  LogOut,
  Info,
  ExternalLink,
  MessageSquare,
  Settings as SettingsIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { getPlantTitle } from '@/lib/utils'

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile } = useUserProfile()

  const [editNameOpen, setEditNameOpen] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(profile?.display_name || '')
  const [isUpdatingName, setIsUpdatingName] = useState(false)

  const plantTitle = getPlantTitle()

  const handleUpdateDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return

    try {
      setIsUpdatingName(true)
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: newDisplayName.trim() })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Name updated successfully! 💚')
      setEditNameOpen(false)
    } catch (error) {
      console.error('Failed to update display name:', error)
      toast.error('Failed to update name. Please try again.')
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleDeleteAccount = async () => {
    toast.info('Account deletion coming soon! For now, reach out to support.')
    // TODO: Implement actual account deletion
    // Consider soft delete with deleted_at timestamp
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success(`See you later, ${plantTitle}! 👋`)
    navigate('/auth')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground font-handwritten text-xl">
          Let's get you sorted, {plantTitle} 💅
        </p>
      </div>

      {/* Appearance Section */}
      <Card className="border-0 shadow-sm gradient-warm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how PlantBestie looks for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-2">
            <Label htmlFor="theme-select" className="text-sm font-semibold">
              Theme
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-full h-12 rounded-xl">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your vibe: light, dark, or follow your device
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Stay updated on your plant care</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notifications appear in the bell icon when your plants need attention.
            Check-in reminders are automatically scheduled based on your plant's needs.
          </p>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="border-0 shadow-sm gradient-sage">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-secondary" />
            Account
          </CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display Name */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Display Name</p>
              <p className="text-sm text-muted-foreground">
                {profile?.display_name || user?.email?.split('@')[0] || plantTitle}
              </p>
            </div>
            <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewDisplayName(profile?.display_name || '')}
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Display Name</DialogTitle>
                  <DialogDescription>
                    Choose a name that makes you happy 💚
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="e.g., Sarah"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditNameOpen(false)}
                    disabled={isUpdatingName}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateDisplayName}
                    disabled={isUpdatingName || !newDisplayName.trim()}
                  >
                    {isUpdatingName ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Change Password */}
          <Button
            variant="outline"
            className="w-full justify-start h-12 rounded-xl"
            onClick={() => toast.info('Password change coming soon!')}
          >
            Change Password
          </Button>

          {/* Delete Account */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hold up! This is permanent ⚠️</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    Deleting your account will erase all your plants, check-ins, and memories.
                  </p>
                  <p className="font-semibold">
                    We'll miss you, but we get it. This action cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            About
          </CardTitle>
          <CardDescription>App info and resources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Version */}
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-semibold">Version</p>
            <p className="text-sm text-muted-foreground">1.0.0</p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-xl"
              onClick={() => toast.info('Privacy policy coming soon!')}
            >
              <span>Privacy Policy</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-xl"
              onClick={() => toast.info('Terms of service coming soon!')}
            >
              <span>Terms of Service</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-xl"
              onClick={() => toast.info('Feedback form coming soon! For now, reach out via email 📧')}
            >
              <span>Send Feedback</span>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        onClick={handleSignOut}
        variant="outline"
        className="w-full gap-2 h-12 rounded-xl"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Made with 💚 for plant lovers everywhere
      </p>
    </div>
  )
}
