import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'
import { useAIQuota } from '@/hooks/useAIQuota'
import { AIFeatureGate, QuotaBadge } from '@/components/AIFeatureGate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * AI Test Page
 * Quick page to test AI analysis functionality
 */
export default function AITest() {
  const { user } = useAuth()
  const { data: quota } = useAIQuota()
  const aiAnalysis = useAIAnalysis()
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1545241047-6083a3684587?w=800')
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    try {
      const analysis = await aiAnalysis.mutateAsync({
        imageUrl,
        analysisType: 'initial_identification',
        plantData: {
          custom_name: 'Test Plant'
        }
      })
      setResult(analysis)
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Analysis Test</h1>
        <p className="text-muted-foreground">
          Test the PlantSis AI plant identification system
        </p>
      </div>

      {/* User & Quota Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subscription:</span>
            <Badge variant={quota?.subscription_tier === 'pro' ? 'default' : 'secondary'}>
              {quota?.subscription_tier || 'loading...'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Analyses Used:</span>
            <span className="text-sm font-medium">
              {quota?.analyses_used_this_month || 0} / {quota?.subscription_tier === 'pro' ? '∞' : '3'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remaining:</span>
            <QuotaBadge />
          </div>
        </CardContent>
      </Card>

      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test AI Analysis</CardTitle>
          <CardDescription>
            Enter a plant image URL to test species identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/plant-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Try: https://images.unsplash.com/photo-1545241047-6083a3684587 (Monstera)
            </p>
          </div>

          {/* Preview Image */}
          {imageUrl && (
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border">
              <img
                src={imageUrl}
                alt="Test plant"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+Image'
                }}
              />
            </div>
          )}

          {/* Analyze Button */}
          <AIFeatureGate feature="analysis">
            <Button
              onClick={handleAnalyze}
              disabled={aiAnalysis.isPending || !imageUrl}
              className="w-full"
              size="lg"
            >
              {aiAnalysis.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing... (this may take 3-5 seconds)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </AIFeatureGate>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Analysis Complete!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Species */}
            {result.species && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Species Identified</h3>
                  <Badge variant="outline">
                    {Math.round((result.confidence || 0) * 100)}% confident
                  </Badge>
                </div>
                <p className="text-lg font-semibold">{result.species}</p>
              </div>
            )}

            {/* Health Status */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Health Status</h3>
              <Badge
                variant={
                  result.healthStatus === 'thriving' ? 'default' :
                  result.healthStatus === 'good' ? 'secondary' :
                  result.healthStatus === 'at_risk' ? 'outline' :
                  'destructive'
                }
                className="text-base"
              >
                {result.healthStatus}
              </Badge>
            </div>

            {/* Insights */}
            {result.insights?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Insights</h3>
                <ul className="space-y-1">
                  {result.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Care Recommendations</h3>
                <ul className="space-y-1">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Flags */}
            {result.riskFlags?.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Issues Detected
                  </h3>
                </div>
                <ul className="space-y-1">
                  {result.riskFlags.map((flag: string, i: number) => (
                    <li key={i} className="text-sm text-amber-700 dark:text-amber-300">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Processing Time:</span>
                <span>{result.processingTimeMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Used:</span>
                <span>{result.tokensUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Check-In:</span>
                <span>{result.nextCheckInDays} days</span>
              </div>
              {result.analysisId && (
                <div className="flex justify-between">
                  <span>Analysis ID:</span>
                  <code className="bg-muted px-1 rounded">{result.analysisId.substring(0, 8)}...</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>1. Enter a plant image URL (or use the default Monstera image)</p>
          <p>2. Click "Analyze with AI" to test species identification</p>
          <p>3. Review the results: species, health status, insights, and recommendations</p>
          <p>4. Free tier users have 3 analyses per month - you'll see the quota enforcement in action</p>
          <p>5. Check the database to see the saved analysis in <code>ai_plant_analyses</code> table</p>
        </CardContent>
      </Card>
    </div>
  )
}
