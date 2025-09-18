import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { clerkId, startWeight, targetWeight, dailyCalorieGoal, checkpoints } = await request.json();

    if (!clerkId || !targetWeight || !checkpoints || !startWeight) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the internal user ID from the clerkId
    const userResult = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Create first weight goal
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
              ${startWeight},
              ${targetWeight},
              ${dailyCalorieGoal},
              ${checkpoints},
              NOW()
            )
        `;
  } catch (error) {
    console.error('Error creating new weight goal:', error);
  }
}