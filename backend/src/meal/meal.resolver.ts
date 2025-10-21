import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MealService } from './meal.service';
import { Meal } from './meal.model';
import { MealGoal } from './meal-goal.model';
import { MealImage } from './meal-image.model';
import { WaterIntake } from './water.model';
import { CreateMealInput } from './dto/create-meal.input';
import { CreateMealGoalInput } from './dto/create-meal-goal.input';
import { UpdateMealGoalInput } from './dto/update-meal-goal.input';
import { UploadMealImageInput } from './dto/upload-meal-image.input';
import { UpdateMealImageInput } from './dto/update-meal-image.input';
import { AIAnalyzeInput } from './dto/ai-analyze.input';
import { CreateWaterInput } from './dto/create-water.input';
import { UpdateWaterInput } from './dto/update-water.input';

@Resolver()
export class MealResolver {
  constructor(private mealService: MealService) { }

  // ============ MEAL (FOOD ENTRY) QUERIES/MUTATIONS ============

  @Query(() => [Meal])
  async meals(
    @Args('clerkId') clerkId: string,
    @Args('date') date: string,
  ) {
    return this.mealService.getMeals(clerkId, date);
  }

  @Mutation(() => Meal)
  async createMeal(@Args('input') input: CreateMealInput) {
    return this.mealService.createMeal(input);
  }

  // ============ MEAL GOALS QUERIES/MUTATIONS ============

  @Query(() => MealGoal, { nullable: true })
  async mealGoal(@Args('clerkId') clerkId: string) {
    return this.mealService.getMealGoal(clerkId);
  }

  @Mutation(() => MealGoal)
  async createMealGoal(@Args('input') input: CreateMealGoalInput) {
    return this.mealService.createMealGoal(input);
  }

  @Mutation(() => MealGoal)
  async updateMealGoal(@Args('input') input: UpdateMealGoalInput) {
    return this.mealService.updateMealGoal(input);
  }

  // ============ MEAL IMAGES QUERIES/MUTATIONS ============

  @Mutation(() => MealImage)
  async uploadMealImage(@Args('input') input: UploadMealImageInput) {
    return this.mealService.uploadMealImage(input);
  }

  @Query(() => [MealImage])
  async mealImages(
    @Args('clerkId') clerkId: string,
    @Args('imageId', { nullable: true }) imageId?: number,
  ) {
    return this.mealService.getMealImages(clerkId, imageId);
  }

  @Mutation(() => MealImage)
  async updateMealImage(@Args('input') input: UpdateMealImageInput) {
    return this.mealService.updateMealImage(input);
  }

  // ============ AI ANALYSIS MUTATIONS ============

  @Mutation(() => String)
  async analyzeMealImage(
    @Args('input') input: AIAnalyzeInput,
    @Args('prompt') prompt: string,
  ) {
    const response = await this.mealService.analyzeMealImage(
      input.imageUrl,
      prompt,
    );
    return JSON.stringify(response);
  }

  // ============ WATER INTAKE QUERIES/MUTATIONS ============

  @Query(() => WaterIntake)
  async waterIntake(
    @Args('clerkId') clerkId: string,
    @Args('date') date: string,
  ) {
    return this.mealService.getWaterIntake(clerkId, date);
  }

  @Mutation(() => WaterIntake)
  async createWaterIntake(@Args('input') input: CreateWaterInput) {
    return this.mealService.createWaterIntake(input);
  }

  @Mutation(() => WaterIntake)
  async updateWaterIntake(@Args('input') input: UpdateWaterInput) {
    return this.mealService.updateWaterIntake(input);
  }
}
