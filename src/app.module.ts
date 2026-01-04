import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './adapters/driven/persistance/prisma.module';
import { CustomerModule } from './customer.module';

@Module({
  imports: [PrismaModule, CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
