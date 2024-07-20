import { User } from '../../../domain/User';
import { UserRepository } from '../../../domain/UserRepository';

class GetUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    public async execute(userId: number): Promise<User | null> {
        try {
            const user = await this.userRepository.findById(userId);


            if (!user) {
                return null;
            }

            return user;
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    }
}

export { GetUserUseCase };
