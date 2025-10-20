import OpenAI from "openai";
import { MACRO_CALCULATION_PROMPT_MEAL_LABEL } from "@/prompts/macroCalculation";

// Server-side only - API key is safe here
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return Response.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4.1-nano",
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

    return Response.json(response);
  } catch (error) {
    console.error("AI Meal Label Analysis Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to analyze meal label" },
      { status: 500 }
    );
  }
}
