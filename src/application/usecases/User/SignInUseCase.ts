import { User } from '../../../domain/User';
import { UserRepository } from '../../../domain/UserRepository';

class SignInUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    public async execute(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return null;

        // Validate the password
        const isPasswordValid = await this.userRepository.validatePassword(email, password);
        if (!isPasswordValid) return null;

        return user;
    }

}

export { SignInUseCase };
