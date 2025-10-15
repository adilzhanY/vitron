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

    const userResult = await sql`
      SELECT id, height, birthday, gender, activity_level, goal 
      FROM users 
      WHERE clerk_id = ${clerkId}
    `;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;
    const user = userResult[0];

    // Create first weight goal and get its ID
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

    // Calculate meal goals using user data
    let caloriesTarget = dailyCalorieGoal;
    let proteinTarget = 0;
    let carbsTarget = 0;
    let fatTarget = 0;

    // If there is all necessary user data, calculate precise macro targets
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

      // Calculate macros using the service
      const macros = calculateMacros({
        heightCm: user.height,
        currentWeight: startWeight,
        targetWeight: targetWeight,
        goal: user.goal,
        activityLevel: user.activity_level,
        age: age,
        gender: user.gender,
      });

      caloriesTarget = macros.calories;
      proteinTarget = macros.protein;
      carbsTarget = macros.carbs;
      fatTarget = macros.fat;
    } else {
      // Fallback: Use basic macro distribution if can't calculate
      proteinTarget = Math.round((caloriesTarget * 0.3) / 4);
      carbsTarget = Math.round((caloriesTarget * 0.4) / 4);
      fatTarget = Math.round((caloriesTarget * 0.3) / 9);
    }

    // Create meal goal linked to this weight goal
    await sql`
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
    `;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weight goal and meal goal created successfully",
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
    console.error("Error creating new weight goal and meal goal:", error);
    return new Response(
      JSON.stringify({ error: "An internal server error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

