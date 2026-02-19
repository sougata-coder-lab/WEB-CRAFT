const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert web developer specializing in creating beautiful, modern, responsive single-page websites. 
When given a description, you generate complete, self-contained HTML files with embedded CSS and JavaScript.

CRITICAL RULES:
1. Output ONLY the raw HTML code - no markdown, no code blocks, no explanations
2. Start directly with <!DOCTYPE html>
3. Include ALL CSS in a <style> tag in the <head>
4. Include ALL JavaScript in a <script> tag before </body>
5. Make it fully responsive with mobile-first design
6. Use modern CSS (flexbox, grid, custom properties)
7. Include smooth animations and hover effects
8. Use Google Fonts via @import in CSS
9. Make it visually stunning with gradients, shadows, and modern design patterns
10. Ensure all interactive elements work (forms show alerts, buttons have effects, etc.)
11. Use semantic HTML5 elements
12. Include a proper meta viewport tag
13. The website must be complete and production-ready`;

export const generateWebsiteCode = async (prompt, existingCode = null) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  let userMessage = prompt;

  if (existingCode) {
    userMessage = `Here is the current website code:\n\n${existingCode}\n\nPlease modify it based on this instruction: ${prompt}\n\nReturn the complete updated HTML file.`;
  } else {
    userMessage = `Create a complete, beautiful, responsive single-page website: ${prompt}\n\nReturn ONLY the complete HTML code starting with <!DOCTYPE html>.`;
  }

  const models = [
    'qwen/qwen-2.5-coder-32b-instruct',
    'deepseek/deepseek-coder',
    'meta-llama/llama-3.1-8b-instruct:free',
  ];

  let lastError;

  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'AI Website Builder',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 8000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      let code = data.choices?.[0]?.message?.content || '';

      // Clean up the response - remove markdown code blocks if present
      code = code.replace(/^```html\n?/i, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

      // Ensure it starts with DOCTYPE
      if (!code.toLowerCase().startsWith('<!doctype')) {
        const doctypeIndex = code.toLowerCase().indexOf('<!doctype');
        if (doctypeIndex > -1) {
          code = code.substring(doctypeIndex);
        } else {
          throw new Error('Generated code does not contain valid HTML');
        }
      }

      return code;
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('All AI models failed to generate code');
};
