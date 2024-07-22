import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10; // Number of salt rounds for bcrypt

async function main() {
    await prisma.$executeRaw`TRUNCATE TABLE "Post" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Permission" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE;`;

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN' },
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER' },
    });

    // Create Permissions and assign them to Roles
    const readPermission = await prisma.permission.upsert({
        where: { name: 'READ' },
        update: {},
        create: {
            name: 'READ',
            role: { connect: { id: adminRole.id } },
        },
    });

    const writePermission = await prisma.permission.upsert({
        where: { name: 'WRITE' },
        update: {},
        create: {
            name: 'WRITE',
            role: { connect: { id: adminRole.id } },
        },
    });

    // Assign READ permission to USER role
    await prisma.permission.upsert({
        where: { name: 'READ_USER' },
        update: {},
        create: {
            name: 'READ_USER',
            role: { connect: { id: userRole.id } },
        },
    });

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('adminpassword', saltRounds);
    const hashedUserPassword = await bcrypt.hash('userpassword', saltRounds);

    // Create Users and assign Roles
    const adminUser = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedAdminPassword,
            role: { connect: { id: adminRole.id } },
        },
    });

    const regularUser = await prisma.user.create({
        data: {
            name: 'Regular User',
            email: 'user@example.com',
            password: hashedUserPassword,
            role: { connect: { id: userRole.id } },
        },
    });

    // Create Posts for Users
    await prisma.post.create({
        data: {
            title: 'Admin Post',
            content: 'This is a post by the admin user.',
            user: { connect: { id: adminUser.id } },
        },
    });

    await prisma.post.create({
        data: {
            title: 'User Post',
            content: 'This is a post by the regular user.',
            user: { connect: { id: regularUser.id } },
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
