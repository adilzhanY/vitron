import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { clerkId, startWeight, targetWeight, dailyCalorieGoal, checkpoints } = await request.json();

    if (!clerkId || !targetWeight || !checkpoints || !startWeight) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Get user ID and current weight
    const userResult = await sql`SELECT id, weight FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const user = userResult[0];
    const userId = user.id;
    const currentWeight = user.weight;

    // 2. Mark the latest active goal as achieved
    // Note: Neon serverless driver doesn't support multiple statements in one query.
    // We find the latest goal ID first.
    const latestGoalResult = await sql`
            SELECT id FROM weight_goals
            WHERE user_id = ${userId} AND achieved = FALSE
            ORDER BY created_at DESC
            LIMIT 1
        `;

    if (latestGoalResult.length > 0) {
      const latestGoalId = latestGoalResult[0].id;
      await sql`
                UPDATE weight_goals
                SET achieved = TRUE, end_date = NOW()
                WHERE id = ${latestGoalId}
            `;
    }

    // 3. Create the new weight goal
    await sql`
            INSERT INTO weight_goals
                (
                  user_id,
                  start_weight,
                  target_weight,
                  daily_calorie_goal,
                  checkpoints,
                  created_at
                )
            VALUES (
              ${userId},
              ${currentWeight},
              ${targetWeight},
              ${dailyCalorieGoal},
              ${checkpoints},
              NOW()
            )
        `;

    // 4. Determine the new goal type
    const newGoalType = parseFloat(targetWeight) < parseFloat(currentWeight) ? 'lose weight' : 'gain weight';

    // 5. Update the user's main goal and target weight
    await sql`
            UPDATE users
            SET weight_goal = ${targetWeight}, goal = ${newGoalType}
            WHERE id = ${userId}
        `;

    return new Response(
      JSON.stringify({ message: 'New weight goal created successfully' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating new weight goal:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}