import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateWeightInput {
  @Field()
  clerkId: string;

  @Field(() => Float)
  weight: number;
}
