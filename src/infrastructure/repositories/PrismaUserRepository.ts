import { PrismaClient } from '@prisma/client';
import { UserRepository } from "../../domain/UserRepository";
import { User } from "../../domain/User";
import { prisma } from "../db/client"; // Make sure this path is correct
import { Prisma } from '@prisma/client'; // Import Prisma to handle known errors
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) { }
  async create(user: User): Promise<User> {
    try {
      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
        },
      });
      return new User(createdUser.id, createdUser.name, createdUser.email);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Email already exists');
      }
      throw error; // Rethrow if it's not the known error
    }
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async update(user: User): Promise<User> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id as number }, // Ensure id is not null
        data: {
          name: user.name,
          email: user.email,
        },
      });
      return new User(updatedUser.id, updatedUser.name, updatedUser.email);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Email already exists');
      }
      throw error; // Rethrow if it's not the known error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found
          throw new Error('User not found');
        }
      }
      throw error; // Rethrow if it's not the known error
    }
  }
}
