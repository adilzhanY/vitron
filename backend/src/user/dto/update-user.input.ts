import { InputType, Field } from '@nestjs/graphql';


// What I send when updating a user (input)
@InputType()
export class UpdateUserInput {
  @Field()
  clerkId: string;

  @Field({ nullable: true })
  birthday?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  weight?: number;

  @Field({ nullable: true })
  height?: number;

  @Field({ nullable: true })
  goal?: string;

  @Field({ nullable: true })
  activityLevel?: string;

  @Field({ nullable: true })
  unitSystem?: string;
}