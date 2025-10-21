// GraphQL query to get user by Clerk ID
export const GET_USER_QUERY = `
  query GetUser($clerkId: String!) {
    user(clerkId: $clerkId) {
      id
      name
      email
      clerkId
      age
      gender
      height
      activityLevel
      goal
      initialWeight
    }
  }
`;

// GraphQL mutation to create a new user
export const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      clerkId
    }
  }
`;

// GraphQL mutation to update user information
export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      age
      gender
      height
      activityLevel
    }
  }
`;

// GraphQL query for user status
export const GET_USER_STATUS_QUERY = `
  query GetUserStatus($clerkId: String!) {
    userStatus(clerkId: $clerkId) {
      measurementsFilled
    }
  }
`;
