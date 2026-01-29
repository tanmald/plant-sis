// Sassy messages for PlantBestie personality

export const WELCOME_MESSAGES = [
  "Hey 👀 Ready to keep your plants alive?",
  "Welcome back, plant parent 🌿",
  "Your plants missed you!",
  "Let's check in on your green friends",
]

export const DYNAMIC_GREETINGS = {
  morning: [
    "Morning, plant parent ☀️",
    "Rise and shine! Your plants are already up",
    "Good morning! Ready to check on your green fam?",
    "Morning vibes! Let's see how your plants slept",
  ],
  afternoon: [
    "Hey there! How's your day going?",
    "Afternoon check-in time?",
    "Your plants are having a good day. You?",
    "Midday plant parent energy 🌱",
  ],
  evening: [
    "Evening! Time to wind down with your plants",
    "Good evening, plant bestie",
    "End-of-day plant vibes",
    "Evening check-in with your green fam",
  ],
  night: [
    "Still up? Your plants are sleeping 😴",
    "Late night plant check? We love it",
    "Night owl plant parent energy",
    "Midnight plant thoughts?",
  ],
}

export const PLANT_STATUS_MESSAGES = {
  thriving: [
    "This one's living their best life",
    "Absolutely vibing",
    "Chef's kiss 👌",
    "Peak plant performance",
    "This plant is winning",
  ],
  healthy: [
    "Looking good!",
    "We love to see it",
    "Happy plant energy",
    "Doing great",
    "Vibing nicely",
  ],
  needsAttention: [
    "This one needs a little love",
    "Time for some TLC",
    "Let's check in on this one",
    "Might need your attention",
  ],
  critical: [
    "Okay, we need to talk about this one",
    "SOS situation here",
    "This plant needs you ASAP",
    "Emergency check-in required",
  ],
}

export const CHECK_IN_INTROS = [
  "Alright, let's see what's going on with",
  "Quick vibe check for",
  "Time to check in on",
  "Let's talk about",
]

export const ENCOURAGEMENT = [
  "You're doing great! 💚",
  "Keep it up, plant parent!",
  "Your plants are lucky to have you",
  "No judgment here, just good vibes 🌱",
  "Look at you go! 🎉",
  "Plant parent of the year vibes",
  "You're crushing it",
]

export const GENTLE_NUDGES = [
  "When was the last time you checked on your plants? 👀",
  "Your plants might be thirsty...",
  "Quick check-in? Takes 2 minutes!",
  "Let's make sure everyone's happy 🌿",
]

export const LOADING_MESSAGES = [
  "Loading your green fam...",
  "Gathering plant intel...",
  "Just a sec...",
  "Getting everything ready...",
  "Checking on your plants...",
]

export const SUCCESS_MESSAGES = [
  "Nailed it! ✨",
  "Done and done!",
  "You got it!",
  "Success! 🎉",
  "We love that for you",
  "Plant saved ✓",
]

export const ERROR_MESSAGES = [
  "Oops, something went wrong. Try again?",
  "Well, that didn't work. Let's try once more.",
  "Hmm, technical hiccup. Give it another shot!",
  "That's weird. One more time?",
]

export const EMPTY_STATE_MESSAGES = {
  noPlants: [
    "Time to start your plant fam",
    "No plants yet? Let's fix that",
    "Your plant journey starts here 🌱",
  ],
  noCheckIns: [
    "Nothing logged yet — hit that check-in button when you're ready 👆",
    "No check-ins yet. Ready to start?",
    "First check-in? We're excited!",
  ],
  noPhotos: [
    "No photos yet! Snap one when you're ready 📸",
    "Your plant's photo album awaits",
  ],
}

// Helper to get random message from array
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)]
}

// Helper to get time-appropriate greeting
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return getRandomMessage(DYNAMIC_GREETINGS.morning)
  if (hour < 18) return getRandomMessage(DYNAMIC_GREETINGS.afternoon)
  if (hour < 22) return getRandomMessage(DYNAMIC_GREETINGS.evening)
  return getRandomMessage(DYNAMIC_GREETINGS.night)
}
