import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';
import { CreateWeightInput } from './dto/create-weight.input';
import { CreateWeightGoalInput } from './dto/create-weight-goal.input';

@Injectable()
export class WeightService {
  private sql = neon(process.env.DATABASE_URL!);

  // ============ WEIGHT ENTRY METHODS ============

  async getWeights(clerkId: string) {
    // Get user ID from clerkId
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    // Fetch all weight entries
    const weights = await this.sql`
      SELECT id, weight, logged_at
      FROM weights
      WHERE user_id = ${userId}
      ORDER BY logged_at DESC
    `;

    console.log(`[WeightService] Found ${weights.length} weight entries for user ${userId}`);

    return weights.map((w) => ({
      id: w.id,
      weight: w.weight,
      loggedAt: w.logged_at instanceof Date ? w.logged_at.toISOString() : w.logged_at,
    }));
  }

  async createWeight(input: CreateWeightInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const result = await this.sql`
      INSERT INTO weights (user_id, weight)
      VALUES (${userId}, ${input.weight})
      ON CONFLICT (user_id, logged_date) DO UPDATE
      SET weight = EXCLUDED.weight,
        logged_at = NOW()
      RETURNING id, weight, logged_at
    `;

    return {
      id: result[0].id,
      weight: result[0].weight,
      loggedAt: result[0].logged_at instanceof Date ? result[0].logged_at.toISOString() : result[0].logged_at,
    };
  }

  // ============ WEIGHT GOAL METHODS ============

  async getWeightGoal(clerkId: string) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const goalResult = await this.sql`
      SELECT 
        id,
        start_weight, 
        target_weight, 
        checkpoints,
        daily_calorie_goal,
        achieved,
        created_at,
        end_date
      FROM weight_goals 
      WHERE user_id = ${userId} AND achieved = FALSE 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (goalResult.length === 0) {
      return null;
    }

    const goal = goalResult[0];
    return {
      id: goal.id,
      startWeight: goal.start_weight,
      targetWeight: goal.target_weight,
      checkpoints: goal.checkpoints,
      dailyCalorieGoal: goal.daily_calorie_goal,
      achieved: goal.achieved,
      createdAt: goal.created_at,
      endDate: goal.end_date,
    };
  }

  async createWeightGoal(input: CreateWeightGoalInput) {
    const userResult = await this.sql`
      SELECT id, height, birthday, gender, activity_level, goal 
      FROM users 
      WHERE clerk_id = ${input.clerkId}
    `;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }

    const userId = userResult[0].id;
    const user = userResult[0];

    const latestGoalResult = await this.sql`
      SELECT id FROM weight_goals
      WHERE user_id = ${userId} AND achieved = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (latestGoalResult.length > 0) {
      const latestGoalId = latestGoalResult[0].id;
      await this.sql`
        UPDATE weight_goals
        SET achieved = TRUE, end_date = NOW()
        WHERE id = ${latestGoalId}
      `;
    }

    const weightGoalResult = await this.sql`
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
        ${input.startWeight},
        ${input.targetWeight},
        ${input.dailyCalorieGoal || null},
        ${input.checkpoints},
        NOW()
      )
      RETURNING id, start_weight, target_weight, checkpoints, daily_calorie_goal, achieved, created_at
    `;

    const weightGoalId = weightGoalResult[0].id;

    const macros = this.calculateMacros(
      user,
      input.startWeight,
      input.targetWeight,
      input.dailyCalorieGoal,
    );

    await this.sql`
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
        ${macros.calories},
        ${macros.protein},
        ${macros.carbs},
        ${macros.fat},
        CURRENT_DATE,
        ${weightGoalId},
        NOW(),
        NOW()
      )
    `;

