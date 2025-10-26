import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateMealInput {
  @Field()
  clerkId: string;

  @Field()
  name: string;

  @Field(() => Float)
  calories: number;

  @Field(() => Float, { nullable: true })
  protein?: number;

  @Field(() => Float, { nullable: true })
  carbs?: number;

  @Field(() => Float, { nullable: true })
  fat?: number;

  @Field()
  mealType: string;

  @Field({ nullable: true })
  isSaved?: boolean;

  @Field({ nullable: true })
  entryDate?: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
