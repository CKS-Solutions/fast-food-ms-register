import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './src/adapters/driven/persistance/schema.prisma',
  datasource: {
    url:
      env('DATABASE_URL', { optional: true }) ||
      'postgresql://postgres:postgres@localhost:5432/ms_register',
  },
});
