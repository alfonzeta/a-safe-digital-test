import { User } from '../../../domain/User';
import { UserRepository } from '../../../domain/UserRepository';

class SignUpUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    public async execute(name: string, email: string, password: string, roleId: number = 2): Promise<User | null> {
        try {
            // Validate required fields
            if (!name || !email || !password) {
                throw new Error('Missing required fields');
            }

            // Check if user with the same email already exists
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            // Create new user
            const newUser = new User(null, name, email, roleId, password);
            const createdUser = await this.userRepository.create(newUser);

            return createdUser;
        } catch (error) {
            // Differentiate between known errors and unexpected errors
            if (error instanceof Error && (error.message === 'Email already exists' || error.message === 'Missing required fields')) {
                throw error;
            } else {
                console.error('Error updating user:', error);
                throw new Error('Internal Server Error');
            }
        }
    }
}

export { SignUpUseCase };

