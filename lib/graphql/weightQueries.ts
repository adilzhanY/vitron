// GraphQL queries for weight entries
export const GET_WEIGHTS_QUERY = `
  query GetWeights($clerkId: String!) {
    weights(clerkId: $clerkId) {
      id
      weight
      loggedAt
    }
  }
`;

export const CREATE_WEIGHT_MUTATION = `
  mutation CreateWeight($input: CreateWeightInput!) {
    createWeight(input: $input) {
      id
      weight
      loggedAt
    }
  }
`;

// GraphQL queries for weight goals
export const GET_WEIGHT_GOAL_QUERY = `
  query GetWeightGoal($clerkId: String!) {
    weightGoal(clerkId: $clerkId) {
      id
      startWeight
      targetWeight
      checkpoints
      dailyCalorieGoal
      achieved
      createdAt
      endDate
    }
  }
`;

export const CREATE_WEIGHT_GOAL_MUTATION = `
  mutation CreateWeightGoal($input: CreateWeightGoalInput!) {
    createWeightGoal(input: $input) {
      id
      startWeight
      targetWeight
      checkpoints
      dailyCalorieGoal
      achieved
      createdAt
    }
  }
`;
