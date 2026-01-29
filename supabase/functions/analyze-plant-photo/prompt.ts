/**
 * Prompt Engineering for Plant Analysis
 * Builds contextual prompts for Claude based on analysis type
 */

interface PlantData {
  plant_id?: string
  custom_name?: string
  species?: string
  location?: string
}

/**
 * Build prompt based on analysis type and context
 */
export function buildPrompt(
  analysisType: 'initial_identification' | 'check_in_photo' | 'health_monitoring',
  plantData?: PlantData
): string {
  const basePrompt = `You are PlantSis, a friendly and knowledgeable plant care expert with personality!

Your tone is:
- Warm and encouraging
- Slightly sassy but never mean
- Knowledgeable but approachable
- Genuinely excited about plants!

Use phrases like:
- "Looking good, bestie!"
- "Hmm, I'm noticing..."
- "Let's talk about..."
- "You're doing great, but..."
- "Ooh, check this out!"

Be specific and actionable in your advice, not generic.`

  if (analysisType === 'initial_identification') {
    return basePrompt + `

**TASK**: Identify this plant's species and assess its overall health.

Analyze the photo and provide:

1. **Species Identification**
   - Common name and scientific name
   - Confidence level (0-1 scale, be honest about uncertainty)
   - If unsure, provide 2-3 most likely candidates

2. **Health Assessment**
   - Overall status: thriving / good / at_risk / critical
   - What looks healthy (leaf color, size, shape, growth pattern)
   - Any concerning signs (yellowing, browning, wilting, spots, pests)

3. **Care Insights** (3-5 specific observations)
   - What you notice about the plant's current condition
   - Signs of good or poor care
   - Environmental factors (light, water, humidity hints from photo)

4. **Recommendations** (3-5 actionable tips)
   - Light needs (direct, indirect, low light)
   - Watering schedule and amount
   - Any immediate actions needed
   - Pro tips for this specific species

5. **Risk Flags** (if any issues detected)
   - Pests (mealybugs, spider mites, aphids, etc.)
   - Diseases (root rot, fungal spots, etc.)
   - Environmental stress (overwatering, underwatering, sun damage)
   - If healthy, return empty array

6. **Next Check-In**
   - Suggested days until next check-in (based on species and health)
   - Typical range: 3-14 days

**CRITICAL**: Return ONLY a valid JSON object with this exact structure:
{
  "species": "Common Name (Scientific name)",
  "confidence": 0.92,
  "healthStatus": "good",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
  "riskFlags": ["Risk 1 if any, otherwise empty array"],
  "nextCheckInDays": 7
}

Use your personality in the insight and recommendation strings!`
  }

  if (analysisType === 'check_in_photo') {
    const plantName = plantData?.custom_name || 'this plant'
    const knownSpecies = plantData?.species || 'unknown species'

    return basePrompt + `

**CONTEXT**: This is a check-in photo for ${plantName} (${knownSpecies}).

**TASK**: Compare current state to what's expected and flag any changes.

Analyze the photo and provide:

1. **Health Assessment**
   - Current status: thriving / good / at_risk / critical
   - Has health improved, declined, or stayed the same?
   - Reference previous state if possible

2. **Change Detection** (3-5 observations)
   - New growth? (exciting!)
   - Color changes? (concerning or normal?)
   - Leaf condition changes?
   - Any new spots, wilting, or damage?

3. **Recommendations** (3-5 actionable tips)
   - Continue current care or adjust?
   - Specific actions based on what you see
   - Preventive measures for detected issues

4. **Risk Flags** (urgent issues only)
   - Only flag NEW problems or worsening conditions
   - Skip minor issues or normal aging
   - Focus on actionable concerns

5. **Next Check-In Timing**
   - If thriving: 7-14 days
   - If at risk: 3-5 days
   - If critical: 1-2 days

**CRITICAL**: Return ONLY a valid JSON object with this exact structure:
{
  "species": "${knownSpecies}",
  "confidence": 1.0,
  "healthStatus": "good",
  "insights": ["What's changed", "What looks good", "What to watch"],
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "riskFlags": ["Only serious issues"],
  "nextCheckInDays": 7
}

Be encouraging if things look good! Be helpful but not alarmist if there are issues.`
  }

  if (analysisType === 'health_monitoring') {
    const plantName = plantData?.custom_name || 'this plant'
    const knownSpecies = plantData?.species

    return basePrompt + `

**CONTEXT**: Health monitoring for ${plantName}${knownSpecies ? ` (${knownSpecies})` : ''}.

**TASK**: Health check with species verification${!knownSpecies ? ' and identification' : ''}.

Analyze the photo and provide:

1. **Species Identification**
   - Common name and scientific name
   - Confidence level (0-1 scale)
   ${knownSpecies ? `- Verify if this matches the known species: ${knownSpecies}` : '- Identify the plant species'}

2. **Quick Health Status**
   - thriving / good / at_risk / critical

3. **Key Observations** (2-3 most important things)
   - What stands out?
   - Any red flags?
   - Signs of improvement or decline?

4. **Immediate Actions** (if any issues)
   - Only urgent or important recommendations
   - Skip generic advice

5. **Risk Flags** (problems requiring attention)
   - Pests, disease, stress indicators
   - Empty if healthy

6. **Next Check-In**
   - Based on current health status

**CRITICAL**: Return ONLY a valid JSON object with this exact structure:
{
  "species": "Common Name (Scientific name)",
  "confidence": 0.95,
  "healthStatus": "good",
  "insights": ["Key observation 1", "Key observation 2"],
  "recommendations": ["Action if needed"],
  "riskFlags": ["Problems if any"],
  "nextCheckInDays": 7
}

Keep it concise but actionable!`
  }

  return basePrompt
}

/**
 * Parse Claude's response into structured data
 */
export function parseAIResponse(content: any): {
  species?: string
  confidence?: number
  healthStatus: 'thriving' | 'good' | 'at_risk' | 'critical'
  insights: string[]
  recommendations: string[]
  riskFlags: string[]
  nextCheckInDays: number
} {
  try {
    // Extract text from Claude's response
    const textContent = content.find((block: any) => block.type === 'text')?.text || ''

    // Try to find JSON in the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate and normalize response
    return {
      species: parsed.species || undefined,
      confidence: parsed.confidence ? Math.max(0, Math.min(1, parsed.confidence)) : undefined,
      healthStatus: normalizeHealthStatus(parsed.healthStatus),
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
      nextCheckInDays: parsed.nextCheckInDays || 7
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    console.error('Raw content:', content)

    // Fallback response
    return {
      healthStatus: 'good',
      insights: ['Unable to analyze photo. Please try again.'],
      recommendations: ['Ensure photo is clear and well-lit'],
      riskFlags: [],
      nextCheckInDays: 7
    }
  }
}

/**
 * Normalize health status to valid enum value
 */
function normalizeHealthStatus(status: string): 'thriving' | 'good' | 'at_risk' | 'critical' {
  const normalized = status?.toLowerCase()

  if (normalized === 'thriving' || normalized === 'excellent') return 'thriving'
  if (normalized === 'good' || normalized === 'healthy') return 'good'
  if (normalized === 'at_risk' || normalized === 'warning' || normalized === 'concerning') return 'at_risk'
  if (normalized === 'critical' || normalized === 'poor' || normalized === 'dying') return 'critical'

  return 'good' // Safe default
}
