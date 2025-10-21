import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class MealImage {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  imageName?: string;

  @Field(() => Int)
  imageSize: number;

  @Field()
  isAnalyzed: boolean;

  @Field({ nullable: true })
  aiResponse?: string;

  @Field()
  uploadedAt: string;
}
