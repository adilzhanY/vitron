import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserStatus {
  @Field()
  measurementsFilled: boolean;
}
