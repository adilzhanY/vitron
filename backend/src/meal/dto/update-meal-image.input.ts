import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateMealImageInput {
  @Field(() => Int)
  imageId: number;

  @Field({ nullable: true })
  aiResponse?: string;

  @Field({ nullable: true })
  isAnalyzed?: boolean;
}
