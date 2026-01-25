// Plant care framework and check-in questions

export const CHECK_IN_QUESTIONS = {
  light: {
    sameSpot: {
      question: "Is your plant in the same spot as last time?",
      type: "radio" as const,
      options: ["Yes", "No", "Not sure"],
    },
    recentSun: {
      question: "Has it received direct sun recently?",
      type: "radio" as const,
      options: [
        { label: "☀️ Lots (several hours daily)", value: "lots" },
        { label: "🌤️ Some (occasional direct sun)", value: "some" },
        { label: "🌥️ None (indirect only)", value: "none" },
      ],
    },
  },
  watering: {
    soilMoisture: {
      question: "How does the top 3-5cm of soil feel?",
      heading: "No judgment — poke the soil",
      type: "radio" as const,
      options: [
        { label: "🏜️ Bone dry", value: "bone_dry" },
        { label: "Slightly dry", value: "slightly_dry" },
        { label: "Damp", value: "damp" },
        { label: "💧 Wet/soggy", value: "wet" },
      ],
    },
    lastWatering: {
      question: "When did you last water deeply?",
      type: "radio" as const,
      options: [
        { label: "1-3 days ago", value: "1-3" },
        { label: "4-7 days ago", value: "4-7" },
        { label: "1-2 weeks ago", value: "1-2_weeks" },
        { label: "2+ weeks ago", value: "2+_weeks" },
        { label: "Can't remember", value: "unknown" },
      ],
    },
  },
  physical: {
    leafCondition: {
      question: "How are the leaves behaving today?",
      type: "multiselect" as const,
      options: [
        { label: "✅ Firm and perky", value: "firm" },
        { label: "Drooping or wilting", value: "drooping" },
        { label: "Yellow or brown spots", value: "spots" },
        { label: "Pale or faded color", value: "pale" },
        { label: "🌱 New growth!", value: "new_growth" },
        { label: "Dusty (need cleaning)", value: "dusty" },
      ],
    },
  },
  pot: {
    drainage: {
      question: "Does the pot have drainage holes?",
      type: "radio" as const,
      options: ["Yes", "No", "Not sure"],
    },
  },
}

export const PLANT_CARE_DEFAULTS: Record<string, {
  wateringFrequency: number // days
  lightNeeds: string
  commonIssues: string[]
}> = {
  'monstera': {
    wateringFrequency: 7,
    lightNeeds: 'Bright indirect light',
    commonIssues: ['Root rot from overwatering', 'Yellow leaves from too much water'],
  },
  'pothos': {
    wateringFrequency: 7,
    lightNeeds: 'Low to medium light',
    commonIssues: ['Leggy growth in low light', 'Root rot from overwatering'],
  },
  'snake plant': {
    wateringFrequency: 14,
    lightNeeds: 'Low to bright indirect light',
    commonIssues: ['Root rot (very drought tolerant)', 'Soft leaves from overwatering'],
  },
  'succulent': {
    wateringFrequency: 14,
    lightNeeds: 'Bright direct light',
    commonIssues: ['Root rot from overwatering', 'Stretching in low light'],
  },
  'fern': {
    wateringFrequency: 4,
    lightNeeds: 'Medium to bright indirect light',
    commonIssues: ['Brown tips from low humidity', 'Crispy leaves when dry'],
  },
}
