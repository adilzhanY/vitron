interface NeonDbError {
  code: string;
  detail: string;
}

type UserGoal = "lose weight" | "gain weight" | "be fit";

export function isNeonDbError(error: unknown): error is NeonDbError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "detail" in error
  );
}

export const estimateMaintenanceCalories = (weightKg: number): number => {
  if (weightKg <= 0) return 2000;
  return Math.round(weightKg * 30);
};

export const computeDailyCalorieGoal = (
  goal: UserGoal,
  currentWeight: number,
  targetWeight: number,
): number => {
  const maintenance = estimateMaintenanceCalories(currentWeight);
  const deficit = 500;
  const surplus = 300;
  const minCalories = 1200;

  switch (goal) {
    case "lose weight":
      return Math.max(maintenance - deficit, minCalories);
    case "gain weight":
      return maintenance + surplus;
    case "be fit":
    default:
      return maintenance;
  }
};

/**
 * Converts a string to title case, keeping small words lowercase
 * except when they're the first or last word
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return "";

  // Small words to keep lowercase (articles, conjunctions, short prepositions)
  const smallWords = [
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "from",
    "if",
    "in",
    "nor",
    "of",
    "off",
    "on",
    "or",
    "per",
    "so",
    "the",
    "to",
    "up",
    "via",
    "with",
    "yet",
  ];

  const words = str.toLowerCase().split(" ");

  return words
    .map((word, index) => {
      // Handle hyphenated words (capitalize both parts)
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");
      }

      // Always capitalize first and last word
      if (index === 0 || index === words.length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Keep small words lowercase
      if (smallWords.includes(word)) {
        return word;
      }

      // Capitalize all other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

/**
 * Capitalizes only the first letter of a string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
