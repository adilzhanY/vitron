export async function graphqlRequest(query: string, variables?: any) {
  const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';
  const graphqlEndpoint = `${serverUrl}/graphql`;

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}