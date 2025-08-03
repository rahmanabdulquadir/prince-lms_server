// scripts/fixContentOrder.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixContentOrder() {
  const modules = await prisma.module.findMany();

  for (const module of modules) {
    const contents = await prisma.content.findMany({
      where: { moduleId: module.id },
      orderBy: { createdAt: 'asc' },
    });

    for (let index = 0; index < contents.length; index++) {
      const content = contents[index];
      await prisma.content.update({
        where: { id: content.id },
        data: { order: index },
      });
    }

    console.log(`✅ Fixed order for module: ${module.id}`);
  }

  console.log('🎉 All modules processed.');
  await prisma.$disconnect();
}

fixContentOrder().catch((err) => {
  console.error('❌ Error fixing order:', err);
  prisma.$disconnect();
  process.exit(1);
});
