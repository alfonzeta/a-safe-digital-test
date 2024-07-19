import { User } from '../../../domain/User';
import { UserRepository } from '../../../domain/UserRepository';

class SignUpUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    public async execute(name: string, email: string, password: string, roleId: number = 2): Promise<User | null> {
        try {
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                return null;
            }

            const newUser = new User(null, name, email, password, roleId = 2);
            const createdUser = await this.userRepository.create(newUser);

            return createdUser;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }
}

export { SignUpUseCase };
