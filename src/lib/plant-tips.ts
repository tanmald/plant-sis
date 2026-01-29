/**
 * Collection of plant care tips with personality
 */
export const PLANT_TIPS = [
  "Talk to your plants! They love the CO\u2082 (and the attention \ud83d\udc85)",
  "Yellow leaves? Could be overwatering, bestie \ud83d\udca7",
  "Most plants prefer morning sun over harsh afternoon rays \u2600\ufe0f",
  "Dust those leaves! Clean leaves = happy photosynthesis \ud83e\uddf9",
  "When in doubt, underwater. Most plants bounce back from drought! \ud83c\udf35",
  "Rotate your plants quarterly for even growth \ud83d\udd04",
  "Brown leaf tips? The air might be too dry \ud83c\udf2b\ufe0f",
  "Repot in spring when your plant is ready to grow! \ud83c\udf31",
  "Use room temperature water \u2014 cold shocks the roots \ud83e\udd76",
  "Droopy leaves after watering? Check for root rot \ud83d\udc40",
  "Grouping plants together increases humidity \ud83c\udf3f",
  "Skip fertilizing in winter \u2014 plants are resting \ud83d\ude34",
  "Yellowing lower leaves are often just old \u2014 no stress! \ud83c\udf42",
  "A little neglect is better than too much love \ud83d\udc9a",
  "Check the soil moisture before watering, not a schedule \ud83e\uddd0",
  "New leaves unfurling? That's growth energy! \u2728",
  "Crispy edges? Move away from heating vents \ud83c\udf21\ufe0f",
  "Shiny leaves = healthy leaves \u2728",
  "Your plants are rooting for you too! \ud83e\udeb4",
  "Consistency is key \u2014 plants love routine \ud83d\udcc5",
]

/**
 * Get a random plant tip
 * Uses the current session to ensure consistency within a session
 */
export function getRandomTip(): string {
  const index = Math.floor(Math.random() * PLANT_TIPS.length)
  return PLANT_TIPS[index]
}
