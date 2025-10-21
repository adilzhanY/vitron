import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class WaterIntake {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  totalConsumed: number;

  @Field(() => Float)
  dailyGoal: number;

  @Field()
  date: string;

  @Field({ nullable: true })
  updatedAt?: string;
}
