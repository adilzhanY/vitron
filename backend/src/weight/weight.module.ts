import { Module } from '@nestjs/common';
import { WeightResolver } from './weight.resolver';
import { WeightService } from './weight.service';

@Module({
  providers: [WeightResolver, WeightService],
  exports: [WeightService],
})
export class WeightModule { }
