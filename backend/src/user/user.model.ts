import { ObjectType, Field, Int, Float } from '@nestjs/graphql';


// What the API returns
@ObjectType()
export class User {
  @Field(() => Int)  // Specify the GraphQL type
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  clerkId: string;

  @Field({ nullable: true })
  birthday?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field(() => Float, { nullable: true })
  initialWeight?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  goal?: string;

  @Field({ nullable: true })
  activityLevel?: string;

  @Field({ nullable: true })
  unitSystem?: string;

  @Field({ nullable: true })
  measurementsFilled?: boolean;
}