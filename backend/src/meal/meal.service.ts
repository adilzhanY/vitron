import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';
import OpenAI from 'openai';
import { CreateMealInput } from './dto/create-meal.input';
import { CreateMealGoalInput } from './dto/create-meal-goal.input';
import { UpdateMealGoalInput } from './dto/update-meal-goal.input';
import { UploadMealImageInput } from './dto/upload-meal-image.input';
import { UpdateMealImageInput } from './dto/update-meal-image.input';
import { CreateWaterInput } from './dto/create-water.input';
import { UpdateWaterInput } from './dto/update-water.input';

@Injectable()
export class MealService {
  private sql = neon(process.env.DATABASE_URL!);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
    });
  }

  // ============ MEAL (FOOD ENTRY) METHODS ============

  async getMeals(clerkId: string, date: string) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const meals = await this.sql`
      SELECT 
        id,
        name, 
        is_saved, 
        calories, 
        protein, 
        carbs, 
        fat, 
        meal_type, 
        DATE(logged_at) as entry_date,
        logged_at
      FROM meals
      WHERE user_id = ${userId} AND DATE(logged_at) = ${date}::date
      ORDER BY logged_at DESC;
    `;

    return meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      mealType: meal.meal_type,
      isSaved: meal.is_saved,
      entryDate: meal.entry_date instanceof Date ? meal.entry_date.toISOString().split('T')[0] : meal.entry_date,
      loggedAt: meal.logged_at instanceof Date ? meal.logged_at.toISOString() : meal.logged_at,
    }));
  }

  async getAllMeals(clerkId: string) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const meals = await this.sql`
      SELECT 
        id,
        name, 
        is_saved, 
        calories, 
        protein, 
        carbs, 
        fat, 
        meal_type, 
        DATE(logged_at) as entry_date,
        logged_at
      FROM meals
      WHERE user_id = ${userId}
      ORDER BY logged_at DESC;
    `;

    return meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      mealType: meal.meal_type,
      isSaved: meal.is_saved,
      entryDate: meal.entry_date instanceof Date ? meal.entry_date.toISOString().split('T')[0] : meal.entry_date,
      loggedAt: meal.logged_at instanceof Date ? meal.logged_at.toISOString() : meal.logged_at,
    }));
  }

  async createMeal(input: CreateMealInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    // Prepare logged_at timestamp
    const loggedAtTimestamp = input.entryDate
      ? new Date(input.entryDate).toISOString()
      : new Date().toISOString();

    // Insert meal
    const result = await this.sql`
      INSERT INTO meals (
        user_id,
        name,
        calories, 
        protein, 
        carbs, 
        fat, 
        meal_type,
        is_saved,
        logged_at
      )
      VALUES (
        ${userId},
        ${input.name},
        ${input.calories},
        ${input.protein || 0},
        ${input.carbs || 0},
        ${input.fat || 0},
        ${input.mealType},
        ${input.isSaved || false},
        ${loggedAtTimestamp}::timestamp
      )
      RETURNING *
    `;

    const meal = result[0];
    return {
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      mealType: meal.meal_type,
      isSaved: meal.is_saved,
      entryDate: meal.logged_at instanceof Date ? meal.logged_at.toISOString() : meal.logged_at,
      loggedAt: meal.logged_at instanceof Date ? meal.logged_at.toISOString() : meal.logged_at,
    };
  }

  // ============ MEAL GOALS METHODS ============

  async getMealGoal(clerkId: string) {
    // Get user ID from clerkId
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    // Get the most recent meal goal
    const mealGoals = await this.sql`
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
      return null;
    }

    const goal = mealGoals[0];
    return {
      id: goal.id,
      caloriesTarget: goal.calories_target,
      proteinTarget: goal.protein_target,
      carbsTarget: goal.carbs_target,
      fatTarget: goal.fat_target,
      goalDate: goal.goal_date,
      relatedWeightGoalId: goal.related_weight_goal_id,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    };
  }

  async createMealGoal(input: CreateMealGoalInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    // Insert meal goal
    const result = await this.sql`
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
        ${input.caloriesTarget},
        ${input.proteinTarget || 0},
        ${input.carbsTarget || 0},
        ${input.fatTarget || 0},
        CURRENT_DATE,
        ${input.relatedWeightGoalId || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const goal = result[0];
    return {
      id: goal.id,
      caloriesTarget: goal.calories_target,
      proteinTarget: goal.protein_target,
      carbsTarget: goal.carbs_target,
      fatTarget: goal.fat_target,
      goalDate: goal.goal_date,
      relatedWeightGoalId: goal.related_weight_goal_id,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    };
  }

  async updateMealGoal(input: UpdateMealGoalInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    // Update the most recent meal goal
    const result = await this.sql`
      UPDATE meal_goals
      SET
        calories_target = COALESCE(${input.caloriesTarget}, calories_target),
        protein_target = COALESCE(${input.proteinTarget}, protein_target),
        carbs_target = COALESCE(${input.carbsTarget}, carbs_target),
        fat_target = COALESCE(${input.fatTarget}, fat_target),
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

    if (result.length === 0) {
      throw new Error('No meal goal found to update');
    }

    const goal = result[0];
    return {
      id: goal.id,
      caloriesTarget: goal.calories_target,
      proteinTarget: goal.protein_target,
      carbsTarget: goal.carbs_target,
      fatTarget: goal.fat_target,
      goalDate: goal.goal_date,
      relatedWeightGoalId: goal.related_weight_goal_id,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    };
  }

  // ============ MEAL IMAGES METHODS ============

  async uploadMealImage(input: UploadMealImageInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const result = await this.sql`
      INSERT INTO meal_images (
        user_id,
        image_data,
        image_name,
        image_type,
        meal_id,
        uploaded_at
      )
      VALUES (
        ${userId},
        ${input.imageData},
        ${input.imageName},
        ${input.imageType},
        ${input.mealId || null},
        NOW()
      )
      RETURNING *
    `;

    const image = result[0];
    return {
      id: image.id,
      imageData: image.image_data,
      imageName: image.image_name,
      imageType: image.image_type,
      mealId: image.meal_id,
      uploadedAt: image.uploaded_at,
    };
  }

  async getMealImages(clerkId: string, imageId?: number) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    let images;
    if (imageId) {
      images = await this.sql`
        SELECT 
          id,
          image_data,
          image_name,
          image_type,
          meal_id,
          ai_response,
          is_analyzed,
          uploaded_at
        FROM meal_images
        WHERE user_id = ${userId} AND id = ${imageId}
        ORDER BY uploaded_at DESC;
      `;
    } else {
      images = await this.sql`
        SELECT 
          id,
          image_data,
          image_name,
          image_type,
          meal_id,
          ai_response,
          is_analyzed,
          uploaded_at
        FROM meal_images
        WHERE user_id = ${userId}
        ORDER BY uploaded_at DESC;
      `;
    }

    return images.map((image) => ({
      id: image.id,
      imageData: image.image_data,
      imageName: image.image_name,
      imageType: image.image_type,
      mealId: image.meal_id,
      aiResponse: image.ai_response,
      isAnalyzed: image.is_analyzed,
      uploadedAt: image.uploaded_at,
    }));
  }

  async updateMealImage(input: UpdateMealImageInput) {
    const result = await this.sql`
      UPDATE meal_images
      SET
        ai_response = COALESCE(${input.aiResponse}, ai_response),
        is_analyzed = COALESCE(${input.isAnalyzed}, is_analyzed)
      WHERE id = ${input.imageId}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new Error('Meal image not found');
    }

    const image = result[0];
    return {
      id: image.id,
      imageData: image.image_data,
      imageName: image.image_name,
      imageType: image.image_type,
      mealId: image.meal_id,
      aiResponse: image.ai_response,
      isAnalyzed: image.is_analyzed,
      uploadedAt: image.uploaded_at,
    };
  }


  // ============ AI ANALYSIS METHODS ============

  async analyzeMealImage(imageUrl: string, prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: 'openai/gpt-4.1-nano',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    return response;
  }

  // ============ WATER INTAKE METHODS ============

  async getWaterIntake(clerkId: string, date: string) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const waterIntake = await this.sql`
      SELECT 
        id,
        total_consumed, 
        daily_goal,
        date,
        updated_at
      FROM daily_water_intake
      WHERE user_id = ${userId} AND date = ${date}::date
      LIMIT 1;
    `;

    if (waterIntake.length === 0) {
      return {
        id: 0,
        totalConsumed: 0,
        dailyGoal: 2500,
        date,
        updatedAt: null,
      };
    }

    const intake = waterIntake[0];
    return {
      id: intake.id,
      totalConsumed: intake.total_consumed,
      dailyGoal: intake.daily_goal,
      date: intake.date,
      updatedAt: intake.updated_at,
    };
  }

  async createWaterIntake(input: CreateWaterInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const entryDate = input.date || new Date().toISOString().split('T')[0];
    const amount = input.amount || 250;
    const dailyGoal = input.dailyGoal || 2500;

    const result = await this.sql`
      INSERT INTO daily_water_intake (
        user_id,
        date,
        total_consumed,
        daily_goal
      )
      VALUES (
        ${userId},
        ${entryDate}::date,
        ${amount},
        ${dailyGoal}
      )
      RETURNING *
    `;

    const intake = result[0];
    return {
      id: intake.id,
      totalConsumed: intake.total_consumed,
      dailyGoal: intake.daily_goal,
      date: intake.date,
      updatedAt: intake.updated_at,
    };
  }

  async updateWaterIntake(input: UpdateWaterInput) {
    const userResult = await this.sql`SELECT id FROM users WHERE clerk_id = ${input.clerkId}`;
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult[0].id;

    const entryDate = input.date || new Date().toISOString().split('T')[0];
    const amount = input.amount || 250;

    const result = await this.sql`
      UPDATE daily_water_intake
      SET 
        total_consumed = total_consumed + ${amount},
        updated_at = NOW()
      WHERE user_id = ${userId} AND date = ${entryDate}::date
      RETURNING *
    `;

    if (result.length === 0) {
      throw new Error('Water intake record not found for this date');
    }

    const intake = result[0];
    return {
      id: intake.id,
      totalConsumed: intake.total_consumed,
      dailyGoal: intake.daily_goal,
      date: intake.date,
      updatedAt: intake.updated_at,
    };
  }
}
