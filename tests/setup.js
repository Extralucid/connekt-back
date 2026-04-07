import { PrismaClient }  from '@prisma/client';
import { execSync }  from 'child_process';
import redis  from '../src/config/redis.js';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  
  // Clear Redis
  await redis.flushall();
  
  // Run migrations for test database
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
});

beforeEach(async () => {
  // Clear all tables before each test
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});