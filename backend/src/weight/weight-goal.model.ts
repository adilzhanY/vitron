import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class WeightGoal {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  startWeight: number;

  @Field(() => Float)
  targetWeight: number;

  @Field(() => Int)
  checkpoints: number;

  @Field(() => Float, { nullable: true })
  dailyCalorieGoal?: number;

  @Field()
  achieved: boolean;

  @Field()
  createdAt: string;

  @Field({ nullable: true })
  endDate?: string;
}
