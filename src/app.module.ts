import { Module } from '@nestjs/common';
import { PrismaModule } from './adapters/driven/persistance/prisma.module';
import { CustomerModule } from './customer.module';

@Module({
  imports: [PrismaModule, CustomerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
