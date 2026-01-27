# 🌿 PlantSis App – Product Requirements Document (PRD)

---

## 1. Product Overview

### Product Name (Working Title)
**PlantSis**

### Product Type
Mobile application (iOS / Android, mobile-first)

### Product Vision
Create a conversational, context-aware plant care companion with a confident, slightly sassy personality that helps people keep their houseplants healthy by guiding observation, timing, and decisions — without rigid schedules or guilt.

> **Vision Statement**
Help people care for their plants with confidence by turning plant care into an intuitive, human-like conversation — supportive, honest, and a little bit sassy.

> **Development Note**
PlantSis is being built incrementally, with foundational features (plant management, AI identification) implemented before conversational care features (guided check-ins, smart reminders). This ensures a solid technical foundation while delivering immediate user value. See Section 2.1 for current implementation status.

---

## 2. Problem Statement

Houseplant owners struggle to keep plants healthy because plant care depends heavily on context (light, season, location, exposure) and subtle visual signals that are easy to miss.

Current plant care solutions:
- Rely on fixed calendars ("water every X days")
- Provide generic, non-contextual advice
- Require botanical knowledge users do not have
- Trigger action too late, when the plant is already stressed

As a result, users feel anxious, guilty, or frustrated, abandon apps, and lose plants despite good intentions.

---

## 2.1 Current Status & Roadmap

### Implementation Status
PlantSis is being built incrementally, prioritizing foundational infrastructure and user experience before implementing the full conversational care system described in this PRD.

**Currently Implemented (Phases 1-4):**
- ✅ Progressive Web App (PWA) foundation with React 18.3, Vite 5.4, and Tailwind CSS 3.4
- ✅ Supabase authentication and database infrastructure
- ✅ Plant management: Add, view, edit, and delete plants
- ✅ Photo uploads with compression and timeline display
- ✅ Plant profiles with location and environment attributes
- ✅ **Gen Z UI Redesign (January 2026)**
  - Glassmorphism design system with frosted glass cards and backdrop blur
  - Vibrant color palette with gradients (forest, sage, sunset, glow)
  - Lucide React icons replacing emoji UI elements
  - Bento grid layouts and modern card arrangements
  - Smooth micro-animations (bounce, slide, scale effects)
  - Bold, expressive typography with enhanced hierarchy
  - Dynamic time-based greetings and expanded sassy message library
  - Floating glass bottom navigation with gradient FAB
  - Horizontal photo timeline with snap scroll
  - Dramatic upgrade CTA with purple/pink/blue gradient
- ✅ **Production Deployment**
  - Deployed on Vercel with automatic deployments from GitHub
  - Live at: https://plant-sis.vercel.app
  - GitHub Actions CI/CD pipeline
  - PWA manifest and service worker configured
- ✅ **Open Source**
  - MIT License
  - Public repository: https://github.com/tanmald/plant-sis

**In Development (Phase 5):**
- 🚧 AI-powered plant identification using OpenAI Vision API
- 🚧 Guided check-in flows (core conversational feature)

**Planned (Phases 6-9):**
- 📋 Smart reminders and notifications
- 📋 Recommendation engine with context-aware suggestions
- 📋 Enhanced PWA features (offline support, install prompts, push notifications)
- 📋 Premium features and monetization
- 📋 Final polish and public launch

### Development Philosophy
The current build follows an incremental approach:
1. **Foundation first:** Establish reliable infrastructure, authentication, and data management
2. **User value early:** Enable plant tracking and photo documentation immediately
3. **AI enhancement:** Add plant identification to reduce onboarding friction
4. **Conversational features:** Implement guided check-ins and recommendations once foundation is solid

This approach ensures each phase delivers working functionality while building toward the full vision described in this PRD.

---

## 3. Target Users & Personas

### Primary Persona: Plant Lover (Casual)
- Owns 3–15 houseplants
- Lives in an apartment
- Enjoys plants aesthetically
- Limited botanical knowledge
- Easily overwhelmed by complex care rules

**Primary Need:**
> "Tell me what to check and what to do, in simple terms, at the right time."

---

### Secondary Persona: Plant Enthusiast
- Owns 10+ plants
- Knows common species names
- Actively adjusts light, pots, and placement
- Seeks validation and nuance, not basic instructions

**Primary Need:**
> "Help me confirm that my care decisions make sense in my environment."

---

## 4. Jobs To Be Done

### Functional Jobs
- Know when to check on a plant
- Know what signals to observe
- Know what action (if any) to take

### Emotional Jobs
- Feel reassured, never judged
- Reduce anxiety about harming plants
- Build confidence and intuition over time

### Social Jobs
- Feel competent as a plant owner
- Share progress visually (optional, future)

---

## 5. Value Proposition

**From static care schedules → to adaptive, conversational plant care.**

PlantSis helps users care for plants by:
- Asking simple, contextual questions
- Interpreting environment and timing
- Offering gentle guidance instead of strict rules

---

## 6. Product Principles

1. Guidance over free chat
2. Observation before instruction
3. Context over generic rules
4. Low cognitive effort
5. Sassy nudges, not alarms
6. Trust and reassurance over perfection

