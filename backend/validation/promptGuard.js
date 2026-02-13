const blockedPatterns = [
  /ignore previous instructions/i,
  /create custom css/i,
  /add inline styles/i,
  /use tailwind classes/i,
  /execute code/i,
  /eval/i
];

export function validatePrompt(prompt) {
  for (const pattern of blockedPatterns) {
    if (pattern.test(prompt)) {
      throw new Error("Prompt contains disallowed instruction");
    }
  }

  return true;
}
