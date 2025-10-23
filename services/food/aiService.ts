import {
  MACRO_CALCULATION_PROMPT_MEAL_IMAGE,
  MACRO_CALCULATION_PROMPT_MEAL_LABEL,
  MACRO_CALCULATION_PROMPT_MEAL_GALLERY
} from '@/prompts/macroCalculation';

// Lambda URL
const API_BASE_URL = "https://4wtijuyqsh.execute-api.eu-central-1.amazonaws.com";

export type PromptType = 'meal' | 'label' | 'gallery';

interface AIAnalysisResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}



/**
 * Analyze food image using AWS Lambda AI service
 * @param imageUrl - S3 URL of the uploaded image
 * @param promptType - Type of prompt to use (meal, label, or gallery)
 * @returns Parsed nutrition data
 */
export async function analyzeImageWithAI(
  imageUrl: string,
  promptType: PromptType
): Promise<any> {
  try {
    let prompt: string;
    switch (promptType) {
      case 'meal':
        prompt = MACRO_CALCULATION_PROMPT_MEAL_IMAGE;
        console.log("AI request was sent with prompt type: meal");
        break;
      case 'label':
        prompt = MACRO_CALCULATION_PROMPT_MEAL_LABEL;
        console.log("AI request was sent with prompt type: label");
        break;
      case 'gallery':
        prompt = MACRO_CALCULATION_PROMPT_MEAL_GALLERY;
        console.log("AI request was sent with prompt type: gallery");
        break;
      default:
        throw new Error(`Unknown prompt type: ${promptType}`);
    }

    const response = await fetch(`${API_BASE_URL}/ai/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed with status: ${response.status}`);
    }

    const aiResponse: AIAnalysisResponse = await response.json();

    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log("Got response from AI:", content);

    try {
      const parsedData = JSON.parse(content);
      console.log("Successfully parsed AI JSON content:", parsedData);
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse AI JSON content:", parseError);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Failed to send AI request:", error);
    throw error;
  }
}



