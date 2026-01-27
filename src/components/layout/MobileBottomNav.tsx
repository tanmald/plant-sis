import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Home', path: '/', icon: Home },
  { title: 'Profile', path: '/profile', icon: User },
]

export function MobileBottomNav() {
  const location = useLocation()
  const HomeIcon = Home
  const ProfileIcon = User

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border"
      aria-label="Mobile navigation"
    >
      <div
        className="grid grid-cols-3 h-16 relative"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Home */}
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-2 min-h-[44px]',
            'transition-all text-xs font-medium',
            'active:scale-95',
            location.pathname === '/'
              ? 'text-primary scale-110'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Navigate to Home"
          aria-current={location.pathname === '/' ? 'page' : undefined}
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* Add Plant - Prominent Round Button */}
        <div className="flex items-center justify-center">
          <Link
            to="/add-plant"
            className="absolute -top-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-warm-lg flex items-center justify-center transition-all active:scale-95 hover:shadow-warm"
            aria-label="Add new plant"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>

        {/* Profile */}
        <Link
          to="/profile"
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-2 min-h-[44px]',
            'transition-all text-xs font-medium',
            'active:scale-95',
            location.pathname === '/profile'
              ? 'text-primary scale-110'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Navigate to Profile"
          aria-current={location.pathname === '/profile' ? 'page' : undefined}
        >
          <ProfileIcon className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  )
}
