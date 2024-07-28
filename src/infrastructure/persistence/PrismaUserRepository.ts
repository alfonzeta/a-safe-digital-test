import { Prisma, PrismaClient } from '@prisma/client';
import { User } from "../../domain/User";
import { UserRepository } from "../../domain/UserRepository";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) { }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    if (user.roleId === null) {
      throw new Error('Role ID should not be null');
    }
    return new User(user.id, user.name, user.email, user.roleId);
  }
  async create(user: User): Promise<User> {
    try {
      const hashedPassword: string = await bcrypt.hash(user.password!, SALT_ROUNDS);
      const createdUser = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          roleId: user.roleId
        },
      });
      return new User(createdUser.id, createdUser.name, createdUser.email, createdUser.roleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }


  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    if (user.roleId === null) {
      throw new Error('Role ID should not be null');
    }
    return new User(user.id, user.name, user.email, user.roleId, user.password);
  }

  async update(user: User): Promise<User> {
    try {
      const updateData: any = {
        name: user.name,
        email: user.email,
        roleId: user.roleId
      };

      if (user.password && user.password.length === 60 && user.password.startsWith('$2')) {
        updateData.password = user.password;
      }
      if (user.password && user.password.length != 60 && !user.password.startsWith('$2')) {
        updateData.password = await bcrypt.hash(user.password, SALT_ROUNDS);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id as number },
        data: updateData,
      });

      return new User(updatedUser.id, updatedUser.name, updatedUser.email, updatedUser.roleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found
          throw new Error('User not found');
        }
      }
      throw error;
    }
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user || !user.password) return false;

    console.log("user: ", user);

    // Check if the password is in a likely hashed format
    const isProbablyHashed = user.password.length === 60 && user.password.startsWith('$2');

    if (isProbablyHashed) {
      // Compare using bcrypt if it's probably hashed
      return await bcrypt.compare(password, user.password);

    } else {
      // Direct comparison if it's not hashed
      const isMatch = password === user.password;

      if (isMatch) {
        // If the plain text password matches, hash it and update the user's record (FOR PLAIN TEXT PASSOWRD FROM SEEDING DATABASE)
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await this.update({ ...user, password: hashedPassword }); // Update password
      }

      return isMatch;
    }
  }
}
