import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { WeightService } from './weight.service';
import { Weight } from './weight.model';
import { WeightGoal } from './weight-goal.model';
import { CreateWeightInput } from './dto/create-weight.input';
import { CreateWeightGoalInput } from './dto/create-weight-goal.input';

@Resolver()
export class WeightResolver {
  constructor(private weightService: WeightService) { }

  // ============ WEIGHT ENTRY QUERIES/MUTATIONS ============

  @Query(() => [Weight])
  async weights(@Args('clerkId') clerkId: string) {
    return this.weightService.getWeights(clerkId);
  }

  @Mutation(() => Weight)
  async createWeight(@Args('input') input: CreateWeightInput) {
    return this.weightService.createWeight(input);
  }

  // ============ WEIGHT GOAL QUERIES/MUTATIONS ============

  @Query(() => WeightGoal, { nullable: true })
  async weightGoal(@Args('clerkId') clerkId: string) {
    return this.weightService.getWeightGoal(clerkId);
  }

  @Mutation(() => WeightGoal)
  async createWeightGoal(@Args('input') input: CreateWeightGoalInput) {
    return this.weightService.createWeightGoal(input);
  }
}
