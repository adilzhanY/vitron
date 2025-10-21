// GraphQL queries for meals (food entries)
export const GET_MEALS_QUERY = `
  query GetMeals($clerkId: String!, $date: String!) {
    meals(clerkId: $clerkId, date: $date) {
      id
      name
      calories
      protein
      carbs
      fat
      mealType
      isSaved
      entryDate
      loggedAt
    }
  }
`;

export const CREATE_MEAL_MUTATION = `
  mutation CreateMeal($input: CreateMealInput!) {
    createMeal(input: $input) {
      id
      name
      calories
      protein
      carbs
      fat
      mealType
      isSaved
      entryDate
      loggedAt
    }
  }
`;

// GraphQL queries for meal goals
export const GET_MEAL_GOAL_QUERY = `
  query GetMealGoal($clerkId: String!) {
    mealGoal(clerkId: $clerkId) {
      id
      caloriesTarget
      proteinTarget
      carbsTarget
      fatTarget
      goalDate
      relatedWeightGoalId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_MEAL_GOAL_MUTATION = `
  mutation CreateMealGoal($input: CreateMealGoalInput!) {
    createMealGoal(input: $input) {
      id
      caloriesTarget
      proteinTarget
      carbsTarget
      fatTarget
      goalDate
      relatedWeightGoalId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MEAL_GOAL_MUTATION = `
  mutation UpdateMealGoal($input: UpdateMealGoalInput!) {
    updateMealGoal(input: $input) {
      id
      caloriesTarget
      proteinTarget
      carbsTarget
      fatTarget
      goalDate
      relatedWeightGoalId
      createdAt
      updatedAt
    }
  }
`;

// GraphQL queries for AI analysis
export const ANALYZE_MEAL_IMAGE_MUTATION = `
  mutation AnalyzeMealImage($input: AIAnalyzeInput!, $prompt: String!) {
    analyzeMealImage(input: $input, prompt: $prompt)
  }
`;

// GraphQL queries for meal images
export const UPLOAD_MEAL_IMAGE_MUTATION = `
  mutation UploadMealImage($input: UploadMealImageInput!) {
    uploadMealImage(input: $input) {
      id
      imageName
      imageSize
      isAnalyzed
      uploadedAt
    }
  }
`;

export const GET_MEAL_IMAGES_QUERY = `
  query GetMealImages($clerkId: String!, $imageId: Int) {
    mealImages(clerkId: $clerkId, imageId: $imageId) {
      id
      imageName
      imageSize
      isAnalyzed
      aiResponse
      uploadedAt
    }
  }
`;

export const UPDATE_MEAL_IMAGE_MUTATION = `
  mutation UpdateMealImage($input: UpdateMealImageInput!) {
    updateMealImage(input: $input) {
      id
      imageName
      imageSize
      isAnalyzed
      aiResponse
      uploadedAt
    }
  }
`;

// GraphQL queries for water intake
export const GET_WATER_INTAKE_QUERY = `
  query GetWaterIntake($clerkId: String!, $date: String!) {
    waterIntake(clerkId: $clerkId, date: $date) {
      id
      totalConsumed
      dailyGoal
      date
      updatedAt
    }
  }
`;

export const CREATE_WATER_INTAKE_MUTATION = `
  mutation CreateWaterIntake($input: CreateWaterInput!) {
    createWaterIntake(input: $input) {
      id
      totalConsumed
      dailyGoal
      date
      updatedAt
    }
  }
`;

export const UPDATE_WATER_INTAKE_MUTATION = `
  mutation UpdateWaterIntake($input: UpdateWaterInput!) {
    updateWaterIntake(input: $input) {
      id
      totalConsumed
      dailyGoal
      date
      updatedAt
    }
  }
`;
