import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdateMealGoalInput {
  @Field()
  clerkId: string;

  @Field(() => Float, { nullable: true })
  caloriesTarget?: number;

  @Field(() => Float, { nullable: true })
  proteinTarget?: number;

  @Field(() => Float, { nullable: true })
  carbsTarget?: number;

  @Field(() => Float, { nullable: true })
  fatTarget?: number;
}
