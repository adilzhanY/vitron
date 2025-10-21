import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateWaterInput {
  @Field()
  clerkId: string;

  @Field({ nullable: true })
  date?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field(() => Float, { nullable: true })
  dailyGoal?: number;
}
