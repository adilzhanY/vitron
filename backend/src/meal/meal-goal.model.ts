import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class MealGoal {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  caloriesTarget: number;

  @Field(() => Float)
  proteinTarget: number;

  @Field(() => Float)
  carbsTarget: number;

  @Field(() => Float)
  fatTarget: number;

  @Field()
  goalDate: string;

  @Field(() => Int, { nullable: true })
  relatedWeightGoalId?: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
