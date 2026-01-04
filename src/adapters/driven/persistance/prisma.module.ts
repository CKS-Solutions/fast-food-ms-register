import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseConfigService } from './database-config.service';

@Global()
@Module({
  providers: [DatabaseConfigService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