    const goal = weightGoalResult[0];
    return {
      id: goal.id,
      startWeight: goal.start_weight,
      targetWeight: goal.target_weight,
      checkpoints: goal.checkpoints,
      dailyCalorieGoal: goal.daily_calorie_goal,
      achieved: goal.achieved,
      createdAt: goal.created_at,
      endDate: null,
      mealGoals: macros,
    };
  }

  // ============ HELPER: CALCULATE MACROS ============

  private calculateMacros(
    user: any,
    startWeight: number,
    targetWeight: number,
    dailyCalorieGoal?: number,
  ) {
    let caloriesTarget = dailyCalorieGoal || 2200;
    let proteinTarget = 0;
    let carbsTarget = 0;
    let fatTarget = 0;

    if (
      user.height &&
      user.birthday &&
      user.gender &&
      user.activity_level &&
      user.goal
    ) {
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

      // Calculate BMR (Mifflin-St Jeor)
      const genderConstant = user.gender === 'male' ? 5 : -161;
      const bmr =
        10 * startWeight + 6.25 * user.height - 5 * age + genderConstant;

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'extremely active': 1.9,
      };
      const maintenanceCalories = bmr * activityMultipliers[user.activity_level];

      // Adjust for goal
      const weightDifference = targetWeight - startWeight;
      const isLosing = weightDifference < 0;
      const isGaining = weightDifference > 0;

      let proteinRatio: number;
      let carbRatio: number;
      let fatRatio: number;

      switch (user.goal) {
        case 'lose weight':
          const deficitPercent = Math.min(
            25,
            Math.max(15, Math.abs(weightDifference) * 0.5),
          );
          caloriesTarget = maintenanceCalories * (1 - deficitPercent / 100);
          proteinRatio = 0.35;
          carbRatio = 0.35;
          fatRatio = 0.3;
          break;

        case 'gain weight':
          const surplusPercent = Math.min(
            20,
            Math.max(10, Math.abs(weightDifference) * 0.5),
          );
          caloriesTarget = maintenanceCalories * (1 + surplusPercent / 100);
          proteinRatio = 0.3;
          carbRatio = 0.45;
          fatRatio = 0.25;
          break;

        case 'be fit':
        default:
          if (Math.abs(weightDifference) > 5) {
            const adjustmentPercent = isLosing ? -10 : isGaining ? 10 : 0;
            caloriesTarget = maintenanceCalories * (1 + adjustmentPercent / 100);
          } else {
            caloriesTarget = maintenanceCalories;
          }
          proteinRatio = 0.3;
          carbRatio = 0.4;
          fatRatio = 0.3;
          break;
      }

      // Calculate grams
      const proteinGrams = Math.round((caloriesTarget * proteinRatio) / 4);
      const carbGrams = Math.round((caloriesTarget * carbRatio) / 4);
      const fatGrams = Math.round((caloriesTarget * fatRatio) / 9);

      // Minimum protein requirement
      const minProteinPerKg =
        user.goal === 'gain weight' ? 2.0 : user.goal === 'lose weight' ? 1.8 : 1.6;
      const minProtein = Math.round(startWeight * minProteinPerKg);
      const finalProtein = Math.max(proteinGrams, minProtein);

      // Recalculate
      const proteinCalories = finalProtein * 4;
      const remainingCalories = caloriesTarget - proteinCalories;
      const finalCarbs = Math.round(
        (remainingCalories * (carbRatio / (carbRatio + fatRatio))) / 4,
      );
      const finalFat = Math.round(
        (remainingCalories * (fatRatio / (carbRatio + fatRatio))) / 9,
      );

      proteinTarget = finalProtein;
      carbsTarget = finalCarbs;
      fatTarget = finalFat;
      caloriesTarget = Math.round(caloriesTarget);
    } else {
      // Fallback: basic distribution
      proteinTarget = Math.round((caloriesTarget * 0.3) / 4);
      carbsTarget = Math.round((caloriesTarget * 0.4) / 4);
      fatTarget = Math.round((caloriesTarget * 0.3) / 9);
    }

    return {
      calories: caloriesTarget,
      protein: proteinTarget,
      carbs: carbsTarget,
      fat: fatTarget,
    };
  }
}
