import { User } from '../../../domain/User';
import { UserRepository } from '../../../domain/UserRepository';

class SignUpUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    public async execute(name: string, email: string, password: string, roleId: number = 2): Promise<User | null> {
        try {
            const existingUser = await this.userRepository.findByEmail(email);


            if (existingUser) {
                throw new Error('Email already exists');
            }

            const newUser = new User(null, name, email, password, roleId = 2);
            const createdUser = await this.userRepository.create(newUser);

            return createdUser;
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

export { SignUpUseCase };
