import { neon } from "@neondatabase/serverless";
import { calculateMacros } from "@/services/food/foodService";

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const {
      clerkId,
      startWeight,
      targetWeight,
      dailyCalorieGoal,
      checkpoints,
    } = await request.json();

    if (!clerkId || !targetWeight || !checkpoints || !startWeight) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // 1. Get user ID and current weight
    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = userResult[0].id;

    // 2. Mark the latest active goal as achieved
    // Note: Neon serverless driver doesn't support multiple statements in one query
    // Find the latest goal ID first
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

    console.log({
      userId,
      startWeight,
      targetWeight,
      dailyCalorieGoal,
      checkpoints,
    });

    // Get user data for meal goal calculation
    const userData = await sql`
      SELECT height, birthday, gender, activity_level, goal 
      FROM users 
      WHERE id = ${userId}
    `;
    const user = userData[0];

    // 3. Create the new weight goal
    const weightGoalResult = await sql`
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
            RETURNING id
        `;

    const weightGoalId = weightGoalResult[0].id;

    // Calculate and create/update meal goals
    let caloriesTarget = dailyCalorieGoal || 2200;
    let proteinTarget = 0;
    let carbsTarget = 0;
    let fatTarget = 0;

    // Log for debugging
    console.log("Creating meal goal for weight goal:", weightGoalId);
    console.log("User data:", {
      height: user.height,
      birthday: user.birthday,
      gender: user.gender,
      activityLevel: user.activity_level,
      goal: user.goal,
    });

    if (
      user.height &&
      user.birthday &&
      user.gender &&
      user.activity_level &&
      user.goal
    ) {
      // Calculate age from birthday
      const birthDate = new Date(user.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Log calculation inputs
      console.log("Calculating macros with:", {
        heightCm: parseFloat(user.height),
        currentWeight: parseFloat(startWeight),
        targetWeight: parseFloat(targetWeight),
        goal: user.goal,
        activityLevel: user.activity_level,
        age: age,
        gender: user.gender,
      });

      // Calculate macros using the service
      const macros = calculateMacros({
        heightCm: parseFloat(user.height),
        currentWeight: parseFloat(startWeight),
        targetWeight: parseFloat(targetWeight),
        goal: user.goal,
        activityLevel: user.activity_level,
        age: age,
        gender: user.gender,
      });

      // Log calculated macros
      console.log("Calculated macros:", macros);

      caloriesTarget = macros.calories;
      proteinTarget = macros.protein;
      carbsTarget = macros.carbs;
      fatTarget = macros.fat;
    } else {
      // Fallback: Use basic macro distribution
      console.log("Using fallback macro calculation");
      proteinTarget = Math.round((caloriesTarget * 0.3) / 4);
      carbsTarget = Math.round((caloriesTarget * 0.4) / 4);
      fatTarget = Math.round((caloriesTarget * 0.3) / 9);
    }

    // Create new meal goal linked to this weight goal
    console.log("Inserting meal goal:", {
      caloriesTarget,
      proteinTarget,
      carbsTarget,
      fatTarget,
      weightGoalId,
    });

    const mealGoalResult = await sql`
      INSERT INTO meal_goals
        (
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
        ${proteinTarget},
        ${carbsTarget},
        ${fatTarget},
        CURRENT_DATE,
        ${weightGoalId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    console.log(
      "Meal goal created successfully with ID:",
      mealGoalResult[0].id,
    );

    // // 4. Determine the new goal type
    // const newGoalType = parseFloat(targetWeight) < parseFloat(currentWeight) ? 'lose weight' : 'gain weight';
    //
    // // 5. Update the user's main goal and target weight
    // await sql`
    //         UPDATE users
    //         SET weight_goal = ${targetWeight}, goal = ${newGoalType}
    //         WHERE id = ${userId}
    //     `;
    //
    return new Response(
      JSON.stringify({
        message: "New weight goal and meal goal created successfully",
        data: {
          weightGoalId,
          mealGoals: {
            calories: caloriesTarget,
            protein: proteinTarget,
            carbs: carbsTarget,
            fat: fatTarget,
          },
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error creating new weight goal:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("clerkId");

  if (!clerkId) {
    return Response.json({ error: "Clerk ID is required" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Find the user by clerkId
    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;

    if (userResult.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const user = userResult[0];
    const userId = user.id;

    // Find the latest active weight goal for the user
    const goalResult = await sql`
      SELECT start_weight, target_weight, checkpoints 
      FROM weight_goals 
      WHERE user_id = ${userId} AND achieved = FALSE 
      ORDER BY created_at DESC 
      LIMIT 1`;

    if (goalResult.length === 0) {
      return Response.json(
        { error: "No active weight goal found" },
        { status: 404 },
      );
    }
    const goal = goalResult[0];

    // // Find the user's most recent weight entry
    // const currentWeightResult = await sql`
    //   SELECT weight
    //   FROM weights
    //   WHERE user_id = ${userId}
    //   ORDER BY logged_at DESC
    //   LIMIT 1`;

    // const currentWeight = currentWeightResult.length > 0
    //   ? parseFloat(currentWeightResult[0].weight)
    //   : parseFloat(goal.start_weight);

    // // Calculate progress
    const start = parseFloat(goal.start_weight);
    const target = parseFloat(goal.target_weight);

    return Response.json({
      startWeight: start,
      targetWeight: target,
      // currentWeight: currentWeight,
      checkpoints: goal.checkpoints,
    });
  } catch (error) {
    console.error("Failed to fetch weight goal:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
