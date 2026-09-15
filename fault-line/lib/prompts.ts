export const COMPOSER_PROMPTS = [
  "WHAT ARE YOU PRETENDING ISN'T BOTHERING YOU?",
  "WHAT ARE YOU OVERTHINKING RIGHT NOW?",
  "WHAT DID YOU PRETEND DIDN'T HURT?",
  "WHAT ARE YOU EMBARRASSED TO ADMIT?",
  "WHAT'S YOUR MOST HUMAN MOMENT TODAY?",
  "WHAT ARE YOU AFRAID PEOPLE WILL NOTICE?",
  "WHAT ARE YOU TIRED OF PRETENDING ABOUT?",
  "WHAT WOULD YOU SAY IF NOBODY KNEW IT WAS YOU?",
];

export function randomPrompt(): string {
  return COMPOSER_PROMPTS[Math.floor(Math.random() * COMPOSER_PROMPTS.length)];
}

export const DAILY_CRACK_PROMPTS = [
  "What is something tiny that ruined your mood today?",
  "What's a compliment you didn't believe?",
  "What did you almost text someone at 2AM?",
  "What's a fear you've never said out loud?",
  "What are you pretending you're over?",
];

/** Deterministic-by-day prompt so everyone gets the same one, like a daily puzzle. */
export function dailyCrackPrompt(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return DAILY_CRACK_PROMPTS[dayIndex % DAILY_CRACK_PROMPTS.length];
}
