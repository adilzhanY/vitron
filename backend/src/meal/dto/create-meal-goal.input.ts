import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CreateMealGoalInput {
  @Field()
  clerkId: string;

  @Field(() => Float)
  caloriesTarget: number;

  @Field(() => Float, { nullable: true })
  proteinTarget?: number;

  @Field(() => Float, { nullable: true })
  carbsTarget?: number;

  @Field(() => Float, { nullable: true })
  fatTarget?: number;

  @Field(() => Int, { nullable: true })
  relatedWeightGoalId?: number;
}
