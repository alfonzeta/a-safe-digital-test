import { User } from "./User";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: number): Promise<void>;
  validatePassword(email: string, password: string): Promise<boolean>;
}