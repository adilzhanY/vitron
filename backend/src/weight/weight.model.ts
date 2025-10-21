import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Weight {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  weight: number;

  @Field()
  loggedAt: string;
}
