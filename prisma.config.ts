import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './src/adapters/driven/persistance/schema.prisma',
});
