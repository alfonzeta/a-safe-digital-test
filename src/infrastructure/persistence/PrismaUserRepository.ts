import { Prisma, PrismaClient } from '@prisma/client';
import { User } from "../../domain/User";
import { UserRepository } from "../../domain/UserRepository";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) { }

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
      return new User(createdUser.id, createdUser.name, createdUser.email, createdUser.password, createdUser.roleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Email already exists2');
      }
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    if (user.roleId === null) {
      throw new Error('Role ID should not be null');
    }
    return new User(user.id, user.name, user.email, user.password, user.roleId);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    if (user.roleId === null) {
      throw new Error('Role ID should not be null');
    }
    return new User(user.id, user.name, user.email, user.password, user.roleId);
  }

  async update(user: User): Promise<User> {
    try {
      const updateData: any = {
        name: user.name,
        email: user.email,
        roleId: user.roleId
      };

      if (user.password) {
        updateData.password = await bcrypt.hash(user.password, SALT_ROUNDS);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id as number },
        data: updateData,
      });


      return new User(updatedUser.id, updatedUser.name, updatedUser.email, updatedUser.password, updatedUser.roleId);
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
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
  }
}