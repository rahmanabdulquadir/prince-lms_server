import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('❌ ADMIN_EMAIL or ADMIN_PASSWORD not defined in .env');
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        phoneNumber: '0000000000',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin seeded successfully');
  } else {
    console.log('⚠️ Admin already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
