import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CreateWeightGoalInput {
  @Field()
  clerkId: string;

  @Field(() => Float)
  startWeight: number;

  @Field(() => Float)
  targetWeight: number;

  @Field(() => Int)
  checkpoints: number;

  @Field(() => Float, { nullable: true })
  dailyCalorieGoal?: number;
}
