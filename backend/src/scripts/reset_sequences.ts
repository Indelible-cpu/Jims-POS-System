
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resetSequences = async () => {
  console.log('Resetting database sequences...');
  try {
    // Reset Category sequence
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Category"`);
    console.log('Category sequence reset successfully.');

    // Reset Product sequence
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Product"`);
    console.log('Product sequence reset successfully.');

  } catch (e) {
    console.error('Failed to reset sequences:', e);
  }
};

resetSequences()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
