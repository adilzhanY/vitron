// Client-side service that calls your API routes
// NEVER instantiate OpenAI client here - it exposes your API key!

import { Platform } from 'react-native';
import OpenAI from 'openai';
import { MACRO_CALCULATION_PROMPT_MEAL_IMAGE, MACRO_CALCULATION_PROMPT_MEAL_LABEL } from '@/prompts/macroCalculation';

// ⚠️ WARNING: This is a DEVELOPMENT-ONLY workaround
// For production, deploy API routes to a real server (Vercel, etc.)
const getOpenAIClient = () => {
  if (Platform.OS !== 'web') {
    return new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }
  return null;
};

export const calculateMacrosByMealImage = async (imageUrl: string) => {
  // Mobile workaround: Call OpenAI directly (development only)
  if (Platform.OS !== 'web') {
    const openai = getOpenAIClient();
    if (!openai) throw new Error('OpenAI client not available');

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: MACRO_CALCULATION_PROMPT_MEAL_IMAGE,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    return response;
  }

  // Web: Use API routes
  const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/ai-meal-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Meal Image API Error:', errorText);
    throw new Error(`Failed to analyze meal image: ${response.statusText}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse response as JSON:', text);
    throw new Error('Server returned invalid JSON response');
  }
};

export const calculateMacrosByMealLabel = async (imageUrl: string) => {
  // Mobile workaround: Call OpenAI directly (development only)
  if (Platform.OS !== 'web') {
    const openai = getOpenAIClient();
    if (!openai) throw new Error('OpenAI client not available');

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: MACRO_CALCULATION_PROMPT_MEAL_LABEL,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    return response;
  }

  // Web: Use API routes
  const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/ai-meal-label`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Meal Label API Error:', errorText);
    throw new Error(`Failed to analyze meal label: ${response.statusText}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse response as JSON:', text);
    throw new Error('Server returned invalid JSON response');
  }
};


