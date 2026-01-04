import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DatabaseConfigService } from './database-config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(forwardRef(() => DatabaseConfigService))
    private readonly databaseConfigService: DatabaseConfigService,
  ) {
    super({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || '',
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    // Aguarda o DatabaseConfigService carregar a DATABASE_URL
    await this.databaseConfigService.ensureLoaded();

    // Reconecta se a URL foi atualizada
    if (process.env.DATABASE_URL) {
      await this.$connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
