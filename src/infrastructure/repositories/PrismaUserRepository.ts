import { UserRepository } from "../../domain/UserRepository";
import { User } from "../../domain/User";
import { prisma } from "../db/client";

export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: user,
    });
    return new User(createdUser.id, createdUser.name, createdUser.email);
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async update(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    return new User(updatedUser.id, updatedUser.name, updatedUser.email);
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
