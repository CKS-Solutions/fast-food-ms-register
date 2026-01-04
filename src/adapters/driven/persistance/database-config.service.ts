import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

interface DatabaseSecret {
  username: string;
  password: string;
}

@Injectable()
export class DatabaseConfigService implements OnModuleInit {
  private databaseUrl: string | null = null;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // Tenta carregar de forma síncrona primeiro (para desenvolvimento)
    if (!process.env.DATABASE_URL && !process.env.DB_SECRET_ARN) {
      this.databaseUrl = this.buildDatabaseUrlFromEnv();
      process.env.DATABASE_URL = this.databaseUrl;
    }
  }

  async onModuleInit() {
    await this.loadDatabaseUrl();
  }

  async ensureLoaded(): Promise<void> {
    if (this.databaseUrl && process.env.DATABASE_URL) {
      return;
    }
    if (!this.loadPromise) {
      this.loadPromise = this.loadDatabaseUrl();
    }
    await this.loadPromise;
  }

  async loadDatabaseUrl(): Promise<void> {
    // Se DATABASE_URL já estiver definida, usa ela
    if (process.env.DATABASE_URL) {
      this.databaseUrl = process.env.DATABASE_URL;
      return;
    }

    // Se não tiver DB_SECRET_ARN, tenta construir a partir das variáveis individuais
    if (!process.env.DB_SECRET_ARN) {
      this.databaseUrl = this.buildDatabaseUrlFromEnv();
      return;
    }

    // Busca credenciais do Secrets Manager
    try {
      const secret = await this.getSecretFromSecretsManager(
        process.env.DB_SECRET_ARN,
      );
      const dbSecret: DatabaseSecret = JSON.parse(secret) as DatabaseSecret;

      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '5432';
      const database = process.env.DB_NAME || 'ms_register';

      this.databaseUrl = `postgresql://${dbSecret.username}:${dbSecret.password}@${host}:${port}/${database}?schema=public`;

      // Define a variável de ambiente para o Prisma usar
      process.env.DATABASE_URL = this.databaseUrl;
    } catch (error) {
      console.error('Error loading database credentials:', error);
      // Fallback para construir a partir de variáveis de ambiente
      this.databaseUrl = this.buildDatabaseUrlFromEnv();
      process.env.DATABASE_URL = this.databaseUrl;
    }
  }

  private async getSecretFromSecretsManager(
    secretArn: string,
  ): Promise<string> {
    const client = new SecretsManagerClient({
      region: process.env.REGION || process.env.AWS_REGION || 'us-east-1',
    });

    const command = new GetSecretValueCommand({
      SecretId: secretArn,
    });

    const response = await client.send(command);
    return response.SecretString || '';
  }

  private buildDatabaseUrlFromEnv(): string {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME || 'ms_register';
    const username = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';

    return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
  }

  getDatabaseUrl(): string {
    return this.databaseUrl || process.env.DATABASE_URL || '';
  }
}
