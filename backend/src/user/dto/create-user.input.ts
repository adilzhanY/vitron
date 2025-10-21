import { InputType, Field } from '@nestjs/graphql';


// What I send when creating a user (input)
@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  clerkId: string;
}