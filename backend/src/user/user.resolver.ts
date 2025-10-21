import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./user.model";
import { UserStatus } from "./user-status.model";
import { UserService } from "./user.service";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) { }

  @Query(() => User)
  async user(@Args('clerkId') clerkId: string) {
    return this.userService.getUser(clerkId);
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput) {
    return this.userService.createUser(input.name, input.email, input.clerkId);
  }

  @Mutation(() => User)
  async updateUser(@Args('input') input: UpdateUserInput) {
    return this.userService.updateUser(input.clerkId, input);
  }

  @Query(() => UserStatus)
  async userStatus(@Args('clerkId') clerkId: string) {
    return this.userService.getUserStatus(clerkId);
  }
}