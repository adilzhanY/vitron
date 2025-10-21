import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AIAnalyzeInput {
  @Field()
  imageUrl: string;
}