---

## 7. User Journey (High-Level)


### Onboarding
1. Welcome & value explanation
2. Add first plant
3. Identify plant (assisted)
4. Define plant location
5. Upload optional photo

### Ongoing Usage
- Periodic check-ins
- Context-aware reminders
- Visual progress tracking

### Long-Term
- Increased user intuition
- Healthier plants
- Reduced dependency on rigid rules

---

## 8. Core Features (MVP Scope)

### 8.1 Plant Profile ✅ Partially Implemented

Each plant includes:
- Custom plant name
- Species (assisted confirmation)
- Photo timeline
- Location context
- Interaction history

**Outcome:** The plant feels personal and trackable.

---

### 8.2 Location & Environment Context (Manual – MVP) ✅ Implemented

User-defined attributes:
- Light type (direct / indirect / low)
- Proximity to window
- Permanent vs occasional placement

The system interprets:
- Risk of sun stress
- Watering frequency adjustments
- Growth expectations

---

### 8.3 Guided Plant Check-ins (Core Feature) 📋 Planned (Phase 5)

PlantSis does **not** function as a chat. Instead, it runs structured, guided check-ins per plant, based on a practical care framework.

Each check-in is composed of short, focused sections:

**Light**
- Is the plant in the same spot as last time?
- Has it received direct sun recently?

**Watering**
- Is the top 3–5 cm of soil dry?
- When was the last deep watering?

**Substrate & Pot**
- Does the pot have drainage holes?
- Are roots visible or soil compacted?

**Humidity**
- Is the environment dry or humid lately?

**Nutrition**
- Was the plant fertilised recently?

**Physical Signals**
- Leaf firmness
- Color changes
- New growth

**Support & Structure**
- Is the plant leaning or unstable?
- Does it need a stake or moss pole?

Responses are collected via toggles, sliders, and quick selections — not free text.

**Outcome:** PlantSis gathers actionable signals without cognitive overload.

---

### 8.4 Smart Reminders 📋 Planned (Phase 7)

Reminder logic based on:
- Plant type
- Last interaction
- Seasonality
- Light exposure

Examples:
- "It might be a good moment to check your Monstera 👀"
- "Lots of light this week — keep an eye on pale leaves"

---

### 8.5 Recommendation Engine (Rule-Based – MVP) 📋 Planned (Phase 5)

Delivers guidance such as:
- Water now / wait
- Rotate plant
- Temporary sun exposure suggestions
- Placement risk warnings

Rules evolve based on user feedback.

---

## 9. Out of Scope (MVP)

- Automatic disease diagnosis
- IoT sensors integration
- Social/community features
- Plant marketplace

---

## 10. Success Metrics

### North Star Metric
**Weekly Plant Check-ins Completed**

### Supporting Metrics
- 7-day and 30-day retention
- Average plants per active user
- Notification open rate
- Check-in completion rate

---

## 11. Assumptions & Risks

### Key Assumptions
- Users prefer questions over instructions
- Conversational tone improves engagement
- Manual context input is sufficient initially

### Risks
- Over-notification
- Advice perceived as too generic
- Onboarding friction

**Mitigation:**
- Adaptive notification frequency
- Progressive onboarding
- Continuous language refinement

---

## 12. Technical & UX Considerations (High-Level)

- Mobile-first design
- Card-based, checklist-driven UI (not chat)
- Step-by-step check-in flows
- Image-based input as primary signal
- Rule engine first, ML later

---

## 13. Future Opportunities

- AI-based visual plant analysis
- Seasonal intelligence
- Environment auto-detection
- Plant-sitting mode (vacation)
- Predictive health insights

---

## 14. Why This Product Works

PlantSis mirrors how people actually care for plants:
- Through observation
- Through context
- Through reassurance

By replicating a human conversation, PlantSis transforms plant care from a chore into a habit.

---

## 15. Brand Voice & Tone Guidelines

### Brand Archetype
**The Plant Sister**
- Knowledgeable but never condescending
- Supportive, honest, and a little sassy
- Calm confidence, not toxic positivity

Think: *the sister who knows plants, tells you the truth, and has your back.*

---

### Voice Pillars

1. **Supportive, Not Judgy**  
Never shame, blame, or scold. Even when the plant is clearly stressed.

2. **Confident, Not Bossy**  
Offer guidance, not commands. Leave room for user agency.

3. **Sassy, But Warm**  
Light sass for engagement — never sarcasm or mockery.

4. **Observational First**  
Ask before telling. Invite the user to notice.

5. **Plain Language**  
No botanical jargon unless the user opts in.

---

### Do / Don’t

**Do**
- Use conversational language
- Use emojis sparingly for tone (👀 🌿 ☀️)
- Normalize imperfection
- Sound human, not instructional

**Don’t**
- Use alarmist language ("URGENT", "FAILED")
- Shame missed check-ins
- Sound like a manual or care sheet
- Overuse emojis or slang

---

### Emotional Contract

PlantSis promises:
- "I won’t judge you"
- "I’ll help you notice things"
- "I’ll tell you the truth, gently"

---

