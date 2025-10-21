import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdateWaterInput {
  @Field()
  clerkId: string;

  @Field({ nullable: true })
  date?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;
}
