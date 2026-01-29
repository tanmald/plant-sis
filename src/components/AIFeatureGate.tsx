import { useAIQuota } from '@/hooks/useAIQuota'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Lock, Calendar } from 'lucide-react'
import { ReactNode } from 'react'

interface AIFeatureGateProps {
  /**
   * Feature being gated ('analysis' or 'check_in')
   */
  feature: 'analysis' | 'check_in'

  /**
   * Children to render if user has access
   */
  children: ReactNode

  /**
   * Optional fallback to show instead of default upgrade card
   */
  fallback?: ReactNode

  /**
   * If true, shows inline upgrade prompt instead of blocking
   */
  soft?: boolean
}

/**
 * AI Feature Gate Component
 *
 * Wraps AI features and enforces quota limits.
 * Shows upgrade prompts for free users who hit their limits.
 */
export function AIFeatureGate({ feature, children, fallback, soft = false }: AIFeatureGateProps) {
  const { data: quota, isLoading } = useAIQuota()

  // Loading state
  if (isLoading) {
    return soft ? <>{children}</> : null
  }

  // No quota data (shouldn't happen)
  if (!quota) {
    return soft ? <>{children}</> : null
  }

  // User has access
  if (quota.can_use_ai) {
    return <>{children}</>
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Soft gate: show inline warning
  if (soft) {
    return (
      <div className="space-y-4">
        {children}
        <InlineUpgradePrompt quota={quota} />
      </div>
    )
  }

  // Hard gate: show upgrade card
  return <UpgradeCard quota={quota} feature={feature} />
}

/**
 * Upgrade Card - Blocks feature access
 */
function UpgradeCard({ quota, feature }: { quota: any; feature: string }) {
  const featureName = feature === 'analysis' ? 'AI Photo Analysis' : 'AI Check-In'

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg">AI Limit Reached</CardTitle>
        </div>
        <CardDescription>
          You've used all {quota.analyses_used_this_month} {featureName} credits this month.
          {quota.subscription_tier === 'free' && ' Upgrade to Pro for unlimited AI!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {quota.subscription_tier === 'free' && (
          <>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">PlantBestie Pro</h4>
                  <ul className="text-sm space-y-1.5 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Unlimited AI photo analyses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Unlimited AI-enhanced check-ins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Push notifications & reminders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Advanced insights & trends</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Priority AI processing (faster!)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-bold">$2.99</span>
                <span className="text-sm text-muted-foreground">/month</span>
                <Badge variant="secondary" className="ml-2">Best Value</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                or $24.99/year (save 30%)
              </p>
            </div>

            <Button className="w-full" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Free credits reset on {quota.reset_date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Inline Upgrade Prompt - Soft warning
 */
function InlineUpgradePrompt({ quota }: { quota: any }) {
  return (
    <Card className="border-amber-500/20 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
              AI credits running low
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
              You've used {quota.analyses_used_this_month} of {quota.remaining_analyses + quota.analyses_used_this_month} free AI analyses this month.
              Upgrade to Pro for unlimited access!
            </p>
            <Button size="sm" variant="outline" className="text-xs h-7">
              <Sparkles className="w-3 h-3 mr-1" />
              View Pro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Quota Badge - Shows remaining AI credits
 */
export function QuotaBadge() {
  const { data: quota } = useAIQuota()

  if (!quota || quota.subscription_tier === 'pro') {
    return null
  }

  const variant = quota.remaining_analyses === 0
    ? 'destructive'
    : quota.remaining_analyses === 1
    ? 'outline'
    : 'secondary'

  return (
    <Badge variant={variant} className="gap-1">
      <Sparkles className="w-3 h-3" />
      {quota.remaining_analyses} AI credits left
    </Badge>
  )
}
