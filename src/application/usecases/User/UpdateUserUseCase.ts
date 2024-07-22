import { User } from '../../../domain/User';
import { UserRepository } from '../../../domain/UserRepository';

class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    public async execute(userId: number, name: string, email: string, password: string, roleId: number): Promise<User | null> {
        try {
            const existingUser = await this.userRepository.findById(userId);

            if (!existingUser) {
                return null;
            }

            existingUser.name = name;
            existingUser.email = email;
            existingUser.password = password;
            existingUser.roleId = roleId;

            const updatedUser = await this.userRepository.update(existingUser);

            return updatedUser;
        } catch (error) {
            if (error instanceof Error && error.message === 'Email already exists') {
                throw new Error('Email already exists');
            } else {
                console.error('Error updating user:', error);
                throw new Error('Internal Server Error');
            }
        }
    }
}

export { UpdateUserUseCase };
