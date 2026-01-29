# PlantSis Edge Functions

Supabase Edge Functions for AI-powered plant analysis and notifications.

## Functions

### 1. analyze-plant-photo

AI-powered plant species identification and health assessment using Claude 3.5 Sonnet.

**Features:**
- Species identification with confidence scores
- Health status assessment (thriving/good/at_risk/critical)
- Personalized care recommendations
- Risk detection (pests, diseases, stress)
- Smart check-in scheduling
- Automatic notification creation for health alerts

**API:**
```typescript
POST /analyze-plant-photo

Request:
{
  "imageUrl": "https://...",
  "plantData": {
    "plant_id": "uuid",
    "custom_name": "Monty",
    "species": "Monstera deliciosa",
    "location": "Living room"
  },
  "analysisType": "initial_identification" | "check_in_photo" | "health_monitoring",
  "userId": "uuid"
}

Response:
{
  "species": "Monstera deliciosa (Swiss Cheese Plant)",
  "confidence": 0.95,
  "healthStatus": "good",
  "insights": ["Leaves are vibrant green", "Good fenestration pattern"],
  "recommendations": ["Keep in indirect light", "Water weekly"],
  "riskFlags": [],
  "nextCheckInDays": 7,
  "analysisId": "uuid",
  "tokensUsed": 1234,
  "processingTimeMs": 2500
}
```

**Quota Management:**
- Free tier: 3 analyses/month
- Pro tier: Unlimited
- Automatically checks quota before analysis
- Returns 429 if quota exceeded

## Setup

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2. Link to your project

```bash
supabase link --project-ref szmpzaftvaabjgpugjhm
```

### 3. Set environment variables

Add secrets to your Supabase project:

```bash
# Set Anthropic API key
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Verify secrets are set
supabase secrets list
```

Or add in Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add secret: `ANTHROPIC_API_KEY`

### 4. Deploy functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy specific function:
```bash
supabase functions deploy analyze-plant-photo
```

### 5. Test locally

Serve functions locally:
```bash
supabase functions serve analyze-plant-photo --env-file .env.local
```

Test with curl:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-plant-photo' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "imageUrl": "https://example.com/plant.jpg",
    "analysisType": "initial_identification",
    "userId": "user-uuid"
  }'
```

## Environment Variables

Required secrets in Supabase:
- `ANTHROPIC_API_KEY` - Your Anthropic API key (from https://console.anthropic.com)
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

## Cost Management

**Free Tier (Claude 3 Haiku):**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- ~$0.000875 per analysis

**Pro Tier (Claude 3.5 Sonnet):**
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- ~$0.0105 per analysis

**Estimated costs** (10k users, 15% pro conversion):
- AI: ~$600/month
- Supabase: $25/month (Pro plan)
- Total: ~$625/month
- Revenue: $4,485/month
- Profit: ~$3,860/month (86% margin)

## Troubleshooting

**"AI quota exceeded" error:**
- User has used their monthly free tier limit (3 analyses)
- Upgrade to Pro or wait for next month

**"AI service not configured" error:**
- `ANTHROPIC_API_KEY` not set in Supabase secrets
- Run: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`

**Slow response times:**
- Claude 3.5 Sonnet can take 2-5 seconds
- Consider using Claude 3 Haiku for faster results
- Cold starts can add 1-2 seconds (first request after idle)

**JSON parse errors:**
- Claude occasionally returns malformed JSON
- Prompt engineering and fallback handling in place
- Check logs: `supabase functions logs analyze-plant-photo`

## Next Steps

1. Add more edge functions:
   - `generate-check-in-prompt` - Contextual check-in prompts
   - `schedule-notifications` - Daily notification scheduler
   - `analyze-check-in-response` - Deep check-in analysis

2. Enable cron jobs for notifications:
   - Daily scheduler at 9 AM
   - Monthly quota reset on 1st

3. Add analytics and monitoring:
   - Track AI usage patterns
   - Monitor error rates
   - Cost analysis

## Learn More

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Deno Deploy](https://deno.com/deploy/docs)
