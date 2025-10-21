import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UploadMealImageInput {
  @Field()
  clerkId: string;

  @Field()
  imageData: string;

  @Field()
  imageName: string;

  @Field()
  imageType: string;

  @Field(() => Int, { nullable: true })
  mealId?: number;
}
