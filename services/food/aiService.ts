import OpenAI from "openai";
import { MACRO_CALCULATION_PROMPT_MEAL_IMAGE, MACRO_CALCULATION_PROMPT_MEAL_LABEL } from "@/prompts/macroCalculation";
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
});

export const calculateMacrosByMealImage = async (imageUrl: string) =>
  await openai.chat.completions.create({
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

// console.log(calculateMacrosByMealImage.choices[0].message);

export const calculateMacrosByMealLabel = async (imageUrl: string) =>
  await openai.chat.completions.create({
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

// console.log(calculateMacrosByMealLabel.choices[0].message);

