import { neon } from "@neondatabase/serverless";

// GET meal goals for a user
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "clerkId is required" }, { status: 400 });
    }

    // Get the internal user ID from the clerkId
    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Get the most recent meal goal for the user
    const mealGoals = await sql`
      SELECT 
        id,
        calories_target,
        protein_target,
        carbs_target,
        fat_target,
        goal_date,
        related_weight_goal_id,
        created_at,
        updated_at
      FROM meal_goals
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (mealGoals.length === 0) {
      return Response.json({ data: null }, { status: 200 });
    }

    return Response.json({ data: mealGoals[0] }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/meal-goals:", error);
    return Response.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

// Create a new meal goal
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {
      clerkId,
      caloriesTarget,
      proteinTarget,
      carbsTarget,
      fatTarget,
      relatedWeightGoalId,
    } = await request.json();

    if (!clerkId || !caloriesTarget) {
      return Response.json(
        { error: "Missing required fields: clerkId, caloriesTarget" },
        { status: 400 },
      );
    }

    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Insert the new meal goal
    const response = await sql`
      INSERT INTO meal_goals (
        user_id,
        calories_target,
        protein_target,
        carbs_target,
        fat_target,
        goal_date,
        related_weight_goal_id,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${caloriesTarget},
        ${proteinTarget || 0},
        ${carbsTarget || 0},
        ${fatTarget || 0},
        CURRENT_DATE,
        ${relatedWeightGoalId || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return new Response(JSON.stringify({ data: response[0] }), { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/meal-goals:", error);
    return Response.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

// Update an existing meal goal
export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, caloriesTarget, proteinTarget, carbsTarget, fatTarget } =
      await request.json();

    if (!clerkId) {
      return Response.json({ error: "clerkId is required" }, { status: 400 });
    }

    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Update the most recent meal goal
    const response = await sql`
      UPDATE meal_goals
      SET
        calories_target = COALESCE(${caloriesTarget}, calories_target),
        protein_target = COALESCE(${proteinTarget}, protein_target),
        carbs_target = COALESCE(${carbsTarget}, carbs_target),
        fat_target = COALESCE(${fatTarget}, fat_target),
        updated_at = NOW()
      WHERE user_id = ${userId}
        AND id = (
          SELECT id FROM meal_goals 
          WHERE user_id = ${userId} 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      RETURNING *
    `;

    if (response.length === 0) {
      return Response.json(
        { error: "No meal goal found to update" },
        { status: 404 },
      );
    }

    return new Response(JSON.stringify({ data: response[0] }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/meal-goals:", error);
    return Response.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
