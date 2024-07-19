import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

    // Create Users and assign Roles
    const adminUser = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword',
            role: { connect: { id: adminRole.id } },
        },
    });

    const regularUser = await prisma.user.create({
        data: {
            name: 'Regular User',
            email: 'user@example.com',
            password: 'userpassword',
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
