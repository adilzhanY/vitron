import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Meal {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Float)
  calories: number;

  @Field(() => Float)
  protein: number;

  @Field(() => Float)
  carbs: number;

  @Field(() => Float)
  fat: number;

  @Field()
  mealType: string;

  @Field()
  isSaved: boolean;

  @Field()
  entryDate: string;

  @Field()
  loggedAt: string;
}
