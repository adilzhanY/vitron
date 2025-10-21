import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { MealModule } from './meal/meal.module';
import { WeightModule } from './weight/weight.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // generates schema automatically
      playground: false,     // Disable the old playground
      plugins: [ApolloServerPluginLandingPageLocalDefault()], // Use Apollo Sandbox instead
    }),
    UserModule,
    MealModule,
    WeightModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
