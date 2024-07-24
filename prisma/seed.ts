import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL_SEED
        },
    },
});
const saltRounds = 10; // Number of salt rounds for bcrypt

async function main() {
    // Check if roles already exist
    const existingRoles = await prisma.role.findMany({
        where: {
            OR: [
                { name: 'ADMIN' },
                { name: 'USER' },
            ],
        },
    });

    const roleNames = existingRoles.map(role => role.name);
    const createAdminRole = !roleNames.includes('ADMIN');
    const createUserRole = !roleNames.includes('USER');

    let adminRole, userRole;
    if (createAdminRole) {
        adminRole = await prisma.role.create({
            data: { name: 'ADMIN' },
        });
    } else {
        adminRole = existingRoles.find(role => role.name === 'ADMIN');
    }

    if (createUserRole) {
        userRole = await prisma.role.create({
            data: { name: 'USER' },
        });
    } else {
        userRole = existingRoles.find(role => role.name === 'USER');
    }

    if (!adminRole || !userRole) {
        throw new Error('Failed to create or retrieve roles.');
    }

    // Check if permissions already exist
    const existingPermissions = await prisma.permission.findMany({
        where: {
            OR: [
                { name: 'READ' },
                { name: 'WRITE' },
                { name: 'READ_USER' },
            ],
        },
    });

    const permissionNames = existingPermissions.map(permission => permission.name);
    const createReadPermission = !permissionNames.includes('READ');
    const createWritePermission = !permissionNames.includes('WRITE');
    const createReadUserPermission = !permissionNames.includes('READ_USER');

    if (createReadPermission) {
        await prisma.permission.create({
            data: {
                name: 'READ',
                role: { connect: { id: adminRole.id } },
            },
        });
    }

    if (createWritePermission) {
        await prisma.permission.create({
            data: {
                name: 'WRITE',
                role: { connect: { id: adminRole.id } },
            },
        });
    }

    if (createReadUserPermission) {
        await prisma.permission.create({
            data: {
                name: 'READ_USER',
                role: { connect: { id: userRole.id } },
            },
        });
    }

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('adminpassword', saltRounds);
    const hashedUserPassword = await bcrypt.hash('userpassword', saltRounds);

    // Check if users already exist
    const existingUsers = await prisma.user.findMany({
        where: {
            OR: [
                { email: 'admin@example.com' },
                { email: 'user@example.com' },
            ],
        },
    });

    const userEmails = existingUsers.map(user => user.email);
    const createAdminUser = !userEmails.includes('admin@example.com');
    const createRegularUser = !userEmails.includes('user@example.com');

    let adminUser, regularUser;
    if (createAdminUser) {
        adminUser = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedAdminPassword,
                role: { connect: { id: adminRole.id } },
            },
        });
    } else {
        adminUser = existingUsers.find(user => user.email === 'admin@example.com');
    }

    if (createRegularUser) {
        regularUser = await prisma.user.create({
            data: {
                name: 'Regular User',
                email: 'user@example.com',
                password: hashedUserPassword,
                role: { connect: { id: userRole.id } },
            },
        });
    } else {
        regularUser = existingUsers.find(user => user.email === 'user@example.com');
    }

    if (!adminUser || !regularUser) {
        throw new Error('Failed to create or retrieve users.');
    }

    // Check if posts already exist
    const existingPosts = await prisma.post.findMany({
        where: {
            OR: [
                { title: 'Admin Post' },
                { title: 'User Post' },
            ],
        },
    });

    const postTitles = existingPosts.map(post => post.title);
    const createAdminPost = !postTitles.includes('Admin Post');
    const createUserPost = !postTitles.includes('User Post');

    if (createAdminPost) {
        await prisma.post.create({
            data: {
                title: 'Admin Post',
                content: 'This is a post by the admin user.',
                user: { connect: { id: adminUser.id } },
            },
        });
    }

    if (createUserPost) {
        await prisma.post.create({
            data: {
                title: 'User Post',
                content: 'This is a post by the regular user.',
                user: { connect: { id: regularUser.id } },
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