## 16. Copy Examples (Real UI Content)

### Onboarding

**Welcome Screen**  
"Hey 🌿 I’m PlantSis.  
I help you keep plants alive, happy, and drama-free. You bring the plants — I’ll bring the common sense."

**Add First Plant**  
"Alright, introduce me 👀 What plant are we dealing with here?"

---

### Check-ins

- "Quick vibe check 👀 How are the leaves behaving today?"
- "No judgement — poke the soil. Dry or still kinda damp?"
- "Has this plant been living its best sunny life lately… or maybe too much?"

---

### Reminders

- "Hey 👋 Your plant just crossed my mind. Might be worth a quick look."
- "Sun’s been showing off this week ☀️ Keep an eye on those lighter bits."
- "Not nagging, just saying — it’s been a minute since you checked this one 😌"

---

### Recommendations

- "I’d chill on the watering for now. This plant’s still good."
- "This spot? Great for a light boost. Just don’t leave it there all day like a rotisserie chicken."
- "A little spin this week could help — plants hate growing lopsided." 

---

### Reassurance / Recovery

- "Okay, deep breath. Plants are dramatic. You’re still a good plant parent."
- "Nope, you didn’t ruin it. We’re just course-correcting."
- "Messy plant care > no plant care. You’re doing fine." 

---

### When a Plant Is Struggling

- "Alright, she’s complaining a bit — but we caught it early. Nice work 👏"
- "These leaves are giving ‘too much sun’. Let’s tone it down." 

---

### Success Moments

- "Ohhh yes 🌱 She’s thriving. Take the win."
- "New growth alert 🚨 (this is a good one)"
- "You + this plant = a very functional relationship." 

---

## 17. Tone Adaptation Rules (Advanced)


- New users → extra reassurance, minimal sass
- Power users → more direct, slightly bolder tone
- Repeated misses → softer language, fewer nudges
- Success streaks → celebratory, affirming tone

---

## 18. Development Roadmap

PlantSis is being built across multiple phases, with each phase delivering working functionality while building toward the complete vision.

### Phase 1: Foundation & Setup ✅ Complete
- React + Vite + Tailwind CSS setup
- PWA structure and routing
- Basic UI components and layout
- Authentication UI screens

### Phase 2: Supabase Setup & Authentication ✅ Complete
- Supabase project configuration
- Database schema (plants, plant_photos tables)
- Row-level security policies
- Authentication flows (login, signup, logout)
- Storage buckets for images

### Phase 3: Core Plant Management UI ✅ Complete
- Add plants with photos
- Plant list and detail views
- Edit and delete plants
- Image upload with compression
- Photo timeline display
- Plant profiles (name, species, location, light, proximity)

**Phase 3.5: Gen Z UI Redesign ✅ Complete (January 2026)**
- Glassmorphism design system (frosted glass cards, backdrop blur)
- Vibrant gradient color palette (forest, sage, sunset, glow)
- Lucide React icon system
- Bento grid layouts for modern card arrangements
- Micro-animations (bounce-soft, slide-up, scale-in)
- Bold typography with font-black headings
- Card-based form selections with icons and gradients
- Horizontal photo timeline with snap scroll
- Floating glass bottom navigation
- Dynamic time-based greetings
- Enhanced sassy message library

### Phase 4: AI Plant Identification 🚧 In Development
- OpenAI Vision API integration
- Photo analysis for species identification
- Confidence scoring
- User confirmation flow
- Fallback to manual entry

### Phase 5: Guided Check-ins 📋 Planned
- Check-in flow UI (structured, not chat)
- Multi-section check-in framework:
  - Light assessment
  - Watering checks
  - Substrate & pot evaluation
  - Humidity context
  - Nutrition tracking
  - Physical signals observation
  - Support & structure needs
- Check-in history and timeline
- Recommendation engine (rule-based MVP)

### Phase 6: Production Deployment & PWA ✅ Complete (January 2026)
- ✅ Deployed on Vercel with automatic deployments
- ✅ GitHub Actions CI/CD pipeline
- ✅ Service worker implementation (Workbox)
- ✅ PWA manifest configuration
- ✅ App icons and theme colors
- 📋 Offline support (basic caching implemented, can be enhanced)
- 📋 Install prompt optimization
- 📋 Push notifications

### Phase 7: Smart Reminders 📋 Planned
- Notification system
- Context-aware reminder logic:
  - Plant type
  - Last interaction
  - Seasonality
  - Light exposure
- Adaptive notification frequency
- User preferences

### Phase 8: Monetization 📋 Planned
- Premium feature identification
- Subscription infrastructure
- Payment integration
- Feature gating
- Free tier limits

### Phase 9: Polish & Launch 📋 Planned
- Performance optimization
- Cross-browser testing
- Analytics integration
- User feedback collection
- App store submission (if applicable)
- Marketing materials

### Future Enhancements (Post-Launch)
- AI-based visual plant health analysis
- Seasonal intelligence and predictions
- Environment auto-detection
- Plant-sitting mode (vacation care)
- Predictive health insights
- Social/community features
- IoT sensor integration

---

**End of Document**

