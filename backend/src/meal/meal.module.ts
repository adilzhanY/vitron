import { Module } from '@nestjs/common';
import { MealResolver } from './meal.resolver';
import { MealService } from './meal.service';

@Module({
  providers: [MealResolver, MealService],
  exports: [MealService],
})
export class MealModule { }
