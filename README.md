# a-safe-digital-test
MAKE DEPLOY
INSIDE BACKEND CONTAINER RUN NPX "PRISMA MIGRATE DEPLOY"

INSIDE POSTGRES CONTAINER
psql -U YOUR_USER -D YOUR_DATABASE
\c YOUR_DATABASE (optional)

TRUNCATE TABLE "Role", "User", "Permission", "Post" RESTART IDENTITY CASCADE;


-- Insert data into the Role table
INSERT INTO "Role" ("name") VALUES
('Admin'),
('Editor'),
('Viewer');

-- Insert data into the User table
INSERT INTO "User" ("name", "email", "password", "roleId") VALUES
('Alice', 'alice@example.com', 'password123', (SELECT "id" FROM "Role" WHERE "name" = 'Admin')),
('Bob', 'bob@example.com', 'password456', (SELECT "id" FROM "Role" WHERE "name" = 'Editor')),
('Charlie', 'charlie@example.com', 'password789', (SELECT "id" FROM "Role" WHERE "name" = 'Viewer'));

-- Insert data into the Permission table
INSERT INTO "Permission" ("name", "roleId") VALUES
('Create Post', (SELECT "id" FROM "Role" WHERE "name" = 'Admin')),
('Edit Post', (SELECT "id" FROM "Role" WHERE "name" = 'Editor')),
('View Post', (SELECT "id" FROM "Role" WHERE "name" = 'Viewer'));

-- Insert data into the Post table
INSERT INTO "Post" ("title", "content", "userId") VALUES
('First Post', 'This is the content of the first post.', (SELECT "id" FROM "User" WHERE "name" = 'Alice')),
('Second Post', 'This is the content of the second post.', (SELECT "id" FROM "User" WHERE "name" = 'Bob'));



DEV:
MAKE DEV 
npm run seed
