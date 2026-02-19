export const enhancePrompt = (prompt: string): string => {
  const trimmed = prompt.trim();
  if (trimmed.length < 20) {
    return `Create a complete, beautiful, modern, responsive single-page website: ${trimmed}. Include smooth animations, hover effects, and a professional design.`;
  }
  return trimmed;
};

export const GENERATION_STEPS = [
  'Analyzing your prompt...',
  'Generating layout structure...',
  'Writing HTML & CSS...',
  'Adding interactivity...',
  'Finalizing your website...',
];
